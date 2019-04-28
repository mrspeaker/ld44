import PIXI from "../lib/pixi.js";

import Game from "./Game.js";

const app = new PIXI.Application({
  width: 1000,
  height: 600,
  backgroundColor: 0x101017,
  resolution: window.devicePixelRatio || 1
});

document.querySelector("#container").appendChild(app.view);

PIXI.loader.add("sprites", "res/sprites.json").load((loader, resources) => {
  const game = new Game(app);
  app.stage.addChild(game.camera);
  app.ticker.add(game.update);
});
