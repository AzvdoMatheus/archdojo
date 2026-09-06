/**
 * Deterministic, fully client-side thumbnail for a challenge card. Generates a
 * small neon-arcade "circuit board" SVG seeded by the challenge slug, so every
 * card (real or mock) gets a distinct but consistent illustration with no
 * network fetch and no binary assets checked into the repo.
 */
const NEON_HUES = [326, 190, 45, 152, 265];
const WIDTH = 280;
const HEIGHT = 140;
const GRID_COLS = 6;
const GRID_ROWS = 3;
const NODE_COUNT = 6;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Places nodes on a jittered grid so they stay spread out instead of clustering. */
function layoutNodes(slug: string): { x: number; y: number }[] {
  const cellW = WIDTH / GRID_COLS;
  const cellH = HEIGHT / GRID_ROWS;
  const cellCount = GRID_COLS * GRID_ROWS;
  const usedCells = new Set<number>();
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < NODE_COUNT; i += 1) {
    const cellHash = hashSeed(`${slug}-cell-${i}`);
    let cell = cellHash % cellCount;
    while (usedCells.has(cell)) {
      cell = (cell + 1) % cellCount;
    }
    usedCells.add(cell);
    const col = cell % GRID_COLS;
    const row = Math.floor(cell / GRID_COLS);
    const jitterX = (cellHash >> 8) % Math.round(cellW * 0.4);
    const jitterY = (cellHash >> 16) % Math.round(cellH * 0.4);
    nodes.push({
      x: Math.round(col * cellW + cellW * 0.3 + jitterX),
      y: Math.round(row * cellH + cellH * 0.3 + jitterY),
    });
  }
  return nodes;
}

export function getChallengeThumbnail(slug: string): string {
  const hash = hashSeed(slug);
  const hue = NEON_HUES[hash % NEON_HUES.length];
  const nodes = layoutNodes(slug);

  let traces = "";
  let previous: { x: number; y: number } | null = null;
  for (const node of nodes) {
    if (previous) {
      const midX = node.x;
      const midY = previous.y;
      traces += `<path d="M${previous.x},${previous.y} L${midX},${midY} L${node.x},${node.y}" fill="none" stroke="hsl(${hue},95%,60%)" stroke-width="2" stroke-opacity="0.85" stroke-linecap="round" />`;
    }
    previous = node;
  }

  const chips = nodes
    .map((n, i) => {
      const size = 12 + (hashSeed(`${slug}-size-${i}`) % 10);
      return (
        `<rect x="${n.x - size / 2}" y="${n.y - size / 2}" width="${size}" height="${size}" rx="3" ` +
        `fill="hsl(${hue},30%,14%)" stroke="hsl(${hue},95%,65%)" stroke-width="2" />` +
        `<circle cx="${n.x}" cy="${n.y}" r="2.5" fill="hsl(${hue},100%,80%)" />`
      );
    })
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="hsl(${hue},50%,7%)" />` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g-${hue})" />` +
    `<defs><radialGradient id="g-${hue}" cx="15%" cy="0%" r="120%">` +
    `<stop offset="0%" stop-color="hsl(${hue},90%,22%)" /><stop offset="100%" stop-color="transparent" /></radialGradient></defs>` +
    `${traces}${chips}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
