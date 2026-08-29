import type { ComponentType } from "react";

export interface ChallengeEntry {
  slug: string;
  title: string;
  Component: ComponentType;
}

/**
 * Cada novo desafio se registra aqui pra aparecer na navegação do playground.
 * Exemplo:
 *
 * import { UrlShortener } from "@challenges/url-shortener";
 *
 * export const challenges: ChallengeEntry[] = [
 *   { slug: "url-shortener", title: "URL Shortener", Component: UrlShortener },
 * ];
 */
export const challenges: ChallengeEntry[] = [];
