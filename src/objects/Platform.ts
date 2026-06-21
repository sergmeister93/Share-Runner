/**
 * Platform (WO-11) — one authored obstacle. Visual is the 170×58 brick repeated
 * across the authored width×height (no generated art). Stationary platforms get a
 * static body; movers get a kinematic (immovable, gravity-off) body driven from the
 * pure PlatformMover. Browser-verified for landing/carry feel at WO-16.
 */

import Phaser from 'phaser';
import { eventBus } from '../core/EventBus';
import { PlatformMover, type PlatformInstance } from '../systems/platformMovement';

/** Brick prefab key from the environment manifest (loaded by the Preloader). */
const BRICK_KEY = 'floating-bricks';

export class Platform {
  readonly id: string;
  readonly sprite: Phaser.GameObjects.TileSprite;
  readonly mover: PlatformMover | null;
  /** Movement applied this frame, for carrying a rider. */
  deltaX = 0;
  deltaY = 0;

  constructor(scene: Phaser.Scene, inst: PlatformInstance) {
    this.id = inst.id;
    this.sprite = scene.add
      .tileSprite(inst.x, inst.y, inst.width, inst.height, BRICK_KEY)
      .setOrigin(0, 0);

    const isMover = inst.kind !== 'stationary' && inst.movement !== null;
    scene.physics.add.existing(this.sprite, !isMover); // static body when not a mover

    if (isMover && inst.movement) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      const m = inst.movement;
      const startPos = m.axis === 'x' ? inst.x : inst.y;
      this.mover = new PlatformMover(inst.id, inst.kind, m.axis, m.min, m.max, inst.speed, startPos);
    } else {
      this.mover = null;
    }
  }

  /** The body other objects collide against. */
  get body(): Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody {
    return this.sprite.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
  }

  /** Advance a mover one step. The body chases the authoritative mover position. */
  update(dtSec: number): void {
    this.deltaX = 0;
    this.deltaY = 0;
    if (!this.mover) return;

    const delta = this.mover.step(
      dtSec,
      () => eventBus.emit('platform:move-start', { platformId: this.id, kind: this.moverKind(), x: this.sprite.x, y: this.sprite.y }),
      (_pos, dir) =>
        eventBus.emit('platform:turnaround', { platformId: this.id, kind: this.moverKind(), x: this.sprite.x, y: this.sprite.y, direction: dir }),
    );

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Chase the authoritative position with velocity so arcade resolves rider contact.
    const v = dtSec > 0 ? delta / dtSec : 0;
    if (this.mover.axis === 'x') {
      this.deltaX = delta;
      body.setVelocityX(v);
    } else {
      this.deltaY = delta;
      body.setVelocityY(v);
    }
  }

  private moverKind(): 'vertical' | 'horizontal' {
    return this.mover!.kind === 'vertical' ? 'vertical' : 'horizontal';
  }
}
