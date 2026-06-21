/**
 * CollectibleSystem (WO-12) — builds the 5 share coins from the catalog, wires
 * each moving coin to its anchor platform, drives bob + tracking, and routes
 * player overlap to a single collect. The Level scene (WO-16) calls
 * `registerOverlap(player)` and `update(dtSec)`.
 */

import type Phaser from 'phaser';
import { ShareCoin } from '../objects/ShareCoin';
import { collectibleInstances } from './collectibles';
import type { AssetCatalog } from './AssetCatalog';
import type { PlatformSystem } from './PlatformSystem';

export class CollectibleSystem {
  readonly coins: ShareCoin[];
  private readonly bySprite: Map<Phaser.GameObjects.GameObject, ShareCoin>;

  constructor(scene: Phaser.Scene, catalog: AssetCatalog, platforms: PlatformSystem) {
    const key = catalog.shareMeta.key;
    this.coins = collectibleInstances(catalog).map((inst) => {
      const anchor =
        inst.behavior === 'moves-with-platform'
          ? (platforms.platforms.find((p) => p.id === inst.anchorPlatformId) ?? null)
          : null;
      return new ShareCoin(scene, inst, key, anchor);
    });
    this.bySprite = new Map(this.coins.map((c) => [c.sprite, c]));
  }

  /** Coin sprites for `scene.physics.add.overlap(player, coins)`. */
  get sprites(): Phaser.GameObjects.GameObject[] {
    return this.coins.map((c) => c.sprite);
  }

  /** Wire player overlap so touching a coin collects it once. */
  registerOverlap(player: Phaser.GameObjects.GameObject): Phaser.Physics.Arcade.Collider {
    return (player.scene ?? this.coins[0].sprite.scene).physics.add.overlap(
      player,
      this.sprites,
      (_p, coinObj) => this.bySprite.get(coinObj as Phaser.GameObjects.GameObject)?.collect(),
    );
  }

  /** Bob + moving-coin tracking. Call once per frame after platforms update. */
  update(dtSec: number): void {
    for (const c of this.coins) c.update(dtSec);
  }
}
