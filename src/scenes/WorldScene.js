import PIXI from "../../lib/pixi.js";
import World from "../World.js";
import WorldTileMap from "../WorldTileMap.js";
import Dialog from "../entities/Dialog.js";
import OneUp from "../entities/OneUp.js";
import Axe from "../entities/Axe.js";
import flags from "../flags.js";

import { Tiles, size } from "../tiles.js";

const { resources } = PIXI.loader;

class WorldScene extends PIXI.Container {
  constructor(ui, camera) {
    super();

    this.tick_num = 0;
    this.tick_length = 4;
    this.last_tick_time = 0;

    const width = 100;
    const height = 100;
    this.camera = camera;
    camera.worldWidth = width * size;
    camera.worldHeight = height * size;
    this.world = new World(width, height, 0.295);
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
    this.flags = flags();
    this.addDialog(this.flags.hello_world);

    // TODO: better handling of "actions" - not really used (just to "chop").
    this.actions = [];

    this.prices = { coin: 1, concrete: 13, building: 87 };
    this.$ = 0;
    this.$$ = ui.addChild(this.addScoreUI());
    this.gameOverUI = ui.addChild(this.addGameOverUI());
    this.droneSFX = null;

    this.dbg = ui.addChild(this.addDebugUI(false));
  }

  renderTiles() {
    const { tilemap, world } = this;
    tilemap.build(world);
  }

  addDialog(flag) {
    // TODO: flags and dialogs concepts are not clear: refactor.
    // Maybe "added" when added, "done" when displayed, calc time to show/hide?
    // `addDialog` could be `doFlag` (would work nicer for game_over flag)
    this.dialogs.push({
      flag,
      time: Date.now()
    });

    // TODO: bad logic - should be able to chain dialogs - can only trigger next one
    if (flag.nextMsg) {
      this.dialogs.push({
        flag: this.flags[flag.nextMsg],
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
    const $$ = new PIXI.Text("", style);

    $$.anchor.set(0.5);
    $$.x = 500;
    $$.y = 300;
    $$.visible = false;
    return $$;
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

  add$($, x, y) {
    const { $$, entities, world } = this;
    this.$ += $;
    $$.visible = true;
    $$.text = `$${this.$.toLocaleString("fullwide")}`;

    // add oneup by x,y or tile idx
    if (y) {
      entities.addChild(new OneUp(x, y, $));
    } else if (x) {
      const { tx, ty } = world;
      const xx = x % tx;
      const yy = (x / ty) | 0;
      entities.addChild(new OneUp(xx * size + 16, yy * size, $));
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
    const { cursor, world } = this;
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
    const { world, prices } = this;
    const t = world.tick(tick);

    let newBuildings = 0;
    let didSpread = false;
    t.added.forEach(([i, tile]) => {
      switch (tile.name) {
        case "coin":
          this.add$(prices.coin);
          didSpread = true;
          break;
        case "concrete":
          this.add$(prices.concrete, i);
          break;
        case "building":
          this.add$(prices.building, i);
          newBuildings++;
          break;
        default:
      }
    });
    this.updatePricesAndSpeed(tick, t.remainingTrees, newBuildings, didSpread);
    this.renderTiles();
  }

  updatePricesAndSpeed(tick, remainingTrees, newBuildings, didSpread) {
    const { prices, world, dbg, flags, tick_length } = this;

    // Kick drum heartbeat
    if (newBuildings > 0) {
      resources.kick.sound.play();
      // Show "real estate" dialog for first building
      if (!flags.building.done) {
        this.addDialog(flags.building);
      }
    }

    // EKG machine and Drone
    const ekgStartTick = 40;
    const mod = tick_length <= 1.0 ? 4 : 8;
    if (!flags.game_over.done && tick > ekgStartTick && tick % mod == 0) {
      resources.pling.sound.play();
      if (!this.droneSFX) {
        const drone = resources.drone.sound;
        drone.volume = 0.2;
        drone.play({ loop: true });
        this.droneSFX = drone;
      }
    }

    if (!flags.init_spread.done) {
      if (didSpread) {
        this.addDialog(flags.init_spread);
      } else if (this.$ > 4) {
        // Helper coins if you didn't place any next to each other!
        world.spawnCoinsAtCell(8, 8);
      }
    }

    // Update $ earned per item
    let multiplier = 1;
    if (this.$ > 1000) {
      multiplier = Math.min(1.1, 1 + tick / 1500);
      prices.concrete = Math.round(prices.concrete * multiplier);
      prices.building = Math.round(prices.building * multiplier);

      // TODO: don't increase until after spreading (or when not spreading)
      if (this.tick_length <= 2) {
        const speed = this.tick_length > 1 ? 0.08 : 0.005;
        this.tick_length = Math.max(0.1, this.tick_length - speed);
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
      flags.game_over.done = true;
      this.gameOverUI.visible = true;
      this.droneSFX.volume = 0.1;
    }

    dbg.text =
      tick +
      " " +
      (percComplete * 100).toFixed(0) +
      "% t:" +
      remainingTrees +
      " b:" +
      newBuildings;
  }

  update(time) {
    const { actions, flags, dialogs, entities, axe } = this;

    // Determine tick
    if (time > (this.tick_num + 1) * this.tick_length) {
      // A fix for changing tick_length lower and ticking mulitple times quickly
      if (time - this.last_tick_time >= this.tick_length) {
        this.last_tick_time = time;
        this.tick(++this.tick_num);
      }
    }

    // Pan on start
    if (time < 4) {
      let o = (4 - time) * 10;
      o = o * o;
      this.camera.left = o;
      this.camera.top = o;
      return;
    }

    // Update one-ups
    entities.children.forEach(e => e.update(time));

    // TODO: Convert these "action" data to real command pattern
    if (actions.length) {
      const a = actions[0];
      if (!a.started) {
        if (!flags.first_chop.done) {
          this.addDialog(flags.first_chop);
        } else if (!flags.second_chop.done) {
          this.addDialog(flags.second_chop);
        }
        axe.visible = true;
        a.doneAt = Date.now() + a.chopTime;

        // Only do chop sounds before 100000 - distracts from "heartbeat" effect
        if (this.$ < 10000) {
          this.chopWoodSFX();
        }

        axe.x = a.x * size - 10;
        axe.y = a.y * size;
        a.started = true;
      }

      if (Date.now() > a.doneAt) {
        if (!flags.first_chop_done.done) {
          this.addDialog(flags.first_chop_done);
        }
        a.tile.type = Tiles.coin.id;

        this.add$(this.prices.coin, a.x * size + 16, a.y * size);
        actions.shift();
        axe.visible = false;
        this.renderTiles();
      }
    }

    if (dialogs.length) {
      const { flag, time } = dialogs[0];
      if (Date.now() >= time) {
        dialogs.shift();
        this.dialog.show(flag.msg);
        flag.done = true;

        // TODO: using msgs to trigger game logic: fix it!
        if (flag.nextMsg) {
          if (flag.nextMsg == "second_spread") {
            this.tick_length = 3;
          }
          if (flag.nextMsg == "third_spread") {
            this.tick_length = 2;
          }
        }
      }
    }

    this.swingAxe(time);
  }

  swingAxe(time) {
    const { axe } = this;
    if (!axe.visible) return;
    axe.rotation = Math.abs(Math.sin(time * 5));
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
