import PIXI from "../lib/pixi.js";
import { Tiles, TilesById, size } from "./tiles.js";
const { resources } = PIXI.loader;

class WorldTileMap extends PIXI.tilemap.CompositeRectTileLayer {
  constructor() {
    super(0, [resources.sprites_image.texture], true);
  }
  build(world) {
    const { tx, ty, cells } = world;
    this.clear();

    for (var i = 0; i < ty; i++)
      for (var j = 0; j < tx; j++) {
        const tile = cells[i * tx + j];
        const t = TilesById[tile.type];

        if (tile.hide) continue;

        // Add grass everywhere
        // TODO: this should be a PIXI.TilingSprite over whole field
        if (!t.base) {
          this.addFrame(Tiles.grass.sheet, j * size, i * size);
        }

        // Add top layer
        const yo = (t.yo || 0) * size;
        this.addFrame(tile.frame || t.sheet, j * size, i * size + yo);
      }
  }
}

export default WorldTileMap;
