import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ArchFlowNode } from "../canvas/types";
import { Inspector } from "./Inspector";

function makeNode(overrides: Partial<ArchFlowNode["data"]> = {}): ArchFlowNode {
  return {
    id: "cache-1",
    type: "archNode",
    position: { x: 0, y: 0 },
    data: {
      kind: "cache",
      label: "Cache",
      replicas: 2,
      capacityPerReplicaRps: 10000,
      cacheHitRate: 0.8,
      ...overrides,
    },
  };
}

describe("Inspector", () => {
  it("shows a hint when nothing is selected", () => {
    render(<Inspector selectedNode={null} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Clique em um componente/)).toBeInTheDocument();
  });

  it("shows the teach-the-beginner explanation for the selected component", () => {
    render(<Inspector selectedNode={makeNode()} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Armazena em memória/)).toBeInTheDocument();
    expect(screen.getByText(/Trade-off:/)).toBeInTheDocument();
  });

  it("calls onUpdate with the new replica count when edited", () => {
    const onUpdate = vi.fn();
    render(<Inspector selectedNode={makeNode()} onUpdate={onUpdate} onDelete={vi.fn()} />);

    const replicasInput = screen.getByLabelText(/Réplicas/);
    fireEvent.change(replicasInput, { target: { value: "5" } });

    expect(onUpdate).toHaveBeenCalledWith("cache-1", { replicas: 5 });
  });

  it("renders live stats once a simResult is present", () => {
    render(
      <Inspector
        selectedNode={makeNode({
          simResult: {
            nodeId: "cache-1",
            inputRps: 1000,
            outputRps: 200,
            utilization: 0.42,
            waitTimeMs: 1.2,
            serviceTimeMs: 0.5,
            latencyMs: 1.7,
            overloaded: false,
          },
        })}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("42.0%")).toBeInTheDocument();
    expect(screen.getByText("1000.0 req/s")).toBeInTheDocument();
  });

  it("flags overloaded nodes clearly instead of just showing a raw percentage", () => {
    render(
      <Inspector
        selectedNode={makeNode({
          simResult: {
            nodeId: "cache-1",
            inputRps: 5000,
            outputRps: 1000,
            utilization: 1.4,
            waitTimeMs: Number.POSITIVE_INFINITY,
            serviceTimeMs: 0.5,
            latencyMs: Number.POSITIVE_INFINITY,
            overloaded: true,
          },
        })}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/Sobrecarregado/)).toBeInTheDocument();
  });
});
