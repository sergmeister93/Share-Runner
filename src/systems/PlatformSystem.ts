/**
 * PlatformSystem (WO-11) — builds the 10 authored platforms, steps the movers each
 * frame, and carries a rider on horizontal movers. The Level scene (WO-16) wires
 * `player.collideWith(system.colliderTargets)` and calls `update` + `carry` per frame.
 */

import type Phaser from 'phaser';
import { Platform } from '../objects/Platform';
import { platformInstances } from './platformMovement';
import type { AssetCatalog } from './AssetCatalog';

export class PlatformSystem {
  readonly platforms: Platform[];

  constructor(scene: Phaser.Scene, catalog: AssetCatalog) {
    this.platforms = platformInstances(catalog).map((inst) => new Platform(scene, inst));
  }

  /** Sprites to pass to `physics.add.collider` / `player.collideWith`. */
  get colliderTargets(): Phaser.GameObjects.GameObject[] {
    return this.platforms.map((p) => p.sprite);
  }

  /** Step every mover. Call once per frame with seconds. */
  update(dtSec: number): void {
    for (const p of this.platforms) p.update(dtSec);
  }

  /**
   * Carry a rider standing on a horizontal mover (arcade does not carry horizontally).
   * Vertical movers carry via body push + the player's ground-stick. Call after
   * `update`, before the player's own movement resolves. Browser-tuned at WO-16.
   */
  carry(rider: Phaser.Physics.Arcade.Sprite): void {
    const body = rider.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down && !body.touching.down) return;
    for (const p of this.platforms) {
      if (!p.mover || p.deltaX === 0) continue;
      if (this.isRestingOn(body, p)) rider.x += p.deltaX;
    }
  }

  /** Rider's feet are on the platform's top surface and horizontally overlapping. */
  private isRestingOn(body: Phaser.Physics.Arcade.Body, platform: Platform): boolean {
    const pb = platform.body;
    const feetY = body.y + body.height;
    const onTop = Math.abs(feetY - pb.y) <= 4; // within a few px of the top surface
    const xOverlap = body.x + body.width > pb.x && body.x < pb.x + pb.width;
    return onTop && xOverlap;
  }
}
