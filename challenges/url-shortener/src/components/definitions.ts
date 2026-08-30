import type { ComponentKind } from "../simulation/types";

export type ComponentCategory =
  | "Cliente"
  | "Tráfego & Edge"
  | "Computação"
  | "Armazenamento"
  | "Mensageria";

export interface ComponentDefinition {
  kind: ComponentKind;
  label: string;
  category: ComponentCategory;
  icon: string;
  /** What it is, in plain language. */
  description: string;
  /** Why/when a player would reach for this piece. */
  whenToUse: string;
  /** The main trade-off: what you give up by adding it. */
  tradeoff: string;
  defaultReplicas: number;
  /** Realistic-order-of-magnitude requests/sec a single replica can serve (the queueing service rate). */
  defaultCapacityPerReplicaRps: number;
  defaultCacheHitRate?: number;
  /** Only the client can be the traffic source; only one is allowed on the canvas. */
  singleton?: boolean;
}

export const componentDefinitions: ComponentDefinition[] = [
  {
    kind: "client",
    label: "Cliente",
    category: "Cliente",
    icon: "🎮",
    description: "O navegador/app do usuário final: quem cria e acessa URLs curtas.",
    whenToUse: "Todo desenho de arquitetura começa aqui - é a fonte de tráfego da simulação.",
    tradeoff: "Nenhum trade-off: é o ponto de partida, não uma peça que você escolhe adicionar.",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: Number.POSITIVE_INFINITY,
    singleton: true,
  },
  {
    kind: "load_balancer",
    label: "Load Balancer",
    category: "Tráfego & Edge",
    icon: "⚖️",
    description: "Distribui as requisições recebidas entre várias réplicas de um serviço.",
    whenToUse:
      "Use quando tiver mais de uma réplica de um serviço e precisar espalhar carga entre elas.",
    tradeoff:
      "Adiciona um hop de rede e um ponto a mais para monitorar; ele mesmo pode virar gargalo se subdimensionado.",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: 8000,
  },
  {
    kind: "cdn",
    label: "CDN",
    category: "Tráfego & Edge",
    icon: "🌐",
    description:
      "Rede de servidores de borda que fica geograficamente perto do usuário e guarda respostas em cache.",
    whenToUse:
      "Ótimo para conteúdo estático ou repetitivo (ex.: páginas de erro, assets) e para reduzir latência geográfica.",
    tradeoff:
      "Não ajuda em respostas dinâmicas e únicas por requisição; invalidação de cache é um problema à parte.",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: 20000,
    defaultCacheHitRate: 0,
  },
  {
    kind: "api_gateway",
    label: "API Gateway",
    category: "Tráfego & Edge",
    icon: "🚪",
    description:
      "Porta de entrada única da API: roteamento, autenticação, rate limiting antes de chegar nos serviços.",
    whenToUse:
      "Use para centralizar preocupações transversais (auth, rate limit, roteamento) fora da lógica de negócio.",
    tradeoff:
      "Mais um componente na frente de tudo: se cair ou ficar lento, derruba o sistema inteiro junto.",
    defaultReplicas: 2,
    defaultCapacityPerReplicaRps: 4000,
  },
  {
    kind: "app_server",
    label: "App Server",
    category: "Computação",
    icon: "🖥️",
    description:
      "Executa a lógica de negócio: gera códigos curtos, valida entradas, orquestra o redirecionamento.",
    whenToUse: "É onde a regra de negócio do desafio (encurtar/redirecionar) realmente roda.",
    tradeoff: "Stateless idealmente - guardar estado aqui dificulta escalar horizontalmente.",
    defaultReplicas: 3,
    defaultCapacityPerReplicaRps: 500,
  },
  {
    kind: "cache",
    label: "Cache",
    category: "Armazenamento",
    icon: "⚡",
    description: "Armazena em memória os pares código-curto → URL-longa mais acessados.",
    whenToUse:
      "O acesso a URLs curtas segue uma distribuição bem desigual (poucas URLs concentram a maior parte dos acessos) - cache reduz drasticamente a carga no banco.",
    tradeoff:
      "Dados em cache podem ficar desatualizados (staleness); mais um lugar para invalidar quando a URL muda.",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: 10000,
    defaultCacheHitRate: 0.8,
  },
  {
    kind: "sql_db",
    label: "Banco SQL",
    category: "Armazenamento",
    icon: "🗄️",
    description: "Banco relacional com esquema fixo e transações ACID.",
    whenToUse:
      "Bom quando você precisa de consistência forte e relações bem definidas (ex.: código curto único).",
    tradeoff:
      "Escalar escrita horizontalmente é mais difícil que em bancos NoSQL; geralmente exige sharding manual.",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: 1500,
  },
  {
    kind: "nosql_db",
    label: "Banco NoSQL",
    category: "Armazenamento",
    icon: "🧩",
    description:
      "Banco chave-valor ou de documentos, sem esquema rígido, feito para escalar horizontalmente.",
    whenToUse:
      "Bom para pares simples chave-valor (código curto → URL) com volume alto e necessidade de escalar escrita.",
    tradeoff:
      "Geralmente troca consistência forte por disponibilidade/escala (consistência eventual).",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: 3000,
  },
  {
    kind: "message_queue",
    label: "Fila / Pub-Sub",
    category: "Mensageria",
    icon: "📬",
    description: "Enfileira mensagens entre serviços para processamento assíncrono e desacoplado.",
    whenToUse:
      "Use para trabalho que não precisa de resposta síncrona (ex.: registrar analytics de cliques, gerar relatórios).",
    tradeoff:
      "Adiciona complexidade operacional e latência de entrega; a resposta ao usuário não pode depender de algo enfileirado.",
    defaultReplicas: 1,
    defaultCapacityPerReplicaRps: 5000,
  },
  {
    kind: "worker",
    label: "Worker",
    category: "Computação",
    icon: "⚙️",
    description:
      "Processo que consome mensagens de uma fila e executa trabalho assíncrono em segundo plano.",
    whenToUse:
      "Sempre acompanha uma fila: é quem de fato processa o que foi enfileirado (ex.: analytics de cliques).",
    tradeoff:
      "Não participa do caminho síncrono de resposta - se o worker cair, o usuário nem percebe na hora (mas o trabalho se acumula).",
    defaultReplicas: 2,
    defaultCapacityPerReplicaRps: 200,
  },
];

export function getComponentDefinition(kind: ComponentKind): ComponentDefinition {
  const def = componentDefinitions.find((d) => d.kind === kind);
  if (!def) throw new Error(`Unknown component kind: ${kind}`);
  return def;
}
