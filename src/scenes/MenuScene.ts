import Phaser from 'phaser';
import { SCENE_MENU, SCENE_PRELOADER } from '../core/Constants';
import { eventBus, type EventName } from '../core/EventBus';
import { gameState } from '../core/GameState';
import {
  createArcadeMenuPanel,
  MENU_OPTIONS,
  type ArcadeMenuPanel,
  type MenuOption,
} from '../ui/ArcadeMenuPanel';

const MENU_EVENTS = {
  shown: 'menu:shown',
  startRequested: 'game:start-requested',
  quitRequested: 'game:quit-requested',
  quitFallbackShown: 'game:quit-fallback-shown',
} as const satisfies Record<string, EventName>;

/** The two-option title menu. Selection is shared by keyboard and pointer input. */
export class MenuScene extends Phaser.Scene {
  private panel?: ArcadeMenuPanel;
  private selectionIndex = 0;
  private closeCheck?: Phaser.Time.TimerEvent;
  private actionLocked = false;

  constructor() {
    super(SCENE_MENU);
  }

  create(): void {
    this.selectionIndex = 0;
    this.actionLocked = false;
    this.closeCheck = undefined;
    this.cameras.main.setBackgroundColor('#06142f');
    this.panel = createArcadeMenuPanel(this);
    this.setSelection(0);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownMenu, this);
    this.bindControls();
    eventBus.emit(MENU_EVENTS.shown, { options: ['Start Game', 'Quit'] });
  }

  private bindControls(): void {
    this.input.keyboard?.on('keydown-UP', this.selectPrevious, this);
    this.input.keyboard?.on('keydown-W', this.selectPrevious, this);
    this.input.keyboard?.on('keydown-DOWN', this.selectNext, this);
    this.input.keyboard?.on('keydown-S', this.selectNext, this);
    this.input.keyboard?.on('keydown-ENTER', this.activateSelection, this);
    this.input.keyboard?.on('keydown-SPACE', this.activateSelection, this);

    this.panel?.optionTexts.forEach((optionText, index) => {
      optionText.on('pointerover', () => this.setSelection(index));
      optionText.on('pointerdown', () => {
        this.setSelection(index);
        this.activateSelection();
      });
    });
  }

  private selectPrevious(): void {
    this.setSelection((this.selectionIndex + MENU_OPTIONS.length - 1) % MENU_OPTIONS.length);
  }

  private selectNext(): void {
    this.setSelection((this.selectionIndex + 1) % MENU_OPTIONS.length);
  }

  private setSelection(index: number): void {
    this.selectionIndex = index;
    const selection: MenuOption = MENU_OPTIONS[index];
    gameState.ui.menuSelection = selection;
    this.panel?.setSelection(index);
  }

  private activateSelection(): void {
    if (this.actionLocked) return;
    const selection = MENU_OPTIONS[this.selectionIndex];
    if (selection === 'Start Game') {
      this.actionLocked = true;
      eventBus.emit(MENU_EVENTS.startRequested, { source: 'menu' });
      this.scene.start(SCENE_PRELOADER);
      return;
    }

    this.requestQuit();
  }

  private requestQuit(): void {
    eventBus.emit(MENU_EVENTS.quitRequested, { source: 'menu' });

    // Browsers only permit script-opened windows to close themselves. A normal game
    // tab remains at the title safely, which is the E-04 fallback policy.
    if (!globalThis.window?.opener) {
      this.showQuitFallback('browser-blocked-window-close');
      return;
    }

    globalThis.window.close();
    this.closeCheck?.remove(false);
    this.closeCheck = this.time.delayedCall(120, () => {
      if (!globalThis.window.closed) this.showQuitFallback('browser-blocked-window-close');
    });
  }

  private showQuitFallback(reason: 'browser-blocked-window-close' | 'unsupported'): void {
    eventBus.emit(MENU_EVENTS.quitFallbackShown, { reason });
    this.panel?.showQuitFallback();
  }

  private shutdownMenu(): void {
    this.closeCheck?.remove(false);
    this.closeCheck = undefined;
    this.input.keyboard?.off('keydown-UP', this.selectPrevious, this);
    this.input.keyboard?.off('keydown-W', this.selectPrevious, this);
    this.input.keyboard?.off('keydown-DOWN', this.selectNext, this);
    this.input.keyboard?.off('keydown-S', this.selectNext, this);
    this.input.keyboard?.off('keydown-ENTER', this.activateSelection, this);
    this.input.keyboard?.off('keydown-SPACE', this.activateSelection, this);
    this.panel = undefined;
  }
}
