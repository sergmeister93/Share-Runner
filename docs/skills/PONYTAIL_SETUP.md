# Ponytail Setup

**Status: FOUND (global plugin, active this session).**

Ponytail was located as an installed global Claude Code plugin — not in this repository:

```
~/.claude/plugins/cache/ponytail/ponytail/4.7.0/
```

The session's SessionStart hook confirmed it active ("PONYTAIL MODE ACTIVE — level: full"). It is a
behavior/style plugin (favors the minimal solution) plus a statusline badge and review/audit
commands.

## Decision: reference, do not vendor

Ponytail is a **personal/global** plugin, not a project dependency. Per `SKILL_STRATEGY.md`:

- Do **not** copy it into `skills/`, `.claude/`, or `vendor/`.
- Do **not** commit it to this repo.
- It applies to whoever has it installed; it is not required for Share-Runner work.

## If a future setup must project-bind Ponytail

Only if the project owner explicitly asks to make Ponytail a project-level dependency:

1. Inspect its `plugin.json` / hooks before enabling anything executable.
2. Decide vendor (`vendor/claude-plugins/ponytail/`) vs. documented `/plugin` install.
3. Do not enable its hooks/statusline/MCP without Manager + human approval.

## Optional: statusline badge

The plugin offers a statusline badge. Enabling it edits `~/.claude/settings.json` (a personal,
global file) — out of scope for this repo and not done automatically.
