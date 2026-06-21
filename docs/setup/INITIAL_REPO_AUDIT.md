# Initial Repo Audit — Share-Runner

Date: 2026-06-21. Pass: repository-preparation (setup only, no gameplay).

## Working directory

`C:\Users\serge\Coding Projects\Platformer` — a **local** path (not under
OneDrive/Dropbox/iCloud). Safe for git-mode parallel work per `comms/KERNEL.md` §5.

## Existing assets (authoritative — do not regenerate)

- `assets/asset_library_manifest.json` — index; canonical space **4400 × 2494** composition px.
- Baltimore level: `assets/levels/baltimore/metadata/` (`baltimore_level_manifest.json`,
  `composition.json`, `collision_map.json`, `parallax_layers.json`), generated art, gold
  `preview.png` (4400×2494), source PNGs, docs.
- Hero sprite: `assets/sprites/characters/male_hero/trp_blue/` — manifest + 6 animation
  strips (160×160 frames; idle/walk/run 10, jump 6, fall 4, fall-loop 3).
- Collectables: `assets/sprites/collectables/` — `shares.png` 56×55, placement **unassigned**.
- Environment: `assets/sprites/environments/` — `platforms.png` 170×58, placement **unassigned**.
- Audio: `assets/audio/music/levels/baltimore/Retro Baltimore Rooftop Soundtrack.mp3` (`loopSuggested`).
- Gameplay placements (collectables, obstacles) are **intentionally empty** — placement authoring is future work.

Full breakdown: [ASSET_MAP](../assets/ASSET_MAP.md).

## Existing comms protocol

Complete, strong, vendor-neutral data-plane protocol under `comms/`:
- `KERNEL.md` (behavior contract, 7 invariants), `PROJECT.md` (was unbound template — now bound),
  `STATUS.md`, `roster.jsonl`/`ledger.jsonl` (seeded, empty), schemas, templates, adapters.
- `bin/validate.mjs`, `bin/status.mjs`, `bin/bind.mjs`; `hooks/pre-commit` (validator + code+ledger gate).
- **Preserved as-is.** Only `PROJECT.md` was specialized for Share-Runner.

## Existing skills / plugins

Repo-local under `skills/`:
- `skills/phaser/` — Phaser 3 skill (multi-file, `SKILL.md` + references).
- `skills/game-architecture/` — game architecture patterns.
- `skills/frontend-design/` — Anthropic frontend-design **plugin** (`.claude-plugin/plugin.json` + SKILL).
- `skills/code-review/` — Anthropic code-review **plugin** (`.claude-plugin/plugin.json` + `commands/code-review.md`).

Global (personal, this session): **ponytail** plugin v4.7.0 at `~/.claude/plugins/cache/ponytail/`
is installed and active. See [SKILLS_AND_PLUGINS_INVENTORY](../skills/SKILLS_AND_PLUGINS_INVENTORY.md).

## Existing scripts

`scripts/validate-baltimore-assets.mjs` (requires `sharp`), `refresh-baltimore-assets.mjs`,
`generate-baltimore-preview.mjs`.

## Current git state

**Not a git repository** (no `.git`). `comms/validate.mjs` defaults to git-mode (from `PROJECT.md`)
and PASSes against the empty ledger, but durability checks are skipped. Resolved this pass:
`git init` + initial setup commit (Phase 10), local-only, no remote/push.

## Validation run (baseline, before changes)

| Command | Result |
| --- | --- |
| `node comms/bin/validate.mjs` | PASS (0 agents, 0 ledger entries; 1 warning: git not available) |
| `node scripts/validate-baltimore-assets.mjs` | FAIL — `Cannot find module 'sharp'` (no deps installed) |

## Risks

1. `sharp` not installed → asset validation cannot run until `npm install sharp`. Environment, not setup defect.
2. No git baseline → resolved by `git init` this pass.
3. Asset gameplay placements unassigned → expected; flagged so implementation pass authors them.

## Recommended setup decisions

- Preserve `comms/` and `assets/` unchanged; bind `PROJECT.md` only.
- Thin root pointer files; behavior stays in `comms/KERNEL.md`.
- Project-local skills in `.claude/skills/` as **wrappers** over existing `skills/` (no content duplication).
- Document ponytail as `FOUND` (global plugin); document `sharp` requirement in SETUP_WARNINGS.
