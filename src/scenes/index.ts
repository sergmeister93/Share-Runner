import { IntroScene } from './IntroScene';
import { LevelLoadStubScene } from './LevelLoadStubScene';
import { MenuScene } from './MenuScene';
import { PreloaderScene } from './PreloaderScene';

export { IntroScene, LevelLoadStubScene, MenuScene, PreloaderScene };

/** Manager-owned src/main.ts can register this bundle without reaching into UX internals. */
export const UX_BOOT_SCENES = [IntroScene, MenuScene, PreloaderScene, LevelLoadStubScene];
