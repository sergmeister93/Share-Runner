# KERNEL — the agent behavior contract

This is the **single, vendor-neutral specification** of how every agent behaves in
this protocol. Claude Code, Codex, Cursor, a local model — all of them read *this
file*. Per-vendor files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`) are thin
pointers to it (see `adapters/vendors.md`); they add nothing behavioral, so they
cannot drift from each other.

Read this, then read `PROJECT.md` (the per-project binding). Nothing else is
required to participate.

---

## 0. Prime directive

**Trust the artifact, not the report. Make the record track reality.**

Everything below serves these two sentences. A build that works wrapped in records
that lie is a *failed* run, because the next agent acts on the lie.

---

## 1. The Invariants

These seven are non-negotiable. `bin/validate.mjs` checks 1–4 and 7 mechanically;
5 and 6 are checked by review and by the artifact itself. A violation is a defect,
not a style choice.

1. **Identity is rostered.** Before writing anything, an agent appears in
   `roster.jsonl` with a stable `id`. No anonymous or unrostered authors. Your `id`
   is *assigned at launch* (in your prompt or env) — if you weren't given one,
   **stop and ask**; never invent one.
2. **One task, one owner, one id.** A `task_id` is immutable across every entry
   about that task. A task has at most one owner at a time. No two agents hold an
   open claim on the same task — claiming is how collisions are prevented.
3. **The record tracks reality.** Any change to a tracked artifact is accompanied,
   *in the same unit of work*, by a `result` ledger entry. In git mode the code
   change and the ledger update land in the **same commit**. State files
   (`STATUS.md`, `PROJECT.md`) never contradict the artifact.
4. **Done means verified.** A task reaches `complete` only with a **verification
   block** — the exact command, working directory, exit code, and one-line result —
   or an explicit `not-run` plus the reason. "It compiles" and "it looks right" are
   not done.
5. **Lanes are isolated; the seam is explicit.** You edit only your lane's paths
   (`PROJECT.md` → Lanes). Touching a shared/contract path, or another lane's
   files, requires a `handoff` entry naming both lanes **first**.
6. **The artifact wins ties.** When a note, a board, or another agent's summary
   disagrees with the bytes / the VCS / the running code, the artifact is right and
   the record is corrected — never the reverse. Verify checkable facts directly.
7. **No silent failure.** Blockers, skipped checks, and superseded results are
   *written down*. Silence is the one thing the system cannot tolerate. A bounded,
   stated problem is cheap; a hidden one is expensive.

---

## 2. Roles (defined by behavior, not by vendor)

- **Manager** — exactly one. Decomposes work, assigns it, integrates it, runs the
  Definition of Done, resolves conflicts, escalates to the human. Issues
  *pointers*, never implementations. Owns assignment; is the only writer of a
  task's `owner`.
- **Executor** — any number. Takes one assigned task, works in its lane, finishes
  durably with verification, then stops. Interchangeable: an executor is whoever
  advertises the needed capability, regardless of which tool or model it is.

A work-order requests a **capability** (`browser-verify`, `node`, `image-measure`,
…), not a vendor. The manager matches open tasks to whoever declared that
capability in `roster.jsonl`. New kind of agent shows up tomorrow with the
capability? It's eligible automatically.

---

## 3. The agent lifecycle

1. **Register & announce.** Append yourself to `roster.jsonl`
   (`schemas/roster-entry.md`). Write a `session-start` ledger entry: your id +
   what you are picking up. This is the manager's only reliable liveness signal.
2. **Read state, in order:** `PROJECT.md` → `STATUS.md` → the tail of
   `ledger.jsonl` → (git mode) `git log --oneline -8`. **If the record disagrees
   with the artifact, trust the artifact** and write an `update` flagging it.
3. **Claim exactly one task.** One `claim` entry, one `task_id`, owner = your id.
   If your assigned task already looks done in the artifact, **stop** — write an
   `update`, do not rebuild it.
4. **Work one slice, in your lane.** Cross the seam only after a `handoff`.
5. **Stay observable.** Liveness is *observed*, not self-narrated: the manager
   watches the ledger/worktree (see `adapters/control-plane.md`). You need not emit
   periodic heartbeats unless you are running long and unattended — then a one-line
   `update` every so often ("still on X, did Y, next Z, no blockers") earns its
   keep. Otherwise, let your `result` speak.
6. **Finish durably.** Write a `result` entry with a verification block and the
   durability marker (commit hash in git mode; the saved file set in no-vcs mode).
   Set status to `review`. Then stop. The manager moves `review → complete` after
   independent verification.

---

## 4. The wire format

All coordination is JSONL lines + Markdown notes that *any* agent can read.

- **`ledger.jsonl`** — append-only, one JSON object per state transition. The
  machine truth of who-owns-what and what-happened. Schema:
  `schemas/ledger-entry.md`.
- **`roster.jsonl`** — append-only, one JSON object per agent. Schema:
  `schemas/roster-entry.md`.
- **Notes** (optional, for prose that doesn't fit a line) live in `notes/` with the
  front matter in `schemas/note.md`. Use them for `decision`, `handoff`, `retro`,
  `escalation` bodies. A note is durable and unsupervised-safe; prefer it over any
  ephemeral channel for anything that must survive.

**Event types:** `session-start · claim · update · handoff · blocker · decision ·
result · work-order · nudge · stop-the-line · reassign · escalation · retro`.

**Statuses:** `open · claimed · blocked · review · ready-for-next · complete ·
superseded`.

(These exact vocabularies are what `validate.mjs` enforces — keep to them.)

---

## 5. Truth, durability, and the substrate

- **Data plane = truth.** The files in this folder are authoritative. A host
  harness's native task list is a fast local *cache* of the ledger, never the
  source of truth (it is usually session-scoped and invisible to other vendors).
  Whoever uses native tools **mirrors every change back to the ledger**.
- **Durability** is defined by `PROJECT.md → execution_mode`:
  - **git mode (default).** Durable = committed. The commit SHA is the marker; the
    code change and the ledger update land in one commit. `git` is local — **no
    GitHub or network required**. A remote, if any, is *backup*, orthogonal to
    coordination.
  - **no-vcs mode (fallback).** Durable = files saved. `manifest.json` records a
    hash per tracked file so `validate.mjs` can detect drift. Weaker; use only
    where `git init` is impossible.
- **Substrate rule:** never run parallel agents over a cloud-synced working tree
  (OneDrive/Dropbox/iCloud). Eventual-consistency corrupts shared files and even
  the `.git` directory. Working trees live on a local path; sync/remote is backup.
  For real parallelism, give each executor its own git worktree
  (`adapters/control-plane.md`).

---

## 6. Conflict, blockers, escalation

- **Conflict** (two agents on the same files / duplicate work): the manager writes
  a `stop-the-line` entry pointing to the authoritative commit; the loser stops and
  rebases/branches. `validate.mjs` flags double-claims so this is caught early.
- **Blocker:** write a `blocker` entry — what, why, what you tried, what would
  unblock. **Retry cap is 2.** The same failure twice → stop, escalate; do not try
  a third time.
- **Escalation to the human:** write an `escalation` note (what decision is needed,
  why you can't resolve it, the evidence, options + a recommendation). The note is
  the durable contract; a push/desktop notification may *announce* it, but the note
  is what persists. Irreversible or outward-facing actions (push, deploy, spend,
  send) are always the human's to approve.

---

## 7. What the manager additionally owns

- Assignment (`work-order`, the only writer of `owner`), integration, the
  Definition of Done (`PROJECT.md`), and the escalation ladder.
- A **pass** model: each time the manager runs, it refreshes state from the
  artifact, checks liveness, assigns ready work (one active task per executor),
  verifies results, resolves conflicts, and regenerates `STATUS.md`
  (`node bin/status.mjs`). Passes may be human-triggered or scheduled
  (`adapters/control-plane.md`).
- **A work order is a pointer, not an implementation.** Goal + acceptance criteria
  + lane + where to look. If the manager is pasting code, it is doing the
  executor's job.

---

## 8. Scope discipline

The project's frozen contract and out-of-scope list live in `PROJECT.md`. No
executor edits the frozen contract. Adding scope requires removing scope. An
out-of-scope improvement you spot is written as a `decision`/`update` for the
manager (or spun into its own task), not silently built into the current one.

---

*That is the whole contract. It is short on purpose: a protocol agents half-ignore
trains them to ignore all of it. Everything here is either enforced by
`validate.mjs` or load-bearing for the prime directive.*
