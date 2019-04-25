import PIXI from "../lib/pixi.js";

class Camera extends PIXI.Container {
  constructor() {
    super();
  }
  zoomIn(x, y) {
    this.scale.x += x;
    this.scale.y += y;
  }
  zoomOut(x, y) {
    this.scale.x -= x;
    this.scale.y -= y;
  }
  zoom(x, y) {
    this.scale.x = x;
    this.scale.y = y;
  }
  pan(x, y) {
    this.x -= x;
    this.y -= y;
  }
}

export default Camera;
