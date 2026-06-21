# Session-Start Checklist

The first actions **every** agent takes, in order. Stop and escalate if you have no assigned id or
no assigned task.

1. Read your root instruction file (`CLAUDE.md` for Claude Code, `AGENTS.md` for Codex).
2. Read `comms/KERNEL.md`.
3. Read `comms/PROJECT.md`.
4. Read `comms/STATUS.md`.
5. Read `docs/skills/SKILL_STRATEGY.md`.
6. Read the relevant `.claude/skills/*/SKILL.md` files for your role.
7. Tail `comms/ledger.jsonl` (and, in git mode, `git log --oneline -8`).
8. Register in `comms/roster.jsonl` if not already registered this session (use the id assigned at
   launch — never invent one).
9. Write a `session-start` ledger entry (your id + what you are picking up).
10. Confirm your assigned task (Manager work order). Executors: do not self-assign.
11. Run relevant validation **before** editing (`comms:validate`, `setup:validate`, and asset/QA
    validators as relevant).
12. If you have no assigned id or no assigned task — **stop and escalate**; do not proceed.
