/**
 * Flag (WO-13) — the goal marker at the authored placement. Static overlap sensor
 * against the player; CompletionSystem decides what a touch means.
 *
 * ponytail: no flag art exists in any manifest (only the placement), so this is a
 * marked PLACEHOLDER rectangle + sensor zone, not a hardcoded/fake texture key.
 * Swap for a real flag sprite when an asset lands (asset gap flagged to Manager).
 * Ceiling: replace the rectangle with `scene.add.sprite(x,y,catalog.flagMeta.key)`
 * and read dims from the catalog once the manifest has a flag entry.
 */

import type Phaser from 'phaser';

const PLACEHOLDER_WIDTH = 28;
const PLACEHOLDER_HEIGHT = 200;
const PLACEHOLDER_COLOR = 0x33dd66;

export class Flag {
  readonly id: string;
  readonly zone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, placement: { id: string; x: number; y: number }) {
    this.id = placement.id;
    // bottom-center anchor: center the body horizontally at x, with its base at y.
    const cx = placement.x;
    const cy = placement.y - PLACEHOLDER_HEIGHT / 2;

    this.zone = scene.add.zone(cx, cy, PLACEHOLDER_WIDTH, PLACEHOLDER_HEIGHT);
    scene.physics.add.existing(this.zone, true); // static overlap body

    scene.add
      .rectangle(cx, cy, PLACEHOLDER_WIDTH, PLACEHOLDER_HEIGHT, PLACEHOLDER_COLOR)
      .setOrigin(0.5, 0.5);
  }

  /** The overlap target for `physics.add.overlap(player, flag.sprite)`. */
  get sprite(): Phaser.GameObjects.Zone {
    return this.zone;
  }
}
