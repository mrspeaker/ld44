import PIXI from "../lib/pixi.js";
import worldGen from "./worldGen.js";
import { Tiles, TilesById, size } from "./tiles.js";

const { resources } = PIXI.loader;

class World {
  constructor(tx, ty, startTrees) {
    this.tx = tx;
    this.ty = ty;
    this.world = worldGen(tx, ty, startTrees);

    this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.sprites_image.texture],
      true
    );
    this.build();
  }

  build() {
    const { tilemap, tx, ty, world } = this;
    tilemap.clear();

    for (var i = 0; i < ty; i++)
      for (var j = 0; j < tx; j++) {
        const tile = world[i * tx + j];
        const t = TilesById[tile.type];

        if (tile.hide) continue;

        // Add grass everywhere
        // TODO: this should be a PIXI.TilingSprite over whole field
        if (!t.base) {
          tilemap.addFrame(Tiles.grass.sheet, j * size, i * size);
        }

        // Add top layer
        const yo = (t.yo || 0) * size;
        tilemap.addFrame(tile.frame || t.sheet, j * size, i * size + yo);
      }
  }

  getNeighbours(idx, ns) {
    ns.length = 0;
    const { tx, ty, world } = this;
    const x = idx % tx;
    const y = (idx / tx) | 0;

    for (let j = -1; j < 2; j++) {
      for (let i = -1; i < 2; i++) {
        if (x + i < 0 || x + i > tx - 1 || y + j < 0 || y + j > ty - 1) {
          ns.push(null);
        } else if (j == 0 && i == 0) {
          ns.push(null);
        } else {
          ns.push(world[(y + j) * tx + (x + i)]);
        }
      }
    }
    return ns;
  }

  spawnCoinsAtIdx(idx) {
    const { world } = this;
    // Force a spread
    world[505].type = Tiles.coin.id;
    world[506].type = Tiles.coin.id;
    world[606].type = Tiles.coin.id;
  }
}

export default World;
