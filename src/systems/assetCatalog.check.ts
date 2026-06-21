/**
 * WO-05 acceptance self-check. Loads the REAL manifests from disk, builds the
 * catalog, and asserts the authored counts + placements and the manifest-mismatch
 * throw. Run: `npm run check:assets` (esbuild -> node).
 */

import { readFileSync } from 'node:fs';
import { buildAssetCatalog } from './AssetCatalog';
import {
  ManifestMismatchError,
  PACKAGE_KEYS,
  packageManifestPath,
  type ManifestBundle,
} from '../data/assetManifests';

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}
function assertEqual(actual: unknown, expected: unknown, msg: string): void {
  assert(actual === expected, `${msg} (got ${String(actual)}, want ${String(expected)})`);
}

const ASSETS = 'assets';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readJson(rel: string): any {
  return JSON.parse(readFileSync(`${ASSETS}/${rel}`, 'utf8'));
}

function loadBundleFromDisk(): ManifestBundle {
  const library = readJson('asset_library_manifest.json');
  const paths = {
    level: packageManifestPath(library, PACKAGE_KEYS.level),
    player: packageManifestPath(library, PACKAGE_KEYS.player),
    collectables: packageManifestPath(library, PACKAGE_KEYS.collectables),
    environment: packageManifestPath(library, PACKAGE_KEYS.environment),
  };
  return {
    root: '/assets',
    library,
    level: readJson(paths.level),
    player: readJson(paths.player),
    collectables: readJson(paths.collectables),
    environment: readJson(paths.environment),
    paths,
  };
}

const catalog = buildAssetCatalog(loadBundleFromDisk());

// --- Authored placements ---------------------------------------------------------
assertEqual(catalog.placements.collectables.length, 5, '5 authored collectables');
assertEqual(catalog.placements.environmentObstacles.length, 10, '10 authored obstacles');
assertEqual(catalog.placements.playerSpawn.x, 220, 'spawn x=220');
assertEqual(catalog.placements.playerSpawn.y, 1905, 'spawn y=1905');
assertEqual(catalog.placements.flag.x, 4230, 'flag x=4230');

// --- Load instructions (dims/frames straight from manifests) ---------------------
const sheets = catalog.loadList.filter((i) => i.kind === 'spritesheet');
const images = catalog.loadList.filter((i) => i.kind === 'image');
const audio = catalog.loadList.filter((i) => i.kind === 'audio');
assertEqual(sheets.length, 6, '6 player animation spritesheets');
assertEqual(images.length, 4, '4 images (background, rowhomes, share, bricks)');
assertEqual(audio.length, 6, '6 audio (1 music + 5 sfx)');

const idle = catalog.getSpritesheet('male_hero_trp_blue-idle');
assertEqual(idle.frameWidth, 160, 'player frame width 160 (manifest)');
assertEqual(idle.frameHeight, 160, 'player frame height 160 (manifest)');
assertEqual(idle.frameCount, 10, 'idle 10 frames (manifest)');
assertEqual(catalog.getImage('share').width, 56, 'share width 56 (manifest)');
assertEqual(catalog.getImage('floating-bricks').width, 170, 'brick width 170 (manifest)');
const theme = catalog.getAudio('baltimore-rooftop-theme');
assertEqual(theme.loop, true, 'music loops (loopSuggested)');
assert(theme.url.endsWith('.mp3'), 'music url resolves to the mp3');
const jumpSfx = catalog.getAudio('sfx-jump');
assertEqual(jumpSfx.loop, false, 'sfx never loops');
assert(jumpSfx.url.endsWith('/assets/audio/sfx/jump.wav'), 'sfx url resolves under /assets');

// --- Manifest discipline: a missing required field must throw, naming the key ----
function expectThrow(mutate: (b: ManifestBundle) => void, mustMention: string): void {
  const b = structuredClone(loadBundleFromDisk());
  mutate(b);
  try {
    buildAssetCatalog(b);
  } catch (e) {
    assert(e instanceof ManifestMismatchError, 'throws ManifestMismatchError');
    assert((e as Error).message.includes(mustMention), `error names "${mustMention}"`);
    return;
  }
  assert(false, `expected throw for missing ${mustMention}`);
}
// @ts-expect-error deliberately removing a required field to prove the guard fires
expectThrow((b) => delete b.player.frame, 'frame');
// @ts-expect-error deliberately removing authored placement
expectThrow((b) => delete b.level.authoredGameplayPlacements.playerSpawn, 'playerSpawn');

console.log('asset self-check PASS — 5 shares, 10 obstacles, spawn(220,1905), flag(4230); dims from manifests; throws on missing key');
