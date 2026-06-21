/**
 * Player (WO-10) — Phaser arcade sprite that wires input + body to the pure
 * PlayerController, plays manifest-driven animations, mirrors gameState.player, and
 * emits the frozen player:* events. Instantiated by the Level scene at integration
 * (WO-16). Runtime visuals are browser-verified there; the logic is node-checked
 * via PlayerController.
 */

import Phaser from 'phaser';
import { eventBus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import type { AssetCatalog } from '../systems/AssetCatalog';
import {
  PlayerController,
  computePlayerSpawn,
  type MovementState,
  type PlayerInput,
} from '../systems/PlayerController';

/** movementState -> the manifest animation name (catalog key is `<assetId>-<name>`). */
const STATE_TO_ANIM: Record<MovementState, string> = {
  idle: 'idle',
  walk: 'walk',
  run: 'run',
  jump: 'jump',
  fall: 'fall',
  'fall-loop': 'fallLoop',
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly controller = new PlayerController();
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly jumpKeys: Phaser.Input.Keyboard.Key[];
  private currentAnimKey = '';

  constructor(
    scene: Phaser.Scene,
    private readonly catalog: AssetCatalog,
  ) {
    const spawn = computePlayerSpawn(catalog.playerMeta, catalog.placements.playerSpawn);
    const idleKey = `${catalog.playerMeta.assetId}-idle`;
    super(scene, spawn.spriteX, spawn.spriteY, idleKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(spawn.originX, spawn.originY);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(spawn.bodyWidth, spawn.bodyHeight);
    body.setOffset(spawn.bodyOffsetX, spawn.bodyOffsetY);
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false); // the controller integrates gravity (deterministic + node-testable)

    this.createAnimations();

    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.jumpKeys = [
      this.cursors.up!,
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    ];

    this.play(idleKey, true);

    const p = gameState.player;
    p.spawnX = spawn.spriteX;
    p.spawnY = spawn.feetY;
    p.x = spawn.spriteX;
    p.y = spawn.feetY;
    eventBus.emit('player:spawned', { playerId: 'player', x: spawn.spriteX, y: spawn.feetY });
  }

  /** Wire ground/platform collision. Called by the Level scene with LevelWorld.groundZones. */
  collideWith(solids: Phaser.Types.Physics.Arcade.ArcadeColliderType): Phaser.Physics.Arcade.Collider {
    return this.scene.physics.add.collider(this, solids);
  }

  private createAnimations(): void {
    for (const i of this.catalog.loadList) {
      if (i.kind !== 'spritesheet' || this.scene.anims.exists(i.key)) continue;
      this.scene.anims.create({
        key: i.key,
        frames: this.scene.anims.generateFrameNumbers(i.key, { start: 0, end: i.frameCount - 1 }),
        frameRate: i.frameRate,
        repeat: i.repeat,
      });
    }
  }

  override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const body = this.body as Phaser.Physics.Arcade.Body;

    const adapter = {
      velocityX: body.velocity.x,
      velocityY: body.velocity.y,
      blockedDown: body.blocked.down || body.touching.down,
    };
    const input: PlayerInput = {
      left: this.cursors.left!.isDown,
      right: this.cursors.right!.isDown,
      jumpPressed: this.jumpKeys.some((k) => Phaser.Input.Keyboard.JustDown(k)),
      jumpReleased: this.jumpKeys.some((k) => Phaser.Input.Keyboard.JustUp(k)),
    };

    const step = this.controller.update(adapter, input, delta);
    body.setVelocity(adapter.velocityX, adapter.velocityY);
    this.setFlipX(step.facing === 'left'); // source art faces right

    this.playState(step.movementState);

    const p = gameState.player;
    p.x = this.x;
    p.y = this.y;
    p.velocityX = adapter.velocityX;
    p.velocityY = adapter.velocityY;
    p.facing = step.facing;
    p.movementState = step.movementState;
    p.isGrounded = step.isGrounded;

    if (step.jumped) {
      eventBus.emit('player:jump', { playerId: 'player', x: this.x, y: this.y, jumpCount: step.jumpCount });
    }
    if (step.landed) {
      eventBus.emit('player:grounded', { playerId: 'player', surfaceId: 'ground', x: this.x, y: this.y });
    }
    if (step.startedFalling) {
      eventBus.emit('player:fall', { playerId: 'player', x: this.x, y: this.y });
    }
  }

  private playState(state: MovementState): void {
    const key = `${this.catalog.playerMeta.assetId}-${STATE_TO_ANIM[state]}`;
    if (this.currentAnimKey === key) return;
    this.currentAnimKey = key;
    this.play(key, true);
  }
}
