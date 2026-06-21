/**
 * Platform movement (WO-11) — pure ping-pong math + manifest instance loading.
 * No Phaser, so the node check can assert bounds + turnaround. The Phaser
 * `Platform` drives a real body from `PlatformMover`.
 */

import { ManifestMismatchError } from '../data/assetManifests';
import type { AssetCatalog } from './AssetCatalog';

export type PlatformKind = 'stationary' | 'vertical' | 'horizontal';

export interface PlatformInstance {
  id: string;
  kind: PlatformKind;
  x: number; // top-left
  y: number;
  width: number;
  height: number;
  brickCount: number;
  movement: { axis: 'x' | 'y'; min: number; max: number } | null;
  speed: number;
}

/** All 10 authored obstacles, straight from the catalog placements (no hardcoding). */
export function platformInstances(catalog: AssetCatalog): PlatformInstance[] {
  const obstacles = catalog.placements.environmentObstacles;
  if (!obstacles?.length) {
    throw new ManifestMismatchError('authoredGameplayPlacements.environmentObstacles', 'level manifest');
  }
  return obstacles.map((o) => ({
    id: o.id,
    kind: o.kind,
    x: o.topLeft.x,
    y: o.topLeft.y,
    width: o.width,
    height: o.height,
    brickCount: o.brickCount,
    movement: o.movement,
    speed: o.speed,
  }));
}

/** Clamp + reflect a candidate position at the [min,max] bounds. */
export function reflect(
  pos: number,
  dir: 1 | -1,
  min: number,
  max: number,
): { pos: number; dir: 1 | -1; turned: boolean } {
  if (dir > 0 && pos >= max) return { pos: max, dir: -1, turned: true };
  if (dir < 0 && pos <= min) return { pos: min, dir: 1, turned: true };
  return { pos, dir, turned: false };
}

/**
 * Authoritative ping-pong mover. Owns position; a Phaser body chases it. Starts
 * heading into the interior (so a platform authored at a bound doesn't instantly
 * turn around).
 */
export class PlatformMover {
  pos: number;
  dir: 1 | -1;
  private started = false;

  constructor(
    readonly id: string,
    readonly kind: PlatformKind,
    readonly axis: 'x' | 'y',
    private readonly min: number,
    private readonly max: number,
    private readonly speed: number,
    startPos: number,
  ) {
    this.pos = startPos;
    this.dir = startPos >= max ? -1 : 1;
  }

  /** Advance one step; fire callbacks; return signed delta moved along the axis. */
  step(
    dtSec: number,
    onStart: (pos: number) => void,
    onTurn: (pos: number, dir: 1 | -1) => void,
  ): number {
    if (!this.started) {
      this.started = true;
      onStart(this.pos);
    }
    const prev = this.pos;
    const candidate = this.pos + this.dir * this.speed * dtSec;
    const r = reflect(candidate, this.dir, this.min, this.max);
    this.pos = r.pos;
    this.dir = r.dir;
    if (r.turned) onTurn(r.pos, r.dir);
    return this.pos - prev;
  }
}
