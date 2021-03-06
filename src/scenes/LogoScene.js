import PIXI from "../../lib/pixi.js";
import Logo from "../entities/Logo.js";

const { resources } = PIXI.loader;

class LogoScene extends PIXI.Container {
  constructor(camera, onDone) {
    super();
    camera.worldWidth = camera.screenWidth;
    camera.worldHeight = camera.screenHeight;

    const logo = new Logo();
    logo.x = 500;
    logo.y = 300;
    logo.anchor.x = 0.5;
    logo.anchor.y = 0.5;
    this.onDone = onDone;
    this.addChild(logo);

    resources.logosfx.sound.play();
  }

  update(t) {
    if (t > 1.5) this.onDone();
  }
}

export default LogoScene;
