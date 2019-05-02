import PIXI from "../../lib/pixi.js";
import World from "../World.js";
import WorldTileMap from "../WorldTileMap.js";
import Dialog from "../entities/Dialog.js";
import OneUp from "../entities/OneUp.js";
import Axe from "../entities/Axe.js";
import flags from "../flags.js";

import { Tiles, TilesById, size } from "../tiles.js";

const { resources } = PIXI.loader;

class WorldScene extends PIXI.Container {
  constructor(bounds, ui, game) {
    super();

    this.game = game; // TODO: remove refs to game from this class

    this.world = new World(100, 100, 0.295);
    this.tilemap = this.addChild(new WorldTileMap());
    this.renderTiles();

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

  renderTiles() {
    const { tilemap, world } = this;
    tilemap.build(world);
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
    const { $, entities, world } = this;
    this.$$ += $$;
    $.visible = true;
    $.text = `$${this.$$.toLocaleString("fullwide")}`;

    // add oneup by x,y or tile idx
    if (y) {
      entities.addChild(new OneUp(x, y, $$));
    } else if (x) {
      const { tx, ty } = world;
      const xx = x % tx;
      const yy = (x / ty) | 0;
      entities.addChild(new OneUp(xx * size + 16, yy * size, $$));
    }
  }

  onClicked(x, y, isShift) {
    const { world } = this;
    const tile = world.getCellAtXY(x, y);

    // Debug neighbours
    if (isShift) {
      const ns = world.getNeighbours(world.getIdxAtXY(x, y), []);
      console.log(ns);
      return;
    }

    if (tile.type == Tiles.tree.id) {
      const { xo, yo } = world.getCellIndices(x, y);
      this.startChop(tile, xo, yo);
    } else {
      resources.mouse.sound.play();
    }
  }

  onMoved(x, y) {
    const { cursor, world, flags } = this;
    const { xo, yo } = world.getCellIndices(x, y);
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

  tick(tick) {
    const { world } = this;
    let remainingTrees = 0;
    let newBuildings = 0;

    const added = []; // New cells, not processed in current tick
    const ns = []; // tmp array for neighbours

    world.cells.forEach((t, i) => {
      if (t.type === Tiles.skull.id) {
        if (Math.random() < 0.05) {
          t.type = Tiles.grass.id;
        }
        return;
      }
      if (t.type === Tiles.tree.id) remainingTrees++;
      if (t.hide || TilesById[t.type].noRule) {
        return;
      }

      world.getNeighbours(i, ns);
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
              newBuildings++;
            }
          }
          break;
      }
    });

    // Make changes AFTER initial pass over tiles
    added.forEach(([i, type]) => {
      const tile = world.cells[i];
      tile.type = type.id;
    });

    this.updatePricesAndSpeed(tick, remainingTrees, newBuildings);
    this.renderTiles();
  }

  updatePricesAndSpeed(tick, remainingTrees, newBuildings) {
    const { prices, world, dbg } = this;

    // Kick drum heartbeat
    if (newBuildings > 0) {
      resources.kick.sound.play();
      // Show "real estate" dialog for first building
      if (!flags.building1.done) {
        flags.building1.done = true;
        this.addNextDialog(flags.building1);
      }
    }

    // Helper coins if you didn't place any next to each other!
    if (this.$$ > 4 && !flags.init_spread.done) {
      world.spawnCoinsAtIdx(505);
    }

    // Update $ earned per item
    let multiplier = 1;
    if (this.$$ > 1000) {
      multiplier = Math.min(1.1, 1 + tick / 1500);
      prices.concrete = Math.round(prices.concrete * multiplier);
      prices.building = Math.round(prices.building * multiplier);

      // TODO: ticks should be controlled by this scene.
      // TODO: don't increase until after spreading (or when not spreading)
      if (this.game.tick_length <= 2) {
        const speed = this.game.tick_length > 1 ? 0.08 : 0.005;
        this.game.tick_length = Math.max(0.1, this.game.tick_length - speed);
      }
    }

    // Game progress logic
    const percComplete = 1 - remainingTrees / world.startTrees;
    if (percComplete > 0.5) {
      Tiles.grass.sheet = "x0y2";
    }
    if (percComplete > 0.75) {
      Tiles.grass.sheet = "x0y3";
      Tiles.tree.sheet = "x2y1";
    }
    if (remainingTrees == 0) {
      this.gameOver.visible = true;
      this.game.gameover = true;
      this.game.drone.volume = 0.1;
    }

    dbg.text =
      tick +
      ") " +
      (percComplete * 100).toFixed(0) +
      "%" +
      " " +
      remainingTrees +
      ": " +
      newBuildings;
  }

  update(t) {
    const { actions, flags, dialogs, entities, axe } = this;

    // Pan on start
    if (t < 4) {
      let o = (4 - t) * 10;
      o = o * o;
      // TODO: camera should be part of this scene, not game.
      this.game.camera.left = o;
      this.game.camera.top = o;
      return;
    }

    // Update one-ups
    entities.children.forEach(e => e.update(t));

    // TODO: Convert these "action" data to real command pattern
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
        axe.visible = true;
        a.doneAt = Date.now() + a.chopTime;

        // Only do chop sounds before 100000 - distracts from "heartbeat" effect
        if (this.$$ < 10000) {
          this.chopWoodSFX();
        }

        axe.x = a.x * size - 10;
        axe.y = a.y * size;
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
        axe.visible = false;
        this.renderTiles();
      }
    }

    // TODO: dialogs... re-write, it's gone crazy.
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

    this.swingAxe(t);
  }

  swingAxe(t) {
    const { axe } = this;
    if (!axe.visible) return;
    axe.rotation = Math.abs(Math.sin(t * 5));
  }

  chopWoodSFX() {
    function play(times) {
      resources.chop.sound.play();
      if (times-- > 0) setTimeout(() => play(times), 700);
    }
    play(6);
  }
}

export default WorldScene;
