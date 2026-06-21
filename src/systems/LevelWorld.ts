/**
 * LevelWorld (WO-09) — builds the backend world pieces the Level scene assembles:
 * physics + camera bounds and the single static ground body. No texture loading and
 * no scene file (the LevelScene is the WO-16 integration seam).
 *
 * `import type Phaser` keeps this module runtime-Phaser-free (we only ever call
 * methods on the passed-in `scene`), so the node self-check can build it with a mock.
 */

import type Phaser from 'phaser';
import { GROUND_TOP_Y, GROUND_WIDTH } from '../core/Constants';
import { ManifestMismatchError } from '../data/assetManifests';
import type { AssetCatalog } from './AssetCatalog';
import { groundBodies, levelWorldBounds, type GroundRect, type Rect } from './levelGeometry';

export interface LevelWorld {
  bounds: Rect;
  /** Invisible static body(ies) for the ground — exactly one per the level contract. */
  groundZones: Phaser.GameObjects.Zone[];
  groundRects: GroundRect[];
}

/**
 * Set world + camera bounds and create the ground static body. If a catalog is
 * supplied, the authored ground must agree with the constants (manifest discipline).
 */
export function buildLevelWorld(scene: Phaser.Scene, catalog?: AssetCatalog): LevelWorld {
  const bounds = levelWorldBounds();
  scene.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  scene.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

  if (catalog) {
    const g = catalog.placements.ground;
    if (!g) throw new ManifestMismatchError('authoredGameplayPlacements.ground', 'level manifest');
    if (g.topY !== GROUND_TOP_Y || g.width !== GROUND_WIDTH) {
      throw new ManifestMismatchError(
        `ground topY/width ${g.topY}/${g.width} != constants ${GROUND_TOP_Y}/${GROUND_WIDTH}`,
        'level manifest',
      );
    }
  }

  const rects = groundBodies();
  const groundZones = rects.map((r) => {
    // Zone is invisible; origin is centered, so place at the rect centre.
    const zone = scene.add.zone(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height);
    scene.physics.add.existing(zone, true); // true => static body
    return zone;
  });

  return { bounds, groundZones, groundRects: rects };
}
