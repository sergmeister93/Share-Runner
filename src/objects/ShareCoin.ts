/**
 * ShareCoin (WO-12) — one collectible. Static arcade body (overlap sensor) moved
 * each frame for bob + move-with-platform tracking (E-02). Collect-once is guarded
 * here; the scoring/events live in the pure `collectShare`.
 */

import type Phaser from 'phaser';
import {
  collectShare,
  bobOffset,
  captureAnchorOffset,
  coinPositionFromPlatform,
  type AnchorOffset,
  type CoinInstance,
} from '../systems/collectibles';
import type { Platform } from './Platform';

export class ShareCoin {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private collected = false;
  private elapsedMs = 0;
  private baseX: number;
  private baseY: number;
  private readonly anchor: Platform | null;
  private readonly offset: AnchorOffset | null;

  constructor(scene: Phaser.Scene, inst: CoinInstance, textureKey: string, anchor: Platform | null) {
    this.id = inst.id;
    this.baseX = inst.x;
    this.baseY = inst.y;

    this.sprite = scene.physics.add.staticSprite(inst.x, inst.y, textureKey);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setData('shareId', inst.id);

    // Only moving coins track a platform; static ones bob in place.
    this.anchor = inst.behavior === 'moves-with-platform' ? anchor : null;
    this.offset = this.anchor
      ? captureAnchorOffset({ x: inst.x, y: inst.y }, { x: this.anchor.sprite.x, y: this.anchor.sprite.y })
      : null;
  }

  update(dtSec: number): void {
    if (this.collected) return;
    this.elapsedMs += dtSec * 1000;

    if (this.anchor && this.offset) {
      // Stay at the fixed offset above the (now moved) platform so it never drifts out of reach.
      const p = coinPositionFromPlatform({ x: this.anchor.sprite.x, y: this.anchor.sprite.y }, this.offset);
      this.baseX = p.x;
      this.baseY = p.y;
    }

    this.sprite.setPosition(this.baseX, this.baseY + bobOffset(this.elapsedMs));
    // Static body must be told its game object moved.
    (this.sprite.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  /** Overlap handler. Idempotent: a second overlap is a no-op. */
  collect(): void {
    if (this.collected) return;
    const result = collectShare(this.id);
    if (!result.collected) return;
    this.collected = true;
    this.sprite.disableBody(true, true); // remove from physics + hide
  }

  get isCollected(): boolean {
    return this.collected;
  }
}
