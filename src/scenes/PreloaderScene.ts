import Phaser from 'phaser';
import { LEVEL_ID, SCENE_LEVEL, SCENE_PRELOADER } from '../core/Constants';
import { eventBus, type EventName } from '../core/EventBus';
import { loadManifestBundle } from '../data/assetManifests';
import { buildAssetCatalog, queueLoads } from '../systems/AssetCatalog';
import { PixelProgressBar } from '../ui/PixelProgressBar';

const PRELOADER_EVENTS = {
  start: 'preloader:start',
  progress: 'asset:load-progress',
  complete: 'asset:load-complete',
} as const satisfies Record<string, EventName>;

/** Dedicated manifest-driven asset-loading scene. Builds no gameplay objects. */
export class PreloaderScene extends Phaser.Scene {
  private progressBar?: PixelProgressBar;
  private totalAssets = 0;
  private completed = false;
  private active = false;

  constructor() {
    super(SCENE_PRELOADER);
  }

  create(): void {
    this.active = true;
    this.completed = false;
    this.totalAssets = 0;
    this.cameras.main.setBackgroundColor('#06142f');
    this.drawBackground();
    this.progressBar = new PixelProgressBar(this);

    eventBus.emit(PRELOADER_EVENTS.start, { levelId: LEVEL_ID });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownPreloader, this);
    this.load.on(Phaser.Loader.Events.PROGRESS, this.handleProgress, this);
    this.load.once(Phaser.Loader.Events.COMPLETE, this.handleComplete, this);

    // Phaser does not await async preload(); bootstrap here, then explicitly start
    // the LoaderPlugin only after the manifest adapter has queued every asset.
    void this.prepareAndStartLoader();
  }

  private async prepareAndStartLoader(): Promise<void> {
    try {
      const bundle = await loadManifestBundle();
      if (!this.active) return;
      const catalog = buildAssetCatalog(bundle);
      this.registry.set('assetCatalog', catalog);
      this.totalAssets = catalog.loadList.length;
      this.progressBar?.update(0, this.totalAssets);
      eventBus.emit(PRELOADER_EVENTS.progress, {
        loaded: 0,
        total: this.totalAssets,
        percent: 0,
      });
      queueLoads(this.load, catalog);

      if (this.totalAssets === 0) {
        this.handleComplete();
        return;
      }
      this.load.start();
    } catch (error) {
      if (!this.active) return;
      const message = error instanceof Error ? error.message : 'unknown manifest error';
      this.progressBar?.showError(message);
      console.error('[Share-Runner] Preloader failed:', error);
    }
  }

  private handleProgress(progress: number): void {
    const percent = Math.round(Phaser.Math.Clamp(progress, 0, 1) * 100);
    const loaded = Math.min(this.totalAssets, Math.round((percent / 100) * this.totalAssets));
    this.progressBar?.update(loaded, this.totalAssets);
    eventBus.emit(PRELOADER_EVENTS.progress, { loaded, total: this.totalAssets, percent });
  }

  private handleComplete(): void {
    if (this.completed || !this.active) return;
    this.completed = true;
    this.progressBar?.update(this.totalAssets, this.totalAssets);
    this.progressBar?.showComplete();
    eventBus.emit(PRELOADER_EVENTS.complete, { levelId: LEVEL_ID });
    this.scene.start(SCENE_LEVEL);
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    const grid = this.add.graphics();
    grid.lineStyle(5, 0x0b2f63, 0.75);
    for (let x = 0; x <= width; x += 160) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 160) grid.lineBetween(0, y, width, y);
    grid.lineStyle(12, 0x22d3ee, 0.85).strokeRect(150, 150, width - 300, height - 300);
  }

  private shutdownPreloader(): void {
    this.active = false;
    this.load.off(Phaser.Loader.Events.PROGRESS, this.handleProgress, this);
    this.load.off(Phaser.Loader.Events.COMPLETE, this.handleComplete, this);
    this.progressBar = undefined;
  }
}
