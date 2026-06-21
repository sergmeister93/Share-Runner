import Phaser from 'phaser';
import { SCORE_FLASH_DURATION_MS } from '../core/Constants';
import { eventBus, type EventHandler } from '../core/EventBus';
import { gameState } from '../core/GameState';

const COLORS = {
  cabinet: 0x06142f,
  deepBlue: 0x0b2f63,
  cyan: 0x22d3ee,
  ice: 0xe8fbff,
  signal: 0x69f0ff,
  gold: 0xffdf5d,
} as const;

const FONT = '"Courier New", monospace';

/** Camera-fixed gameplay readout and completion spectacle. Reflects GameState; owns no score logic. */
export class HUD {
  readonly root: Phaser.GameObjects.Container;
  readonly counterText: Phaser.GameObjects.Text;
  readonly scoreText: Phaser.GameObjects.Text;
  readonly flashRoot: Phaser.GameObjects.Container;

  private readonly counterFrame: Phaser.GameObjects.Graphics;
  private readonly collectionFeedback: Phaser.GameObjects.Text;
  private readonly flashPanel: Phaser.GameObjects.Graphics;
  private readonly flashScore: Phaser.GameObjects.Text;
  private readonly flashShares: Phaser.GameObjects.Text;
  private pulseTimer?: Phaser.Time.TimerEvent;
  private feedbackTimer?: Phaser.Time.TimerEvent;
  private flashTimer?: Phaser.Time.TimerEvent;
  private flashTween?: Phaser.Tweens.Tween;
  private destroyed = false;

  private readonly onScoreChanged: EventHandler<'score:changed'> = (payload) => {
    this.render(payload.sharesCollected, payload.totalSharesRequired, payload.score);
  };

  private readonly onShareCollected: EventHandler<'share:collected'> = ({ scoreDelta }) => {
    this.showCollectionFeedback(scoreDelta);
  };

  private readonly onCounterPulse: EventHandler<'hud:share-counter-pulse'> = (payload) => {
    this.render(payload.sharesCollected, payload.totalSharesRequired, gameState.score);
    this.pulseCounter();
  };

  private readonly onLevelComplete: EventHandler<'level:complete'> = ({ score, sharesCollected }) => {
    this.startCompletionFlash(score, sharesCollected);
  };

  private readonly onResetComplete: EventHandler<'game:reset-complete'> = () => {
    this.cancelAnimations();
    this.renderFromState();
  };

  constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    this.root = scene.add.container(96, 88).setDepth(1000).setScrollFactor(0);

    this.counterFrame = scene.add.graphics();
    const shareLabel = this.makeText(36, 24, 'SHARES', 30, '#69f0ff');
    this.counterText = this.makeText(36, 58, '', 66, '#e8fbff');
    const scoreLabel = this.makeText(340, 24, 'SCORE', 30, '#69f0ff');
    this.scoreText = this.makeText(340, 58, '', 66, '#e8fbff');
    this.collectionFeedback = this.makeText(690, 68, '', 38, '#ffdf5d')
      .setOrigin(1, 0)
      .setVisible(false);
    this.root.add([
      this.counterFrame,
      shareLabel,
      this.counterText,
      scoreLabel,
      this.scoreText,
      this.collectionFeedback,
    ]);

    this.flashRoot = scene.add
      .container(Math.round(width / 2), Math.round(height / 2))
      .setDepth(1100)
      .setScrollFactor(0)
      .setVisible(false);
    this.flashPanel = scene.add.graphics();
    const flashTitle = this.makeText(0, -210, 'SHARE CIRCUIT COMPLETE', 64, '#69f0ff')
      .setOrigin(0.5);
    this.flashScore = this.makeText(0, -60, '', 116, '#ffdf5d').setOrigin(0.5);
    this.flashShares = this.makeText(0, 105, '', 48, '#e8fbff').setOrigin(0.5);
    const flashTag = this.makeText(0, 210, 'ALL SHARES DELIVERED', 34, '#69f0ff').setOrigin(0.5);
    this.flashRoot.add([this.flashPanel, flashTitle, this.flashScore, this.flashShares, flashTag]);

    this.drawCounter(false);
    this.drawFlashPanel();
    this.renderFromState();
    eventBus.on('score:changed', this.onScoreChanged);
    eventBus.on('share:collected', this.onShareCollected);
    eventBus.on('hud:share-counter-pulse', this.onCounterPulse);
    eventBus.on('level:complete', this.onLevelComplete);
    eventBus.on('game:reset-complete', this.onResetComplete);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cancelAnimations();
    eventBus.off('score:changed', this.onScoreChanged);
    eventBus.off('share:collected', this.onShareCollected);
    eventBus.off('hud:share-counter-pulse', this.onCounterPulse);
    eventBus.off('level:complete', this.onLevelComplete);
    eventBus.off('game:reset-complete', this.onResetComplete);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.flashRoot.destroy(true);
    this.root.destroy(true);
  }

  private makeText(
    x: number,
    y: number,
    text: string,
    fontSize: number,
    color: string,
  ): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: FONT,
        fontSize: `${fontSize}px`,
        fontStyle: 'bold',
        color,
        letterSpacing: 3,
      })
      .setResolution(1);
  }

  private renderFromState(): void {
    this.render(gameState.sharesCollected, gameState.totalSharesRequired, gameState.score);
  }

  private render(sharesCollected: number, totalSharesRequired: number, score: number): void {
    this.counterText.setText(`${sharesCollected} / ${totalSharesRequired}`);
    this.scoreText.setText(score.toString().padStart(6, '0'));
  }

  private drawCounter(highlighted: boolean): void {
    this.counterFrame.clear();
    this.counterFrame.fillStyle(COLORS.cabinet, 0.94).fillRect(0, 0, 720, 150);
    this.counterFrame.lineStyle(8, highlighted ? COLORS.gold : COLORS.cyan, 1);
    this.counterFrame.strokeRect(0, 0, 720, 150);
    this.counterFrame.lineStyle(3, COLORS.ice, 0.5).strokeRect(16, 16, 688, 118);
    this.counterFrame.fillStyle(COLORS.deepBlue, 1).fillRect(304, 20, 4, 110);
  }

  private pulseCounter(): void {
    this.pulseTimer?.remove(false);
    this.drawCounter(true);
    this.counterText.setColor('#ffdf5d');
    this.pulseTimer = this.scene.time.delayedCall(220, () => {
      this.drawCounter(false);
      this.counterText.setColor('#e8fbff');
      this.pulseTimer = undefined;
    });
  }

  private showCollectionFeedback(scoreDelta: number): void {
    this.feedbackTimer?.remove(false);
    this.collectionFeedback.setText(`+${scoreDelta}`).setVisible(true);
    this.feedbackTimer = this.scene.time.delayedCall(520, () => {
      this.collectionFeedback.setVisible(false);
      this.feedbackTimer = undefined;
    });
  }

  private drawFlashPanel(): void {
    this.flashPanel.clear();
    this.flashPanel.fillStyle(COLORS.cabinet, 0.97).fillRect(-760, -300, 1520, 600);
    this.flashPanel.lineStyle(16, COLORS.gold, 1).strokeRect(-760, -300, 1520, 600);
    this.flashPanel.lineStyle(5, COLORS.cyan, 1).strokeRect(-726, -266, 1452, 532);
  }

  private startCompletionFlash(score: number, sharesCollected: number): void {
    if (this.destroyed || gameState.ui.scoreFlashActive) return;
    gameState.ui.scoreFlashActive = true;
    this.flashScore.setText(`SCORE ${score.toString().padStart(6, '0')}`);
    this.flashShares.setText(`SHARES ${sharesCollected} / ${gameState.totalSharesRequired}`);
    this.flashRoot.setAlpha(1).setVisible(true);
    eventBus.emit('score:flash:start', { score, durationMs: SCORE_FLASH_DURATION_MS });

    this.flashTween = this.scene.tweens.add({
      targets: this.flashRoot,
      alpha: 0.62,
      duration: 120,
      ease: 'Stepped',
      yoyo: true,
      repeat: -1,
    });
    this.flashTimer = this.scene.time.delayedCall(SCORE_FLASH_DURATION_MS, () => {
      this.flashTween?.stop();
      this.flashTween = undefined;
      this.flashRoot.setAlpha(1).setVisible(false);
      this.flashTimer = undefined;
      gameState.ui.scoreFlashActive = false;
      eventBus.emit('score:flash:complete', { score });
    });
  }

  private cancelAnimations(): void {
    this.pulseTimer?.remove(false);
    this.feedbackTimer?.remove(false);
    this.flashTimer?.remove(false);
    this.flashTween?.stop();
    this.pulseTimer = undefined;
    this.feedbackTimer = undefined;
    this.flashTimer = undefined;
    this.flashTween = undefined;
    this.drawCounter(false);
    this.counterText.setColor('#e8fbff');
    this.collectionFeedback.setVisible(false);
    this.flashRoot.setAlpha(1).setVisible(false);
    gameState.ui.scoreFlashActive = false;
  }
}

export function createHUD(scene: Phaser.Scene): HUD {
  return new HUD(scene);
}
