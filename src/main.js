import PIXI from "../lib/pixi.js";

import Game from "./Game.js";

const app = new PIXI.Application({
  width: 1000,
  height: 600,
  backgroundColor: 0x101017,
  resolution: window.devicePixelRatio || 1
});

const container = document.querySelector("#container");
container.appendChild(app.view);

function toggleFullScreen() {
  if (!document.mozFullScreen && !document.webkitFullScreen) {
    if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else {
      container.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitCancelFullScreen();
    }
  }
}
document.querySelector("#fs").addEventListener("click", () => {
  toggleFullScreen();
});
document.addEventListener("contextmenu", e => e.preventDefault());

PIXI.loader
  .add("sprites", "res/sprites.json")
  .add("chop", "res/audio/chop.mp3")
  .add("logosfx", "res/audio/logo.mp3")
  .add("mouse", "res/audio/mouse.mp3")
  .add("dialogbeep", "res/audio/dialogbeep.mp3")
  .add("kick", "res/audio/kick.mp3")
  .add("pling", "res/audio/pling.mp3")
  .load((loader, resources) => {
    const game = new Game(app);
    app.stage.addChild(game.camera);
    app.stage.addChild(game.ui);
    app.ticker.add(game.update);
  });
