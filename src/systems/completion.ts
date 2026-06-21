/**
 * Completion (WO-13) — the win condition core, pure and node-checkable. The level
 * completes ONLY when all 5 shares are collected AND the player touches the flag.
 * An early touch shows locked feedback (E-03) without completing.
 *
 * Score-flash spectacle is the HUD's job (WO-14, listens for level:complete); this
 * module emits only the state truth.
 */

import { eventBus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { TOTAL_SHARES_REQUIRED, LEVEL_ID } from '../core/Constants';

// Debounce repeated locked-feedback so spamming the flag pre-collection isn't noisy.
const LOCKED_FEEDBACK_DEBOUNCE_MS = 600;

export interface FlagTouchResult {
  completed: boolean;
  missingShares: number;
}

export class CompletionTracker {
  private completed = false;
  private lastLockedMs = Number.NEGATIVE_INFINITY;

  /**
   * Handle a flag overlap. `nowMs` (scene time) debounces locked feedback only.
   * Completes at most once; before all shares it stays re-touchable.
   */
  onFlagTouch(nowMs = 0): FlagTouchResult {
    if (this.completed) return { completed: true, missingShares: 0 };

    const missing = TOTAL_SHARES_REQUIRED - gameState.sharesCollected;
    if (missing > 0) {
      if (nowMs - this.lastLockedMs >= LOCKED_FEEDBACK_DEBOUNCE_MS) {
        this.lastLockedMs = nowMs;
        eventBus.emit('flag:locked-feedback', { missingShares: missing });
      }
      return { completed: false, missingShares: missing };
    }

    // All 5 collected: complete exactly once.
    this.completed = true;
    gameState.flag.reached = true;
    gameState.flag.completionEligible = true;
    gameState.isLevelComplete = true;

    const total = TOTAL_SHARES_REQUIRED as 5;
    eventBus.emit('flag:reached', {
      levelId: LEVEL_ID,
      sharesCollected: gameState.sharesCollected,
      totalSharesRequired: total,
      completionEligible: true,
    });
    eventBus.emit('level:complete', {
      levelId: LEVEL_ID,
      score: gameState.score,
      elapsedMs: gameState.elapsedMs,
      sharesCollected: total,
    });
    return { completed: true, missingShares: 0 };
  }

  get isComplete(): boolean {
    return this.completed;
  }

  /** Restart-safe: clear completion + debounce (call alongside gameState.reset). */
  reset(): void {
    this.completed = false;
    this.lastLockedMs = Number.NEGATIVE_INFINITY;
  }
}
