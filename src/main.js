import PIXI from "../lib/pixi.js";

import Game from "./Game.js";

const app = new PIXI.Application({
  width: 1000,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1
});

// create viewport
var viewport = new PIXI.extras.Viewport({
  screenWidth: 1000,
  screenHeight: 600,
  worldWidth: 2000,
  worldHeight: 1000,
  interaction: app.renderer.plugins.interaction
});

// add the viewport to the stage
app.stage.addChild(viewport);
viewport
  .drag()
  .pinch()
  .wheel()
  .decelerate()
  .on("click", (...args) => console.log(args));

document.body.appendChild(app.view);

PIXI.loader.add("sprites", "res/sprites.json").load((loader, resources) => {
  const game = new Game(viewport);
  app.stage.addChild(game.camera);
  app.ticker.add(game.update);
});
