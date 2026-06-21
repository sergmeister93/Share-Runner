import Phaser from 'phaser';
import {
  SCENE_LEVEL,
  SCENE_COMPLETION,
  LEVEL_ID,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  SCORE_FLASH_DURATION_MS,
} from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import type { AssetCatalog } from '../systems/AssetCatalog';
import { buildLevelWorld } from '../systems/LevelWorld';
import { Player } from '../objects/Player';
import { PlatformSystem } from '../systems/PlatformSystem';
import { CollectibleSystem } from '../systems/CollectibleSystem';
import { CompletionSystem } from '../systems/CompletionSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { AudioController } from '../ui/AudioController';
import { createMuteToggle } from '../ui/MuteToggle';
import { HUD } from '../ui/HUD';

// Level manifest image keys (verified facts of baltimore_level_manifest.json). The
// Preloader loaded these; the AssetCatalog addresses assets by key.
const BG_SKYLINE_KEY = 'baltimore-skyline-wide';
const BG_ROWHOMES_KEY = 'baltimore-rowhome-platform-strip';
const ROWHOME_TOP_Y = 1905;
// World-camera zoom for a readable side-scroll. ponytail: a literal here; promote to
// Constants if a second level ever needs a different value.
const LEVEL_CAMERA_ZOOM = 2.5;
const ROWHOME_HALF_WIDTH = 2200; // two strips meet at x=2200 (composition.json)

/**
 * LevelScene (WO-16 integration seam) — assembles the world, player, platforms,
 * coins, flag, HUD, audio and camera from the merged backend/ux systems and runs
 * the gameplay loop. Manager-owned integration; executors do not edit it.
 */
export class LevelScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: PlatformSystem;
  private coins!: CollectibleSystem;
  private completion!: CompletionSystem;
  private audio!: AudioController;
  private completing = false;
  private readonly onComplete = (): void => this.onLevelComplete();

  constructor() {
    super(SCENE_LEVEL);
  }

  create(): void {
    this.completing = false;
    const catalog = this.registry.get('assetCatalog') as AssetCatalog | undefined;
    if (!catalog) {
      // Preloader must run first; fail loud rather than render an empty level.
      throw new Error('[LevelScene] no assetCatalog in registry — Preloader did not run');
    }

    this.drawBackdrop();

    const world = buildLevelWorld(this, catalog);
    this.platforms = new PlatformSystem(this, catalog);
    this.player = new Player(this, catalog);
    this.player.setDepth(10);
    this.player.collideWith(world.groundZones);
    this.player.collideWith(this.platforms.colliderTargets);

    this.coins = new CollectibleSystem(this, catalog, this.platforms);
    this.coins.registerOverlap(this.player);

    this.completion = new CompletionSystem(this, catalog);
    this.completion.registerOverlap(this.player);

    this.audio = new AudioController(this, catalog);
    const mute = createMuteToggle(this, this.audio);
    const hud = new HUD(this);

    // World camera: zoom in + follow so the player is readable (WO-18 QA: ~23px wide
    // at whole-world contain-fit). Bounds (=world) clamp it to the level edges.
    const camera = new CameraSystem(this);
    camera.contain();
    camera.follow(this.player);
    this.cameras.main.setZoom(LEVEL_CAMERA_ZOOM);

    // UI camera: HUD + mute toggle must NOT move with the world camera's zoom/scroll
    // (setScrollFactor(0) ignores scroll but NOT zoom — caught in a ux live audit). Give
    // the overlays their own unzoomed camera; each camera ignores the other's objects.
    const uiObjects = [hud.root, hud.flashRoot, ...mute.cameraObjects];
    const uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.ignore(uiObjects);
    uiCamera.ignore(this.children.list.filter((o) => !uiObjects.includes(o)));

    gameState.currentScene = SCENE_LEVEL;
    gameState.isRunActive = true;
    gameState.isLevelComplete = false;
    gameState.elapsedMs = 0;

    eventBus.emit('level:loaded', {
      levelId: LEVEL_ID,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
    });
    // level:start drives AudioController.requestMusicStart (gesture already given at Menu).
    eventBus.emit('level:start', { levelId: LEVEL_ID, requiredShares: 5 });

    // Transition to Completion after the HUD score-flash has played out in-level.
    eventBus.once('level:complete', this.onComplete);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownLevel, this);
  }

  override update(_time: number, delta: number): void {
    if (this.completing) return;
    const dtSec = delta / 1000;
    gameState.elapsedMs += delta;
    this.platforms.update(dtSec);
    this.platforms.carry(this.player);
    this.coins.update(dtSec);
    // Player advances via its own preUpdate; CompletionSystem reacts via overlap.
  }

  private onLevelComplete(): void {
    this.completing = true;
    gameState.isRunActive = false;
    this.player.setActive(false); // freeze input/movement (preUpdate skips inactive)
    // Let the HUD flash play, then move to the persistent completion screen.
    this.time.delayedCall(SCORE_FLASH_DURATION_MS + 250, () => {
      this.scene.start(SCENE_COMPLETION);
    });
  }

  private drawBackdrop(): void {
    this.add.image(0, 0, BG_SKYLINE_KEY).setOrigin(0, 0).setDepth(-20);
    this.add.image(0, ROWHOME_TOP_Y, BG_ROWHOMES_KEY).setOrigin(0, 0).setDepth(-10);
    this.add
      .image(ROWHOME_HALF_WIDTH, ROWHOME_TOP_Y, BG_ROWHOMES_KEY)
      .setOrigin(0, 0)
      .setDepth(-10);
  }

  private shutdownLevel(): void {
    eventBus.off('level:complete', this.onComplete); // no-op if it already fired (once)
  }
}
