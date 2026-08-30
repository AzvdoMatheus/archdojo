import { Handle, type NodeProps, Position } from "@xyflow/react";
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

  return (
    <div
      className={`arch-node${selected ? " arch-node--selected" : ""}${overloaded ? " arch-node--overloaded" : ""}`}
    >
      {data.kind !== "client" && <Handle type="target" position={Position.Left} />}
      <div className="arch-node__header">
        <span className="arch-node__icon">{def.icon}</span>
        <span className="arch-node__label">{data.label}</span>
      </div>
      <div className="arch-node__meta">
        {data.kind !== "client" ? `x${data.replicas}` : "fonte de tráfego"}
      </div>
      {result && (
        <div className="arch-node__stats">
          <span className={`arch-node__stat${overloaded ? " arch-node__stat--danger" : ""}`}>
            {(result.utilization * 100).toFixed(0)}%
          </span>
          <span className="arch-node__stat">{formatMs(result.latencyMs)}</span>
          <span className="arch-node__stat">{formatRps(result.outputRps)} rps</span>
        </div>
      )}
      {overloaded && <div className="arch-node__badge">SOBRECARGA</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
