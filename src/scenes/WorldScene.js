import PIXI from "../../lib/pixi.js";

const { resources } = PIXI.loader;

const Tiles = {
  grass: { id: 0, sheet: "x0y0", base: true },
  coin: { id: 1, sheet: "x1y0" },
  tree: { id: 2, sheet: "x2y0", yo: -0.3 },
  concrete: { id: 3, sheet: "x3y0", base: true },
  skull: { id: 4, sheet: "x1y1" },
  bedrock: { id: 5, sheet: "x4y0", base: true }
};
const TilesById = Object.entries(Tiles).reduce((ac, [k, v], i) => {
  v.id = i;
  ac[v.id] = v;
  ac[v.id].name = k;
  return ac;
}, {});

class WorldScene extends PIXI.Container {
  constructor(bounds) {
    super();

    this.size = 32;
    this.tx = 100;
    this.ty = 100;
    this.world = [...Array(this.tx * this.ty)].map((_, i) => {
      const x = i % this.tx;
      const y = (i / this.tx) | 0;
      let type = Tiles.grass.id;
      if (Math.random() < 0.3) type = Tiles.tree.id;
      if (y == 0 || x == 0 || x == this.tx - 1 || y == this.ty - 1)
        type = Tiles.bedrock.id;
      return {
        type
      };
    });

    this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.sprites_image.texture],
      true
    );

    this.addChild(this.tilemap);

    this.cursor = new PIXI.Sprite(resources.sprites.textures.x0y1);
    this.addChild(this.cursor);

    this.build();
  }

  onClicked(x, y) {
    const { size } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    const t = this.world[yo * this.tx + xo];
    t.type = t.type === Tiles.coin.id ? Tiles.grass.id : Tiles.coin.id;
    this.build();
  }

  onMoved(x, y) {
    const { size, cursor } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    cursor.x = xo * size;
    cursor.y = yo * size;
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
      if (t.type === Tiles.skull.id) {
        if (Math.random() < 0.05) {
          t.type = Tiles.grass.id;
        }
        return;
      }
      this.getNeighbours(i, ns);
      const n = ns.reduce(
        (ac, el) => {
          if (!el) return ac;
          if (el.type === Tiles.coin.id) ac.coins++;
          if (el.type === Tiles.grass.id) ac.blanks++;
          if (el.type === Tiles.tree.id) ac.trees++;
          if (el.type === Tiles.concrete.id) ac.concrete++;
          return ac;
        },
        { coins: 0, blanks: 0, trees: 0, concrete: 0 }
      );
      if (t.type === Tiles.grass.id) {
        if (n.coins >= 2) added.push([i, Tiles.coin]);
      } else if (t.type === Tiles.tree.id) {
        if (n.coins > 0 && n.blanks === 0) {
          // Starved.
          added.push([i, Tiles.skull]);
        }
      } else if (t.type === Tiles.coin.id) {
        if (n.coins + n.concrete === 8) {
          added.push([i, Tiles.concrete]);
        }
      }
    });
    added.forEach(([i, type]) => {
      //if (Math.random() < 0.5) return;
      const tile = this.world[i];
      tile.type = type.id;
    });
    died.forEach(i => {
      // if (this.world[i].type == 1) this.world[i].type = 0;
    });
    this.build(t);
  }

  build() {
    const { tilemap, size, tx, ty, world } = this;
    tilemap.clear();

    for (var i = 0; i < ty; i++)
      for (var j = 0; j < tx; j++) {
        const tile = world[i * tx + j];
        const t = TilesById[tile.type];

        if (!t.base) {
          tilemap.addFrame(Tiles.grass.sheet, j * size, i * size);
        }
        //  if (tile.type !== Tiles.grass.id) {
        const yo = (t.yo || 0) * size;
        tilemap.addFrame(t.sheet, j * size, i * size + yo);
        // }
      }

    // if you are lawful citizen, please use textures from
    //  const textures = resources.sheet.textures;
    //    tilemap.addFrame(textures["brick.png"], 2 * size, 2 * size);
    //    tilemap.addFrame(textures["brick_wall.png"], 2 * size, 3 * size);
  }
}

export default WorldScene;
