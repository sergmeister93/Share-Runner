# Adapter — vendors

Different tools auto-read different instruction files: Claude Code reads `CLAUDE.md`,
Codex reads `AGENTS.md`, Cursor reads `.cursorrules` (or `.cursor/rules/*`), Gemini
reads `GEMINI.md`. They always will. **Do not fight it, and do not duplicate
behavior into each one** — that is exactly how the two governance files in the
audited project came to disagree about who played which role *and* both carried the
same false facts.

## The rule: stubs, not copies

Every per-vendor file is a **thin pointer** to `comms/KERNEL.md`. It contains no
behavioral content of its own, so the vendor files cannot drift from each other or
from the kernel. `bind.mjs` generates them into `comms/stubs/` from one template;
you copy/symlink them to the project root.

A stub is ~5 lines:

```markdown
# <Vendor> — pointer

You are an agent in a multi-agent protocol. Your behavior contract is
`comms/KERNEL.md`; the project binding is `comms/PROJECT.md`. Read both before
acting. Your agent id is provided at launch — if you weren't given one, stop and
ask. Do not put behavioral rules in this file; they live in the kernel.
```

## Capabilities, not vendors

The protocol never branches on which tool an agent is. An agent advertises
**capabilities** in `roster.jsonl` (`node`, `browser-verify`, `image-measure`, …); a
skill is just a capability an agent declares. Work-orders request capabilities. This
is what lets "multiple Claude Codes" or "multiple Codexes" or "multiple Cursors" or
any mix run the same protocol unchanged — and what lets a new kind of agent join
tomorrow with no protocol edit.

## Boundary

The protocol governs the **observable contract**: roster, ledger, notes, lanes,
handoffs, durability. It does **not** reach inside how an agent does its work
(which skills it invokes, how it prompts itself). Standardize the I/O; stay blind to
the engine. Trying to unify vendor internals couples you to them and rots.
