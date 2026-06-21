/**
 * GameState — the single source of gameplay truth (frozen contract, WO-04).
 * Shape per specs/contracts/game_state_contract.md. Systems and scenes read this
 * directly and mutate it through events; scenes keep no parallel gameplay truth.
 */

import { eventBus } from './EventBus';
import { LEVEL_ID, TOTAL_SHARES_REQUIRED, SCENE_INTRO, SCENE_LEVEL, type SceneKey } from './Constants';

export interface PlayerState {
  id: 'player';
  spawnX: number;
  spawnY: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: 'left' | 'right';
  movementState: 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'fall-loop';
  isGrounded: boolean;
  activePlatformId: string | null;
}

export interface FlagState {
  id: 'flag';
  x: number;
  y: number;
  reached: boolean;
  completionEligible: boolean;
}

export interface AudioState {
  musicId: string | null;
  muted: boolean;
  musicPlaying: boolean;
}

export interface UiState {
  scoreFlashActive: boolean;
  menuSelection: 'Start Game' | 'Quit' | null;
}

export interface GameStateShape {
  runId: string;
  currentScene: SceneKey;
  levelId: typeof LEVEL_ID;
  isRunActive: boolean;
  isPaused: boolean;
  isLevelComplete: boolean;
  elapsedMs: number;
  score: number;
  sharesCollected: number;
  totalSharesRequired: 5;
  collectedShareIds: string[];
  player: PlayerState;
  flag: FlagState;
  audio: AudioState;
  ui: UiState;
}

function newRunId(): string {
  return globalThis.crypto.randomUUID();
}

function freshPlayer(): PlayerState {
  return {
    id: 'player',
    spawnX: 0,
    spawnY: 0,
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    facing: 'right',
    movementState: 'idle',
    isGrounded: false,
    activePlatformId: null,
  };
}

function freshFlag(): FlagState {
  return { id: 'flag', x: 0, y: 0, reached: false, completionEligible: false };
}

class GameState implements GameStateShape {
  runId = newRunId();
  currentScene: SceneKey = SCENE_INTRO;
  levelId = LEVEL_ID;
  isRunActive = false;
  isPaused = false;
  isLevelComplete = false;
  elapsedMs = 0;
  score = 0;
  sharesCollected = 0;
  totalSharesRequired = TOTAL_SHARES_REQUIRED as 5;
  collectedShareIds: string[] = [];
  player: PlayerState = freshPlayer();
  flag: FlagState = freshFlag();
  audio: AudioState = { musicId: null, muted: false, musicPlaying: false };
  ui: UiState = { scoreFlashActive: false, menuSelection: null };

  /**
   * Restart-safe reset. New runId, clean run/score/share/player/flag/score-flash
   * state, `levelId` + `totalSharesRequired` restored, `audio.muted` PERSISTED
   * (E-05). Note: event-listener teardown is the scene's job in shutdown()
   * (`eventBus.removeAllListeners()`) — reset must keep listeners so subscribers
   * can observe `game:reset-complete`.
   */
  reset(nextScene: SceneKey = SCENE_LEVEL): void {
    const muted = this.audio.muted; // persist player's mute preference across reset

    this.runId = newRunId();
    this.currentScene = nextScene;
    this.levelId = LEVEL_ID;
    this.isRunActive = false;
    this.isPaused = false;
    this.isLevelComplete = false;
    this.elapsedMs = 0;
    this.score = 0;
    this.sharesCollected = 0;
    this.collectedShareIds = [];
    this.player = freshPlayer();
    this.flag = freshFlag();
    this.audio = { musicId: null, muted, musicPlaying: false };
    this.ui = { scoreFlashActive: false, menuSelection: null };

    eventBus.emit('game:reset-complete', { runId: this.runId, levelId: this.levelId });
  }
}

/** The shared singleton. Import this everywhere; never `new GameState()`. */
export const gameState = new GameState();
