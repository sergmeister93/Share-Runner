/**
 * Flag (WO-13) — the goal marker at the authored placement. Static overlap sensor
 * against the player; CompletionSystem decides what a touch means. The visual is the
 * real finish-flag sprite (environments manifest `finish-flag`); the win-trigger is a
 * separate invisible sensor zone kept at the QA-verified footprint.
 */

import type Phaser from 'phaser';
import type { PrefabMeta } from '../systems/AssetCatalog';

// Win-trigger sensor footprint (gameplay-tuned; QA-verified reachable at x=4230). The
// sensor is the contract the level was balanced around — only the visual changed from a
// placeholder rect to the real sprite, so these stay put.
const SENSOR_WIDTH = 28;
const SENSOR_HEIGHT = 200;
// Flag sprite display height in world px; width derives from the manifest's native
// aspect so nothing is hardcoded. ponytail: single tunable knob if the flag should read
// bigger/smaller on screen — the sensor is independent and stays put.
const DISPLAY_HEIGHT = SENSOR_HEIGHT;

export class Flag {
  readonly id: string;
  readonly zone: Phaser.GameObjects.Zone;

  constructor(
    scene: Phaser.Scene,
    placement: { id: string; x: number; y: number },
    meta: PrefabMeta,
  ) {
    this.id = placement.id;
    // bottom-center anchor: base planted at (placement.x, placement.y).
    const cx = placement.x;
    const cy = placement.y - SENSOR_HEIGHT / 2;

    this.zone = scene.add.zone(cx, cy, SENSOR_WIDTH, SENSOR_HEIGHT);
    scene.physics.add.existing(this.zone, true); // static overlap body

    // Display width from the manifest's native aspect ratio (no hardcoded sprite dims).
    const displayWidth = DISPLAY_HEIGHT * (meta.width / meta.height);
    scene.add
      .sprite(placement.x, placement.y, meta.key)
      .setOrigin(0.5, 1)
      .setDisplaySize(displayWidth, DISPLAY_HEIGHT);
  }

  /** The overlap target for `physics.add.overlap(player, flag.sprite)`. */
  get sprite(): Phaser.GameObjects.Zone {
    return this.zone;
  }
}
