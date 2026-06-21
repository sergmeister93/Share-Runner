import { IntroScene } from './IntroScene';
import { MenuStubScene } from './MenuStubScene';

export { IntroScene, MenuStubScene };

/** Manager-owned src/main.ts can register this bundle without reaching into UX internals. */
export const UX_BOOT_SCENES = [IntroScene, MenuStubScene];
