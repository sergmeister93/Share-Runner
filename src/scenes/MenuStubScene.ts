import Phaser from 'phaser';
import { SCENE_MENU } from '../core/Constants';

/**
 * Temporary WO-07 transition target. WO-08 replaces this with the real two-option
 * menu; it intentionally emits no menu/game events and owns no gameplay state.
 */
export class MenuStubScene extends Phaser.Scene {
  constructor() {
    super(SCENE_MENU);
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#06142f');
    this.add
      .text(width / 2, height / 2 - 60, 'MENU SYSTEM READY', {
        fontFamily: '"Courier New", monospace',
        fontSize: '120px',
        fontStyle: 'bold',
        color: '#69f0ff',
        stroke: '#0b2f63',
        strokeThickness: 18,
      })
      .setOrigin(0.5)
      .setResolution(1);
    this.add
      .text(width / 2, height / 2 + 120, 'START GAME + QUIT ARRIVE IN WO-08', {
        fontFamily: '"Courier New", monospace',
        fontSize: '52px',
        color: '#e8fbff',
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setResolution(1);
  }
}
