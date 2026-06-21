/**
 * Smallest runnable check for the reset guarantee (WO-04 acceptance).
 * Run: `npm run check:core` (esbuild -> node; node can't import phaser, but these
 * three singletons are phaser-free by design). Fails loudly if reset() regresses.
 */

import { gameState } from './GameState';
import { eventBus } from './EventBus';
import { LEVEL_ID } from './Constants';

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

// Compare through `unknown` so TS's literal-narrowing after the dirtying writes
// (it can't see that reset() mutates the same object) doesn't false-flag TS2367.
function assertEqual(actual: unknown, expected: unknown, msg: string): void {
  assert(actual === expected, `${msg} (got ${String(actual)}, want ${String(expected)})`);
}

// Dirty every category reset must clear, plus set mute (which must survive).
gameState.audio.muted = true;
gameState.score = 4242;
gameState.sharesCollected = 5;
gameState.collectedShareIds.push('share-1', 'share-2');
gameState.isLevelComplete = true;
gameState.isRunActive = true;
gameState.player.x = 999;
gameState.player.movementState = 'run';
gameState.flag.reached = true;
gameState.ui.scoreFlashActive = true;
const oldRunId = gameState.runId;

let resetCompleteFired = false;
eventBus.on('game:reset-complete', (p) => {
  resetCompleteFired = true;
  assert(p.levelId === LEVEL_ID, 'reset-complete carries canonical levelId');
  assert(p.runId === gameState.runId, 'reset-complete carries the new runId');
});

gameState.reset();

assertEqual(gameState.score, 0, 'score cleared');
assertEqual(gameState.sharesCollected, 0, 'sharesCollected cleared');
assertEqual(gameState.collectedShareIds.length, 0, 'collectedShareIds cleared');
assertEqual(gameState.isLevelComplete, false, 'isLevelComplete cleared');
assertEqual(gameState.isRunActive, false, 'isRunActive cleared');
assertEqual(gameState.player.x, 0, 'player.x reset');
assertEqual(gameState.player.movementState, 'idle', 'player.movementState reset');
assertEqual(gameState.flag.reached, false, 'flag reset');
assertEqual(gameState.ui.scoreFlashActive, false, 'score-flash reset');
assertEqual(gameState.totalSharesRequired, 5, 'totalSharesRequired restored to 5');
assertEqual(gameState.audio.muted, true, 'audio.muted PERSISTED across reset (E-05)');
assert(gameState.runId !== oldRunId, 'new runId minted');
assertEqual(gameState.levelId, 'baltimore-waterfront', 'levelId restored to canonical baltimore-waterfront');
assert(resetCompleteFired, 'game:reset-complete emitted');

console.log('core self-check PASS — reset clears state, persists muted, mints runId, emits reset-complete');
