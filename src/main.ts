import Phaser from 'phaser';
import { createGameConfig } from './core/PhaserGameConfig';
import { eventBus } from './core/EventBus';
import { UX_BOOT_SCENES } from './scenes';

/**
 * App entry (Manager seam). Registers the UX scene bundle from src/scenes/index.ts
 * (WO-07 handoff). IntroScene is first, so it auto-starts. app:boot announces that
 * Phaser + the shared singletons are live (event_bus_contract §4.1).
 * ponytail: MenuStubScene is WO-07's placeholder; WO-08's real Menu replaces it.
 */
new Phaser.Game(createGameConfig(UX_BOOT_SCENES));
eventBus.emit('app:boot', { timestampMs: Date.now() });
