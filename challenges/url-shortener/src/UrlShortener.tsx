import { Button } from "@packages/ui";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArchNode } from "./canvas/ArchNode";
import type { ArchFlowNode, ArchNodeData } from "./canvas/types";
import { urlShortenerChallenge } from "./challenge";
import { ChallengeBrief } from "./components/ChallengeBrief";
import { EvaluationPlaceholder } from "./components/EvaluationPlaceholder";
import { Inspector } from "./components/Inspector";
import { PALETTE_DRAG_MIME, Palette } from "./components/Palette";
import { PixelIcon } from "./components/PixelIcon";
import { getComponentDefinition } from "./components/definitions";
import { simulate } from "./simulation/engine";
import type { ComponentKind, SimEdge, SimNodeConfig } from "./simulation/types";

const nodeTypes = { archNode: ArchNode };

function makeClientNode(): ArchFlowNode {
  const def = getComponentDefinition("client");
  return {
    id: "client",
    type: "archNode",
    position: { x: 40, y: 200 },
    data: {
      kind: "client",
      label: def.label,
      replicas: def.defaultReplicas,
      capacityPerReplicaRps: def.defaultCapacityPerReplicaRps,
    },
  };
}

let nodeCounter = 0;
function nextNodeId(kind: ComponentKind): string {
  nodeCounter += 1;
  return `${kind}-${nodeCounter}`;
}

function CanvasBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ArchFlowNode>([makeClientNode()]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData(PALETTE_DRAG_MIME) as ComponentKind | "";
      if (!kind) return;

      const def = getComponentDefinition(kind);
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const id = nextNodeId(kind);

      const newNode: ArchFlowNode = {
        id,
        type: "archNode",
        position,
        data: {
          kind,
          label: def.label,
          replicas: def.defaultReplicas,
          capacityPerReplicaRps: def.defaultCapacityPerReplicaRps,
          cacheHitRate: def.defaultCacheHitRate,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const handleUpdate = useCallback(
    (nodeId: string, patch: Partial<ArchNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId((current) => (current === nodeId ? null : current));
    },
    [setNodes, setEdges],
  );

  const handleSimulate = useCallback(() => {
    setSimError(null);

    const simNodes: SimNodeConfig[] = nodes.map((n) => ({
      id: n.id,
      kind: n.data.kind,
      replicas: n.data.replicas,
      capacityPerReplicaRps: n.data.capacityPerReplicaRps,
      cacheHitRate: n.data.cacheHitRate,
    }));
    const simEdges: SimEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

    const output = simulate({
      nodes: simNodes,
      edges: simEdges,
      sourceNodeId: "client",
      incomingRps: urlShortenerChallenge.simulationTrafficRps,
    });

    if (!output.ok) {
      setSimError(output.errors.map((e) => e.message).join(" "));
    }

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, simResult: output.results.get(n.id) },
      })),
    );
  }, [nodes, edges, setNodes]);

  return (
    <div className="font-pixel-mono text-fg flex h-[calc(100vh-3rem)] min-h-0 flex-col gap-4 text-lg">
      <ChallengeBrief />
      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_300px] gap-4">
        <Palette />
        <div
          className="border-line-2 bg-panel relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border-2"
          ref={wrapperRef}
        >
          <div className="border-line-2 z-10 flex items-center gap-4 border-b-2 px-3 py-2.5">
            <Button
              type="button"
              className="font-arcade text-ink h-auto gap-2 rounded bg-neon-magenta px-4 py-2.5 text-[9px] shadow-[0_3px_0_#a4155f] hover:bg-neon-magenta active:translate-y-px active:shadow-[0_1px_0_#a4155f]"
              onClick={handleSimulate}
            >
              <PixelIcon name="play" size="sm" />
              Simular ({urlShortenerChallenge.simulationTrafficRps.toLocaleString("pt-BR")} req/s)
            </Button>
            {simError && <span className="text-neon-danger text-base">{simError}</span>}
          </div>
          <ReactFlow
            className="!bg-ink"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <Inspector selectedNode={selectedNode} onUpdate={handleUpdate} onDelete={handleDelete} />
          <EvaluationPlaceholder />
        </div>
      </div>
    </div>
  );
}

export function UrlShortener() {
  return (
    <ReactFlowProvider>
      <CanvasBoard />
    </ReactFlowProvider>
  );
}
