import PIXI from "../../lib/pixi.js";

class OneUp extends PIXI.Text {
  constructor(x, y, num = 1) {
    const style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 10,
      fill: "#ffffff",
      stroke: "#4a1850",
      strokeThickness: 1
    });

    super(`$${num}`, style);
    this.anchor.set(0.5);
    this.x = x;
    this.y = y;
    this.ticks = 100;
    this.speed = Math.random();
  }

  update() {
    // move up, fade out
    this.y -= this.speed;
    const a = this.ticks / 100;
    this.alpha = a * a;
    if (this.ticks-- <= 0) {
      this.parent.removeChild(this);
    }
  }
}

export default OneUp;
