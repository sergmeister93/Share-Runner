import Phaser from 'phaser';
import { SCENE_COMPLETION, SCENE_LEVEL } from '../core/Constants';
import { gameState } from '../core/GameState';

/**
 * CompletionScene (WO-16 integration seam) — the persistent post-win screen.
 * E-06: stay on completion + offer restart. Manager-owned integration scene.
 */
export class CompletionScene extends Phaser.Scene {
  private restarting = false;

  constructor() {
    super(SCENE_COMPLETION);
  }

  create(): void {
    this.restarting = false;
    gameState.currentScene = SCENE_COMPLETION;
    const { width, height } = this.scale;
    const cx = Math.round(width / 2);
    this.cameras.main.setBackgroundColor('#06142f');

    const score = gameState.score.toString().padStart(6, '0');
    const seconds = (gameState.elapsedMs / 1000).toFixed(1);

    this.title(cx, height / 2 - 360, 'LEVEL COMPLETE', 150, '#69f0ff');
    this.title(cx, height / 2 - 150, `SCORE  ${score}`, 110, '#ffdf5d');
    this.title(
      cx,
      height / 2 + 20,
      `SHARES  ${gameState.sharesCollected} / ${gameState.totalSharesRequired}`,
      72,
      '#e8fbff',
    );
    this.title(cx, height / 2 + 150, `TIME  ${seconds}s`, 56, '#e8fbff');
    this.title(cx, height / 2 + 330, 'PRESS  ENTER / R  TO PLAY AGAIN', 56, '#69f0ff');

    this.input.keyboard?.once('keydown-ENTER', this.restart, this);
    this.input.keyboard?.once('keydown-R', this.restart, this);
    this.input.once('pointerdown', this.restart, this);
  }

  private restart(): void {
    if (this.restarting) return;
    this.restarting = true;
    // reset() mints a new runId, clears run/score/share/flag state, PERSISTS mute
    // (E-05), and emits game:reset-complete. A fresh LevelScene rebuilds all systems.
    gameState.reset(SCENE_LEVEL);
    this.scene.start(SCENE_LEVEL);
  }

  private title(x: number, y: number, text: string, size: number, color: string): void {
    this.add
      .text(x, y, text, {
        fontFamily: '"Courier New", monospace',
        fontSize: `${size}px`,
        fontStyle: 'bold',
        color,
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setResolution(1);
  }
}
