/**
 * WO-09 acceptance self-check. Runs buildLevelWorld against a mock scene (the systems
 * are runtime-Phaser-free) and asserts world/camera bounds + a single ground body.
 * Camera *behaviour* (pan/follow) is browser-verified at integration (WO-16).
 * Run: `npm run check:level` (esbuild -> node).
 */

import { buildLevelWorld } from './LevelWorld';
import { levelWorldBounds, groundBodies, groundBodyRect } from './levelGeometry';
import { ManifestMismatchError } from '../data/assetManifests';

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}
function assertEqual(actual: unknown, expected: unknown, msg: string): void {
  assert(actual === expected, `${msg} (got ${String(actual)}, want ${String(expected)})`);
}

// --- Pure geometry ---------------------------------------------------------------
const bounds = levelWorldBounds();
assertEqual(bounds.width, 4400, 'world bounds width 4400');
assertEqual(bounds.height, 2494, 'world bounds height 2494');
assertEqual(groundBodies().length, 1, 'exactly one ground body (single, non-segmented)');
const gr = groundBodyRect();
assertEqual(gr.top, 1905, 'ground top y=1905');
assertEqual(gr.width, 4400, 'ground width 4400');

// --- buildLevelWorld against a mock scene ----------------------------------------
let worldBounds: Record<string, number> | null = null;
let camBounds: Record<string, number> | null = null;
let zoneCount = 0;
let staticBodyCount = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockScene: any = {
  physics: {
    world: { setBounds: (x: number, y: number, w: number, h: number) => (worldBounds = { x, y, w, h }) },
    add: { existing: (obj: unknown, isStatic: boolean) => (isStatic ? (staticBodyCount += 1) : 0, obj) },
  },
  cameras: { main: { setBounds: (x: number, y: number, w: number, h: number) => (camBounds = { x, y, w, h }) } },
  add: {
    zone: (x: number, y: number, w: number, h: number) => {
      zoneCount += 1;
      return { x, y, w, h };
    },
  },
};

const world = buildLevelWorld(mockScene);
// Cast restores the union: the reassignment happens inside the mock closure, which
// TS's flow analysis doesn't track, so it would otherwise narrow these to `null`.
const wb = worldBounds as { w: number; h: number } | null;
const cb = camBounds as { w: number; h: number } | null;
assert(wb !== null && wb.w === 4400 && wb.h === 2494, 'physics world bounds set 4400x2494');
assert(cb !== null && cb.w === 4400 && cb.h === 2494, 'camera bounds set 4400x2494');
assertEqual(zoneCount, 1, 'one ground zone created');
assertEqual(staticBodyCount, 1, 'one STATIC body created');
assertEqual(world.groundRects[0].top, 1905, 'returned ground rect top 1905');

// --- Manifest discipline: mismatched authored ground must throw ------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const badCatalog: any = { placements: { ground: { x: 0, topY: 9999, width: 4400 } } };
let threw = false;
try {
  buildLevelWorld(mockScene, badCatalog);
} catch (e) {
  threw = e instanceof ManifestMismatchError;
}
assert(threw, 'buildLevelWorld throws ManifestMismatchError when authored ground != constants');

console.log('level-world self-check PASS — bounds 4400x2494, single static ground body @ y=1905 w=4400, manifest cross-check enforced');
