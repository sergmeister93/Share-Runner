# Template — retro

Written on demand (per milestone or per merge, not on a fixed "sprint" clock) by
the manager, with executor input. The point is to change **one** thing next time,
not to assign blame. Append as a `retro` ledger line + note.

```markdown
---
ts: YYYY-MM-DDTHH:MM:SSZ
agent: manager
type: retro
task_id: retro-<milestone>
status: complete
---

## <milestone> — Retro

### Delivered
- <commit/marker> — <description> — <owner>

### Durability gate
- [ ] Verification commands pass (commands + exit codes recorded)
- [ ] Cross-agent review done
- [ ] Landed durably (committed in git mode / files saved in no-vcs)
- [ ] STATUS.md regenerated; ledger matches the artifact (validate.mjs clean)

### What went well

### What went poorly

### Root causes (not symptoms)

### Where communication failed
Silence? Directive-spam? Stale state? Record-vs-artifact drift?

### Where effort was duplicated (and why ownership let it happen)

### The one change for next time
- <single highest-leverage change>
```
