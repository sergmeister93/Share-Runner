---
name: qa-verification
description: How QA verifies Share-Runner work. Use when confirming acceptance criteria or running validation. Do not sign off on "looks right" — record evidence.
---

# QA Verification (Share-Runner)

Verify acceptance criteria, not vibes. Evidence before assertions.

## Always record

For every check: the **exact command**, **working directory**, **exit code**, and a one-line result.
Distinguish: setup validation vs. unit tests vs. browser tests vs. visual checks.

## Setup pass (now)

Verify scaffolding and protocol integrity:
- `node comms/bin/validate.mjs` → PASS
- `node scripts/validate-project-setup.mjs` → PASS
- `node scripts/validate-baltimore-assets.mjs` → PASS, or its blocker (`sharp` missing) documented.

## Implementation pass (later, once gameplay exists)

Verify, against the running artifact: title/menu flow, start transition, player spawn, camera
behavior, collision, moving platforms (stationary/vertical/horizontal), five-share collection,
flag completion, score flash, restart safety.

## When NOT to use

Don't use it to implement features — QA implements only when explicitly assigned a QA-tooling task.
