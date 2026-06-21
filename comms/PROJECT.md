# PROJECT — Share-Runner binding

Binds the portable `KERNEL.md` to this repo. Machine-readable settings use `key: value` lines so
`bin/validate.mjs` can parse them. Read `KERNEL.md` first, then this file.

```yaml
# --- Identity ---------------------------------------------------------------
project: Share-Runner
root: C:\Users\serge\Coding Projects\Platformer

# --- Substrate (see adapters/vcs.md) ----------------------------------------
execution_mode: git          # git | no-vcs
control_plane: none          # native | none
durability: commit           # commit | files
liveness_threshold_min: 20   # an owned task silent longer than this = check on it
```

## Roster policy

Agents self-register into `roster.jsonl` at launch with the id assigned in their prompt. Identities
are not invented. There is **exactly one** manager. Expected ids (allowlist):

- `manager-claude` — the one Manager (Claude Code).
- `backend-claude` — backend/game-logic executor (Claude Code).
- `ux-codex` — UX/frontend executor (OpenAI Codex).
- `qa-agent` — QA/verification (Claude Code or sub-agent).

Executors do not self-assign. They take only Manager-issued work orders, work one task in their
lane, submit for review, and **stop**. The Manager alone writes `owner`, approves, and merges.

## Lanes

An executor edits **only** its lane's paths. The **seam** is manager-only. `src/**` paths are
future (scaffolded with READMEs this pass; no runtime code yet).

| lane | owner capability | paths |
| --- | --- | --- |
| manager | orchestration, review, merge | `comms/**`, `.agents/**`, `.claude/**`, `docs/**`, root governance files, `specs/tasks/**` |
| backend-engine | phaser, typescript, game-logic | `src/core/**`, `src/systems/**`, `src/objects/**`, `src/data/**`, `specs/engine/**` |
| ux-frontend | frontend-design, game-ui, sprite-integration | `src/scenes/**`, `src/ui/**`, `src/styles/**`, `specs/ux/**` |
| qa-verification | tests, browser-verify, validation | `tests/**`, `scripts/validate-*.mjs`, `docs/qa/**` |
| asset-pipeline | asset-manifest-read, pixel-art-safe | `assets/**`, `scripts/refresh-baltimore-assets.mjs`, `scripts/generate-baltimore-preview.mjs`, `scripts/validate-baltimore-assets.mjs`, `docs/assets/**` |
| skills-plugins | claude-skills, plugin-inventory | `.claude/**`, `skills/**`, `docs/skills/**` |
| seam (manager only) | — | root app entrypoints once created, shared config, `package.json`, frozen contracts, asset contracts |

## Frozen contract

No executor edits these without a Manager-authored `handoff`/`decision`.

- **Asset manifests:** `assets/asset_library_manifest.json`,
  `assets/levels/baltimore/metadata/baltimore_level_manifest.json`, `.../composition.json`,
  `.../collision_map.json`, `.../parallax_layers.json`, and the sprite manifests under
  `assets/sprites/**/manifest.json`.
- **Game design brief:** `docs/design/GAME_DESIGN_BRIEF.md`.
- **Skill/plugin strategy:** `docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md`,
  `docs/skills/SKILL_STRATEGY.md`, `docs/skills/PLUGIN_SETUP.md`.
- **Level contract:** `specs/level/baltimore_level_contract.md`.
- **Agent protocol:** `comms/KERNEL.md`, `comms/PROJECT.md`.
- **Future contracts:** `specs/contracts/event_bus_contract.md`,
  `specs/contracts/game_state_contract.md`, `specs/contracts/asset_loading_contract.md`.

## Capabilities required

`node`, `git`, `phaser`, `typescript`, `browser-verify`, `asset-manifest-read`, `pixel-art-safe`,
`frontend-design`, `code-review`, `qa-verification`, `claude-skills`, `plugin-inventory`,
`hook-safety`.

## Commands (project-specific)

- comms:validate:  `node comms/bin/validate.mjs`
- assets:validate: `node scripts/validate-baltimore-assets.mjs`   # needs `npm install sharp`
- assets:preview:  `node scripts/generate-baltimore-preview.mjs`
- assets:refresh:  `node scripts/refresh-baltimore-assets.mjs`
- setup:validate:  `node scripts/validate-project-setup.mjs`
- test:  not yet defined (no runtime code in setup mode)
- build: not yet defined
- run:   not yet defined

## Definition of Done — setup pass

- [ ] Root `CLAUDE.md`, `AGENTS.md`, `CODEX.md` exist and point to the kernel/binding.
- [ ] `.agents/prompts/` holds launch prompts: manager, backend, ux-codex, qa, asset-pipeline, review, session-start-checklist.
- [ ] `.claude/skills/` holds the nine project skills (see DoD list in the setup prompt).
- [ ] `docs/skills/` holds inventory, strategy, plugin setup; ponytail status recorded as FOUND/NOT_FOUND/PENDING_MANUAL_INSTALL.
- [ ] `docs/design/`, `docs/architecture/`, `docs/assets/`, `docs/workflow/` brief/structure/asset-map/workflow docs exist.
- [ ] `specs/level/baltimore_level_contract.md` and the three `specs/contracts/*` exist.
- [ ] Comms validation passes; setup validation passes; asset validation passes **or** its blocker is documented.
- [ ] Git state understood and committed; no gameplay/runtime code implemented.

## Out of scope (setup pass)

Adding anything here requires removing something in scope.

- Phaser scenes, player/platform/coin/flag implementation, title/menu runtime, collision/gameplay code.
- New generated art/audio/sprites; regenerating existing assets.
- Production runtime files in `src/` (READMEs only this pass).
- New gameplay dependencies; enabling executable plugins/hooks/MCP/LSP/monitors.

## Escalation

- Human (Principal): project owner (Claude Code session operator).
- Approval-gated actions (always the human's): push, deploy, spend, send, destructive fs,
  plugin/hook/MCP/monitor activation, asset regeneration.
