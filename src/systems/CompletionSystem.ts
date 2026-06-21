/**
 * CompletionSystem (WO-13) — wires the Flag overlap to the pure CompletionTracker.
 * The Level scene (WO-16) calls `registerOverlap(player)`; `elapsedMs` is the run
 * timer the scene maintains in gameState.
 */

import type Phaser from 'phaser';
import { Flag } from '../objects/Flag';
import { CompletionTracker } from './completion';
import type { AssetCatalog } from './AssetCatalog';

export class CompletionSystem {
  readonly flag: Flag;
  private readonly tracker = new CompletionTracker();

  constructor(scene: Phaser.Scene, catalog: AssetCatalog) {
    this.flag = new Flag(scene, catalog.placements.flag, catalog.flagMeta);
  }

  /** Player overlap -> evaluate the win condition (locked feedback or completion). */
  registerOverlap(player: Phaser.GameObjects.GameObject): Phaser.Physics.Arcade.Collider {
    const scene = this.flag.zone.scene;
    return scene.physics.add.overlap(player, this.flag.sprite, () =>
      this.tracker.onFlagTouch(scene.time.now),
    );
  }

  get isComplete(): boolean {
    return this.tracker.isComplete;
  }

  reset(): void {
    this.tracker.reset();
  }
}
