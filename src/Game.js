import Camera from "./Camera.js";
import WorldScene from "./scenes/WorldScene.js";
import LogoScene from "./scenes/LogoScene.js";

class Game {
  constructor(app) {
    this.time = 0;
    this.tick = 0;
    this.tick_length = 4;
    this.last_tick_time = 0;
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
    if (this.time > (this.tick + 1) * this.tick_length) {
      if (this.time - this.last_tick_time >= this.tick_length) {
        this.last_tick_time = this.time;
        this.scene.tick(++this.tick);

        const mod = this.tick_length <= 1.0 ? 4 : 8;
        //x        this.scene.dgb.text = this.tick_length;
        if (!this.gameover && this.tick > 40 && this.tick % mod == 0) {
          PIXI.loader.resources.pling.sound.play();
          if (!this.drone) {
            const drone = PIXI.loader.resources.drone.sound;
            drone.volume = 0.2;
            drone.play({ loop: true });
            this.drone = drone;
          }
        }
      }
    }
    this.scene.update(this.time);
  }
}

export default Game;
