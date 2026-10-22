import { TOTAL_SUPPLY } from "@/lib/shards";

// The world is a square spiral of 5,000 sectors around the Archive at (0, 0). Token 1 sits
// next to the Archive; Archivists ring it, Survivors hold the outer wastes.
// Cell coordinates are integers; the grid is about 71 x 71.

export type Cell = { x: number; y: number };

const cells: Cell[] = [];
(function build() {
  let x = 0;
  let y = 0;
  let dx = 1;
  let dy = 0;
  let segment = 1;
  let step = 0;
  let turns = 0;
  // Archive occupies (0,0); tokens start on the next cell.
  while (cells.length < TOTAL_SUPPLY) {
    x += dx;
    y += dy;
    cells.push({ x, y });
    step++;
    if (step === segment) {
      step = 0;
      const t = dx;
      dx = -dy;
      dy = t;
      turns++;
      if (turns % 2 === 0) segment++;
    }
  }
})();

export function cellForToken(tokenId: number): Cell {
  return cells[Math.min(Math.max(tokenId, 1), TOTAL_SUPPLY) - 1];
}

export const WORLD_RADIUS = Math.max(...cells.map((c) => Math.max(Math.abs(c.x), Math.abs(c.y))));
export const ALL_CELLS = cells;
