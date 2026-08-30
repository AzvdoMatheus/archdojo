import type { Node } from "@xyflow/react";
import type { ComponentKind, SimNodeResult } from "../simulation/types";

export interface ArchNodeData extends Record<string, unknown> {
  kind: ComponentKind;
  label: string;
  replicas: number;
  capacityPerReplicaRps: number;
  cacheHitRate?: number;
  simResult?: SimNodeResult;
}

export type ArchFlowNode = Node<ArchNodeData, "archNode">;
