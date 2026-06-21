import { IntroScene } from './IntroScene';
import { LevelLoadStubScene } from './LevelLoadStubScene';
import { MenuStubScene } from './MenuStubScene';
import { PreloaderScene } from './PreloaderScene';

export { IntroScene, LevelLoadStubScene, MenuStubScene, PreloaderScene };

/** Manager-owned src/main.ts can register this bundle without reaching into UX internals. */
export const UX_BOOT_SCENES = [IntroScene, MenuStubScene, PreloaderScene, LevelLoadStubScene];
