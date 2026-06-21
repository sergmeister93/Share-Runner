/**
 * PlayerController (WO-10) — the pure player state machine. No Phaser, no side
 * effects: it reads a body-like + input, integrates velocity, and returns intent
 * flags. The Phaser `Player` object applies the result, emits events, mirrors
 * gameState, and plays animations. Being pure makes the whole thing node-testable.
 *
 * Game-feel (skill): coyote time, jump buffering, variable jump height. The player
 * is never wrong — a jump pressed just-too-early or just-too-late still fires.
 * Collision (skill): gravity is integrated here at a clamped dt; grounded is read
 * fresh from body contact each step (never stored), which kills rest jitter.
 */

import {
  GRAVITY_Y,
  PLAYER_JUMP_VELOCITY,
  PLAYER_MAX_RUN_SPEED,
  PLAYER_ACCELERATION,
  COYOTE_TIME_MS,
  JUMP_BUFFER_MS,
} from '../core/Constants';
import type { PlayerMeta } from './AssetCatalog';

export type MovementState = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'fall-loop';

export interface PlayerInput {
  left: boolean;
  right: boolean;
  /** Edge: jump was pressed THIS frame (buffer the press, not the hold). */
  jumpPressed: boolean;
  /** Edge: jump was released THIS frame (drives variable height). */
  jumpReleased: boolean;
}

/** Minimal arcade-body slice. `blockedDown` is this frame's downward contact. */
export interface PlayerBodyLike {
  velocityX: number;
  velocityY: number;
  readonly blockedDown: boolean;
}

export interface PlayerStep {
  movementState: MovementState;
  facing: 'left' | 'right';
  isGrounded: boolean;
  jumped: boolean;
  jumpCount: number;
  landed: boolean; // became grounded this step (emit player:grounded)
  startedFalling: boolean; // entered descent this step (emit player:fall)
}

// [TUNABLE] — release-to-cut keeps this fraction of upward velocity on early release.
const JUMP_CUT_MULTIPLIER = 0.5;
// [TUNABLE] — below this speed the move anim is a walk, above it a run.
const WALK_SPEED_THRESHOLD = PLAYER_MAX_RUN_SPEED * 0.45;
// [TUNABLE] — fall anim plays once, then fall-loop takes over (manifest fall ≈4f@10fps).
const FALL_ANIM_MS = 400;
// Clamp dt so a tab stall / breakpoint can't teleport the player (spiral-of-death guard).
const MAX_STEP_MS = 50;
// ponytail: tiny downward velocity while grounded instead of a hard 0. Arcade drops
// blocked.down when a body fully rests, flickering `grounded`; this keeps continuous
// contact. Ceiling: swap for body.onFloor()+manual snap if the player ever visibly sinks.
const GROUND_STICK_VELOCITY = 50;

export class PlayerController {
  private coyoteMs = 0;
  private bufferMs = 0;
  private fallElapsedMs = 0;
  private jumpCount = 0;
  private wasGrounded = false;
  private facing: 'left' | 'right' = 'right';
  private lastState: MovementState = 'idle';

  /** Advance one step. Mutates `body` velocity; returns the resulting intent. */
  update(body: PlayerBodyLike, input: PlayerInput, deltaMs: number): PlayerStep {
    const dt = Math.min(deltaMs, MAX_STEP_MS);
    const dtSec = dt / 1000;
    const grounded = body.blockedDown;

    // --- forgiveness timers (count down in ms; refill on the relevant edge) ------
    this.coyoteMs = grounded ? COYOTE_TIME_MS : Math.max(0, this.coyoteMs - dt);
    this.bufferMs = input.jumpPressed ? JUMP_BUFFER_MS : Math.max(0, this.bufferMs - dt);

    // --- horizontal: accelerate toward max, decelerate to rest when no input -----
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let vx = body.velocityX;
    if (dir !== 0) {
      vx = clamp(vx + dir * PLAYER_ACCELERATION * dtSec, -PLAYER_MAX_RUN_SPEED, PLAYER_MAX_RUN_SPEED);
      this.facing = dir > 0 ? 'right' : 'left';
    } else {
      const drop = PLAYER_ACCELERATION * dtSec;
      vx = vx > 0 ? Math.max(0, vx - drop) : Math.min(0, vx + drop);
    }
    body.velocityX = vx;

    // --- vertical: stick to ground for contact, gravity while airborne, jump + cut -
    let vy = body.velocityY;
    if (grounded) vy = GROUND_STICK_VELOCITY; // keep arcade contact (a jump overrides below)
    else vy += GRAVITY_Y * dtSec; // gravity only while airborne

    let jumped = false;
    if (this.bufferMs > 0 && this.coyoteMs > 0) {
      vy = PLAYER_JUMP_VELOCITY;
      this.bufferMs = 0; // consume the press
      this.coyoteMs = 0; // consume the grace (prevents a mid-air double-jump)
      this.jumpCount += 1;
      jumped = true;
    }
    if (input.jumpReleased && vy < 0) vy *= JUMP_CUT_MULTIPLIER; // variable height (rising only)
    body.velocityY = vy;

    // --- state machine -----------------------------------------------------------
    this.fallElapsedMs = !grounded && vy > 0 ? this.fallElapsedMs + dt : 0;
    const state = this.deriveState(grounded, vx, vy);
    const landed = grounded && !this.wasGrounded;
    const startedFalling =
      state === 'fall' && this.lastState !== 'fall' && this.lastState !== 'fall-loop';

    this.wasGrounded = grounded;
    this.lastState = state;
    return { movementState: state, facing: this.facing, isGrounded: grounded, jumped, jumpCount: this.jumpCount, landed, startedFalling };
  }

  private deriveState(grounded: boolean, vx: number, vy: number): MovementState {
    // Rising (including the very frame the jump fires, while still touching ground)
    // shows the jump anim immediately rather than a stray idle/run frame.
    if (vy < 0) return 'jump';
    if (!grounded) return this.fallElapsedMs >= FALL_ANIM_MS ? 'fall-loop' : 'fall';
    const speed = Math.abs(vx);
    if (speed < 1) return 'idle';
    return speed <= WALK_SPEED_THRESHOLD ? 'walk' : 'run';
  }

  /** Restart-safe: clear timers/counters (call alongside gameState.reset). */
  reset(): void {
    this.coyoteMs = 0;
    this.bufferMs = 0;
    this.fallElapsedMs = 0;
    this.jumpCount = 0;
    this.wasGrounded = false;
    this.facing = 'right';
    this.lastState = 'idle';
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// --- Spawn geometry (pure; uses manifest pivot/collision, no hardcoded numbers) ---

export interface PlayerSpawn {
  /** Sprite position (origin set to the pivot so feet land on the placement). */
  spriteX: number;
  spriteY: number;
  originX: number;
  originY: number;
  /** Arcade body size + offset within the 160×160 frame. */
  bodyWidth: number;
  bodyHeight: number;
  bodyOffsetX: number;
  bodyOffsetY: number;
  /** World y the feet rest at (== placement.y, the ground top). */
  feetY: number;
}

/**
 * Convert a bottom-center authored placement into sprite + body placement. The
 * sprite origin is the manifest pivot (feet), so placing the sprite AT the
 * placement puts the collision-box bottom (feet) exactly on the placement point.
 */
export function computePlayerSpawn(
  meta: PlayerMeta,
  placement: { x: number; y: number },
): PlayerSpawn {
  return {
    spriteX: placement.x,
    spriteY: placement.y,
    originX: meta.pivot.x,
    originY: meta.pivot.y,
    bodyWidth: meta.collision.width,
    bodyHeight: meta.collision.height,
    bodyOffsetX: meta.collision.x,
    bodyOffsetY: meta.collision.y,
    feetY: placement.y,
  };
}
