import { describe, expect, it } from "vitest";
import { findFreeDropPosition } from "./layout";

describe("findFreeDropPosition", () => {
  it("returns the desired position when nothing overlaps it", () => {
    const desired = { x: 400, y: 300 };
    expect(findFreeDropPosition(desired, [{ x: 40, y: 200 }])).toEqual(desired);
  });

  it("nudges the position diagonally when it overlaps an existing node", () => {
    const desired = { x: 40, y: 200 };
    const result = findFreeDropPosition(desired, [{ x: 40, y: 200 }]);

    expect(result).not.toEqual(desired);
    const clearsX = Math.abs(result.x - 40) >= 190;
    const clearsY = Math.abs(result.y - 200) >= 120;
    expect(clearsX || clearsY).toBe(true);
  });

  it("keeps nudging until it clears every existing node", () => {
    const existing = [
      { x: 40, y: 200 },
      { x: 80, y: 240 },
      { x: 120, y: 280 },
    ];

    const result = findFreeDropPosition({ x: 40, y: 200 }, existing);

    for (const pos of existing) {
      const clearsX = Math.abs(result.x - pos.x) >= 190;
      const clearsY = Math.abs(result.y - pos.y) >= 120;
      expect(clearsX || clearsY).toBe(true);
    }
  });
});
