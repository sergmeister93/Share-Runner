import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from './Constants';

/** Phaser game config. Pixel-art crisp, contain-fit. Arcade physics added at WO-16
 * integration: world gravity is 0 — the PlayerController integrates its own gravity
 * and platforms are gravity-off, so nothing relies on Phaser's global gravity. */
export function createGameConfig(
  scenes: Phaser.Types.Scenes.SceneType[],
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'app',
    backgroundColor: '#0b0e14',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      // FIT == "contain": scale to fit the viewport, preserve aspect, letterbox.
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: scenes,
  };
}
