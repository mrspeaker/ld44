import PIXI from "../lib/pixi.js";
import Logo from "./Logo.js";
import Camera from "./Camera.js";

const app = new PIXI.Application();
document.body.appendChild(app.view);

PIXI.Loader.shared.load((loader, resources) => {
  const camera = new Camera();
  app.stage.addChild(camera);

  const sprite = new Logo();
  sprite.x = app.renderer.width / 2;
  sprite.y = app.renderer.height / 2;
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;
  camera.addChild(sprite);

  app.ticker.add(() => {});
});
