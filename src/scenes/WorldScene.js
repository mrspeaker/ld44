import PIXI from "../../lib/pixi.js";
import Dialog from "../entities/Dialog.js";
import OneUp from "../entities/OneUp.js";

const { resources } = PIXI.loader;

const Tiles = {
  grass: { sheet: "x0y0", base: true },
  coin: { sheet: "x1y0" },
  tree: { sheet: "x2y0", yo: -0.3 },
  concrete: { sheet: "x3y0", base: true },
  skull: { sheet: "x3y1", yo: -0.3 },
  bedrock: { sheet: "x1y2", base: false },
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

    this.startTrees = 2950;
    this.size = 32;
    this.tx = 100;
    this.ty = 100;
    this.game = game; // TODO: this is just to increase tick speed - move tick speed in here!

    this.world = [...Array(this.tx * this.ty)].map((_, i) => {
      const x = i % this.tx;
      const y = (i / this.tx) | 0;
      let type = Tiles.grass.id;
      //  if (Math.random() < 0.3) type = Tiles.tree.id;
      if (y == 0 || x == 0 || x == this.tx - 1 || y == this.ty - 1) {
        type = Tiles.bedrock.id;
      }
      return {
        type
      };
    });

    // Add in the trees
    let trees = this.startTrees;
    while (trees > 0) {
      const ti = (Math.random() * this.world.length) | 0;
      if (this.world[ti].type == Tiles.grass.id) {
        this.world[ti].type = Tiles.tree.id;
        trees--;
      }
    }

    this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.sprites_image.texture],
      true
    );
    this.addChild(this.tilemap);
    this.build();

    this.entities = new PIXI.Container();
    this.addChild(this.entities);

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
    this.dialog.x = 250;
    this.dialog.y = 480;
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

    const style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 40,
      fill: "#ffffff",
      stroke: "#4a1850",
      strokeThickness: 5
    });
    this.prices = { coin: 1, concrete: 13, building: 87 };

    this.$$ = 0;
    this.$ = new PIXI.Text(`$${this.$$}`, style);
    this.$.anchor.set(0.5);
    this.$.x = 500;
    this.$.y = 300;
    this.$.visible = false;
    ui.addChild(this.$);

    this.dbg = new PIXI.Text(
      "dbg",
      new PIXI.TextStyle({
        fontFamily: "monospace",
        fontSize: 8,
        fill: "#ffffff"
      })
    );
    this.dbg.x = 10;
    this.dbg.y = 60;
    ui.addChild(this.dbg);
    this.dbg.visible = false;

    this.gameOver = new PIXI.Container();
    const m1 = new PIXI.Text("You died with:", style);
    const m2 = new PIXI.Text("Game over.", style);
    this.gameOver.addChild(m1);
    this.gameOver.addChild(m2);
    m1.anchor.set(0.5);
    m2.anchor.set(0.5);
    m1.x = 500;
    m1.y = 230;
    m2.x = 500;
    m2.y = 370;
    ui.addChild(this.gameOver);
    this.gameOver.visible = false;
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

  add$($$, x, y) {
    this.$$ += $$;
    this.$.visible = true;
    this.$.text = `$${this.$$.toLocaleString("fullwide")}`;

    // add oneup by x,y or tile idx
    if (y) {
      this.entities.addChild(new OneUp(x, y, $$));
    } else if (x) {
      const { tx, ty, size } = this;
      const xx = x % tx;
      const yy = (x / ty) | 0;
      this.entities.addChild(new OneUp(xx * size + 16, yy * size, $$));
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
    } else {
      resources.mouse.sound.play();
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

  tick(t) {
    const ns = [];
    const added = [];
    let trees = 0;
    let addedABuilding = false;
    this.world.forEach((t, i) => {
      if (t.type === Tiles.skull.id) {
        if (Math.random() < 0.05) {
          t.type = Tiles.grass.id;
        }
        return;
      }
      if (t.type === Tiles.tree.id) trees++;
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
          this.add$(this.prices.coin);

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
          this.add$(this.prices.concrete, i);
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
          this.add$(this.prices.building, i);
          addedABuilding = true;
        }
      }
    });
    // Make changes after initial pass over tiles
    added.forEach(([i, type]) => {
      const tile = this.world[i];
      tile.type = type.id;
    });

    if (addedABuilding) {
      resources.kick.sound.play();
    }

    // Rebiuld the tilemap
    this.build(t);

    const percComplete = 1 - trees / this.startTrees;
    if (percComplete > 0.5) {
      Tiles.grass.sheet = "x0y2";
    }
    if (percComplete > 0.75) {
      Tiles.grass.sheet = "x0y3";
      Tiles.tree.sheet = "x2y1";
    }
    if (trees == 0) {
      this.gameOver.visible = true;
      this.game.gameover = true;
    }

    let multiplier = 1;
    const { prices } = this;
    if (this.$$ > 1000) {
      multiplier = Math.min(1.1, 1 + t / 1500);
      prices.coin = Math.round(prices.coin * multiplier);
      prices.concrete = Math.round(prices.concrete * multiplier);
      prices.building = Math.round(prices.building * multiplier);

      if (this.game.tick_length <= 2) {
        const speed = this.game.tick_length > 1 ? 0.08 : 0.005;
        this.game.tick_length = Math.max(0.1, this.game.tick_length - speed);
      }
    }

    this.dbg.text =
      (percComplete * 100).toFixed(0) +
      "% " +
      this.game.tick_length.toFixed(5) +
      "-" +
      prices.building +
      " - " +
      multiplier.toFixed(3);
  }

  build() {
    const { tilemap, size, tx, ty, world } = this;
    tilemap.clear();

    for (var i = 0; i < ty; i++)
      for (var j = 0; j < tx; j++) {
        const tile = world[i * tx + j];
        const t = TilesById[tile.type];

        if (tile.hide) continue;

        // Add grass everywhere: TODO: this should be a PIXI.TilingSprite over whole field?
        if (!t.base) {
          tilemap.addFrame(Tiles.grass.sheet, j * size, i * size);
        }

        // Add top layer
        const yo = (t.yo || 0) * size;
        tilemap.addFrame(tile.frame || t.sheet, j * size, i * size + yo);
      }
  }

  update(t) {
    const { actions, size, flags, dialogs, entities } = this;

    // Pan on start
    if (t < 4) {
      let o = (4 - t) * 10;
      o = o * o;
      this.game.camera.left = o;
      this.game.camera.top = o;
      return;
    }

    entities.children.forEach(e => e.update(t));

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
        (function chopSFX() {
          function play(times) {
            resources.chop.sound.play();
            if (times-- > 0) setTimeout(() => play(times), 700);
          }
          play(6);
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

        this.add$(this.prices.coin, a.x * size + 16, a.y * size);
        actions.shift();
        this.axe.visible = false;
        this.build();
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
            this.game.tick_length = 2;
          }
        }
      }
    }

    // Swing an axe
    if (this.axe.visible) this.axe.rotation = Math.abs(Math.sin(t * 5));
  }
}

export default WorldScene;
