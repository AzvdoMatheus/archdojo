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
    <aside className="dojo-palette" aria-label="Paleta de componentes">
      <h2 className="dojo-palette__title">Componentes</h2>
      {byCategory.map(({ category, items }) => (
        <section key={category} className="dojo-palette__section">
          <h3 className="dojo-palette__category">{category}</h3>
          <ul className="dojo-palette__list">
            {items.map((def) => (
              <li key={def.kind} className="dojo-palette__item-wrapper">
                <button
                  type="button"
                  className="dojo-palette__item"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(PALETTE_DRAG_MIME, def.kind);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                >
                  <span className="dojo-palette__icon">{def.icon}</span>
                  <span>{def.label}</span>
                </button>
                <div className="dojo-palette__tooltip" role="tooltip">
                  <p className="dojo-palette__tooltip-title">{def.label}</p>
                  <p>
                    <strong>O que é:</strong> {def.description}
                  </p>
                  <p>
                    <strong>Quando usar:</strong> {def.whenToUse}
                  </p>
                  <p>
                    <strong>Trade-off:</strong> {def.tradeoff}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
