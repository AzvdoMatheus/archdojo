/**
 * ArchNode's rendered footprint (min-w-[150px] plus padding/icon/stat-badges), used only to
 * keep freshly dropped nodes from landing exactly on top of an existing one. Overlap is a real
 * bug, not a cosmetic one: React Flow gives the top (later/selected) node's own body a higher
 * z-index than nodes beneath it, so a covering node silently swallows pointer events meant for
 * the connection handle of the node underneath - dragging a connection from that handle then
 * does nothing, with no visible error.
 */
const NODE_FOOTPRINT = { width: 190, height: 120 };

export interface Point {
  x: number;
  y: number;
}

function overlaps(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < NODE_FOOTPRINT.width && Math.abs(a.y - b.y) < NODE_FOOTPRINT.height;
}

/**
 * Returns `desired`, or the nearest position along a diagonal cascade that doesn't overlap
 * any position in `existing`.
 */
export function findFreeDropPosition(desired: Point, existing: Point[], maxAttempts = 20): Point {
  const step = 40;
  let candidate = desired;
  let attempts = 0;

  while (existing.some((pos) => overlaps(candidate, pos)) && attempts < maxAttempts) {
    candidate = { x: candidate.x + step, y: candidate.y + step };
    attempts += 1;
  }

  return candidate;
}
