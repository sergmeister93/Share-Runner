# Baltimore Implementation Notes

## Coordinate contract

Author the level in canonical `4400x2494` composition pixels. Fit that space into the browser viewport with one uniform scale:

```js
const compositionWidth = 4400;
const compositionHeight = 2494;
const scale = Math.min(
  viewportWidth / compositionWidth,
  viewportHeight / compositionHeight
);
```

Apply the same scale and letterbox offset to rendering, player movement, spawn positions, and collision. Use integer draw positions after transformation.

## Phaser 3 assembly

```js
// preload()
this.load.image(
  "baltimore-skyline-wide",
  "assets/levels/baltimore/generated/baltimore_skyline_wide.png"
);
this.load.image(
  "baltimore-rowhome-platform-strip",
  "assets/levels/baltimore/generated/baltimore_rowhome_platform_strip.png"
);
this.load.image("share", "assets/sprites/collectables/shares.png");
this.load.image("floating-bricks", "assets/sprites/environments/platforms.png");
this.load.spritesheet(
  "male-hero-idle",
  "assets/sprites/characters/male_hero/trp_blue/animations/male_hero-idle.png",
  { frameWidth: 160, frameHeight: 160 }
);

// create()
this.add.image(0, 0, "baltimore-skyline-wide")
  .setOrigin(0, 0)
  .setDepth(-100)
  .setScrollFactor(0.18, 0.08);

for (const x of [0, 2200]) {
  this.add.image(x, 1905, "baltimore-rowhome-platform-strip")
    .setOrigin(0, 0)
    .setDepth(10);
}

const roof = this.add.zone(0, 1905, 4400, 20).setOrigin(0, 0);
this.physics.add.existing(roof, true);
this.physics.add.collider(player, roof);
```

Recommended renderer settings:

```js
const config = { pixelArt: true, roundPixels: true };
```

## Player alignment

The player frame is `160x160` with a foot pivot at `(80, 150)`. To stand on the roof at world position `x`, place the frame's top-left at `(x - 80, 1905 - 150)`, or use a sprite origin matching the normalized pivot `(0.5, 0.9375)`.

The fixed local collider is `44x96` at `(58, 54)` inside each frame.

## Deferred gameplay placement

Shares and floating bricks are normalized ingredients only:

- share: `56x55`, circular sensor radius `22`
- floating bricks: `170x58`, solid top collider `170x12`

Do not copy their positions from the scale-test preview. Add future placements only to `authoredGameplayPlacements` and the corresponding gameplay data after level design is approved.

## Camera and bounds

Clamp the camera to `(0, 0, 4400, 2494)`. The skyline and rowhome textures are not seamless and must not repeat. Keep camera behavior separate from level collision and simulation state.
