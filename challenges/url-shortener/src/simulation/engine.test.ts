import { describe, expect, it } from "vitest";
import { computeNodeQueue, simulate } from "./engine";
import type { SimNodeConfig } from "./types";

describe("computeNodeQueue (M/M/c queueing math)", () => {
  it("matches the closed-form M/M/1 formula for a single replica", () => {
    const lambda = 40;
    const mu = 50;
    const result = computeNodeQueue(lambda, mu, 1);

    // Classic M/M/1: Wq = lambda / (mu * (mu - lambda)), in seconds.
    const expectedWaitSeconds = lambda / (mu * (mu - lambda));
    expect(result.waitTimeMs).toBeCloseTo(expectedWaitSeconds * 1000, 6);
    expect(result.serviceTimeMs).toBeCloseTo(1000 / mu, 6);
    expect(result.latencyMs).toBeCloseTo(result.waitTimeMs + result.serviceTimeMs, 6);
    expect(result.utilization).toBeCloseTo(0.8, 6);
    expect(result.overloaded).toBe(false);
  });

  it("returns zero wait and zero utilization when there is no traffic", () => {
    const result = computeNodeQueue(0, 100, 2);
    expect(result.utilization).toBe(0);
    expect(result.waitTimeMs).toBe(0);
    expect(result.overloaded).toBe(false);
  });

  it("flags a node as overloaded once utilization reaches 100%", () => {
    const atCapacity = computeNodeQueue(100, 100, 1);
    expect(atCapacity.utilization).toBeCloseTo(1, 6);
    expect(atCapacity.overloaded).toBe(true);
    expect(atCapacity.waitTimeMs).toBe(Number.POSITIVE_INFINITY);

    const overCapacity = computeNodeQueue(150, 100, 1);
    expect(overCapacity.utilization).toBeCloseTo(1.5, 6);
    expect(overCapacity.overloaded).toBe(true);
  });

  it("reduces wait time when more replicas share the same load (M/M/c benefit)", () => {
    // Same total utilization (0.8), but spread across 4 replicas instead of 1.
    const singleReplica = computeNodeQueue(80, 100, 1);
    const fourReplicas = computeNodeQueue(80, 25, 4);

    expect(singleReplica.utilization).toBeCloseTo(fourReplicas.utilization, 6);
    expect(fourReplicas.waitTimeMs).toBeLessThan(singleReplica.waitTimeMs);
  });

  it("matches known Erlang C reference values (c=2, rho=0.5)", () => {
    // lambda=50, mu=50, c=2 -> a = c*rho = 1.0, a well-known Erlang C table entry: C ~= 0.3333
    const result = computeNodeQueue(50, 50, 2);
    const capacity = 2 * 50;
    const pWaitImplied = (result.waitTimeMs / 1000) * (capacity - 50);
    expect(pWaitImplied).toBeCloseTo(1 / 3, 3);
  });
});

describe("simulate (topology traversal + traffic propagation)", () => {
  const client: SimNodeConfig = {
    id: "client",
    kind: "client",
    replicas: 1,
    capacityPerReplicaRps: Number.POSITIVE_INFINITY,
  };
  const lb: SimNodeConfig = {
    id: "lb",
    kind: "load_balancer",
    replicas: 1,
    capacityPerReplicaRps: 5000,
  };
  const appServer: SimNodeConfig = {
    id: "app",
    kind: "app_server",
    replicas: 4,
    capacityPerReplicaRps: 100,
  };
  const db: SimNodeConfig = {
    id: "db",
    kind: "sql_db",
    replicas: 1,
    capacityPerReplicaRps: 300,
  };

  it("propagates RPS linearly through a simple chain in topological order", () => {
    const output = simulate({
      nodes: [client, lb, appServer, db],
      edges: [
        { source: "client", target: "lb" },
        { source: "lb", target: "app" },
        { source: "app", target: "db" },
      ],
      sourceNodeId: "client",
      incomingRps: 200,
    });

    expect(output.ok).toBe(true);
    expect(output.results.get("lb")?.inputRps).toBe(200);
    expect(output.results.get("app")?.inputRps).toBe(200);
    expect(output.results.get("db")?.inputRps).toBe(200);
    // App server: 200 rps over 4 replicas * 100 rps = 400 capacity -> utilization 0.5
    expect(output.results.get("app")?.utilization).toBeCloseTo(0.5, 6);
  });

  it("reduces downstream traffic by the cache hit rate", () => {
    const cache: SimNodeConfig = {
      id: "cache",
      kind: "cache",
      replicas: 1,
      capacityPerReplicaRps: 5000,
      cacheHitRate: 0.8,
    };

    const output = simulate({
      nodes: [client, cache, db],
      edges: [
        { source: "client", target: "cache" },
        { source: "cache", target: "db" },
      ],
      sourceNodeId: "client",
      incomingRps: 1000,
    });

    expect(output.results.get("cache")?.inputRps).toBe(1000);
    expect(output.results.get("cache")?.outputRps).toBeCloseTo(200, 6);
    expect(output.results.get("db")?.inputRps).toBeCloseTo(200, 6);
  });

  it("sums fan-in traffic from multiple upstream nodes", () => {
    const worker: SimNodeConfig = {
      id: "worker",
      kind: "worker",
      replicas: 1,
      capacityPerReplicaRps: 1000,
    };

    const output = simulate({
      nodes: [client, lb, appServer, worker],
      edges: [
        { source: "client", target: "lb" },
        { source: "lb", target: "appServer_dup" }, // will be ignored (unknown endpoint)
      ],
      sourceNodeId: "client",
      incomingRps: 100,
    });

    // Edge to an unknown node should be reported as an error, not silently accepted.
    expect(output.ok).toBe(false);
    expect(output.errors[0]?.type).toBe("unknown_edge_endpoint");
    void appServer;
    void worker;
  });

  it("marks an overloaded node when demand exceeds total capacity", () => {
    const output = simulate({
      nodes: [client, db],
      edges: [{ source: "client", target: "db" }],
      sourceNodeId: "client",
      incomingRps: 1000, // db capacity is only 300 rps
    });

    const dbResult = output.results.get("db");
    expect(dbResult?.overloaded).toBe(true);
    expect(dbResult?.utilization).toBeGreaterThan(1);
  });

  it("detects cycles instead of infinite-looping", () => {
    const output = simulate({
      nodes: [client, lb, appServer],
      edges: [
        { source: "client", target: "lb" },
        { source: "lb", target: "app" },
        { source: "app", target: "lb" },
      ],
      sourceNodeId: "client",
      incomingRps: 100,
    });

    expect(output.ok).toBe(false);
    expect(output.errors.some((e) => e.type === "cycle")).toBe(true);
  });
});
