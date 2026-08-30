import { Card, Popover, PopoverContent, PopoverTrigger } from "@packages/ui";
import { PixelIcon } from "./PixelIcon";
import { type ComponentCategory, componentDefinitions } from "./definitions";

const CATEGORY_ORDER: ComponentCategory[] = [
  "Tráfego & Edge",
  "Computação",
  "Armazenamento",
  "Mensageria",
];

export const PALETTE_DRAG_MIME = "application/archdojo-component-kind";

export function Palette() {
  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: componentDefinitions.filter((d) => d.category === category),
  }));

  return (
    <aside
      aria-label="Paleta de componentes"
      className="border-line-2 bg-panel overflow-y-auto rounded-lg border-2 p-3"
    >
      <h2 className="font-arcade text-neon-gold mb-3 text-xs [text-shadow:0_0_6px_rgba(255,210,63,0.6)]">
        Componentes
      </h2>
      {byCategory.map(({ category, items }) => (
        <section key={category} className="mb-3">
          <h3 className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
            {category}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {items.map((def) => (
              <li key={def.kind}>
                <Popover>
                  <PopoverTrigger asChild>
                    {/* biome-ignore lint/a11y/useSemanticElements: also needs to be a native HTML5 drag source, which <button> disallows dragging out of the box. */}
                    <Card
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(PALETTE_DRAG_MIME, def.kind);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      className="border-line-2 hover:border-neon-cyan flex-row items-center gap-2 rounded border-2 bg-transparent px-2 py-1.5 text-left text-lg text-fg ring-0 cursor-grab"
                    >
                      <span className="text-neon-purple">
                        <PixelIcon name={def.icon} size="md" />
                      </span>
                      <span>{def.label}</span>
                    </Card>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    className="border-neon-cyan bg-ink-2 w-72 rounded border-2 p-3 text-base leading-snug text-fg shadow-[4px_4px_0_#000]"
                  >
                    <p className="font-arcade text-neon-gold mb-2 text-xs">{def.label}</p>
                    <p className="mb-1.5">
                      <strong>O que é:</strong> {def.description}
                    </p>
                    <p className="mb-1.5">
                      <strong>Quando usar:</strong> {def.whenToUse}
                    </p>
                    <p>
                      <strong>Trade-off:</strong> {def.tradeoff}
                    </p>
                  </PopoverContent>
                </Popover>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
