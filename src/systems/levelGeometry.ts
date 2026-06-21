/**
 * Level geometry (WO-09) — pure bounds math, no Phaser. Both the Phaser-side
 * `buildLevelWorld` and the node self-check import this, so the numbers have one home.
 */

import { WORLD_WIDTH, WORLD_HEIGHT, GROUND_TOP_Y, GROUND_WIDTH } from '../core/Constants';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GroundRect extends Rect {
  /** Top edge of the ground surface (player feet rest here). */
  top: number;
}

/** World bounds for physics + camera: the full canonical composition space. */
export function levelWorldBounds(): Rect {
  return { x: 0, y: 0, width: WORLD_WIDTH, height: WORLD_HEIGHT };
}

/** The single ground body: spans full width from GROUND_TOP_Y down to the world floor. */
export function groundBodyRect(): GroundRect {
  const top = GROUND_TOP_Y;
  return { x: 0, y: top, top, width: GROUND_WIDTH, height: WORLD_HEIGHT - top };
}

/** Exactly one ground body — the level contract requires a single, non-segmented roof. */
export function groundBodies(): GroundRect[] {
  return [groundBodyRect()];
}
