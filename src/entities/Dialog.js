import PIXI from "../../lib/pixi.js";

const { resources } = PIXI.loader;

class Dialog extends PIXI.Container {
  constructor() {
    super();
    const g = new PIXI.Graphics();
    g.lineStyle(2, 0x00000, 1);
    g.beginFill(0x111115, 0.7);
    g.drawRoundedRect(0, 0, 500, 40, 8);
    g.endFill();

    this.addChild(g);

    var style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 16,
      fill: "#ffffff"
    });

    var text = new PIXI.Text("", style);
    text.anchor.set(0.5);
    text.x = 250;
    text.y = 20;
    this.addChild(text);
    this.text = text;

    this.visible = false;
  }
  show(text) {
    this.text.text = text;
    this.visible = !!text;
    if (this.visible) {
      resources.dialogbeep.sound.play();
    }
  }
}

export default Dialog;
