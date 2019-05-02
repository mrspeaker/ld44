import PIXI from "../../lib/pixi.js";
import { size } from "../tiles.js";

class Axe extends PIXI.Sprite {
  constructor() {
    super(PIXI.loader.resources.sprites.textures.x2y2);
    this.pivot.x = size * 0.3;
    this.pivot.y = size * 0.95;
  }
}

export default Axe;
