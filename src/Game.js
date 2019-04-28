import Camera from "./Camera.js";
import WorldScene from "./scenes/WorldScene.js";

class Game {
  constructor(app) {
    this.time = 0;
    this.tick = 0;
    this.camera = new Camera(
      app,
      this.onClicked.bind(this),
      this.onMoved.bind(this)
    );
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
  onClicked(x, y, isShift) {
    const { scene } = this;
    scene && scene.onClicked && scene.onClicked(x, y, isShift);
  }
  onMoved(x, y) {
    const { scene } = this;
    scene && scene.onMoved && scene.onMoved(x, y);
  }
  update(dt) {
    this.time += dt * (1 / 60);
    const z = Math.sin(Date.now() / 1000) * 0.01;
    // this.camera.zoom(1 + z, 1 + z);
    if (this.time > (this.tick + 1) * 1) {
      this.scene.tick(++this.tick);
    }
    this.scene.update(this.time);
  }
}

export default Game;
