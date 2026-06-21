# Adapter — durability / VCS

The kernel says "finish durably." *What durable means* is set here, per project, by
`PROJECT.md → execution_mode`. There are two modes. **git is the default and the
strongly-recommended one — and git does not require GitHub.**

---

## git mode (default)

`git init` is offline, free, and needs no account or remote. You get everything the
protocol wants from a VCS, locally:

| Protocol need | git primitive |
| --- | --- |
| Durability marker | the commit SHA |
| Registry / timeline | `git log`, `git status --porcelain` |
| Agent isolation | one **worktree** per executor |
| Lanes | branches |
| "Review" gate | manager merges the executor's branch after `validate.mjs` passes |
| Code + record land together | both staged in **one commit**, enforced by the pre-commit hook |

**The keystone:** require the code change *and* the `ledger.jsonl` update in the
**same commit**. Then "the code shipped but the record lied" is structurally
impossible — `hooks/pre-commit` rejects a commit that stages source changes without
a matching ledger update, and runs `validate.mjs`.

Because the hook lives in the repo, it fires for **every** committer — Claude,
Codex, Cursor, the human — with no harness involvement. That is the protocol's
vendor-neutral enforcement point.

**A remote is optional and orthogonal.** GitHub (or any remote) is *backup +
sharing*, not coordination. Add one whenever you want off-machine durability; the
protocol neither needs nor checks for it. "GitHub vs no GitHub" is not a dimension
of this protocol.

`manifest.json` is **not used** in git mode — git already hashes every file.

---

## no-vcs mode (fallback)

Use only where `git init` is genuinely impossible (locked sandbox, or you
explicitly decline a repo).

- Durable = files saved in the project folder.
- `manifest.json` maps `path → sha256` for each tracked file. `validate.mjs`
  recomputes hashes and flags any file that changed without a corresponding
  `result` + manifest update. This is the drift check that, in git mode, git itself
  provides.
- Enforcement is weaker (no pre-commit hook). Run `node bin/validate.mjs` manually,
  or on a schedule, as the gate.

---

## The substrate rule (applies to both modes)

**Never run parallel agents over a cloud-synced working tree** (OneDrive, Dropbox,
iCloud, …). Eventual-consistency causes truncated reads, "file exists / doesn't"
disagreements, and — in git mode — corruption of `.git/objects` and
`.git/index.lock`. The risk scales with concurrency.

- Working trees live on a **local, non-synced path**.
- Sync/remote is for **backup**, a separate concern from coordination.
- For real parallelism, give each executor its **own git worktree** so agents write
  disjoint files that merge cleanly, instead of contending on shared files.
