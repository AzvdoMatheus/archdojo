import type { ArchFlowNode, ArchNodeData } from "../canvas/types";
import { getComponentDefinition } from "./definitions";

interface InspectorProps {
  selectedNode: ArchFlowNode | null;
  onUpdate: (nodeId: string, patch: Partial<ArchNodeData>) => void;
  onDelete: (nodeId: string) => void;
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "∞ (fila cresce sem limite)";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${ms.toFixed(1)} ms`;
}

export function Inspector({ selectedNode, onUpdate, onDelete }: InspectorProps) {
  if (!selectedNode) {
    return (
      <aside className="dojo-inspector">
        <h2 className="dojo-inspector__title">Inspetor</h2>
        <p className="dojo-inspector__hint">
          Clique em um componente no canvas para ver detalhes e stats aqui.
        </p>
      </aside>
    );
  }

  const { data } = selectedNode;
  const def = getComponentDefinition(data.kind);
  const result = data.simResult;
  const isClient = data.kind === "client";

  return (
    <aside className="dojo-inspector">
      <h2 className="dojo-inspector__title">
        {def.icon} {data.label}
      </h2>

      <section className="dojo-inspector__section">
        <p>
          <strong>O que é:</strong> {def.description}
        </p>
        <p>
          <strong>Quando usar:</strong> {def.whenToUse}
        </p>
        <p>
          <strong>Trade-off:</strong> {def.tradeoff}
        </p>
      </section>

      {!isClient && (
        <section className="dojo-inspector__section">
          <h3>Configuração</h3>
          <label className="dojo-inspector__field">
            Réplicas
            <input
              type="number"
              min={1}
              max={64}
              value={data.replicas}
              onChange={(e) =>
                onUpdate(selectedNode.id, { replicas: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </label>
          <label className="dojo-inspector__field">
            Capacidade por réplica (req/s)
            <input
              type="number"
              min={1}
              value={data.capacityPerReplicaRps}
              onChange={(e) =>
                onUpdate(selectedNode.id, {
                  capacityPerReplicaRps: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </label>
          {data.kind === "cache" && (
            <label className="dojo-inspector__field">
              Taxa de acerto do cache ({Math.round((data.cacheHitRate ?? 0) * 100)}%)
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((data.cacheHitRate ?? 0) * 100)}
                onChange={(e) =>
                  onUpdate(selectedNode.id, { cacheHitRate: Number(e.target.value) / 100 })
                }
              />
            </label>
          )}
          <button
            type="button"
            className="dojo-inspector__delete"
            onClick={() => onDelete(selectedNode.id)}
          >
            Remover componente
          </button>
        </section>
      )}

      <section className="dojo-inspector__section">
        <h3>Stats ao vivo</h3>
        {result ? (
          <dl className="dojo-inspector__stats">
            <dt>Entrada</dt>
            <dd>
              {Number.isFinite(result.inputRps) ? `${result.inputRps.toFixed(1)} req/s` : "-"}
            </dd>
            <dt>Saída</dt>
            <dd>
              {Number.isFinite(result.outputRps) ? `${result.outputRps.toFixed(1)} req/s` : "-"}
            </dd>
            <dt>Utilização</dt>
            <dd className={result.overloaded ? "dojo-inspector__stat-danger" : undefined}>
              {Number.isFinite(result.utilization)
                ? `${(result.utilization * 100).toFixed(1)}%`
                : "∞"}
            </dd>
            <dt>Latência</dt>
            <dd className={result.overloaded ? "dojo-inspector__stat-danger" : undefined}>
              {formatMs(result.latencyMs)}
            </dd>
            {result.overloaded && (
              <>
                <dt />
                <dd className="dojo-inspector__stat-danger">
                  Sobrecarregado: a demanda excede a capacidade deste componente.
                </dd>
              </>
            )}
          </dl>
        ) : (
          <p className="dojo-inspector__hint">
            Pressione "Simular" para ver os stats reagirem à sua topologia.
          </p>
        )}
      </section>
    </aside>
  );
}
