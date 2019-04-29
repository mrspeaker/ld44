import PIXI from "../../lib/pixi.js";
import Dialog from "../entities/Dialog.js";

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
  constructor(bounds, ui, game) {
    super();

    this.size = 32;
    this.tx = 100;
    this.ty = 100;
    this.game = game; // TODO: this is just to increase tick speed - move tick speed in here!

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

    this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.sprites_image.texture],
      true
    );
    this.addChild(this.tilemap);
    this.build();

    this.cursor = new PIXI.Sprite(resources.sprites.textures.x0y1);
    this.addChild(this.cursor);

    this.axe = new PIXI.Sprite(resources.sprites.textures.x2y2);
    this.axe.pivot.x = this.size * 0.3;
    this.axe.pivot.y = this.size * 0.95;
    this.axe.visible = false;
    this.addChild(this.axe);

    // TODO: better handling of "actions" - not really used in the end.
    this.actions = [];

    this.dialog = new Dialog(ui);
    this.dialog.show("Chop some wood to start earning $$$!");
    // TODO: fire events for dialog, remove from here
    this.flags = {
      first_chop: { done: false, msg: "" },
      first_chop_done: {
        done: false,
        msg: "Phew, it's hard work - but it's a living!"
      },
      second_chop: { done: false, msg: "It takes money to make money." },
      init_spread: {
        done: false,
        msg: "Hey! Your wealth is beginning to spread!",
        nextMsg: "second_spread",
        after: 5000
      },
      second_spread: {
        done: false,
        msg: "Things are trending up",
        nextMsg: "third_spread",
        after: 5000
      },
      third_spread: {
        done: false,
        msg: "Big money in real estate... good for you.",
        nextMsg: "fourth_spread",
        after: 5000
      },
      fourth_spread: { done: false, msg: "" }
    };

    this.dialogs = [];
  }

  addNextDialog(flag) {
    // TODO: sort by time
    if (flag.nextMsg) {
      this.dialogs.push({
        msg: this.flags[flag.nextMsg],
        time: Date.now() + flag.after
      });
    }
  }

  onClicked(x, y, isShift) {
    const { size } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    const i = yo * this.tx + xo;
    const t = this.world[i];

    if (isShift) {
      const ns = this.getNeighbours(i, []);
      console.log(ns);
      return;
    }

    if (t.type == Tiles.tree.id) {
      this.startChop(t, xo, yo);
    }
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
      // TODO: clean up count
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
        if (n.coins >= 2 || crapThings > 7) {
          added.push([i, Tiles.coin]);

          // TODO: remove flags - make events
          const { flags } = this;
          if (!flags.init_spread.done) {
            flags.init_spread.done = true;
            flags.init_spread.time = Date.now();
            this.dialog.show(flags.init_spread.msg);
            this.addNextDialog(flags.init_spread);
          }
        }
      } else if (t.type === Tiles.tree.id) {
        if (n.coins > 0 && n.blanks === 0) {
          // Starved, so die
          added.push([i, Tiles.skull]);
        }
      } else if (t.type === Tiles.coin.id) {
        if (crapThings >= 8) {
          added.push([i, Tiles.concrete]);
        }
        if (n.trees > 0) {
          // "Magic flip" to kill some trees randomly - stops pockets of green!
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
    // Make changes after initial pass over tiles
    added.forEach(([i, type]) => {
      const tile = this.world[i];
      tile.type = type.id;
    });

    // Rebiuld the tilemap
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

  update(t) {
    const { actions, size, flags, dialogs } = this;

    // TODO: This is dumb - just for tree click (only 1 "action"!)
    if (actions.length) {
      const a = actions[0];
      if (!a.started) {
        // TODO: flags is also dumb
        if (!flags.first_chop.done) {
          this.dialog.show(flags.first_chop.msg);
          flags.first_chop.done = true;
        } else if (!flags.second_chop.done) {
          this.dialog.show(flags.second_chop.msg);
          flags.second_chop.done = true;
        }
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
        if (!flags.first_chop_done.done) {
          this.dialog.show(flags.first_chop_done.msg);
          flags.first_chop_done.done = true;
        }
        a.tile.type = Tiles.coin.id;
        actions.shift();
        this.axe.visible = false;
      }
    }

    // TODO: dialogs... also dumb.
    if (dialogs.length) {
      const d = dialogs[0];
      if (Date.now() > d.time) {
        this.dialog.show(d.msg.msg);
        d.done = true;
        this.addNextDialog(d.msg);
        dialogs.shift();
        if (d.msg.nextMsg) {
          if (d.msg.nextMsg == "third_spread") {
            this.game.tick_length = 3;
          }
          if (d.msg.nextMsg == "fourth_spread") {
            this.game.tick_length = 1;
          }
        }
      }
    }

    // Swing an axe
    if (this.axe.visible) this.axe.rotation = Math.abs(Math.sin(t * 3));
  }
}

export default WorldScene;
