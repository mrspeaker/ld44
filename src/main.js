import PIXI from "../lib/pixi.js";
import Game from "./Game.js";

PIXI.loader
  .add("sprites", "res/sprites.json")
  .add("chop", "res/audio/chop.mp3")
  .add("drone", "res/audio/drone.mp3")
  .add("logosfx", "res/audio/logo.mp3")
  .add("mouse", "res/audio/mouse.mp3")
  .add("dialogbeep", "res/audio/dialogbeep.mp3")
  .add("kick", "res/audio/kick.mp3")
  .add("pling", "res/audio/pling.mp3")
  .load((loader, resources) => {
    // Let's go!
    const game = new Game();
    addGameToDOM("#container", game.view);
  });

function addGameToDOM(parent, view) {
  const container = document.querySelector(parent);
  container.appendChild(view);

  // Handle full screen
  document.querySelector("#fs").addEventListener("click", () => {
    if (!document.fullscreen && !document.webkitFullScreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else {
        container.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.cancelFullscreen) {
        document.cancelFullscreen();
      } else {
        document.webkitCancelFullScreen();
      }
    }
  });
  // No right-click on game screen
  container.addEventListener("contextmenu", e => e.preventDefault());
}
