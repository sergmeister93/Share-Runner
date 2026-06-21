/**
 * WO-13 acceptance self-check. Drives CompletionTracker against gameState and
 * asserts: <5 shares -> flag:locked-feedback (right missingShares), no completion;
 * 5 shares -> flag:reached + level:complete exactly once + isLevelComplete.
 * Run: `npm run check:completion`.
 */

import { CompletionTracker } from './completion';
import { gameState } from '../core/GameState';
import { eventBus } from '../core/EventBus';

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}
function assertEqual(actual: unknown, expected: unknown, msg: string): void {
  assert(actual === expected, `${msg} (got ${String(actual)}, want ${String(expected)})`);
}

let lockedCount = 0;
let lastMissing = -1;
let reachedCount = 0;
let completeCount = 0;
let completePayloadOk = false;
eventBus.on('flag:locked-feedback', (p) => {
  lockedCount += 1;
  lastMissing = p.missingShares;
});
eventBus.on('flag:reached', (p) => {
  reachedCount += 1;
  assertEqual(p.levelId, 'baltimore-waterfront', 'flag:reached levelId canonical');
  assertEqual(p.completionEligible, true, 'flag:reached completionEligible=true');
});
eventBus.on('level:complete', (p) => {
  completeCount += 1;
  completePayloadOk =
    p.levelId === 'baltimore-waterfront' && p.sharesCollected === 5;
});

gameState.reset();
const tracker = new CompletionTracker();

// --- Early touch with 0 shares: locked, no completion (E-03) ---------------------
let r = tracker.onFlagTouch(0);
assertEqual(r.completed, false, '0 shares: not completed');
assertEqual(r.missingShares, 5, '0 shares: missing 5');
assertEqual(lockedCount, 1, 'locked-feedback emitted once');
assertEqual(lastMissing, 5, 'missingShares=5');
assertEqual(gameState.isLevelComplete, false, 'not complete with 0 shares');

// debounce: an immediate re-touch does not re-emit
tracker.onFlagTouch(100);
assertEqual(lockedCount, 1, 'locked-feedback debounced within window');
// past the debounce window it emits again
tracker.onFlagTouch(800);
assertEqual(lockedCount, 2, 'locked-feedback re-emits after debounce');

// --- 4 shares: still locked, missing 1 -------------------------------------------
gameState.sharesCollected = 4;
r = tracker.onFlagTouch(2000);
assertEqual(r.completed, false, '4 shares: not completed');
assertEqual(lastMissing, 1, '4 shares: missing 1');
assertEqual(completeCount, 0, 'no completion before all 5');

// --- 5 shares: completes exactly once --------------------------------------------
gameState.sharesCollected = 5;
gameState.score = 500;
r = tracker.onFlagTouch(3000);
assertEqual(r.completed, true, '5 shares: completed');
assertEqual(reachedCount, 1, 'flag:reached emitted once');
assertEqual(completeCount, 1, 'level:complete emitted once');
assert(completePayloadOk, 'level:complete payload (levelId + sharesCollected:5)');
assertEqual(gameState.isLevelComplete, true, 'isLevelComplete set');
assertEqual(gameState.flag.reached, true, 'flag.reached set');
assertEqual(gameState.flag.completionEligible, true, 'flag.completionEligible set');

// --- Re-touch after completion: no duplicate completion --------------------------
tracker.onFlagTouch(4000);
assertEqual(completeCount, 1, 'level:complete fires exactly once (guarded)');
assertEqual(reachedCount, 1, 'flag:reached fires exactly once');

console.log('completion self-check PASS — locked-feedback under 5 (no complete), single flag:reached + level:complete at 5, isLevelComplete set');
