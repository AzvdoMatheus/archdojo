import { Badge } from "@packages/ui";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { PixelIcon } from "../components/PixelIcon";
import { getComponentDefinition } from "../components/definitions";
import type { ArchFlowNode } from "./types";

function formatRps(rps: number): string {
  if (!Number.isFinite(rps)) return "-";
  if (rps >= 1000) return `${(rps / 1000).toFixed(1)}k`;
  return rps.toFixed(0);
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "∞";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms.toFixed(1)}ms`;
}

export function ArchNode({ data, selected }: NodeProps<ArchFlowNode>) {
  const def = getComponentDefinition(data.kind);
  const result = data.kind !== "client" ? data.simResult : undefined;
  const overloaded = result?.overloaded ?? false;

  const borderClass = overloaded
    ? "border-neon-danger shadow-[0_0_12px_rgba(255,46,110,0.35)] animate-overload"
    : selected
      ? "border-neon-cyan shadow-[0_0_10px_rgba(0,229,255,0.3)]"
      : "border-line-2";

  return (
    <div
      className={`min-w-[150px] rounded-md border-2 bg-gradient-to-b from-[rgba(124,58,237,0.08)] to-black/20 p-3 font-pixel-mono text-fg ${borderClass}`}
    >
      {data.kind !== "client" && <Handle type="target" position={Position.Left} />}
      <div className="flex items-center gap-2">
        <span className="border-line-2 bg-panel-2 flex h-8 w-8 flex-none items-center justify-center rounded border text-neon-purple">
          <PixelIcon name={def.icon} size="md" />
        </span>
        <span className="text-lg">{data.label}</span>
      </div>
      <div className="text-muted-foreground mt-1 text-base">
        {data.kind !== "client" ? `x${data.replicas}` : "fonte de tráfego"}
      </div>
      {result && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className={`font-pixel-mono rounded border-line-2 bg-ink text-sm ${overloaded ? "border-neon-danger text-neon-danger" : "text-neon-cyan"}`}
          >
            {(result.utilization * 100).toFixed(0)}%
          </Badge>
          <Badge
            variant="outline"
            className="font-pixel-mono border-line-2 bg-ink rounded text-sm text-neon-cyan"
          >
            {formatMs(result.latencyMs)}
          </Badge>
          <Badge
            variant="outline"
            className="font-pixel-mono border-line-2 bg-ink rounded text-sm text-neon-cyan"
          >
            {formatRps(result.outputRps)} rps
          </Badge>
        </div>
      )}
      {overloaded && (
        <div className="font-arcade mt-1.5 text-[9px] text-neon-danger">SOBRECARGA</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
