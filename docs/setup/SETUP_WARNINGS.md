# Setup Warnings

Open items from the setup pass (2026-06-21). None block the next phase; each names its fix.

## Environment

- **`sharp` not installed.** `node scripts/validate-baltimore-assets.mjs` fails with
  `Cannot find module 'sharp'`. No `node_modules`/lockfile present. Asset validation is
  **deferred until** `npm install sharp` is run. This is an environment gap, not a setup
  defect, and not a sign the assets are wrong. The setup validator
  (`scripts/validate-project-setup.mjs`) and comms validator both run with **zero deps**.

## Git

- Repo had **no git history**. Resolved this pass: `git init` + one local setup commit.
  No remote configured; nothing pushed (push is human-approval-gated).

## Cloud sync

- Working tree is at `C:\Users\serge\Coding Projects\Platformer` — a **local** path, **not**
  under OneDrive/Dropbox/iCloud. No cloud-sync corruption risk for parallel agents.

## Plugins / hooks / executable components (intentionally NOT enabled)

- **ponytail** plugin (v4.7.0, global) is `FOUND` and active this session. Not copied into the
  repo — it is a personal/global Claude Code plugin. See [PONYTAIL_SETUP](../skills/PONYTAIL_SETUP.md).
- **pre-commit hook** (`comms/hooks/pre-commit`) inspected and safe (local validator + code+ledger
  gate; no network/delete/push). Installed into `.git/hooks/` by `bind.mjs` during Phase 9.
- No MCP servers, LSP servers, or monitors were enabled. None discovered in-repo.
- The `code-review` and `frontend-design` repo-local plugins are **instruction/command packages**;
  no executable activation was performed. Loading them through Claude Code's plugin system is a
  manual, human-approved step documented in [PLUGIN_SETUP](../skills/PLUGIN_SETUP.md).
