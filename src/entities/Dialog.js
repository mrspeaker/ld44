import PIXI from "../../lib/pixi.js";

class Dialog extends PIXI.Container {
  constructor(ui) {
    super();
    const g = new PIXI.Graphics();
    // draw a rounded rectangle
    g.lineStyle(2, 0x00000, 1);
    g.beginFill(0x111115, 0.7);
    g.drawRoundedRect(0, 0, 500, 40, 8);
    g.endFill();

    this.addChild(g);

    var style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 16,
      fill: "#ffffff"
      //wordWrap: true,
      //wordWrapWidth: 200
    });

    var text = new PIXI.Text("", style);
    //text.anchor.set(0.5);
    text.x = 10;
    text.y = 12;
    this.addChild(text);
    this.text = text;

    ui.addChild(this);
    this.visible = false;
  }
  show(text) {
    this.text.text = text;
    this.visible = !!text;
  }
}

export default Dialog;
