import type { SimEdge, SimInput, SimNodeConfig, SimNodeResult, SimOutput } from "./types";

/**
 * Erlang C: probability that an arriving request finds all c servers busy and has to queue.
 * Standard M/M/c result, used below to get the average queueing delay Wq.
 */
function erlangC(c: number, rho: number): number {
  const a = c * rho; // offered load (erlangs)
  let sum = 0;
  let term = 1;
  for (let k = 0; k < c; k++) {
    if (k > 0) term *= a / k;
    sum += term;
  }
  // term is now a^(c-1)/(c-1)!; extend it to a^c/c!
  const lastTerm = c > 0 ? term * (a / c) : 1;
  const erlangBDenominator = sum + lastTerm / (1 - rho);
  const cTerm = lastTerm / (1 - rho);
  return cTerm / erlangBDenominator;
}

/**
 * M/M/c queueing metrics for one node.
 * lambda: arrival rate (req/s). mu: per-replica service rate (req/s). c: replica count.
 */
export function computeNodeQueue(
  lambda: number,
  mu: number,
  c: number,
): {
  utilization: number;
  waitTimeMs: number;
  serviceTimeMs: number;
  latencyMs: number;
  overloaded: boolean;
} {
  const serviceTimeMs = mu > 0 ? 1000 / mu : Number.POSITIVE_INFINITY;
  const capacity = c * mu;
  const utilization = capacity > 0 ? lambda / capacity : Number.POSITIVE_INFINITY;

  if (lambda <= 0) {
    return {
      utilization: 0,
      waitTimeMs: 0,
      serviceTimeMs,
      latencyMs: serviceTimeMs,
      overloaded: false,
    };
  }

  if (utilization >= 1 || capacity <= 0) {
    return {
      utilization,
      waitTimeMs: Number.POSITIVE_INFINITY,
      serviceTimeMs,
      latencyMs: Number.POSITIVE_INFINITY,
      overloaded: true,
    };
  }

  const pWait = erlangC(c, utilization);
  const waitTimeMs = (pWait / (capacity - lambda)) * 1000;
  const latencyMs = waitTimeMs + serviceTimeMs;

  return { utilization, waitTimeMs, serviceTimeMs, latencyMs, overloaded: false };
}

function topologicalOrder(
  nodes: SimNodeConfig[],
  edges: SimEdge[],
): { order: string[]; cycle: boolean } {
  const ids = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const adjacency = new Map<string, string[]>(nodes.map((n) => [n.id, []]));

  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  const order: string[] = [];

  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    order.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const remaining = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }

  return { order, cycle: order.length !== nodes.length };
}

/**
 * Simulates traffic flowing from `sourceNodeId` through the graph in topological order.
 * A node's inbound RPS is the sum of every incoming edge's source output RPS (fan-in).
 * A node's outbound RPS is replicated (not split) across every outgoing edge: fan-out models
 * a request triggering multiple independent downstream effects (e.g. write to DB AND publish
 * to a queue), not load-balancing across edges. Load balancing across replicas of the SAME
 * logical component is instead modeled by the `replicas` field on a single node.
 * Cache nodes reduce their outbound RPS by `cacheHitRate`: only cache misses propagate further.
 */
export function simulate(input: SimInput): SimOutput {
  const { nodes, edges, sourceNodeId, incomingRps } = input;
  const errors: SimOutput["errors"] = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const ids = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      errors.push({
        type: "unknown_edge_endpoint",
        message: `Edge references a node that does not exist: ${edge.source} -> ${edge.target}`,
      });
    }
  }

  if (!ids.has(sourceNodeId)) {
    return {
      ok: false,
      results: new Map(),
      errors: [{ type: "disconnected_source", message: "Source node is not part of the graph." }],
    };
  }

  const { order, cycle } = topologicalOrder(nodes, edges);
  if (cycle) {
    errors.push({ type: "cycle", message: "The graph has a cycle; traffic cannot be simulated." });
    return { ok: false, results: new Map(), errors };
  }

  const inboundRps = new Map<string, number>();
  inboundRps.set(sourceNodeId, incomingRps);

  const outgoingByNode = new Map<string, SimEdge[]>();
  for (const edge of edges) {
    if (!outgoingByNode.has(edge.source)) outgoingByNode.set(edge.source, []);
    outgoingByNode.get(edge.source)?.push(edge);
  }

  const results = new Map<string, SimNodeResult>();

  for (const nodeId of order) {
    const node = nodeById.get(nodeId);
    if (!node) continue;

    const inputRps = nodeId === sourceNodeId ? incomingRps : (inboundRps.get(nodeId) ?? 0);

    const queue = computeNodeQueue(inputRps, node.capacityPerReplicaRps, node.replicas);
    const passThroughFraction =
      node.kind === "cache" && typeof node.cacheHitRate === "number" ? 1 - node.cacheHitRate : 1;
    const outputRps = inputRps * passThroughFraction;

    results.set(nodeId, {
      nodeId,
      inputRps,
      outputRps,
      utilization: queue.utilization,
      waitTimeMs: queue.waitTimeMs,
      serviceTimeMs: queue.serviceTimeMs,
      latencyMs: queue.latencyMs,
      overloaded: queue.overloaded,
    });

    for (const edge of outgoingByNode.get(nodeId) ?? []) {
      inboundRps.set(edge.target, (inboundRps.get(edge.target) ?? 0) + outputRps);
    }
  }

  return { ok: errors.length === 0, results, errors };
}
