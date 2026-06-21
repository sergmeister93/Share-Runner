import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from './Constants';

/** Phaser game config for the app shell. Pixel-art crisp, contain-fit, no gameplay. */
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
    scene: scenes,
  };
}
