/**
 * WO-10 acceptance self-check. Drives PlayerController with a mock body across
 * frames and asserts the movement state machine + coyote/buffer/variable-height
 * timing, plus spawn math (feet at y=1905) from the REAL player manifest.
 * Animation/texture visuals are browser-verified at integration (WO-16).
 * Run: `npm run check:player` (esbuild -> node).
 */

import { readFileSync } from 'node:fs';
import { PlayerController, computePlayerSpawn, type PlayerBodyLike, type PlayerInput } from './PlayerController';
import { buildAssetCatalog } from './AssetCatalog';
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

const STEP = 16; // ms per frame (~60fps)
const NO_INPUT: PlayerInput = { left: false, right: false, jumpPressed: false, jumpReleased: false };
interface MockBody {
  velocityX: number;
  velocityY: number;
  blockedDown: boolean;
}
const body = (blockedDown: boolean): MockBody => ({ velocityX: 0, velocityY: 0, blockedDown });
const input = (over: Partial<PlayerInput>): PlayerInput => ({ ...NO_INPUT, ...over });

// === Spawn math from the real manifest ==========================================
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
const spawn = computePlayerSpawn(catalog.playerMeta, catalog.placements.playerSpawn);
assertEqual(spawn.feetY, 1905, 'spawn feet at ground top y=1905');
assertEqual(spawn.spriteX, 220, 'spawn x=220 from placement');
assertEqual(spawn.bodyHeight, 96, 'body height from manifest collision');
assertEqual(spawn.bodyOffsetY, 54, 'body offset y from manifest collision');
// pivot * frameHeight == collision feet (54+96=150) => feet land on the placement
assertEqual(Math.round(spawn.originY * catalog.playerMeta.frameHeight), 150, 'pivot maps feet to frame y=150');

// === Grounded idle -> run ========================================================
{
  const c = new PlayerController();
  const b = body(true);
  let s = c.update(b, NO_INPUT, STEP);
  assertEqual(s.movementState, 'idle', 'grounded + no input => idle');
  for (let i = 0; i < 12; i++) s = c.update(b, input({ right: true }), STEP);
  assertEqual(s.movementState, 'run', 'holding right ramps to run');
  assertEqual(s.facing, 'right', 'facing right');
  assert(b.velocityX > 0 && b.velocityX <= 520, 'vx within [0, MAX_RUN_SPEED]');
}

// === Jump -> rising 'jump' -> falling 'fall' -> 'fall-loop' -> land ==============
{
  const c = new PlayerController();
  const b = body(true);
  c.update(b, NO_INPUT, STEP); // settle grounded
  let s = c.update(b, input({ jumpPressed: true }), STEP);
  assertEqual(s.jumped, true, 'jump fires from grounded');
  assertEqual(s.jumpCount, 1, 'jumpCount increments');
  assertEqual(b.velocityY, -1300, 'jump sets PLAYER_JUMP_VELOCITY');
  assertEqual(s.movementState, 'jump', 'rising => jump');
  // go airborne and let gravity flip to falling
  b.blockedDown = false;
  let sawFall = false;
  let sawFallLoop = false;
  let sawStartedFalling = false;
  for (let i = 0; i < 60; i++) {
    s = c.update(b, NO_INPUT, STEP);
    if (s.startedFalling) sawStartedFalling = true;
    if (s.movementState === 'fall') sawFall = true;
    if (s.movementState === 'fall-loop') sawFallLoop = true;
  }
  assert(sawStartedFalling, 'startedFalling fires once at apex (emit player:fall)');
  assert(sawFall, 'descending => fall');
  assert(sawFallLoop, 'sustained descent => fall-loop');
  // land
  b.blockedDown = true;
  s = c.update(b, NO_INPUT, STEP);
  assertEqual(s.landed, true, 'landed=true on touchdown (emit player:grounded)');
  assertEqual(s.isGrounded, true, 'grounded after landing');
}

// === Coyote time: jump shortly AFTER leaving a ledge still fires =================
{
  const c = new PlayerController();
  const b = body(true);
  c.update(b, NO_INPUT, STEP); // grounded: coyote refilled to 100ms
  b.blockedDown = false; // walked off the ledge
  c.update(b, NO_INPUT, STEP); // ~16ms airborne, no jump
  const s = c.update(b, input({ jumpPressed: true }), STEP); // ~32ms < 100ms coyote
  assertEqual(s.jumped, true, 'jump within coyote window fires after leaving ledge');
}
// ...but after the coyote window expires, it does not
{
  const c = new PlayerController();
  const b = body(true);
  c.update(b, NO_INPUT, STEP);
  b.blockedDown = false;
  for (let i = 0; i < 10; i++) c.update(b, NO_INPUT, STEP); // 160ms > 100ms coyote
  const s = c.update(b, input({ jumpPressed: true }), STEP);
  assertEqual(s.jumped, false, 'jump after coyote expired does not fire (no double-jump)');
}

// === Jump buffering: press just BEFORE landing fires on touchdown ================
{
  const c = new PlayerController();
  const b = body(false); // airborne, coyote already 0
  for (let i = 0; i < 8; i++) c.update(b, NO_INPUT, STEP); // ensure coyote drained
  let s = c.update(b, input({ jumpPressed: true }), STEP); // buffered, can't jump midair
  assertEqual(s.jumped, false, 'buffered press does not jump mid-air');
  b.blockedDown = true; // land within buffer window (120ms)
  s = c.update(b, NO_INPUT, STEP);
  assertEqual(s.jumped, true, 'buffered press fires on landing');
}

// === Variable jump height: release while rising cuts upward velocity ============
{
  const c = new PlayerController();
  const b = body(false);
  b.velocityY = -1000; // rising
  const s = c.update(b, input({ jumpReleased: true }), STEP);
  // gravity applied (-1000 + 3000*0.016 = -952), then cut by 0.5 => -476
  assertEqual(b.velocityY, -476, 'release-to-cut halves rising velocity');
  assertEqual(s.movementState, 'jump', 'still rising => jump');
}

console.log('player self-check PASS — state machine (idle/run/jump/fall/fall-loop), coyote, buffer, variable-height, spawn feet@1905');
