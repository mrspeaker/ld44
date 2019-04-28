import PIXI from "../../lib/pixi.js";

const { resources } = PIXI.loader;

const Tiles = {
  grass: { sheet: "x0y0", base: true },
  coin: { sheet: "x1y0" },
  tree: { sheet: "x2y0", yo: -0.3 },
  concrete: { sheet: "x3y0", base: true },
  skull: { sheet: "x1y1" },
  bedrock: { sheet: "x1y2", base: true },
  building: { sheet: "x4y0", base: true }
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
      if (y == 0 || x == 0 || x == this.tx - 1 || y == this.ty - 1) {
        type = Tiles.bedrock.id;
      }
      return {
        type
      };
    });
    this.actions = [];

    this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.sprites_image.texture],
      true
    );

    this.addChild(this.tilemap);

    this.cursor = new PIXI.Sprite(resources.sprites.textures.x0y1);
    this.axe = new PIXI.Sprite(resources.sprites.textures.x2y2);
    this.axe.pivot.x = this.size * 0.3;
    this.axe.pivot.y = this.size * 0.95;
    this.axe.visible = false;

    this.addChild(this.cursor);
    this.addChild(this.axe);

    this.build();
  }

  onClicked(x, y, isShift) {
    const { size } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    const i = yo * this.tx + xo;
    const t = this.world[i];

    if (isShift) {
      const ns = this.getNeighbours(i, []);
      const n = ns.reduce(
        (ac, el) => {
          if (!el || el.type === Tiles.bedrock.id) {
            ac.concrete++;
            return ac;
          }
          if (el.type === Tiles.coin.id) ac.coins++;
          if (el.type === Tiles.grass.id) ac.blanks++;
          if (el.type === Tiles.tree.id) ac.trees++;
          if (el.type === Tiles.concrete.id) ac.concrete++;
          if (el.type === Tiles.building.id) ac.buildings++;
          return ac;
        },
        { coins: 0, blanks: 0, trees: 0, concrete: 0, buildings: 0 }
      );
      console.log(n, ns);
      return;
    }

    if (t.type == Tiles.tree.id) {
      this.startChop(t, xo, yo);
    }
    this.build();
  }

  onMoved(x, y) {
    const { size, cursor } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    cursor.x = xo * size;
    cursor.y = yo * size;
  }

  startChop(t, x, y) {
    const { actions } = this;
    if (actions.length) {
      console.log("bzzz... already chopping");
      //one at a time!
      return;
    }
    actions.push({
      type: "chop",
      tile: t,
      start: Date.now(),
      chopTime: 4000,
      started: false,
      x,
      y
    });
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
    return ns;
  }

  update(t) {
    const { actions, size } = this;
    if (actions.length) {
      const a = actions[0];
      if (!a.started) {
        this.axe.visible = true;
        a.doneAt = Date.now() + a.chopTime;
        (function() {
          function play(times) {
            resources.chop.sound.play();
            if (times-- > 0) setTimeout(() => play(times), 1000);
          }
          play(4);
        })();

        this.axe.x = a.x * size - 10;
        this.axe.y = a.y * size;
        a.started = true;
      }
      if (Date.now() > a.doneAt) {
        a.tile.type = Tiles.coin.id;
        actions.shift();
        this.axe.visible = false;
      }
    }
    this.axe.rotation = Math.abs(Math.sin(t * 3));
  }

  tick(t) {
    const ns = [];
    const added = [];
    this.world.forEach((t, i) => {
      if (t.type === Tiles.skull.id) {
        if (Math.random() < 0.05) {
          t.type = Tiles.grass.id;
        }
        return;
      }
      if (t.hide || t.type == Tiles.building.id) return;

      this.getNeighbours(i, ns);
      const n = ns.reduce(
        (ac, el) => {
          if (!el || el.type === Tiles.bedrock.id) {
            ac.concrete++;
            return ac;
          }
          if (el.type === Tiles.coin.id) ac.coins++;
          if (el.type === Tiles.grass.id) ac.blanks++;
          if (el.type === Tiles.tree.id) ac.trees++;
          if (el.type === Tiles.concrete.id) ac.concrete++;
          if (el.type === Tiles.building.id) ac.buildings++;
          return ac;
        },
        { coins: 0, blanks: 0, trees: 0, concrete: 0, buildings: 0 }
      );
      const crapThings = n.coins + n.concrete + n.buildings;

      if (t.type === Tiles.grass.id) {
        if (n.coins >= 2 || crapThings > 7) added.push([i, Tiles.coin]);
      } else if (t.type === Tiles.tree.id) {
        if (n.coins > 0 && n.blanks === 0) {
          // Starved.
          added.push([i, Tiles.skull]);
        }
      } else if (t.type === Tiles.coin.id) {
        if (crapThings >= 8) {
          added.push([i, Tiles.concrete]);
        }
        if (n.trees > 0) {
          // "Magic flip" to kill some trees randomly.
          if (Math.random() < 0.005) {
            ns.find(n => n && n.type === Tiles.tree.id).type = Tiles.skull.id;
          }
        }
      } else if (n.concrete > 3 && t.type === Tiles.concrete.id && !t.hide) {
        const c = Tiles.concrete.id;
        const sq = [5, 7, 8];
        if (
          sq.every(ni => {
            const n = ns[ni];
            return n && n.type == c && !n.hide;
          })
        ) {
          t.type = Tiles.building.id;
          t.frame = Math.random() < 0.7 ? Tiles.building.sheet : "x5y0";
          sq.forEach(ni => (ns[ni].hide = true));
        }
      }
    });
    added.forEach(([i, type]) => {
      //if (Math.random() < 0.5) return;
      const tile = this.world[i];
      tile.type = type.id;
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

        if (tile.hide) continue;

        if (!t.base) {
          tilemap.addFrame(Tiles.grass.sheet, j * size, i * size);
        }
        const yo = (t.yo || 0) * size;
        tilemap.addFrame(tile.frame || t.sheet, j * size, i * size + yo);
        if (tile.type === Tiles.building.id) {
          j++;
        }
      }
  }
}

export default WorldScene;
