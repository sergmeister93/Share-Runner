import Phaser from 'phaser';
import { SCENE_LEVEL } from '../core/Constants';

/** Temporary WO-06 transition target; WO-16 replaces it with integrated LevelScene. */
export class LevelLoadStubScene extends Phaser.Scene {
  constructor() {
    super(SCENE_LEVEL);
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#06142f');
    this.add
      .text(width / 2, height / 2 - 60, 'LEVEL ASSETS READY', {
        fontFamily: '"Courier New", monospace',
        fontSize: '128px',
        fontStyle: 'bold',
        color: '#69f0ff',
        stroke: '#0b2f63',
        strokeThickness: 20,
      })
      .setOrigin(0.5)
      .setResolution(1);
    this.add
      .text(width / 2, height / 2 + 120, 'WORLD INTEGRATION ARRIVES IN WO-16', {
        fontFamily: '"Courier New", monospace',
        fontSize: '52px',
        color: '#e8fbff',
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setResolution(1);
  }
}
