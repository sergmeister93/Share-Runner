# WO-14 dependency blocker: WO-12 unclaimed

- Agent: `ux-codex`
- Downstream task: WO-14 HUD share counter + completion score flash
- Blocking dependency: `wo-12-coins` remains open and unclaimed; WO-13 must follow it before WO-14 is assignable.
- Evidence: Manager explicitly marked ux-codex idle until WO-14 and the execution plan gates WO-14 on WO-12 + WO-13.
- Requested Manager action: re-nudge/restore the backend executor for WO-12, or reassign that work order through the comms protocol.

No UX source changes are pending or authorized while this dependency remains open.
