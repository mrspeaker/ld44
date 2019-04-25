import PIXI from "../lib/pixi.js";
import Game from "./Game.js";

const app = new PIXI.Application({
  width: 800,
  height: 300,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1
});
document.body.appendChild(app.view);

PIXI.Loader.shared.load((loader, resources) => {
  const game = new Game();
  app.stage.addChild(game.camera);
  app.ticker.add(game.update);
});
