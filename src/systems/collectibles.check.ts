/**
 * WO-12 acceptance self-check. Loads the 5 coins from the real manifest; asserts
 * unique ids, idempotent collect+score (+100), and that moving coins sit at a fixed
 * offset above their anchor platform and track it. Run: `npm run check:coins`.
 */

import { readFileSync } from 'node:fs';
import { buildAssetCatalog } from './AssetCatalog';
import {
  collectibleInstances,
  collectShare,
  captureAnchorOffset,
  coinPositionFromPlatform,
  bobOffset,
} from './collectibles';
import { gameState } from '../core/GameState';
import { eventBus } from '../core/EventBus';
import { PACKAGE_KEYS, packageManifestPath, type ManifestBundle } from '../data/assetManifests';

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}
function assertEqual(actual: unknown, expected: unknown, msg: string): void {
  assert(actual === expected, `${msg} (got ${String(actual)}, want ${String(expected)})`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const readJson = (rel: string): any => JSON.parse(readFileSync(`assets/${rel}`, 'utf8'));
const library = readJson('asset_library_manifest.json');
const paths = {
  level: packageManifestPath(library, PACKAGE_KEYS.level),
  player: packageManifestPath(library, PACKAGE_KEYS.player),
  collectables: packageManifestPath(library, PACKAGE_KEYS.collectables),
  environment: packageManifestPath(library, PACKAGE_KEYS.environment),
};
const bundle: ManifestBundle = {
  root: '/assets',
  library,
  level: readJson(paths.level),
  player: readJson(paths.player),
  collectables: readJson(paths.collectables),
  environment: readJson(paths.environment),
  paths,
};
const catalog = buildAssetCatalog(bundle);

// --- 5 unique coins; texture key from catalog ------------------------------------
const coins = collectibleInstances(catalog);
assertEqual(coins.length, 5, 'exactly 5 share coins');
assertEqual(new Set(coins.map((c) => c.id)).size, 5, 'coin ids are unique');
assert(catalog.shareMeta.key.length > 0 && catalog.shareMeta.width === 56, 'share texture key+dims from catalog');

// --- Collect-once + scoring (E-10: +100) -----------------------------------------
gameState.reset();
let collectedEvents = 0;
eventBus.on('share:collected', (p) => {
  collectedEvents += 1;
  assertEqual(p.totalRequired, 5, 'share:collected totalRequired=5');
  assertEqual(p.scoreDelta, 100, 'share:collected scoreDelta=100');
});

const r1 = collectShare('share_01');
assertEqual(r1.collected, true, 'first collect succeeds');
assertEqual(gameState.sharesCollected, 1, 'sharesCollected=1');
assertEqual(gameState.score, 100, 'score=100 after first');

const r2 = collectShare('share_01'); // duplicate
assertEqual(r2.collected, false, 'duplicate collect is a no-op');
assertEqual(gameState.sharesCollected, 1, 'count unchanged on duplicate');
assertEqual(gameState.score, 100, 'score unchanged on duplicate');

collectShare('share_02');
assertEqual(gameState.sharesCollected, 2, 'second distinct coin counts');
assertEqual(gameState.score, 200, 'score=200');
assertEqual(collectedEvents, 2, 'share:collected emitted once per real collect');
assertEqual(gameState.collectedShareIds.length, 2, 'collectedShareIds has 2 unique');

// --- E-02 moving coins sit ABOVE their platform and track it ----------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const obstacles: any[] = catalog.placements.environmentObstacles;
for (const id of ['share_02', 'share_03', 'share_05']) {
  const coin = coins.find((c) => c.id === id)!;
  const plat = obstacles.find((o) => o.id === coin.anchorPlatformId);
  assert(!!plat?.movement, `${id} anchored to a moving platform`);
  const offset = captureAnchorOffset({ x: coin.x, y: coin.y }, plat.topLeft);
  assert(offset.dy < 0, `${id} is above its platform top (offset.dy<0)`);
  // move the platform top-left and confirm the coin tracks by the same delta
  const moved = { x: plat.topLeft.x + 30, y: plat.topLeft.y - 40 };
  const pos = coinPositionFromPlatform(moved, offset);
  assertEqual(pos.x, coin.x + 30, `${id} tracks platform x`);
  assertEqual(pos.y, coin.y - 40, `${id} tracks platform y`);
}

// --- Bob stays within amplitude --------------------------------------------------
assertEqual(Math.round(bobOffset(0)), 0, 'bob starts at 0');
assert(Math.abs(bobOffset(225)) <= 8 + 1e-6, 'bob within amplitude');

console.log('coins self-check PASS — 5 unique coins, collect-once +100 idempotent, moving coins track anchor above platform');
