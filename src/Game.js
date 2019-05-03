import Camera from "./Camera.js";
import WorldScene from "./scenes/WorldScene.js";
import LogoScene from "./scenes/LogoScene.js";

class Game extends PIXI.Application {
  constructor() {
    super({
      width: 1000,
      height: 600,
      backgroundColor: 0x101017,
      resolution: window.devicePixelRatio || 1
    });

    this.time = 0;

    this.camera = new Camera(
      this,
      this.onClicked.bind(this),
      this.onMoved.bind(this)
    );
    this.ui = new PIXI.Container();

    this.stage.addChild(this.camera);
    this.stage.addChild(this.ui);
    this.ticker.add(this.update.bind(this));

    this.showLogoScreen();
  }
  showLogoScreen() {
    this.scene = new LogoScene(this.ui, () => {
      this.clearUI();
      this.scene = new WorldScene(this.ui, this.camera);
    });
  }
  clearUI() {
    const { ui } = this;
    while (ui.children[0]) {
      ui.removeChild(ui.children[0]);
    }
  }
  set scene(scene) {
    const { _scene, camera } = this;
    if (_scene) {
      camera.removeChild(_scene);
    }
    this._scene = scene;
    camera.addChild(scene);
  }
  get scene() {
    return this._scene;
  }
  onClicked(x, y, isShift) {
    const { scene } = this;
    scene.onClicked && scene.onClicked(x, y, isShift);
  }
  onMoved(x, y) {
    const { scene } = this;
    scene.onMoved && scene.onMoved(x, y);
  }
  update(dt) {
    this.time += dt * (1 / 60);
    this.scene.update(this.time);
  }
}

export default Game;
