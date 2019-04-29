import PIXI from "../../lib/pixi.js";

PIXI.loader.add("logo", "res/mrspeaker.net.png");

class Logo extends PIXI.Sprite {
  constructor() {
    super(PIXI.utils.TextureCache["logo"]);
  }
}

export default Logo;
