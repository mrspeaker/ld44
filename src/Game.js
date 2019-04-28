import Camera from "./Camera.js";
import WorldScene from "./scenes/WorldScene.js";

class Game {
  constructor(app) {
    this.time = 0;
    this.tick = 0;
    this.camera = new Camera(app, this.onTileClicked.bind(this)); //viewport; //new Camera();
    this.scene = new WorldScene();
    this.update = this.update.bind(this);
  }
  set scene(scene) {
    if (this._scene) {
      this.camera.removeChild(this._scene);
    }
    this._scene = scene;
    this.camera.addChild(scene);
  }
  get scene() {
    return this._scene;
  }
  onTileClicked(x, y) {
    if (this._scene) {
      this._scene.onClick(x, y);
    }
  }
  update(dt) {
    this.time += dt * (1 / 60);
    const z = Math.sin(Date.now() / 1000) * 0.01;
    // this.camera.zoom(1 + z, 1 + z);
    if (this.time > (this.tick + 1) * 1) {
      this.scene.tick(++this.tick);
    }
  }
}

export default Game;
