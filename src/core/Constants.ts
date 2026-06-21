/**
 * Constants — the single source of shared config values (frozen seam, WO-04).
 * Asset *paths* never live here; they come from manifests (WO-05). Only canonical
 * world facts, contract-default dimensions, scene keys, and tunables belong here.
 *
 * `[TUNABLE]` marks values revisable after playtest (reconcile note E-07). They are
 * starting points for in-browser tuning, not final.
 */

/** Canonical level id. The superseded underscore/rooftop form must never appear. */
export const LEVEL_ID = 'baltimore-waterfront' as const;
/** Music asset key (manifest), unrelated to the level id. */
export const LEVEL_MUSIC_KEY = 'baltimore-rooftop-theme' as const;
/** SFX asset keys (manifest `sfx` block). Paths live in the manifest, not here. */
export const SFX_KEYS = {
  jump: 'sfx-jump',
  land: 'sfx-land',
  collect: 'sfx-collect',
  complete: 'sfx-complete',
  locked: 'sfx-locked',
} as const;

// --- Canonical world facts (repo facts; verified against level contract) ---------
export const WORLD_WIDTH = 4400;
export const WORLD_HEIGHT = 2494;
export const WORLD_ORIGIN_X = 0;
export const WORLD_ORIGIN_Y = 0;
export const GROUND_TOP_Y = 1905;
export const GROUND_WIDTH = 4400;
export const FIT_POLICY = 'contain' as const;
export const PIXEL_ART = true;
export const PIXEL_SNAPPING = true;

// --- Asset dimension defaults (contract validation only; runtime prefers manifest) -
export const PLAYER_FRAME_WIDTH = 160;
export const PLAYER_FRAME_HEIGHT = 160;
export const PLAYER_IDLE_VISUAL_HEIGHT = 102;
export const PLAYER_IDLE_FRAMES = 10;
export const PLAYER_WALK_FRAMES = 10;
export const PLAYER_RUN_FRAMES = 10;
export const PLAYER_JUMP_FRAMES = 6;
export const PLAYER_FALL_FRAMES = 4;
export const PLAYER_FALL_LOOP_FRAMES = 3;
export const SHARE_COIN_WIDTH = 56;
export const SHARE_COIN_HEIGHT = 55;
export const PLATFORM_BRICK_WIDTH = 170;
export const PLATFORM_BRICK_HEIGHT = 58;

// --- Gameplay constants ----------------------------------------------------------
export const TOTAL_SHARES_REQUIRED = 5;
export const SHARE_SCORE_VALUE = 100; // [TUNABLE]
export const SCORE_FLASH_DURATION_MS = 1600; // [TUNABLE]
export const COIN_BOB_AMPLITUDE_PX = 8; // [TUNABLE]
export const COIN_BOB_DURATION_MS = 900; // [TUNABLE]
export const CAMERA_PAN_DURATION_MS = 1200; // [TUNABLE]
export const MUSIC_VOLUME = 0.55; // [TUNABLE]
export const SFX_VOLUME = 0.4; // [TUNABLE]

// Provisional physics (reconcile note; [TUNABLE] — finalized after playtest, E-07).
export const GRAVITY_Y = 3000; // [TUNABLE]
export const PLAYER_JUMP_VELOCITY = -1300; // [TUNABLE]
export const PLAYER_MAX_RUN_SPEED = 520; // [TUNABLE]
export const PLAYER_ACCELERATION = 2600; // [TUNABLE]
export const COYOTE_TIME_MS = 100; // [TUNABLE]
export const JUMP_BUFFER_MS = 120; // [TUNABLE]

// --- Scene keys ------------------------------------------------------------------
export const SCENE_INTRO = 'Intro' as const;
export const SCENE_MENU = 'Menu' as const;
export const SCENE_PRELOADER = 'Preloader' as const;
export const SCENE_LEVEL = 'Level' as const;
export const SCENE_COMPLETION = 'Completion' as const;

export type SceneKey =
  | typeof SCENE_INTRO
  | typeof SCENE_MENU
  | typeof SCENE_PRELOADER
  | typeof SCENE_LEVEL
  | typeof SCENE_COMPLETION;
