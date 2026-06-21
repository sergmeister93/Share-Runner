import Phaser from 'phaser';

/**
 * Canonical authored space for baltimore-waterfront (frozen level contract).
 * World is 4400×2494, origin top-left. WO-04 will own the Constants singleton;
 * these literals live here only because the Scale Manager needs them at boot.
 */
const WORLD_WIDTH = 4400;
const WORLD_HEIGHT = 2494;

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
