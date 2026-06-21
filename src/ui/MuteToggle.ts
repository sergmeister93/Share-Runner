import Phaser from 'phaser';
import { eventBus, type EventHandler } from '../core/EventBus';
import { gameState } from '../core/GameState';
import type { AudioController } from './AudioController';

const COLORS = {
  cabinet: 0x06142f,
  deepBlue: 0x0b2f63,
  cyan: 0x22d3ee,
  ice: 0xe8fbff,
  signal: 0x69f0ff,
} as const;

/** Compact camera-fixed mute control with a shared pointer / keyboard state. */
export class MuteToggle {
  readonly root: Phaser.GameObjects.Container;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private readonly frame: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private destroyed = false;

  private readonly onMuteChanged: EventHandler<'audio:mute-changed'> = ({ muted }) =>
    this.render(muted);

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly audio: AudioController,
  ) {
    const { width } = scene.scale;
    this.root = scene.add.container(width - 570, 120).setDepth(1000).setScrollFactor(0);
    this.frame = scene.add.graphics();
    this.label = scene.add
      .text(240, 70, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#e8fbff',
        align: 'center',
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setResolution(1);
    this.root.add([this.frame, this.label]);
    this.hitZone = scene.add
      .zone(width - 330, 190, 480, 140)
      .setDepth(1001)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.hitZone.on('pointerdown', this.onPointerToggle, this);
    scene.input.keyboard?.on('keydown-M', this.onKeyboardToggle, this);
    eventBus.on('audio:mute-changed', this.onMuteChanged);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.render(gameState.audio.muted);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.hitZone.off('pointerdown', this.onPointerToggle, this);
    this.scene.input.keyboard?.off('keydown-M', this.onKeyboardToggle, this);
    eventBus.off('audio:mute-changed', this.onMuteChanged);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.hitZone.destroy();
    this.root.destroy(true);
  }

  private onPointerToggle(): void {
    this.audio.toggleMuted('ui');
  }

  private onKeyboardToggle(event?: KeyboardEvent): void {
    if (event?.repeat) return;
    this.audio.toggleMuted('keyboard');
  }

  private render(muted: boolean): void {
    this.frame.clear();
    this.frame.fillStyle(COLORS.cabinet, 0.96).fillRect(0, 0, 480, 140);
    this.frame.lineStyle(8, muted ? COLORS.deepBlue : COLORS.cyan, 1).strokeRect(0, 0, 480, 140);
    this.frame.lineStyle(3, COLORS.ice, 0.55).strokeRect(18, 18, 444, 104);
    this.label.setText(muted ? 'SOUND: OFF  [M]' : 'SOUND: ON   [M]');
    this.label.setColor(muted ? '#e8fbff' : '#69f0ff');
    this.root.setAlpha(muted ? 0.82 : 1);
  }
}

export function createMuteToggle(scene: Phaser.Scene, audio: AudioController): MuteToggle {
  return new MuteToggle(scene, audio);
}
