import PIXI from "../../lib/pixi.js";

const { resources } = PIXI.loader;

class WorldScene extends PIXI.Container {
  constructor(bounds) {
    super();

    this.size = 32;
    this.tx = 32;
    this.ty = 20;
    this.world = [...Array(this.tx * this.ty)].map((_, i) => {
      const x = i % this.tx;
      const y = (i / this.tx) | 0;
      return {
        type: Math.random() < 0.05 ? 2 : Math.random() < 0.01 ? 1 : 0
      };
    });

    this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.sprites_image.texture],
      true
    );
    this.addChild(this.tilemap);
    this.build(0);
  }

  getNeighbours(idx, ns) {
    ns.length = 0;
    const { tx, ty, world } = this;
    const x = idx % this.tx;
    const y = (idx / this.tx) | 0;

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
  }

  tick(t) {
    const ns = [];
    const added = [];
    const died = [];
    this.world.forEach((t, i) => {
      this.getNeighbours(i, ns);
      const n = ns.reduce((ac, el) => ac + (el && el.type == 1 ? 1 : 0), 0);
      if (n > 1 && n < 4) {
        added.push(i);
      }
      if (n > 5) died.push(i);
    });
    added.forEach(i => {
      if (this.world[i].type !== 2) this.world[i].type = 1;
    });
    died.forEach(i => {
      if (this.world[i].type == 1) this.world[i].type = 0;
    });
    this.build(t);
  }

  build(frame) {
    const { tilemap, size, tx, ty, world } = this;
    tilemap.clear();

    for (var i = 0; i < ty; i++)
      for (var j = 0; j < tx; j++) {
        const tile = world[i * tx + j];
        tilemap.addFrame("x0y0", j * size, i * size);
        if (tile.type == 1) tilemap.addFrame("x1y0", j * size, i * size);
        if (tile.type == 2) tilemap.addFrame("x2y0", j * size, i * size);
      }

    // if you are lawful citizen, please use textures from
    //  const textures = resources.sheet.textures;
    //    tilemap.addFrame(textures["brick.png"], 2 * size, 2 * size);
    //    tilemap.addFrame(textures["brick_wall.png"], 2 * size, 3 * size);
  }
}

export default WorldScene;
