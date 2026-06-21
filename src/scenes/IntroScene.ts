import Phaser from 'phaser';
import { SCENE_INTRO, SCENE_MENU } from '../core/Constants';
import { eventBus, type EventName } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { createArcadeTitleCard, type ArcadeTitleCard } from '../ui/ArcadeTitleCard';

const INTRO_EVENTS = {
  start: 'intro:start',
  titleSlam: 'intro:title-slam',
  scanlinePulse: 'intro:scanline-pulse',
  complete: 'intro:complete',
} as const satisfies Record<string, EventName>;

const STANDARD_PULSE_COUNT = 3;
const STANDARD_COMPLETE_DELAY_MS = 2600;
const REDUCED_COMPLETE_DELAY_MS = 700;

/** The first visible scene: one compact, restart-safe arcade title beat. */
export class IntroScene extends Phaser.Scene {
  private card?: ArcadeTitleCard;
  private scheduled: Phaser.Time.TimerEvent[] = [];
  private completed = false;
  private reducedMotion = false;

  constructor() {
    super(SCENE_INTRO);
  }

  create(): void {
    this.completed = false;
    this.scheduled = [];
    this.reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.cameras.main.setBackgroundColor('#06142f');
    this.card = createArcadeTitleCard(this);

    eventBus.emit(INTRO_EVENTS.start, { runId: gameState.runId });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownIntro, this);
    this.bindSkipControls();

    if (this.reducedMotion) {
      this.playReducedMotionBeat();
      return;
    }

    this.schedule(320, () => this.playTitleSlam());
    this.schedule(840, () => this.playPulse(1, STANDARD_PULSE_COUNT));
    this.schedule(1240, () => this.playPulse(2, STANDARD_PULSE_COUNT));
    this.schedule(1640, () => this.playPulse(3, STANDARD_PULSE_COUNT));
    this.schedule(STANDARD_COMPLETE_DELAY_MS, () => this.completeIntro());
  }

  private playTitleSlam(): void {
    if (this.completed || !this.card) return;
    eventBus.emit(INTRO_EVENTS.titleSlam, { title: 'Share-Runner', intensity: 'high' });
    this.card.revealTitle();

    // Deliberately stepped integer positions: arcade impact without filtered scaling.
    this.card.setTitleOffset(72, -36);
    this.schedule(55, () => this.card?.setTitleOffset(-28, 12));
    this.schedule(110, () => this.card?.setTitleOffset(0, 0));
  }

  private playPulse(pulseIndex: number, totalPulses: number): void {
    if (this.completed || !this.card) return;
    eventBus.emit(INTRO_EVENTS.scanlinePulse, { pulseIndex, totalPulses });
    this.card.pulse(true);
    this.schedule(92, () => this.card?.pulse(false));
  }

  private playReducedMotionBeat(): void {
    this.card?.revealTitle();
    this.card?.setTitleOffset(0, 0);
    eventBus.emit(INTRO_EVENTS.titleSlam, { title: 'Share-Runner', intensity: 'low' });
    eventBus.emit(INTRO_EVENTS.scanlinePulse, { pulseIndex: 1, totalPulses: 1 });
    this.schedule(REDUCED_COMPLETE_DELAY_MS, () => this.completeIntro());
  }

  private bindSkipControls(): void {
    this.input.keyboard?.on('keydown-ENTER', this.completeIntro, this);
    this.input.keyboard?.on('keydown-SPACE', this.completeIntro, this);
    this.input.once('pointerdown', this.completeIntro, this);
  }

  private completeIntro(): void {
    if (this.completed) return;
    this.completed = true;
    eventBus.emit(INTRO_EVENTS.complete, { nextScene: SCENE_MENU });

    if (this.scene.manager.keys[SCENE_MENU]) {
      this.scene.start(SCENE_MENU);
      return;
    }

    // Entry wiring is Manager-owned. Keep a clean, inspectable final frame until wired.
    this.card?.showReadyState();
    console.info('[Share-Runner] intro:complete emitted; Menu scene registration pending.');
  }

  private schedule(delayMs: number, callback: () => void): void {
    this.scheduled.push(this.time.delayedCall(delayMs, callback));
  }

  private shutdownIntro(): void {
    for (const timer of this.scheduled) timer.remove(false);
    this.scheduled = [];
    this.input.keyboard?.off('keydown-ENTER', this.completeIntro, this);
    this.input.keyboard?.off('keydown-SPACE', this.completeIntro, this);
    this.input.off('pointerdown', this.completeIntro, this);
    this.card = undefined;
  }
}
