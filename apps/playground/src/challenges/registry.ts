import { UrlShortener, urlShortenerChallenge } from "@challenges/url-shortener";
import type { ComponentType } from "react";

export type ChallengeDifficulty = "Fácil" | "Médio" | "Difícil";

export interface ChallengeEntry {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  summary: string;
  Component: ComponentType;
}

/**
 * Cada novo desafio se registra aqui pra aparecer na aba "Desafios" da Home.
 */
export const challenges: ChallengeEntry[] = [
  {
    slug: urlShortenerChallenge.slug,
    title: urlShortenerChallenge.title,
    difficulty: urlShortenerChallenge.difficulty,
    summary: urlShortenerChallenge.summary,
    Component: UrlShortener,
  },
];
