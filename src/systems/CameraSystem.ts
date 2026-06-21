/**
 * CameraSystem (WO-09) — camera containment, player-follow, and the establishing
 * pan. Player-follow target wiring lands with the Player (WO-10). Runtime camera
 * behaviour is browser-verified at integration (WO-16).
 *
 * `import type Phaser` keeps this runtime-Phaser-free (calls go through `scene`).
 */

import type Phaser from 'phaser';
import { eventBus } from '../core/EventBus';
import { WORLD_WIDTH, WORLD_HEIGHT, CAMERA_PAN_DURATION_MS } from '../core/Constants';

export class CameraSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  /** Camera cannot show outside the world bounds. */
  contain(): void {
    this.scene.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  /** Follow the player once it exists (WO-10 supplies the target). */
  follow(target: Phaser.GameObjects.GameObject): void {
    this.scene.cameras.main.startFollow(target, true);
  }

  /**
   * Establishing pan toward the spawn area. Emits the frozen spectacle events at
   * start and completion; pan duration is the tunable CAMERA_PAN_DURATION_MS.
   */
  establishingPan(targetX: number, targetY: number, from: 'menu' | 'preloader'): void {
    eventBus.emit('camera:establishing-pan:start', {
      from,
      targetX,
      targetY,
      durationMs: CAMERA_PAN_DURATION_MS,
    });
    this.scene.cameras.main.pan(
      targetX,
      targetY,
      CAMERA_PAN_DURATION_MS,
      'Sine.easeInOut',
      false,
      (_cam, progress) => {
        if (progress >= 1) {
          eventBus.emit('camera:establishing-pan:complete', { playerId: 'player' });
        }
      },
    );
  }
}
