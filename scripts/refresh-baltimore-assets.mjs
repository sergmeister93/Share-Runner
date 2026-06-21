import { createRequire } from "node:module";
import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fromRoot = (...parts) => path.join(root, ...parts);

const CANVAS = { width: 4400, height: 2494 };
const SKYLINE = { width: 4400, height: 2200 };
const ROWHOMES = { width: 2200, height: 589, y: 1905 };
const HERO = {
  sourceFrame: 128,
  frame: 160,
  pivotX: 80,
  pivotY: 150,
  approvedIdleHeight: 102,
};

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function archiveOnce(runtimeFile, sourceFile) {
  await mkdir(path.dirname(sourceFile), { recursive: true });
  if (!(await exists(sourceFile))) await copyFile(runtimeFile, sourceFile);
}

const levelGenerated = fromRoot("assets", "levels", "baltimore", "generated");
const levelSource = fromRoot("assets", "levels", "baltimore", "source");
const skylineRuntime = path.join(levelGenerated, "baltimore_skyline_wide.png");
const skylineSource = path.join(levelSource, "baltimore_skyline_wide_source.png");
const rowhomesRuntime = path.join(levelGenerated, "baltimore_rowhome_platform_strip.png");
const rowhomesSource = path.join(levelSource, "baltimore_rowhome_platform_strip_source.png");

const sharesRuntime = fromRoot("assets", "sprites", "collectables", "shares.png");
const sharesSource = fromRoot("assets", "sprites", "collectables", "source", "shares_source.png");
const platformsRuntime = fromRoot("assets", "sprites", "environments", "platforms.png");
const platformsSource = fromRoot("assets", "sprites", "environments", "source", "platforms_source.png");

await archiveOnce(skylineRuntime, skylineSource);
await archiveOnce(rowhomesRuntime, rowhomesSource);
await archiveOnce(sharesRuntime, sharesSource);
await archiveOnce(platformsRuntime, platformsSource);

await sharp(skylineSource)
  .resize({ ...SKYLINE, kernel: "nearest" })
  .png()
  .toFile(skylineRuntime);

await sharp(rowhomesSource)
  .resize({ width: ROWHOMES.width, height: ROWHOMES.height, kernel: "nearest" })
  .png()
  .toFile(rowhomesRuntime);

await sharp(sharesSource)
  .extract({ left: 239, top: 224, width: 546, height: 536 })
  .resize({ width: 56, height: 55, kernel: "lanczos3" })
  .png()
  .toFile(sharesRuntime);

await sharp(platformsSource)
  .extract({ left: 305, top: 303, width: 926, height: 313 })
  .resize({ width: 170, height: 58, kernel: "lanczos3" })
  .png()
  .toFile(platformsRuntime);

const heroRoot = fromRoot("assets", "sprites", "characters", "male_hero", "trp_blue");
const heroAnimations = [
  ["male_hero-idle.png", 10],
  ["male_hero-walk.png", 10],
  ["male_hero-run.png", 10],
  ["male_hero-jump.png", 6],
  ["male_hero-fall.png", 4],
  ["male_hero-fall-loop.png", 3],
];
const heroScale = HERO.approvedIdleHeight / 37;
const scaledSourceFrame = Math.round(HERO.sourceFrame * heroScale);
const cropLeft = Math.round(64 * heroScale) - HERO.pivotX;
const cropTop = Math.round(80 * heroScale) - HERO.pivotY;

for (const [fileName, frameCount] of heroAnimations) {
  const runtimeFile = path.join(heroRoot, "animations", fileName);
  const sourceFile = path.join(heroRoot, "source", "animations", fileName);
  await archiveOnce(runtimeFile, sourceFile);

  const frames = [];
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const sourceFrame = await sharp(sourceFile)
      .extract({
        left: frameIndex * HERO.sourceFrame,
        top: 0,
        width: HERO.sourceFrame,
        height: HERO.sourceFrame,
      })
      .resize(scaledSourceFrame, scaledSourceFrame, { kernel: "nearest" })
      .png()
      .toBuffer();
    const normalizedFrame = await sharp(sourceFrame)
      .extract({ left: cropLeft, top: cropTop, width: HERO.frame, height: HERO.frame })
      .png()
      .toBuffer();
    frames.push({ input: normalizedFrame, left: frameIndex * HERO.frame, top: 0 });
  }

  await sharp({
    create: {
      width: frameCount * HERO.frame,
      height: HERO.frame,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(frames)
    .png()
    .toFile(runtimeFile);
}

await sharp(skylineRuntime)
  .resize({ width: 1100, height: 550, kernel: "nearest" })
  .png()
  .toFile(path.join(levelGenerated, "baltimore_skyline_wide_preview.png"));

await sharp(rowhomesRuntime)
  .resize({ width: 550, height: 147, kernel: "nearest" })
  .png()
  .toFile(path.join(levelGenerated, "baltimore_rowhome_platform_strip_preview.png"));

await sharp({
  create: {
    width: CANVAS.width,
    height: CANVAS.height,
    channels: 4,
    background: { r: 5, g: 17, b: 39, alpha: 1 },
  },
})
  .composite([
    { input: skylineRuntime, left: 0, top: 0 },
    { input: rowhomesRuntime, left: 0, top: ROWHOMES.y },
    { input: rowhomesRuntime, left: ROWHOMES.width, top: ROWHOMES.y },
  ])
  .png()
  .toFile(fromRoot("assets", "levels", "baltimore", "preview.png"));

console.log("Baltimore runtime assets refreshed from archived sources.");
