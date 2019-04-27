import PIXI from "../../lib/pixi.js";
import Logo from "../entities/Logo.js";

class LogoScene extends PIXI.Container {
  constructor(bounds) {
    super();
    const logo = new Logo();
    logo.x = 170; // app.renderer.width / 2;
    logo.y = 150; // app.renderer.height / 2;
    logo.anchor.x = 0.5;
    logo.anchor.y = 0.5;

    this.addChild(logo);
  }
}

export default LogoScene;
