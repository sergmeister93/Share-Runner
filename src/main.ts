import Phaser from 'phaser';
import { createGameConfig } from './core/PhaserGameConfig';
import { eventBus } from './core/EventBus';
import { IntroScene, MenuScene, PreloaderScene } from './scenes';
import { LevelScene } from './scenes/LevelScene';
import { CompletionScene } from './scenes/CompletionScene';

/**
 * App entry (Manager seam). Final scene graph for the first playable:
 * Intro → Menu → Preloader → Level → Completion. IntroScene is first, so it
 * auto-starts. app:boot announces that Phaser + the shared singletons are live
 * (event_bus_contract §4.1).
 */
new Phaser.Game(
  createGameConfig([IntroScene, MenuScene, PreloaderScene, LevelScene, CompletionScene]),
);
eventBus.emit('app:boot', { timestampMs: Date.now() });
