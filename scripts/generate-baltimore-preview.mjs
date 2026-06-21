import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const asset = (...parts) => path.join(root, "assets", ...parts);
const backgroundPath = asset("levels", "baltimore", "generated", "baltimore_skyline_wide.png");
const homesPath = asset("levels", "baltimore", "generated", "baltimore_rowhome_platform_strip.png");
const heroPath = asset("sprites", "characters", "male_hero", "trp_blue", "animations", "male_hero-idle.png");
const sharesPath = asset("sprites", "collectables", "shares.png");
const platformsPath = asset("sprites", "environments", "platforms.png");
const outputPath = asset("levels", "baltimore", "generated", "baltimore_level_gameplay_preview.png");

// Match the supplied 4400x2494 composition reference. At this resolution the
// rowhome strip is scaled to half the canvas width and repeated twice, which
// keeps Baltimore's waterfront and skyline dominant in the frame.
const canvasWidth = 4400;
const canvasHeight = 2494;
const rowhomeWidth = 2200;
const rowhomeHeight = 589;
const rooftopY = canvasHeight - rowhomeHeight;

const hero = await sharp(heroPath)
  .extract({ left: 0, top: 0, width: 160, height: 160 })
  .png()
  .toBuffer();

const share = await sharp(sharesPath).png().toBuffer();
const floatingBricks = await sharp(platformsPath).png().toBuffer();

const rowhomes = await sharp(homesPath)
  .resize({ width: rowhomeWidth, height: rowhomeHeight, kernel: "nearest" })
  .png()
  .toBuffer();

const background = await sharp(backgroundPath)
  // Preserve the panorama's native 2:1 aspect ratio. The reference uses the
  // extra canvas height for the foreground rather than stretching the skyline.
  .resize({ width: canvasWidth, kernel: "nearest" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: canvasWidth,
    height: canvasHeight,
    channels: 4,
    background: { r: 5, g: 17, b: 39, alpha: 1 },
  },
})
  .composite([
    { input: background, left: 0, top: 0 },
    { input: rowhomes, left: 0, top: rooftopY },
    { input: rowhomes, left: rowhomeWidth, top: rooftopY },
    // Ingredient placements below are visual scale tests only. They are not
    // authored level data and intentionally do not appear in level metadata.
    { input: hero, left: 545, top: rooftopY - 150 },
    { input: floatingBricks, left: 1015, top: 1759 },
    { input: floatingBricks, left: 1755, top: 1604 },
    { input: floatingBricks, left: 2655, top: 1739 },
    { input: share, left: 720, top: 1770 },
    { input: share, left: 820, top: 1715 },
    { input: share, left: 1072, top: 1645 },
    { input: share, left: 1812, top: 1490 },
    { input: share, left: 2712, top: 1625 },
  ])
  .png()
  .toFile(outputPath);

console.log(outputPath);
