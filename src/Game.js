import Camera from "./Camera.js";
import LogoScene from "./scenes/LogoScene.js";

class Game {
  constructor(app) {
    this.time = 0;
    this.camera = new Camera();
    this.scene = new LogoScene();
    this.update = this.update.bind(this);
  }
  set scene(scene) {
    if (this._scene) {
      this.camera.removeChild(this._scene);
    }
    this._scene = scene;
    this.camera.addChild(scene);
  }
  update(dt) {
    this.time += dt;
  }
}

export default Game;
