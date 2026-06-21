/**
 * EventBus — the single typed pub/sub seam (frozen contract, WO-04).
 * Event names and payload shapes are FROZEN per specs/contracts/event_bus_contract.md.
 * No executor types raw event-name strings: the only valid keys are those in
 * `EventPayloads`, so a typo is a compile error.
 *
 * ponytail: thin hand-rolled emitter rather than Phaser's. Reason — `import 'phaser'`
 * throws `window is not defined` under node, which would block the lane's self-check
 * and any future node-side test. This bus needs only emit/on/off/teardown; eventemitter3
 * would be a redundant dep for ~25 lines. Behavior matches the contract.
 */

import type { LEVEL_ID } from './Constants';

type LevelId = typeof LEVEL_ID; // "baltimore-waterfront"

/** FROZEN §4.1 event table — name -> payload shape. */
export interface EventPayloads {
  'app:boot': { timestampMs: number };

  'intro:start': { runId: string };
  'intro:title-slam': { title: 'Share-Runner'; intensity: 'low' | 'medium' | 'high' };
  'intro:scanline-pulse': { pulseIndex: number; totalPulses: number };
  'intro:complete': { nextScene: 'Menu' };

  'menu:shown': { options: ['Start Game', 'Quit'] };
  'game:start-requested': { source: 'menu' };
  'game:quit-requested': { source: 'menu' | 'keyboard' };
  'game:quit-fallback-shown': { reason: 'browser-blocked-window-close' | 'unsupported' };

  'preloader:start': { levelId: LevelId };
  'asset:load-progress': { loaded: number; total: number; percent: number };
  'asset:load-complete': { levelId: LevelId };

  'level:loaded': { levelId: LevelId; worldWidth: 4400; worldHeight: 2494 };
  'camera:establishing-pan:start': {
    from: 'menu' | 'preloader';
    targetX: number;
    targetY: number;
    durationMs: number;
  };
  'camera:establishing-pan:complete': { playerId: 'player' };
  'level:start': { levelId: LevelId; requiredShares: 5 };

  'player:spawned': { playerId: 'player'; x: number; y: number };
  'player:grounded': { playerId: 'player'; surfaceId: string; x: number; y: number };
  'player:jump': { playerId: 'player'; x: number; y: number; jumpCount: number };
  'player:fall': { playerId: 'player'; x: number; y: number };

  'platform:move-start': {
    platformId: string;
    kind: 'vertical' | 'horizontal';
    x: number;
    y: number;
  };
  'platform:turnaround': {
    platformId: string;
    kind: 'vertical' | 'horizontal';
    x: number;
    y: number;
    direction: -1 | 1;
  };

  'share:spawned': { shareId: string; x: number; y: number; anchorPlatformId?: string };
  'share:bob-cycle': { shareId: string; phase: number };
  'share:collected': {
    shareId: string;
    collectedCount: number;
    totalRequired: 5;
    scoreDelta: number;
  };
  'score:changed': { score: number; sharesCollected: number; totalSharesRequired: 5 };
  'hud:share-counter-pulse': { sharesCollected: number; totalSharesRequired: 5 };

  'flag:reached': {
    levelId: LevelId;
    sharesCollected: number;
    totalSharesRequired: 5;
    completionEligible: boolean;
  };
  'flag:locked-feedback': { missingShares: number };
  'level:complete': { levelId: LevelId; score: number; elapsedMs: number; sharesCollected: 5 };

  'score:flash:start': { score: number; durationMs: number };
  'score:flash:complete': { score: number };

  'audio:music-start': { musicId: string; loop: boolean; volume: number };
  'audio:music-stop': {
    musicId: string;
    reason: 'level-complete' | 'scene-transition' | 'mute' | 'reset';
  };
  'audio:mute-changed': { muted: boolean; source: 'ui' | 'keyboard' | 'state-reset' };

  'game:reset': { reason: 'restart' | 'level-retry' | 'scene-reload' };
  'game:reset-complete': { runId: string; levelId: LevelId };
}

export type EventName = keyof EventPayloads;
export type EventHandler<K extends EventName> = (payload: EventPayloads[K]) => void;

class EventBus {
  private readonly handlers = new Map<EventName, Set<EventHandler<EventName>>>();

  on<K extends EventName>(event: K, handler: EventHandler<K>): this {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as EventHandler<EventName>);
    return this;
  }

  once<K extends EventName>(event: K, handler: EventHandler<K>): this {
    const wrapped: EventHandler<K> = (payload) => {
      this.off(event, wrapped);
      handler(payload);
    };
    return this.on(event, wrapped);
  }

  off<K extends EventName>(event: K, handler: EventHandler<K>): this {
    this.handlers.get(event)?.delete(handler as EventHandler<EventName>);
    return this;
  }

  emit<K extends EventName>(event: K, payload: EventPayloads[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    // Copy so a handler that adds/removes listeners can't disturb this dispatch.
    for (const handler of [...set]) (handler as EventHandler<K>)(payload);
  }

  /** Restart-safety: scenes call this in shutdown() to drop all listeners. */
  removeAllListeners(): void {
    this.handlers.clear();
  }
}

/** The shared singleton. Import this everywhere; never `new EventBus()`. */
export const eventBus = new EventBus();
