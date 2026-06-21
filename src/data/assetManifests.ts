/**
 * Asset manifest types + browser loader (WO-05).
 *
 * The manifests are the ONLY source of asset paths and dimensions. This module
 * types the slices the runtime consumes and fetches the bundle starting from the
 * single documented entry point (`asset_library_manifest.json`). Nested manifest
 * locations come from the library manifest — never hardcoded here.
 */

/** Thrown when a manifest lacks a field the runtime requires. Names the missing key. */
export class ManifestMismatchError extends Error {
  constructor(missingKey: string, source: string) {
    super(`manifest-mismatch: missing "${missingKey}" in ${source}`);
    this.name = 'ManifestMismatchError';
  }
}

// --- Manifest shapes (only the consumed fields) ----------------------------------

export interface AssetLibraryManifest {
  packages: Record<string, { manifest: string; goldPreview?: string }>;
  audio?: Record<string, { file: string; format: string; loopSuggested?: boolean }>;
  /** One-shot gameplay SFX, keyed by Phaser asset key. Paths are asset-root-relative. */
  sfx?: Record<string, { file: string; format: string }>;
}

export interface ImageAssetEntry {
  key: string;
  path: string;
  width: number;
  height: number;
}

export interface AudioAssetEntry {
  key: string;
  path: string;
  format?: string;
  loopSuggested?: boolean;
}

export interface MovementSpec {
  axis: 'x' | 'y';
  min: number;
  max: number;
}

export type ObstacleKind = 'stationary' | 'vertical' | 'horizontal';

export interface ObstaclePlacement {
  id: string;
  kind: ObstacleKind;
  topLeft: { x: number; y: number };
  brickCount: number;
  width: number;
  height: number;
  movement: MovementSpec | null;
  speed: number;
}

export type CollectableBehavior = 'static-bob' | 'moves-with-platform';

export interface CollectablePlacement {
  id: string;
  center: { x: number; y: number };
  anchorPlatformId: string;
  behavior: CollectableBehavior;
}

export interface AuthoredGameplayPlacements {
  anchors: Record<string, string>;
  ground: { x: number; topY: number; width: number };
  playerSpawn: { id: string; anchor: string; x: number; y: number };
  flag: { id: string; anchor: string; x: number; y: number };
  environmentObstacles: ObstaclePlacement[];
  collectables: CollectablePlacement[];
}

export interface LevelManifest {
  levelId: string;
  worldBounds: { x: number; y: number; width: number; height: number };
  assets: {
    background: ImageAssetEntry;
    rowhomes: ImageAssetEntry;
    music: AudioAssetEntry;
  };
  authoredGameplayPlacements: AuthoredGameplayPlacements;
}

export interface PlayerAnimationEntry {
  file: string;
  frames: number;
  fpsSuggested: number;
  loop: boolean;
  next?: string;
}

export interface PlayerSpriteManifest {
  assetId: string;
  frame: { width: number; height: number };
  pivot?: { normalizedFromTopLeft: { x: number; y: number } };
  collision?: { x: number; y: number; width: number; height: number };
  animations: Record<string, PlayerAnimationEntry>;
}

export interface SingleImageManifest {
  assets: Record<string, { key: string; file: string; width: number; height: number }>;
}

/** Parsed manifests + the library-relative paths they were loaded from (for dir resolution). */
export interface ManifestBundle {
  /** URL root the asset paths resolve against (e.g. `/assets`). */
  root: string;
  library: AssetLibraryManifest;
  level: LevelManifest;
  player: PlayerSpriteManifest;
  collectables: SingleImageManifest;
  environment: SingleImageManifest;
  /** Library-relative path of each nested manifest, used to resolve its asset paths. */
  paths: { level: string; player: string; collectables: string; environment: string };
}

/** Asset URL root and the documented entry manifest (the one allowed literal). */
export const ASSET_ROOT = '/assets';
export const LIBRARY_MANIFEST_PATH = 'asset_library_manifest.json';

/** Library package keys the level depends on. */
const PACKAGE_KEYS = {
  level: 'baltimoreLevel',
  player: 'maleHeroTrpBlue',
  collectables: 'collectables',
  environment: 'environmentPrefabs',
} as const;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new ManifestMismatchError(url, `fetch (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

function packageManifestPath(library: AssetLibraryManifest, key: string): string {
  const path = library.packages?.[key]?.manifest;
  if (!path) throw new ManifestMismatchError(`packages.${key}.manifest`, LIBRARY_MANIFEST_PATH);
  return path;
}

/**
 * Browser loader: fetch the library manifest, then the four nested manifests it
 * points to. The Preloader (WO-06) awaits this, then calls `queueLoads`.
 */
export async function loadManifestBundle(root: string = ASSET_ROOT): Promise<ManifestBundle> {
  const library = await fetchJson<AssetLibraryManifest>(`${root}/${LIBRARY_MANIFEST_PATH}`);
  const paths = {
    level: packageManifestPath(library, PACKAGE_KEYS.level),
    player: packageManifestPath(library, PACKAGE_KEYS.player),
    collectables: packageManifestPath(library, PACKAGE_KEYS.collectables),
    environment: packageManifestPath(library, PACKAGE_KEYS.environment),
  };
  const [level, player, collectables, environment] = await Promise.all([
    fetchJson<LevelManifest>(`${root}/${paths.level}`),
    fetchJson<PlayerSpriteManifest>(`${root}/${paths.player}`),
    fetchJson<SingleImageManifest>(`${root}/${paths.collectables}`),
    fetchJson<SingleImageManifest>(`${root}/${paths.environment}`),
  ]);
  return { root, library, level, player, collectables, environment, paths };
}

/** Same package-key resolution the node self-check uses to assemble a bundle from disk. */
export { PACKAGE_KEYS, packageManifestPath };
