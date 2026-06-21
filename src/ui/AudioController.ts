import Phaser from 'phaser';
import { LEVEL_MUSIC_KEY, MUSIC_VOLUME } from '../core/Constants';
import { eventBus, type EventHandler, type EventName } from '../core/EventBus';
import { gameState } from '../core/GameState';
import type { AssetCatalog } from '../systems/AssetCatalog';

const AUDIO_EVENTS = {
  levelStart: 'level:start',
  levelComplete: 'level:complete',
  reset: 'game:reset',
  resetComplete: 'game:reset-complete',
  musicStart: 'audio:music-start',
  musicStop: 'audio:music-stop',
  muteChanged: 'audio:mute-changed',
} as const satisfies Record<string, EventName>;

export type AudioStopReason = 'level-complete' | 'scene-transition' | 'mute' | 'reset';
export type MuteChangeSource = 'ui' | 'keyboard' | 'state-reset';

/**
 * Scene-scoped music coordinator. Playback can be requested before browser audio
 * unlock, but it only begins once Phaser confirms a user gesture unlocked sound.
 */
export class AudioController {
  private readonly soundManager: Phaser.Sound.BaseSoundManager;
  private readonly loop: boolean;
  private music?: Phaser.Sound.BaseSound;
  private playRequested = false;
  private destroyed = false;

  private readonly onLevelStart: EventHandler<'level:start'> = () => this.requestMusicStart();
  private readonly onLevelComplete: EventHandler<'level:complete'> = () =>
    this.stopMusic('level-complete');
  private readonly onReset: EventHandler<'game:reset'> = () => this.stopMusic('reset');
  private readonly onResetComplete: EventHandler<'game:reset-complete'> = () => {
    this.applyPersistedMute();
    this.stopMusic('reset');
  };

  constructor(
    private readonly scene: Phaser.Scene,
    catalog: AssetCatalog,
  ) {
    const musicMeta = catalog.getAudio(LEVEL_MUSIC_KEY);
    this.loop = musicMeta.loop;
    if (!this.loop) {
      throw new Error(`[AudioController] ${LEVEL_MUSIC_KEY} must be loopSuggested:true in the manifest`);
    }

    this.soundManager = scene.sound;
    this.applyPersistedMute();
    eventBus.on(AUDIO_EVENTS.levelStart, this.onLevelStart);
    eventBus.on(AUDIO_EVENTS.levelComplete, this.onLevelComplete);
    eventBus.on(AUDIO_EVENTS.reset, this.onReset);
    eventBus.on(AUDIO_EVENTS.resetComplete, this.onResetComplete);
    this.soundManager.on(Phaser.Sound.Events.UNLOCKED, this.tryStartMusic, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  /** Request level music. If audio is locked, the request waits for `unlocked`. */
  requestMusicStart(): void {
    if (this.destroyed) return;
    this.playRequested = true;
    this.tryStartMusic();
  }

  setMuted(muted: boolean, source: MuteChangeSource): void {
    if (this.destroyed) return;
    gameState.audio.muted = muted;
    this.soundManager.mute = muted;
    eventBus.emit(AUDIO_EVENTS.muteChanged, { muted, source });
  }

  toggleMuted(source: Extract<MuteChangeSource, 'ui' | 'keyboard'>): boolean {
    const muted = !gameState.audio.muted;
    this.setMuted(muted, source);
    return muted;
  }

  stopMusic(reason: AudioStopReason): void {
    this.playRequested = false;
    const music = this.music;
    if (!music) return;

    const wasActive = music.isPlaying || gameState.audio.musicPlaying;
    music.stop();
    music.destroy();
    this.music = undefined;
    gameState.audio.musicId = null;
    gameState.audio.musicPlaying = false;
    if (wasActive) {
      eventBus.emit(AUDIO_EVENTS.musicStop, { musicId: LEVEL_MUSIC_KEY, reason });
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.stopMusic('scene-transition');
    this.destroyed = true;
    eventBus.off(AUDIO_EVENTS.levelStart, this.onLevelStart);
    eventBus.off(AUDIO_EVENTS.levelComplete, this.onLevelComplete);
    eventBus.off(AUDIO_EVENTS.reset, this.onReset);
    eventBus.off(AUDIO_EVENTS.resetComplete, this.onResetComplete);
    this.soundManager.off(Phaser.Sound.Events.UNLOCKED, this.tryStartMusic, this);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private applyPersistedMute(): void {
    this.soundManager.mute = gameState.audio.muted;
  }

  private tryStartMusic(): void {
    if (this.destroyed || !this.playRequested || this.music?.isPlaying) return;
    if (this.soundManager.locked) return;

    const music = this.soundManager.add(LEVEL_MUSIC_KEY, {
      loop: this.loop,
      volume: MUSIC_VOLUME,
    });
    if (!music.play()) {
      music.destroy();
      return;
    }

    this.music = music;
    gameState.audio.musicId = LEVEL_MUSIC_KEY;
    gameState.audio.musicPlaying = true;
    this.applyPersistedMute();
    eventBus.emit(AUDIO_EVENTS.musicStart, {
      musicId: LEVEL_MUSIC_KEY,
      loop: this.loop,
      volume: MUSIC_VOLUME,
    });
  }
}
