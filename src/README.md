# src/ — future runtime (scaffold only)

Intentionally scaffolded. **No runtime code this pass** — implementation comes later through
Manager-assigned work orders. `scripts/validate-project-setup.mjs` fails if `.ts`/`.js`/`.html`/
`.css` appear here during the setup pass.

Subfolders and owning lanes:

- `core/`, `systems/`, `objects/`, `data/` — **backend-engine** lane.
- `scenes/`, `ui/`, `styles/` (created when needed) — **ux-frontend** lane.

Future structure follows `skills/phaser/SKILL.md` and `docs/architecture/REPO_STRUCTURE.md`.
