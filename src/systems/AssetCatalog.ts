/**
 * AssetCatalog (WO-05) — turns the manifest bundle into Phaser load instructions
 * and runtime-queryable metadata. Pure (no Phaser, no fetch) so it runs under node
 * for the self-check. Every dimension and path comes from the manifests; nothing is
 * inferred from an image and nothing is hardcoded.
 */

import {
  ManifestMismatchError,
  type AuthoredGameplayPlacements,
  type ManifestBundle,
} from '../data/assetManifests';

export type LoadInstruction =
  | { kind: 'image'; key: string; url: string; width: number; height: number }
  | {
      kind: 'spritesheet';
      key: string;
      url: string;
      frameWidth: number;
      frameHeight: number;
      frameCount: number;
      /** Animation playback metadata from the manifest (fps + loop). */
      frameRate: number;
      repeat: number;
    }
  | { kind: 'audio'; key: string; url: string; loop: boolean };

/** Player frame/pivot/collision pulled straight from the sprite manifest (no hardcoding). */
export interface PlayerMeta {
  assetId: string;
  frameWidth: number;
  frameHeight: number;
  /** Pivot normalized from top-left (feet anchor). */
  pivot: { x: number; y: number };
  /** Collision box within the frame, top-left origin. */
  collision: { x: number; y: number; width: number; height: number };
}

/** Minimal slice of Phaser's loader so this module needs no Phaser import. */
export interface PhaserLoaderLike {
  image(key: string, url: string): unknown;
  spritesheet(key: string, url: string, config: { frameWidth: number; frameHeight: number }): unknown;
  audio(key: string, url: string): unknown;
}

/** Resolve `rel` against POSIX `baseDir`, collapsing `.`/`..`. Both are asset-root-relative. */
function resolvePath(baseDir: string, rel: string): string {
  const out: string[] = [];
  for (const seg of `${baseDir}/${rel}`.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return out.join('/');
}

function dirOf(manifestPath: string): string {
  const i = manifestPath.lastIndexOf('/');
  return i === -1 ? '' : manifestPath.slice(0, i);
}

/** Read a required field or throw a clear manifest-mismatch naming the key. */
function req<T>(value: T | undefined | null, key: string, source: string): T {
  if (value === undefined || value === null) throw new ManifestMismatchError(key, source);
  return value;
}

export class AssetCatalog {
  readonly loadList: LoadInstruction[];
  readonly placements: AuthoredGameplayPlacements;
  readonly playerMeta: PlayerMeta;
  private readonly byKey: Map<string, LoadInstruction>;

  constructor(loadList: LoadInstruction[], placements: AuthoredGameplayPlacements, playerMeta: PlayerMeta) {
    this.loadList = loadList;
    this.placements = placements;
    this.playerMeta = playerMeta;
    this.byKey = new Map(loadList.map((i) => [i.key, i]));
  }

  private get(key: string, kind: LoadInstruction['kind']): LoadInstruction {
    const entry = this.byKey.get(key);
    if (!entry) throw new ManifestMismatchError(`asset key "${key}"`, 'asset catalog');
    if (entry.kind !== kind) {
      throw new ManifestMismatchError(`asset "${key}" is ${entry.kind}, expected ${kind}`, 'asset catalog');
    }
    return entry;
  }

  getImage(key: string) {
    return this.get(key, 'image') as Extract<LoadInstruction, { kind: 'image' }>;
  }
  getSpritesheet(key: string) {
    return this.get(key, 'spritesheet') as Extract<LoadInstruction, { kind: 'spritesheet' }>;
  }
  getAudio(key: string) {
    return this.get(key, 'audio') as Extract<LoadInstruction, { kind: 'audio' }>;
  }
}

/** Build the catalog from parsed manifests. Throws `ManifestMismatchError` on any gap. */
export function buildAssetCatalog(bundle: ManifestBundle): AssetCatalog {
  const url = (baseDir: string, rel: string): string => `${bundle.root}/${resolvePath(baseDir, rel)}`;
  const loads: LoadInstruction[] = [];

  // --- Level images + music (paths relative to the level manifest dir) -----------
  const levelDir = dirOf(bundle.paths.level);
  const levelSrc = 'baltimore_level_manifest.json';
  const levelAssets = req(bundle.level.assets, 'assets', levelSrc);
  for (const name of ['background', 'rowhomes'] as const) {
    const a = req(levelAssets[name], `assets.${name}`, levelSrc);
    loads.push({
      kind: 'image',
      key: req(a.key, `assets.${name}.key`, levelSrc),
      url: url(levelDir, req(a.path, `assets.${name}.path`, levelSrc)),
      width: req(a.width, `assets.${name}.width`, levelSrc),
      height: req(a.height, `assets.${name}.height`, levelSrc),
    });
  }
  const music = req(levelAssets.music, 'assets.music', levelSrc);
  loads.push({
    kind: 'audio',
    key: req(music.key, 'assets.music.key', levelSrc),
    url: url(levelDir, req(music.path, 'assets.music.path', levelSrc)),
    loop: music.loopSuggested === true,
  });

  // --- Player animation spritesheets (frame size from the player manifest) -------
  const playerDir = dirOf(bundle.paths.player);
  const playerSrc = 'male_hero/trp_blue/manifest.json';
  const frame = req(bundle.player.frame, 'frame', playerSrc);
  const frameWidth = req(frame.width, 'frame.width', playerSrc);
  const frameHeight = req(frame.height, 'frame.height', playerSrc);
  const animations = req(bundle.player.animations, 'animations', playerSrc);
  for (const [name, anim] of Object.entries(animations)) {
    loads.push({
      kind: 'spritesheet',
      key: `${bundle.player.assetId}-${name}`,
      url: url(playerDir, req(anim.file, `animations.${name}.file`, playerSrc)),
      frameWidth,
      frameHeight,
      frameCount: req(anim.frames, `animations.${name}.frames`, playerSrc),
      frameRate: req(anim.fpsSuggested, `animations.${name}.fpsSuggested`, playerSrc),
      repeat: anim.loop ? -1 : 0,
    });
  }

  // --- Single-image prefabs: share coin + platform bricks ------------------------
  for (const [src, dir, manifest] of [
    ['collectables/manifest.json', dirOf(bundle.paths.collectables), bundle.collectables],
    ['environments/manifest.json', dirOf(bundle.paths.environment), bundle.environment],
  ] as const) {
    const assets = req(manifest.assets, 'assets', src);
    for (const [name, a] of Object.entries(assets)) {
      loads.push({
        kind: 'image',
        key: req(a.key, `assets.${name}.key`, src),
        url: url(dir, req(a.file, `assets.${name}.file`, src)),
        width: req(a.width, `assets.${name}.width`, src),
        height: req(a.height, `assets.${name}.height`, src),
      });
    }
  }

  const placements = req(
    bundle.level.authoredGameplayPlacements,
    'authoredGameplayPlacements',
    levelSrc,
  );
  req(placements.playerSpawn, 'authoredGameplayPlacements.playerSpawn', levelSrc);
  req(placements.flag, 'authoredGameplayPlacements.flag', levelSrc);
  req(placements.environmentObstacles, 'authoredGameplayPlacements.environmentObstacles', levelSrc);
  req(placements.collectables, 'authoredGameplayPlacements.collectables', levelSrc);

  // Player frame/pivot/collision metadata — for spawn + body sizing, never hardcoded.
  const pivot = req(bundle.player.pivot?.normalizedFromTopLeft, 'pivot.normalizedFromTopLeft', playerSrc);
  const collision = req(bundle.player.collision, 'collision', playerSrc);
  const playerMeta: PlayerMeta = {
    assetId: bundle.player.assetId,
    frameWidth,
    frameHeight,
    pivot: { x: req(pivot.x, 'pivot.x', playerSrc), y: req(pivot.y, 'pivot.y', playerSrc) },
    collision: {
      x: req(collision.x, 'collision.x', playerSrc),
      y: req(collision.y, 'collision.y', playerSrc),
      width: req(collision.width, 'collision.width', playerSrc),
      height: req(collision.height, 'collision.height', playerSrc),
    },
  };

  return new AssetCatalog(loads, placements, playerMeta);
}

/** Queue every catalog asset onto a Phaser scene loader. Called by the Preloader (WO-06). */
export function queueLoads(loader: PhaserLoaderLike, catalog: AssetCatalog): void {
  for (const i of catalog.loadList) {
    if (i.kind === 'image') loader.image(i.key, i.url);
    else if (i.kind === 'spritesheet')
      loader.spritesheet(i.key, i.url, { frameWidth: i.frameWidth, frameHeight: i.frameHeight });
    else loader.audio(i.key, i.url);
  }
}
