---
name: asset-manifest-discipline
description: How to consume Share-Runner asset manifests correctly. Use whenever reading asset paths, dimensions, collision, or placement data. Do not bypass manifests with hardcoded values.
---

# Asset Manifest Discipline

The manifests are the single source of truth for asset paths, dimensions, and the coordinate system.

## Rules

- **Read top-down:** `assets/asset_library_manifest.json` first, then the nested manifests it points
  to (level metadata under `assets/levels/baltimore/metadata/`, sprite manifests under
  `assets/sprites/**/manifest.json`).
- **No hardcoded dimensions** when manifest metadata exists (e.g. share 56×55, platforms 170×58,
  hero frame 160×160, canonical space 4400×2494).
- **Preserve the canonical coordinate system** and the `uniformScaleFormula` /
  `min(viewportW/4400, viewportH/2494)` scaling rule.
- **Validate** with `node scripts/validate-baltimore-assets.mjs` (needs `npm install sharp`).
- **Update manifests and docs together** when assets change; land them in the same unit of work.
- **Escalate** if the manifest and the filesystem disagree — the artifact wins (KERNEL §1.6); write
  an `update`/`blocker` rather than silently "fixing" one side.

## When NOT to use

Tasks that touch no assets.
