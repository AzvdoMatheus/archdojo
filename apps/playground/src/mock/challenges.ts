import type { ChallengeDifficulty } from "../challenges/registry";

/**
 * Mock-only challenge entries so the "Desafios" grid can be evaluated with a
 * realistic amount of content before more real challenges are built. These
 * are NOT wired to any real challenge implementation/route - `status: "mock"`
 * is what Home.tsx checks to render them as disabled "coming soon" cards
 * instead of navigable Links. Keep this list separate from
 * `challenges/registry.ts`, which only ever holds real, playable challenges.
 */
export interface MockChallengeEntry {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  summary: string;
  status: "mock";
}

export const mockChallenges: MockChallengeEntry[] = [
  {
    slug: "rate-limiter",
    title: "Rate Limiter Distribuído",
    difficulty: "Médio",
    summary: "Projete um limitador de taxa compartilhado entre múltiplas instâncias de API.",
    status: "mock",
  },
  {
    slug: "news-feed",
    title: "Feed de Notícias",
    difficulty: "Difícil",
    summary: "Modele fan-out de posts, ranking e cache de timeline para milhões de usuários.",
    status: "mock",
  },
  {
    slug: "chat-app",
    title: "Chat em Tempo Real",
    difficulty: "Médio",
    summary: "Desenhe entrega de mensagens em tempo real com presença e histórico durável.",
    status: "mock",
  },
  {
    slug: "video-streaming",
    title: "Streaming de Vídeo",
    difficulty: "Difícil",
    summary: "Planeje ingestão, transcodificação e distribuição via CDN de vídeo sob demanda.",
    status: "mock",
  },
  {
    slug: "ride-sharing",
    title: "Corridas Compartilhadas",
    difficulty: "Difícil",
    summary: "Combine motoristas e passageiros geoespacialmente com baixa latência.",
    status: "mock",
  },
  {
    slug: "job-scheduler",
    title: "Agendador de Jobs",
    difficulty: "Fácil",
    summary: "Construa uma fila de jobs agendados com retries e garantias de entrega única.",
    status: "mock",
  },
];
