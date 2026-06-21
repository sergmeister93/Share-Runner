/**
 * WO-11 acceptance self-check. Loads the 10 authored platforms from the real
 * manifest and drives PlatformMover to assert ping-pong stays in bounds and
 * turnaround fires with the correct direction. Carry/landing feel = browser
 * (WO-16). Run: `npm run check:platforms`.
 */

import { readFileSync } from 'node:fs';
import { buildAssetCatalog } from './AssetCatalog';
import { platformInstances, PlatformMover } from './platformMovement';
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

// --- 10 authored instances, correct kind split ----------------------------------
const insts = platformInstances(catalog);
assertEqual(insts.length, 10, '10 authored platforms');
assertEqual(insts.filter((p) => p.kind === 'stationary').length, 6, '6 stationary');
assertEqual(insts.filter((p) => p.kind === 'vertical').length, 2, '2 vertical');
assertEqual(insts.filter((p) => p.kind === 'horizontal').length, 2, '2 horizontal');
assert(
  insts.every((p) => p.width === p.brickCount * 170),
  'platform width == brickCount * 170 (manifest brick width)',
);

// --- Ping-pong stays in bounds; turnaround direction is correct ------------------
function simulate(p: (typeof insts)[number]): { startCount: number; turns: Array<{ pos: number; dir: 1 | -1 }>; minSeen: number; maxSeen: number } {
  const m = p.movement!;
  const startPos = m.axis === 'x' ? p.x : p.y;
  const mover = new PlatformMover(p.id, p.kind, m.axis, m.min, m.max, p.speed, startPos);
  let startCount = 0;
  const turns: Array<{ pos: number; dir: 1 | -1 }> = [];
  let minSeen = startPos;
  let maxSeen = startPos;
  const dt = 1 / 60;
  for (let i = 0; i < 2000; i++) {
    mover.step(dt, () => (startCount += 1), (pos, dir) => turns.push({ pos, dir }));
    minSeen = Math.min(minSeen, mover.pos);
    maxSeen = Math.max(maxSeen, mover.pos);
    assert(mover.pos >= m.min - 1e-6 && mover.pos <= m.max + 1e-6, `${p.id} stays within [${m.min},${m.max}]`);
  }
  return { startCount, turns, minSeen, maxSeen };
}

for (const p of insts.filter((q) => q.movement)) {
  const m = p.movement!;
  const r = simulate(p);
  assertEqual(r.startCount, 1, `${p.id} emits move-start exactly once`);
  assert(r.turns.length >= 2, `${p.id} ping-pongs (>=2 turnarounds)`);
  assert(Math.abs(r.minSeen - m.min) < 1e-6, `${p.id} reaches its min bound`);
  assert(Math.abs(r.maxSeen - m.max) < 1e-6, `${p.id} reaches its max bound`);
  for (const t of r.turns) {
    if (Math.abs(t.pos - m.max) < 1e-6) assertEqual(t.dir, -1, `${p.id} reverses to -1 at max`);
    if (Math.abs(t.pos - m.min) < 1e-6) assertEqual(t.dir, 1, `${p.id} reverses to +1 at min`);
  }
}

console.log('platforms self-check PASS — 10 instances (6 static/2 vert/2 horiz), movers ping-pong in bounds, turnaround direction correct');
