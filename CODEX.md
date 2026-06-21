# CODEX.md — Codex alias

Human-readable alias requested by the project owner. Codex itself reads `AGENTS.md`; this file
points there so nothing is duplicated.

- **Behavior contract:** `comms/KERNEL.md`
- **Project binding:** `comms/PROJECT.md`
- **Codex root instructions:** `AGENTS.md`
- **Launch prompt (UX/Codex lane):** `.agents/prompts/ux-codex-agent.md`
- **Skills/plugins:** `docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md`,
  `docs/skills/SKILL_STRATEGY.md`, `docs/skills/PLUGIN_SETUP.md`

Status: **setup mode**. Do not implement gameplay or generate assets until the Manager assigns
work through the comms protocol. Do not enable plugins/hooks/MCP/LSP/monitors without Manager
approval and, for executable components, human approval.
