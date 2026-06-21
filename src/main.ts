import Phaser from 'phaser';
import { createGameConfig } from './core/PhaserGameConfig';
import { eventBus } from './core/EventBus';

/**
 * Boot stub for the app shell (WO-03). The real scenes — Intro, Menu, Preloader,
 * Level, Completion — are the ux lane's work orders and live in src/scenes/**.
 * ponytail: inline boot scene; no scene file yet, src/scenes/** is not my lane.
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b0e14');
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Share-Runner — boot', {
        fontFamily: 'monospace',
        fontSize: '120px',
        color: '#9fe7ff',
      })
      .setOrigin(0.5);

    // Singletons are available now; announce boot (event_bus_contract §4.1).
    eventBus.emit('app:boot', { timestampMs: Date.now() });
  }
}

new Phaser.Game(createGameConfig([BootScene]));
