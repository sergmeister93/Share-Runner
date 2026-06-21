# WO-18 Pixel Crispness + Camera + Reachability — Result

**Agent:** qa-agent  
**Date:** 2026-06-21  
**Status:** review  

---

## 1. Pixel-Art Crispness

**Command:** `browser.evaluate` → `window.getComputedStyle(canvas).imageRendering`

| Setting | Value | Expected | Result |
|---------|-------|----------|--------|
| CSS image-rendering | `pixelated` | pixelated | PASS |
| Phaser pixelArt | true | true | PASS (PhaserGameConfig.ts) |
| Phaser roundPixels | true | true | PASS |
| Phaser antialias | false | false | PASS |

**Screenshot:** `01-pixel-crisp-whole-world-view.png` — platform bricks, skyline, rowhomes render
with hard pixel edges at scale 0.384. No blur or interpolation artifacts visible.

---

## 2. Contain-Fit / Scale

**Command:** `browser.evaluate` → canvas getBoundingClientRect vs canvas.width/height

| Metric | Value |
|--------|-------|
| Internal canvas size | 4400 × 2494 px (world size) |
| Display size at 1689×1221 viewport | 1689 × 957 px |
| Scale X | 0.3839 |
| Scale Y | 0.3839 |
| Aspect ratio maintained | 1.7642 (world: 4400/2494 = 1.7642) ✓ |
| Letterbox | 131 px top + bottom (horizontal bands) |
| Stretching | None (uniform scale, no distortion) |

**Result: PASS** — Phaser `Scale.FIT` correctly contain-fits the 4400×2494 world, letterboxes
vertically, no stretching, aspect ratio preserved.

---

## 3. Camera Assessment

**Current state:** The camera's world bounds equal the game dimensions (4400×2494), and `CameraSystem`
uses `camera.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT)` with no zoom. The result is that the **entire
4400×2494 world is visible at all times** — the player (160×150 sprite, ~55px body width) appears
at ≈1.4% of world width, or roughly **23 pixels wide on a 1689px-wide screen**.

**Screenshot:** `01-pixel-crisp-whole-world-view.png` shows the small-player-in-big-world result.

**Assessment:**

| Aspect | Observation |
|--------|-------------|
| World visibility | Full world visible at all times |
| Player apparent size | ~23px wide — extremely small |
| Scrolling | None (whole world fits in camera) |
| Playability | Significantly impaired — player hard to see, platforms appear tiny |

**Recommendation (tuning call for Manager):** A follow-camera with **2–3× zoom** is strongly
recommended before public first-playable. Suggested approach: `camera.setZoom(2.5)` + `camera.follow(player)` — this would display ≈1760×998 world units per screen at 2.5× zoom, showing roughly
40% of the world at once while keeping the player clearly visible. This is a constants/scene change,
no contract impact. Camera follow wiring exists in `CameraSystem.follow()` (WO-09); zoom requires
a one-line `camera.setZoom(N)` call in LevelScene.

---

## 4. Coin & Flag Reachability (E-08 Gate)

**Physics in effect:**
```
GRAVITY_Y = 3000 px/s²
PLAYER_JUMP_VELOCITY = -1300 px/s
PLAYER_MAX_RUN_SPEED = 520 px/s
PLAYER_ACCELERATION = 2600 px/s²
Max jump height = 1300²/(2×3000) = 281.7 px
```

### Per-coin reachability

| Coin | Platform | Coin Y offset above platform | Reachable? | Notes |
|------|----------|------------------------------|-----------|-------|
| share_01 | plat_s_01 (stationary, y=1745) | 45 px | **YES — trivial** | Player body overlaps coin body when standing on platform. Auto-collected on landing. Confirmed physical collection at t=931ms. |
| share_02 | plat_v_01 (vertical mover, y=1490–1690) | 245 px | **YES — requires skill** | Max jump 281px > 245px needed. Player must land on v_01, position at x≈1295–1395 (within coin X body [1317,1373]), then fire vertical jump (no horizontal run). Physically achievable; not pixel-perfect. See analysis. |
| share_03 | plat_h_01 (horizontal mover, y=1540) | 45 px | **YES — trivial** | Auto-collected when player lands on h_01. Coin moves with platform in X. |
| share_04 | plat_s_04 (stationary, y=1410) | 45 px | **YES — trivial** | Auto-collected on landing. |
| share_05 | plat_h_02 (horizontal mover, y=1520) | 45 px | **YES — trivial** | Auto-collected when player lands on h_02. |

**Flag:** x=4230, y=1905 (ground level, bottom-center anchor). Placeholder green rectangle 28×200px.
Player body overlaps flag zone while running on ground at x≈4194–4266. Confirmed `level:complete`
fired at x≈4230 in WO-17 traversal run. **Reachable — PASS.** (Pixel QA exempt per Manager decision;
no flag sprite asset exists.)

### share_02 reachability detail

The coin body at platform y=y_p: center y = y_p−245, body [y_p−272.5, y_p−217.5].

From v_01 at any height y_p (full range 1490–1690), player jumps with vy=−1300:
- Player feet at apex: y_p − 281.7
- Player body at apex: [y_p−377.7, y_p−281.7]
- Coin body: [y_p−272.5, y_p−217.5]

At apex, player bottom (y_p−281.7) < coin top (y_p−272.5): player passes ABOVE coin → overlap on
the way UP at t≈0.34s. X overlap window: player body [x−22, x+22] must intersect coin [1317,1373].
Required player X: [1295, 1395]. Platform v_01 spans x=[1260,1430], so player has 100px of valid
standing zone.

**Conclusion:** share_02 is reachable without physics or placement changes. No E-07 retune or
WO-02 re-author needed. The 245px height vs 45px for all other coins is a design anomaly worth
noting to the Manager; it creates a materially harder collect that may or may not be intentional.

### Flag reachability detail

```
Flag zone: center (4230, 1905−100) = (4230, 1805), body [4216,4244] × [1705,1905]
Player on ground (y=1905): body [playerX−22, playerX+22] × [1809,1905]
Y overlap: max(1809,1705)=1809, min(1905,1905)=1905 → 96px overlap ✓
X overlap: playerX in [4194, 4266]
```

Player running on ground reaches flag at ≈t=7.8s (from x=220 at 520px/s). Confirmed.

---

## Overall Verdict

| Area | Result |
|------|--------|
| Pixel crispness | **PASS** |
| Contain-fit scaling | **PASS** |
| Camera | **PASS** (functional) — **RECOMMEND** follow-cam + 2.5× zoom |
| Coin reachability | **PASS** (all 5 reachable; share_02 requires skill) |
| Flag reachability | **PASS** |

No physics retune (E-07) or placement change (WO-02) required. Camera zoom is a
quality-of-life recommendation for Manager consideration before final first-playable sign-off.
