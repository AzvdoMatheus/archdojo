export type ComponentKind =
  | "client"
  | "load_balancer"
  | "cdn"
  | "api_gateway"
  | "app_server"
  | "cache"
  | "sql_db"
  | "nosql_db"
  | "message_queue"
  | "worker";

export interface SimNodeConfig {
  id: string;
  kind: ComponentKind;
  /** Number of parallel replicas (servers) behind this logical node. */
  replicas: number;
  /** Max requests/sec a single replica can service (the queueing service rate, mu). */
  capacityPerReplicaRps: number;
  /** Only meaningful for kind === "cache": fraction of requests served without hitting downstream nodes. */
  cacheHitRate?: number;
}

export interface SimEdge {
  source: string;
  target: string;
}

export interface SimInput {
  nodes: SimNodeConfig[];
  edges: SimEdge[];
  /** id of the node that injects traffic into the graph (normally the Client node). */
  sourceNodeId: string;
  /** Requests/sec the source node injects into the graph. */
  incomingRps: number;
}

export interface SimNodeResult {
  nodeId: string;
  /** Requests/sec arriving at this node. */
  inputRps: number;
  /** Requests/sec this node forwards downstream (reduced by cache hit rate, if any). */
  outputRps: number;
  /** lambda / (c * mu). >= 1 means the node cannot keep up. */
  utilization: number;
  /** Average time a request waits in queue before being served, in ms (Erlang C Wq). */
  waitTimeMs: number;
  /** 1 / mu, in ms: time to actually process one request once served. */
  serviceTimeMs: number;
  /** waitTimeMs + serviceTimeMs: what the player should read as "this node's latency". */
  latencyMs: number;
  overloaded: boolean;
}

export interface SimError {
  type: "cycle" | "disconnected_source" | "unknown_edge_endpoint";
  message: string;
}

export interface SimOutput {
  ok: boolean;
  results: Map<string, SimNodeResult>;
  errors: SimError[];
}
