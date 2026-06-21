import { IntroScene } from './IntroScene';
import { MenuScene } from './MenuScene';
import { PreloaderScene } from './PreloaderScene';

// The integration scenes (LevelScene, CompletionScene) are registered directly by
// the Manager-owned src/main.ts; these are the standalone UX scenes it re-exports.
export { IntroScene, MenuScene, PreloaderScene };
