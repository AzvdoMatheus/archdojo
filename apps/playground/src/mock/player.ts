/**
 * Mocked player/progress state for the Home screen's "Desafios" header.
 *
 * There is no auth/user system yet, so this module hardcodes a single local
 * player. It is shaped like data a real backend would eventually return
 * (name, avatar, xp, completed challenge slugs) precisely so `usePlayer()`
 * can later be swapped for a real fetch/query without touching callers.
 */

export interface PlayerProfile {
  name: string;
  avatarUrl: string;
  xp: number;
  completedChallengeSlugs: string[];
}

/** XP required to reach each level; level = how many thresholds have been cleared. */
const LEVEL_XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];

function levelForXp(xp: number): number {
  let level = 1;
  for (const threshold of LEVEL_XP_THRESHOLDS) {
    if (xp >= threshold) level += 1;
    else break;
  }
  return level;
}

/** Deterministic placeholder avatar - a neon-toned pixel identicon, fully client-side. */
function mockAvatarUrl(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const cells = Array.from({ length: 25 }, (_, i) => (hash >> i) & 1);
  const size = 5;
  const cellSize = 20;
  const rects = cells
    .map((on, i) => {
      if (!on) return "";
      const x = (i % size) * cellSize;
      const y = Math.floor(i / size) * cellSize;
      return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="hsl(${hue},90%,60%)" />`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="hsl(${hue},40%,12%)" />${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PLAYER_NAME = "Capitão";
const MOCK_XP = 420;
const MOCK_COMPLETED_SLUGS = ["url-shortener", "rate-limiter"];

export const mockPlayer: PlayerProfile = {
  name: PLAYER_NAME,
  avatarUrl: mockAvatarUrl(PLAYER_NAME),
  xp: MOCK_XP,
  completedChallengeSlugs: MOCK_COMPLETED_SLUGS,
};

export function usePlayer(): PlayerProfile & { level: number } {
  return { ...mockPlayer, level: levelForXp(mockPlayer.xp) };
}
