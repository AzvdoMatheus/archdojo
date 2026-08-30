import { Button, Card, CardContent, CardHeader, CardTitle } from "@packages/ui";
import type { ArchFlowNode, ArchNodeData } from "../canvas/types";
import { PixelIcon } from "./PixelIcon";
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

const cardClass = "border-line-2 bg-panel gap-3 rounded-lg border-2 py-4";
const sectionTitleClass = "font-arcade text-neon-cyan mb-2 text-[10px]";
const fieldLabelClass = "flex flex-col gap-1 text-base mb-2";
const fieldInputClass =
  "font-pixel-mono bg-ink-2 border-line-2 text-fg rounded border-2 px-2 py-1 text-lg";

export function Inspector({ selectedNode, onUpdate, onDelete }: InspectorProps) {
  if (!selectedNode) {
    return (
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="font-arcade text-neon-gold text-sm [text-shadow:0_0_6px_rgba(255,210,63,0.6)]">
            Inspetor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Clique em um componente no canvas para ver detalhes e stats aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { data } = selectedNode;
  const def = getComponentDefinition(data.kind);
  const result = data.simResult;
  const isClient = data.kind === "client";

  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="font-arcade text-neon-gold flex items-center gap-2 text-sm [text-shadow:0_0_6px_rgba(255,210,63,0.6)]">
          <PixelIcon name={def.icon} size="md" className="text-neon-purple" />
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <section className="mb-4">
          <p className="mb-1.5">
            <strong>O que é:</strong> {def.description}
          </p>
          <p className="mb-1.5">
            <strong>Quando usar:</strong> {def.whenToUse}
          </p>
          <p>
            <strong>Trade-off:</strong> {def.tradeoff}
          </p>
        </section>

        {!isClient && (
          <section className="mb-4">
            <h3 className={sectionTitleClass}>Configuração</h3>
            <label className={fieldLabelClass}>
              Réplicas
              <input
                type="number"
                min={1}
                max={64}
                className={fieldInputClass}
                value={data.replicas}
                onChange={(e) =>
                  onUpdate(selectedNode.id, { replicas: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </label>
            <label className={fieldLabelClass}>
              Capacidade por réplica (req/s)
              <input
                type="number"
                min={1}
                className={fieldInputClass}
                value={data.capacityPerReplicaRps}
                onChange={(e) =>
                  onUpdate(selectedNode.id, {
                    capacityPerReplicaRps: Math.max(1, Number(e.target.value) || 1),
                  })
                }
              />
            </label>
            {data.kind === "cache" && (
              <label className={fieldLabelClass}>
                Taxa de acerto do cache ({Math.round((data.cacheHitRate ?? 0) * 100)}%)
                <input
                  type="range"
                  min={0}
                  max={100}
                  className="accent-neon-magenta"
                  value={Math.round((data.cacheHitRate ?? 0) * 100)}
                  onChange={(e) =>
                    onUpdate(selectedNode.id, { cacheHitRate: Number(e.target.value) / 100 })
                  }
                />
              </label>
            )}
            <Button
              type="button"
              variant="destructive"
              className="font-pixel-mono mt-1 text-lg"
              onClick={() => onDelete(selectedNode.id)}
            >
              Remover componente
            </Button>
          </section>
        )}

        <section>
          <h3 className={sectionTitleClass}>Stats ao vivo</h3>
          {result ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-muted-foreground">Entrada</dt>
              <dd>
                {Number.isFinite(result.inputRps) ? `${result.inputRps.toFixed(1)} req/s` : "-"}
              </dd>
              <dt className="text-muted-foreground">Saída</dt>
              <dd>
                {Number.isFinite(result.outputRps) ? `${result.outputRps.toFixed(1)} req/s` : "-"}
              </dd>
              <dt className="text-muted-foreground">Utilização</dt>
              <dd className={result.overloaded ? "text-neon-danger" : undefined}>
                {Number.isFinite(result.utilization)
                  ? `${(result.utilization * 100).toFixed(1)}%`
                  : "∞"}
              </dd>
              <dt className="text-muted-foreground">Latência</dt>
              <dd className={result.overloaded ? "text-neon-danger" : undefined}>
                {formatMs(result.latencyMs)}
              </dd>
              {result.overloaded && (
                <>
                  <dt />
                  <dd className="text-neon-danger">
                    Sobrecarregado: a demanda excede a capacidade deste componente.
                  </dd>
                </>
              )}
            </dl>
          ) : (
            <p className="text-muted-foreground">
              Pressione "Simular" para ver os stats reagirem à sua topologia.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
