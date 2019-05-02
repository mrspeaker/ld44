import PIXI from "../../lib/pixi.js";
import Dialog from "../entities/Dialog.js";
import OneUp from "../entities/OneUp.js";
import Axe from "../entities/Axe.js";
import flags from "../flags.js";

import { Tiles, TilesById, size } from "../tiles.js";
import worldGen from "../worldGen.js";

const { resources } = PIXI.loader;

class WorldScene extends PIXI.Container {
  constructor(bounds, ui, game) {
    super();

    this.game = game; // TODO: remove refs to game from this class

    this.tx = 100; // map width
    this.ty = 100; // map height

    this.startTrees = 2950;
    this.world = worldGen(this.tx, this.ty, this.startTrees);

    this.tilemap = this.addChild(
      new PIXI.tilemap.CompositeRectTileLayer(
        0,
        [resources.sprites_image.texture],
        true
      )
    );
    this.build();

    this.entities = this.addChild(new PIXI.Container());
    this.cursor = this.addChild(
      new PIXI.Sprite(resources.sprites.textures.x0y1)
    );

    this.axe = this.addChild(new Axe());
    this.axe.visible = false;

    this.dialogs = [];
    this.dialog = ui.addChild(new Dialog());
    this.dialog.x = 250;
    this.dialog.y = 480;
    this.dialog.show("Chop some wood to start earning $$$!");

    // TODO: better handling of "actions" - not really used (just to "chop").
    this.actions = [];

    // TODO: fire events for dialog, remove from here
    this.flags = flags;

    this.prices = { coin: 1, concrete: 13, building: 87 };
    this.$$ = 0;
    this.$ = ui.addChild(this.addScoreUI());
    this.gameOver = ui.addChild(this.addGameOverUI());
    this.dbg = ui.addChild(this.addDebugUI(false));
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

  addScoreUI() {
    const style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 40,
      fill: "#ffffff",
      stroke: "#222222",
      strokeThickness: 5
    });
    const $ = new PIXI.Text("", style);

    $.anchor.set(0.5);
    $.x = 500;
    $.y = 300;
    $.visible = false;
    return $;
  }

  addDebugUI(show = true) {
    const dbg = new PIXI.Text(
      "dbg",
      new PIXI.TextStyle({
        fontFamily: "monospace",
        fontSize: 8,
        fill: "#ffffff"
      })
    );

    dbg.x = 10;
    dbg.y = 60;
    dbg.visible = show;
    return dbg;
  }

  addGameOverUI() {
    const style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 40,
      fill: "#ffffff",
      stroke: "#222222",
      strokeThickness: 5
    });
    const go = new PIXI.Container();
    const m1 = new PIXI.Text("You died with:", style);
    const m2 = new PIXI.Text("Game over.", style);
    go.addChild(m1);
    go.addChild(m2);
    m1.anchor.set(0.5);
    m2.anchor.set(0.5);
    m1.x = 500;
    m1.y = 230;
    m2.x = 500;
    m2.y = 370;
    go.visible = false;
    return go;
  }

  add$($$, x, y) {
    this.$$ += $$;
    this.$.visible = true;
    this.$.text = `$${this.$$.toLocaleString("fullwide")}`;

    // add oneup by x,y or tile idx
    if (y) {
      this.entities.addChild(new OneUp(x, y, $$));
    } else if (x) {
      const { tx, ty } = this;
      const xx = x % tx;
      const yy = (x / ty) | 0;
      this.entities.addChild(new OneUp(xx * size + 16, yy * size, $$));
    }
  }

  onClicked(x, y, isShift) {
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
    const { cursor } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    cursor.x = xo * size;
    cursor.y = yo * size;
  }

  startChop(t, x, y) {
    const { actions } = this;
    if (actions.length) {
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
    const added = [];
    let trees = 0;
    let addedABuilding = false;

    const ns = []; // tmp array for neighbours
    this.world.forEach((t, i) => {
      if (t.type === Tiles.skull.id) {
        if (Math.random() < 0.05) {
          t.type = Tiles.grass.id;
        }
        return;
      }
      if (t.type === Tiles.tree.id) trees++;
      if (t.hide || TilesById[t.type].noRule) {
        return;
      }

      this.getNeighbours(i, ns);
      const n = ns.reduce(
        (ac, el) => {
          // TODO: clean up counts
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

      // Cellular automata rules
      switch (t.type) {
        case Tiles.grass.id:
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
          break;
        case Tiles.tree.id:
          if (n.coins > 0 && n.blanks === 0) {
            // Starved, so die
            added.push([i, Tiles.skull]);
          }
          break;
        case Tiles.coin.id:
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
          break;
        case Tiles.concrete.id:
          if (n.concrete > 3) {
            // Check if 4 tiles are concrete: convert to building
            const c = Tiles.concrete.id;
            const sq = [5, 7, 8];
            if (
              sq.every(ni => {
                const n = ns[ni];
                return n && n.type == c && !n.hide;
              })
            ) {
              t.type = Tiles.building.id;
              t.frame =
                Math.random() < 0.7
                  ? Tiles.building.sheet
                  : Tiles.building.sheetAlt;
              sq.forEach(ni => (ns[ni].hide = true));
              this.add$(this.prices.building, i);
              addedABuilding = true;
            }
          }
          break;
        default:
          console.warn("other", t.type);
          return;
      }
    });

    // Make changes AFTER initial pass over tiles
    added.forEach(([i, type]) => {
      const tile = this.world[i];
      tile.type = type.id;
    });

    // Kick drum heartbeat
    if (addedABuilding) {
      resources.kick.sound.play();
      if (!this.flags.building1.done) {
        this.flags.building1.done = true;
        this.addNextDialog(this.flags.building1);
      }
    }

    // Rebuild the tilemap
    this.build(t);

    // Game score/pacing logic
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
      this.game.drone.volume = 0.1;
    }

    // Helper coins if you didn't place any next to each other!
    if (this.$$ > 4 && !this.flags.init_spread.done) {
      // Force a spread
      this.world[505].type = Tiles.coin.id;
      this.world[506].type = Tiles.coin.id;
      this.world[606].type = Tiles.coin.id;
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

  update(t) {
    const { actions, flags, dialogs, entities } = this;

    // Pan on start
    if (t < 4) {
      let o = (4 - t) * 10;
      o = o * o;
      this.game.camera.left = o;
      this.game.camera.top = o;
      return;
    }

    // Update one-ups
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
        // Only do chop sounds before 100000 - distracts from "heartbeat" effect
        if (this.$$ < 10000) {
          (function chopSFX() {
            function play(times) {
              resources.chop.sound.play();
              if (times-- > 0) setTimeout(() => play(times), 700);
            }
            play(6);
          })();
        }

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
          if (d.msg.nextMsg == "second_spread") {
            this.game.tick_length = 3;
          }
          if (d.msg.nextMsg == "third_spread") {
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
