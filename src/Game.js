import Camera from "./Camera.js";
import WorldScene from "./scenes/WorldScene.js";
import LogoScene from "./scenes/LogoScene.js";

class Game {
  constructor(app) {
    this.time = 0;

    // TODO: camera should only be in WorldScene
    this.camera = new Camera(
      app,
      this.onClicked.bind(this),
      this.onMoved.bind(this)
    );
    this.ui = new PIXI.Container();

    this.scene = new LogoScene(() => {
      this.scene = new WorldScene({}, this.ui, this);
    });
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
    this.scene.update(this.time);
  }
}

export default Game;
