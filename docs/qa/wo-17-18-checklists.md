---
type: qa-checklist
agent: qa-agent
ts: 2026-06-21T16:32:00Z
ready_after: WO-16
---

# WO-17 + WO-18 Acceptance Checklists

Prepared during setup pass per execution plan. Execute against the running artifact once WO-16 (`integrate scene transitions end-to-end`) reaches `complete`. Each check requires exact command + exit code — "looks right" is not evidence.

---

## WO-17 — Browser Smoke Test

**Lane:** qa-verification | **Owner:** qa-agent | **Ready after:** WO-16

For every check: record URL, browser console output, and a screenshot filename in `docs/qa/wo-17-evidence/`.

### Launch

- [ ] `npm run dev` (or `npm start`) exits without error; dev server running on expected port.
- [ ] Browser opens at `http://localhost:<port>/`; no console errors on load.
- [ ] Pixel-art assets load without 404s; network tab shows 0 failed requests for game assets.

### Intro / Menu flow

- [ ] Intro scene plays (spectacle, background, title card visible).
- [ ] Intro auto-transitions to Menu scene (no manual intervention needed).
- [ ] Menu shows exactly two options: **Start Game** and **Quit**.
- [ ] No console errors during transition.

### Start

- [ ] Clicking **Start Game** transitions from Menu → Preloader → Level without console errors.
- [ ] Preloader progress visible (or transition is instant and asset loading confirmed in network tab).
- [ ] Level scene starts within 5 s of clicking Start.

### Player spawn + movement

- [ ] Player spawns at left side of level (x near left edge, y above ground).
- [ ] Left/right arrow (or A/D) moves player; player does not tunnel through ground.
- [ ] Space/Up arrow makes player jump; player returns to ground; no infinite jump.
- [ ] Player does not fall through ground (`y=1905` static body).
- [ ] Player stops at world bounds (does not leave 4400×2494 bounds).

### Ground collision

- [ ] Player walks along ground the full width of the level without falling through.
- [ ] Jump from ground and land — no sticking, no clipping.

### Platform collision (all 3 types)

- [ ] **Stationary platform:** player can land on it from above; cannot fall through from below.
- [ ] **Vertical moving platform:** player stays on top while platform moves up and down; no jitter, no separation.
- [ ] **Horizontal moving platform:** player is carried left/right; no sliding off unexpectedly.

### Collecting all 5 shares

- [ ] 5 share coins visible in level (manifest-driven placement).
- [ ] Each coin bobbing animation plays.
- [ ] Touching coin removes it and increments HUD counter (0→1, 1→2, … 4→5).
- [ ] Console emits `share:collected` / `score:changed` events (check DevTools).
- [ ] No coin is double-collectible (touch twice → still counted once).

### Flag completion

- [ ] Flag visible at right side of level.
- [ ] Touching flag with < 5 shares collected: **no** completion sequence; player continues.
- [ ] Touching flag with exactly 5 shares: completion sequence fires.
- [ ] Completion does not trigger if player revisits flag after partial collection.

### Score flash

- [ ] After flag completion, score/share flash animation plays.
- [ ] Flash is visible and pixel-crisp (no blurring).

### Music loop

- [ ] `baltimore-rooftop-theme` starts after user interaction (keyboard or click).
- [ ] Audio loops without audible gap.
- [ ] No console errors from audio context.

### Mute toggle

- [ ] Mute key (per GameState contract) toggles audio off.
- [ ] Toggle again → audio resumes from same position (or restarts — document which).
- [ ] Mute state persists across a page reload (check localStorage key).

### Reset safety

- [ ] Press R (or restart equivalent) mid-game → level resets cleanly; no duplicate event listeners.
- [ ] Share counter resets to 0.
- [ ] Player spawns at start position.
- [ ] Music restarts (or resumes — document behavior).
- [ ] No console errors during reset.

---

## WO-18 — Pixel-Art Crispness + Camera QA

**Lane:** qa-verification (+ ux-frontend) | **Owner:** qa-agent | **Ready after:** WO-16

### Pixel-art rendering

- [ ] `pixelArt: true` confirmed in Phaser config (check source or DevTools game config).
- [ ] Canvas has `image-rendering: pixelated` (or `crisp-edges`) in computed CSS.
- [ ] No blurring on any sprite at 1× scale.
- [ ] No blurring at 2× browser zoom.
- [ ] Check: character edges are sharp, not anti-aliased.

### Contain-fit scaling

- [ ] Game canvas fits inside viewport without cropping (contain, not cover).
- [ ] At narrow viewport (< 4400 px wide), game scales down — confirm with DevTools responsive mode at 375 px width.
- [ ] At wide viewport (> 4400 px), game does not stretch beyond 4400×2494 logical pixels.
- [ ] Scale is `min(vw/4400, vh/2494)` — verify formula by resizing browser and observing canvas size.

### Camera

- [ ] Camera follows player horizontally; does not show area outside level bounds.
- [ ] Camera does not leave the `4400×2494` world rectangle (no black bars due to camera overrun).
- [ ] Camera stable on moving platforms (no jitter when player is carried).

### Coin reachability (E-08 gate)

- [ ] All 5 coins reachable by a player starting at left spawn, using movement + jump only.
- [ ] Confirm each coin's position from manifest-authored placement; document platform path for each.
- [ ] If any coin is unreachable without special moves not implemented, flag as E-08 blocker.

---

## Evidence directory

All screenshots and console logs for WO-17 and WO-18 go in `docs/qa/wo-17-evidence/` and
`docs/qa/wo-18-evidence/` respectively. File naming: `<check-slug>-<ts>.png`.

## Blocker escalation

If any check fails, write a `blocker` ledger entry (`task_id: wo-17` or `wo-18`) pointing to the
specific failing check and the console output. Retry cap 2. Third failure → escalation note to
Manager.
