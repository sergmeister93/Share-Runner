# Environment Prefabs

`platforms.png` contains the approved floating-brick prefab at `170x58` runtime pixels. Its top `170x12` rectangle is the local solid collision surface.

This size is authoritative for the Baltimore composition. Position, count, spacing, and obstacle behavior are intentionally undecided. Do not infer placements from `baltimore_level_gameplay_preview.png`; that image is only a visual scale test.

Use nearest-neighbor filtering, disable mipmaps, and keep the large source artwork in `source/` out of runtime bundles.
