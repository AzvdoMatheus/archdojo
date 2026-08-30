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
  (flex/grid tracks with `min-height: 0` at every level) or the canvas silently grows to fit
  node content instead of the viewport. See `UrlShortener.css` (`.dojo-shell`, `.dojo-workspace`,
  `.dojo-canvas-wrapper`) for a working pattern.
- Manually driving the React Flow canvas with `chrome-devtools-axi`: `drag @<ref> @<ref>`
  (CDP-level, works for both the HTML5 palette drag-and-drop and node-to-node edge
  connections) needs real accessible refs, but React Flow's `.react-flow__handle` elements
  aren't in the accessibility tree by default. Tag them first via `eval` (add
  `role="button"`/`tabindex`/`aria-label`), re-`snapshot`, then `drag` between the tagged
  handle refs - synthetic `PointerEvent`s dispatched by hand don't work because React Flow's
  drag code calls `setPointerCapture` with a `pointerId` the browser never associated with
  a real pointer session.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
