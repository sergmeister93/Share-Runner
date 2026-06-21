/**
 * Collectibles (WO-12) — pure share-coin logic: instance loading, idempotent
 * collect+score, bob, and move-with-platform offset math. No Phaser, so the win
 * condition's core is node-checked. The Phaser `ShareCoin` is the visual shell.
 */

import { eventBus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { SHARE_SCORE_VALUE, TOTAL_SHARES_REQUIRED, COIN_BOB_AMPLITUDE_PX, COIN_BOB_DURATION_MS } from '../core/Constants';
import { ManifestMismatchError } from '../data/assetManifests';
import type { AssetCatalog } from './AssetCatalog';

export type CoinBehavior = 'static-bob' | 'moves-with-platform';

export interface CoinInstance {
  id: string;
  x: number; // authored center
  y: number;
  anchorPlatformId: string;
  behavior: CoinBehavior;
}

/** The 5 authored share coins, straight from the catalog placements. */
export function collectibleInstances(catalog: AssetCatalog): CoinInstance[] {
  const coins = catalog.placements.collectables;
  if (!coins?.length) {
    throw new ManifestMismatchError('authoredGameplayPlacements.collectables', 'level manifest');
  }
  return coins.map((c) => ({
    id: c.id,
    x: c.center.x,
    y: c.center.y,
    anchorPlatformId: c.anchorPlatformId,
    behavior: c.behavior,
  }));
}

export interface AnchorOffset {
  dx: number;
  dy: number;
}

/** Coin position relative to its platform's top-left, captured at authoring. */
export function captureAnchorOffset(
  coinCenter: { x: number; y: number },
  platformTopLeft: { x: number; y: number },
): AnchorOffset {
  return { dx: coinCenter.x - platformTopLeft.x, dy: coinCenter.y - platformTopLeft.y };
}

/** Live coin center from the platform's current top-left + the fixed offset. */
export function coinPositionFromPlatform(
  platformTopLeft: { x: number; y: number },
  offset: AnchorOffset,
): { x: number; y: number } {
  return { x: platformTopLeft.x + offset.dx, y: platformTopLeft.y + offset.dy };
}

/** Gentle vertical bob offset (sine), tunable amplitude/period from Constants. */
export function bobOffset(elapsedMs: number): number {
  return COIN_BOB_AMPLITUDE_PX * Math.sin((2 * Math.PI * elapsedMs) / COIN_BOB_DURATION_MS);
}

export interface CollectResult {
  collected: boolean;
  scoreDelta: number;
}

/**
 * Collect a share exactly once. Idempotent: a repeat id is a no-op. Updates
 * gameState (shares/score/ids) and emits share:collected -> score:changed ->
 * hud:share-counter-pulse. Returns whether this call actually collected.
 */
export function collectShare(id: string): CollectResult {
  if (gameState.collectedShareIds.includes(id)) return { collected: false, scoreDelta: 0 };

  gameState.collectedShareIds.push(id);
  gameState.sharesCollected += 1;
  gameState.score += SHARE_SCORE_VALUE;

  const total = TOTAL_SHARES_REQUIRED as 5;
  eventBus.emit('share:collected', {
    shareId: id,
    collectedCount: gameState.sharesCollected,
    totalRequired: total,
    scoreDelta: SHARE_SCORE_VALUE,
  });
  eventBus.emit('score:changed', {
    score: gameState.score,
    sharesCollected: gameState.sharesCollected,
    totalSharesRequired: total,
  });
  eventBus.emit('hud:share-counter-pulse', {
    sharesCollected: gameState.sharesCollected,
    totalSharesRequired: total,
  });
  return { collected: true, scoreDelta: SHARE_SCORE_VALUE };
}
