# Repo Structure

Current (authoritative) vs. future (scaffolded with READMEs only this pass).

## Current — authoritative assets

```
assets/
  asset_library_manifest.json          # index; canonical space 4400×2494
  levels/baltimore/                     # metadata/, generated/, source/, reference/, docs/, preview.png
  sprites/characters/male_hero/trp_blue/  # manifest.json + animations/
  sprites/collectables/                 # manifest.json, shares.png, source/
  sprites/environments/                 # manifest.json, platforms.png, source/
  audio/music/levels/baltimore/         # Retro Baltimore Rooftop Soundtrack.mp3
```

## Current — comms protocol

```
comms/
  KERNEL.md  PROJECT.md  STATUS.md      # contract, binding, dashboard
  roster.jsonl  ledger.jsonl            # data plane (append-only)
  schemas/  templates/  adapters/       # formats + vendor/control-plane notes
  bin/validate.mjs  bin/status.mjs  bin/bind.mjs
  hooks/pre-commit                      # validator + code/ledger gate
```

## Current — skills / plugins / governance

```
skills/                 # repo-local: phaser, game-architecture, frontend-design, code-review
.claude/skills/         # project-local skill wrappers (this pass)
.claude/commands/  .claude/plugins/     # staging areas (documented; not auto-loaded)
.agents/prompts/        # copy-paste launch prompts per role
docs/                   # design, architecture, assets, workflow, setup, skills, qa
specs/                  # level + contracts (+ tasks/ for future work orders)
scripts/                # asset + setup validation
vendor/                 # third-party staging (claude-plugins/)
```

## Future — source code (READMEs only now; owning lane in each README)

```
src/
  core/      # EventBus, GameState, Constants            (backend-engine)
  systems/   # input, physics, platform movement, audio  (backend-engine)
  objects/   # Player, Platform, ShareCoin, Flag         (backend-engine)
  data/      # level/config data adapters                (backend-engine)
  scenes/    # Intro, Menu, Preloader, Level, Completion  (ux-frontend)
  ui/        # HUD, buttons, menus                        (ux-frontend)
  styles/    # CSS                                        (ux-frontend)
tests/       # unit + browser verification               (qa-verification)
```

Runtime files (`.ts`/`.js`/`.html`/`.css`) are **not** added to `src/` during the setup pass;
`validate-project-setup.mjs` enforces this.
