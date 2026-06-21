import { createRequire } from "node:module";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const at = (...parts) => path.join(root, ...parts);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function json(...parts) {
  return JSON.parse(await readFile(at(...parts), "utf8"));
}

async function dimensions(expectedWidth, expectedHeight, ...parts) {
  const file = at(...parts);
  const metadata = await sharp(file).metadata();
  check(
    metadata.width === expectedWidth && metadata.height === expectedHeight,
    `${parts.join("/")} expected ${expectedWidth}x${expectedHeight}, got ${metadata.width}x${metadata.height}`
  );
}

async function alphaBounds(file, threshold = 8) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > threshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { width: maxX - minX + 1, height: maxY - minY + 1 };
}

await dimensions(4400, 2494, "assets", "levels", "baltimore", "preview.png");
await dimensions(4400, 2494, "assets", "levels", "baltimore", "generated", "baltimore_level_gameplay_preview.png");
await dimensions(4400, 2200, "assets", "levels", "baltimore", "generated", "baltimore_skyline_wide.png");
await dimensions(2200, 589, "assets", "levels", "baltimore", "generated", "baltimore_rowhome_platform_strip.png");
await dimensions(56, 55, "assets", "sprites", "collectables", "shares.png");
await dimensions(170, 58, "assets", "sprites", "environments", "platforms.png");

const heroAnimations = { idle: 10, walk: 10, run: 10, jump: 6, fall: 4, "fall-loop": 3 };
for (const [name, frames] of Object.entries(heroAnimations)) {
  await dimensions(
    frames * 160,
    160,
    "assets",
    "sprites",
    "characters",
    "male_hero",
    "trp_blue",
    "animations",
    `male_hero-${name}.png`
  );
}

const idleFrame = await sharp(
  at("assets", "sprites", "characters", "male_hero", "trp_blue", "animations", "male_hero-idle.png")
)
  .extract({ left: 0, top: 0, width: 160, height: 160 })
  .png()
  .toBuffer();
const idleBounds = await alphaBounds(idleFrame);
check(idleBounds.height === 102, `hero idle visual height expected 102, got ${idleBounds.height}`);

const level = await json("assets", "levels", "baltimore", "metadata", "baltimore_level_manifest.json");
const composition = await json("assets", "levels", "baltimore", "metadata", "composition.json");
const collision = await json("assets", "levels", "baltimore", "metadata", "collision_map.json");
const parallax = await json("assets", "levels", "baltimore", "metadata", "parallax_layers.json");
const hero = await json("assets", "sprites", "characters", "male_hero", "trp_blue", "manifest.json");
const collectables = await json("assets", "sprites", "collectables", "manifest.json");
const environment = await json("assets", "sprites", "environments", "manifest.json");
const library = await json("assets", "asset_library_manifest.json");

check(level.compositionSpace.width === 4400 && level.compositionSpace.height === 2494, "level composition dimensions mismatch");
check(level.authoredGameplayPlacements.status === "authored-provisional", "authored placements must be the WO-02 approved provisional layout");
check(level.authoredGameplayPlacements.collectables.length === 5, "level must author exactly 5 share coins (WO-02)");
check(new Set(level.authoredGameplayPlacements.collectables.map((c) => c.id)).size === 5, "share coin ids must be unique");
check(level.authoredGameplayPlacements.environmentObstacles.length === 10, "level must author the 10 §7 platform instances (WO-02)");
check(level.authoredGameplayPlacements.flag.x === 4230 && level.authoredGameplayPlacements.playerSpawn.x === 220, "spawn left / flag right anchors must match §7");
check(composition.layers.length === 3, "gold composition must contain skyline plus two rowhome instances");
check(composition.layers[1].x === 0 && composition.layers[2].x === 2200, "rowhome instances must meet at x=2200");
check(composition.layers[1].y === 1905 && composition.layers[2].y === 1905, "rowhome instances must start at y=1905");
check(composition.spawnGuides.collectables.placements.length === 0, "composition collectable placements must remain empty");
check(composition.spawnGuides.environmentObstacles.placements.length === 0, "composition obstacle placements must remain empty");
check(collision.staticBodies.length === 1, "level must expose one continuous roof body");
check(collision.staticBodies[0].width === 4400 && collision.staticBodies[0].y === 1905, "roof collision mismatch");
check(parallax.layers[1].instances.length === 2, "parallax rowhome layer must contain two instances");
check(hero.frame.width === 160 && hero.frame.height === 160, "hero frame metadata mismatch");
check(hero.approvedScale.idleVisualHeight === 102, "hero visual scale metadata mismatch");
check(collectables.assets.share.width === 56 && collectables.assets.share.height === 55, "share manifest mismatch");
check(collectables.assets.share.placementStatus === "unassigned", "share placement must remain unassigned");
check(environment.assets.floatingBricks.width === 170 && environment.assets.floatingBricks.height === 58, "platform manifest mismatch");
check(environment.assets.floatingBricks.placementStatus === "unassigned", "platform placement must remain unassigned");
check(library.canonicalCoordinateSpace.width === 4400, "library index canonical width mismatch");
check(library.canonicalCoordinateSpace.height === 2494, "library index canonical height mismatch");

try {
  await access(at("assets", "audio", "music", "levels", "baltimore", "Retro Baltimore Rooftop Soundtrack.mp3"));
} catch {
  failures.push("missing Baltimore rooftop soundtrack");
}

for (const source of [
  ["assets", "levels", "baltimore", "source", "baltimore_skyline_wide_source.png"],
  ["assets", "levels", "baltimore", "source", "baltimore_rowhome_platform_strip_source.png"],
  ["assets", "sprites", "collectables", "source", "shares_source.png"],
  ["assets", "sprites", "environments", "source", "platforms_source.png"],
]) {
  try {
    await access(at(...source));
  } catch {
    failures.push(`missing archived source: ${source.join("/")}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Baltimore asset library validation passed.");
}
