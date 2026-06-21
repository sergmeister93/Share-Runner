import Phaser from 'phaser';
import { SFX_KEYS, SFX_VOLUME } from '../core/Constants';
import { eventBus, type EventHandler, type EventName } from '../core/EventBus';
import type { AssetCatalog } from '../systems/AssetCatalog';

/**
 * One-shot gameplay SFX. Each bound event is edge-triggered or debounced upstream
 * (Player.jumped/landed, share collected once, completion fires once, locked feedback
 * debounced), so each fires exactly one play. Mute is shared: SFX go through the same
 * scene sound manager AudioController toggles, so muting silences them too.
 */
const SFX_BINDINGS = [
  ['player:jump', SFX_KEYS.jump],
  ['player:grounded', SFX_KEYS.land],
  ['share:collected', SFX_KEYS.collect],
  ['level:complete', SFX_KEYS.complete],
  ['flag:locked-feedback', SFX_KEYS.locked],
] as const satisfies ReadonlyArray<readonly [EventName, string]>;

export class SfxController {
  private readonly soundManager: Phaser.Sound.BaseSoundManager;
  private readonly bound: Array<{ event: EventName; handler: EventHandler<EventName> }> = [];
  private destroyed = false;

  constructor(scene: Phaser.Scene, catalog: AssetCatalog) {
    this.soundManager = scene.sound;
    for (const [event, key] of SFX_BINDINGS) {
      catalog.getAudio(key); // fail loud if the manifest never registered this sfx
      const handler: EventHandler<EventName> = () => this.play(key);
      eventBus.on(event, handler);
      this.bound.push({ event, handler });
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private play(key: string): void {
    if (this.destroyed || this.soundManager.locked) return;
    this.soundManager.play(key, { volume: SFX_VOLUME });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const { event, handler } of this.bound) eventBus.off(event, handler);
  }
}
