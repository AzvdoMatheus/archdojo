# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.
- `vitest.setup.ts` must call `cleanup()` from `@testing-library/react` in an `afterEach`
  (globals are off in `vitest.config.ts`, so it isn't automatic). Without it, DOM nodes
  from earlier tests in the same file leak into later ones and `getByText`/`getByRole`
  start throwing "multiple elements found" for reasons that look unrelated to the test.
- A package that writes component tests needs `@testing-library/jest-dom` (and
  `@testing-library/react`) in its own `devDependencies`, plus
  `"types": ["@testing-library/jest-dom"]` in its `tsconfig.json` `compilerOptions` -
  otherwise `tsc --noEmit` fails on matchers like `toBeInTheDocument` even though tests
  pass at runtime. See `challenges/url-shortener/{package.json,tsconfig.json}`.
- The canvas/graph editor (drag-drop palette, node/edge graph, inspector panel) uses
  `@xyflow/react` (React Flow v12+; package renamed from `reactflow`). The queueing-theory
  traffic simulation (M/M/c via Erlang C, topological traversal, cache hit-rate reduction)
  lives in `challenges/<name>/src/simulation/engine.ts` and is pure/framework-free by
  design - keep new challenges' simulation math there rather than inside components, so
  it stays unit-testable without mounting React Flow.
- React Flow needs a real, bounded height on the whole ancestor chain down to `.react-flow`
  (flex/grid tracks with `min-h-0` at every level) or the canvas silently grows to fit node
  content instead of the viewport. See the Tailwind classes on `UrlShortener.tsx`'s root,
  workspace grid, and canvas wrapper divs for a working pattern.
- Styling is Tailwind CSS v4 (via `@tailwindcss/vite` in `apps/playground/vite.config.ts`),
  entry point `apps/playground/src/App.css`. Tailwind v4's automatic content scan is rooted
  at the app and does NOT reach sibling pnpm workspace packages on its own - that CSS file
  has explicit `@source "../../../challenges"` and `@source "../../../packages"` lines for
  exactly this reason. A new workspace package that uses Tailwind classes (challenge or
  shared lib) needs no extra config as long as it lives under one of those two directories;
  a package anywhere else needs its own `@source` line - don't assume the scan finds it,
  verify by grepping the served `/src/App.css` for one of that package's classnames.
- UI primitives (Button, Card, Badge, Tooltip, Popover, ...) live in `packages/ui/src`,
  a shared pnpm package (`@packages/ui`), not inside `apps/playground` - they were generated
  there by shadcn/ui's `init`/`add` CLI (`components.json`'s aliases point `ui`/`utils`/`lib`
  at `@ui` -> `packages/ui/src`) and then physically moved so both the app shell and any
  challenge package can import them via `@packages/ui`, avoiding a circular workspace
  dependency (a challenge importing from the app that imports the challenge). Run future
  `npx shadcn@latest add <component>` from `apps/playground` - the CLI will write straight
  into `packages/ui/src` given the current `components.json`.
- shadcn/ui's semantic theme tokens (`--muted`, `--card`, `--primary`, ...) and this app's
  own "Arcade Neon" tokens (`--color-*` in the first `@theme` block of `App.css`) are two
  separate systems remapped onto the same palette - do not give one of your own custom
  `--color-*` tokens the same bare name as one of shadcn's semantic tokens (e.g. defining
  both a custom `--color-muted` "muted text" token AND shadcn's `--muted-foreground: var(--color-muted)` mapping). Whichever `@theme`/`@theme inline` block is later in the file wins
  and silently reassigns the other's meaning - this happened once and made all
  `text-muted-foreground` text render invisible (foreground == background). Use
  `text-muted-foreground` (shadcn's token) for muted text, not a custom `--color-muted`.
- Visual direction is "Arcade Neon" (decided by the captain, mockup preserved at
  `/Users/matheusazevedo/firstmate/data/archdojo/ui-arcade-design.html` outside the repo):
  Silkscreen/Press Start 2P for UI chrome, VT323 for smaller monospace text, magenta/cyan/gold
  neon accents on a near-black background, pixelarticons (CDN, see `index.html`) instead of
  emoji for icons. Theme tokens (colors, fonts) live in `App.css`'s `@theme` block - reuse
  those tokens (`text-neon-cyan`, `font-arcade`, etc.) rather than hardcoding hex values.
  Component icon names are pixelarticons slugs (e.g. `"server"`, `"database"`) stored on
  `ComponentDefinition.icon` and rendered via the shared `PixelIcon` component - check
  https://unpkg.com/pixelarticons@2.4.1/fonts/pixelart-icons-font.css for valid slugs before
  inventing a new one; a wrong slug renders as an invisible/empty glyph with no error.
- Manually driving the React Flow canvas with `chrome-devtools-axi`: `drag @<ref> @<ref>`
  (CDP-level, works for both the HTML5 palette drag-and-drop and node-to-node edge
  connections) needs real accessible refs, but React Flow's `.react-flow__handle` elements
  aren't in the accessibility tree by default. Tag them first via `eval` (add
  `role="button"`/`tabindex`/`aria-label`), re-`snapshot`, then `drag` between the tagged
  handle refs - synthetic `PointerEvent`s dispatched by hand don't work because React Flow's
  drag code calls `setPointerCapture` with a `pointerId` the browser never associated with
  a real pointer session.

- `npx shadcn@latest add <component>` from `apps/playground` (documented above) currently fails
  with "Could not load the workspace config in packages/ui" / "Could not resolve the following
  aliases" once `@packages/ui` is a separate pnpm workspace package - the CLI's monorepo
  detection now wants `packages/ui` to carry its own `components.json` and tsconfig path
  aliases that resolve `@ui/*` to itself, neither of which exist there by design. Tried pinning
  older `shadcn` versions (4.18.0, still broke) and adding a scratch `components.json` /
  tsconfig paths entry in `packages/ui` (worked partway, still broke on `@ui/utils`). Given the
  small number of primitives involved, the direct path is to hand-write the component in
  `packages/ui/src` copying shadcn's canonical implementation (radix-ui import, `cn` from
  `./utils`, `data-slot` attributes) - see `tabs.tsx` for the pattern other components already
  follow.
- React Flow (`@xyflow/react`) node overlap silently breaks connection dragging: each node's
  outer `.react-flow__node` wrapper gets `pointer-events: all` and a z-index the library raises
  for the more-recently-added/selected node, so when two nodes visually overlap, the top node's
  own body captures clicks meant for a handle on the node underneath - the drag starts but no
  `onConnect` fires, with no console error. This is very easy to trigger by dropping a palette
  component near the default `Cliente` node. Reproduced and confirmed live with
  `chrome-devtools-axi drag` between tagged handles (see the technique above) before and after:
  overlapping nodes fail to connect, non-overlapping ones connect on the first try. Fixed at the
  source in `UrlShortener.tsx`'s `onDrop` via `canvas/layout.ts`'s `findFreeDropPosition`, which
  nudges a freshly-dropped node's position diagonally until it clears every existing node's
  footprint, rather than trying to fight React Flow's per-node stacking contexts with CSS.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
