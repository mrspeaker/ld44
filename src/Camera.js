import PIXI from "../lib/pixi.js";

class Camera extends PIXI.extras.Viewport {
  constructor(app, onPointerClicked, onMouseMoved) {
    super({
      screenWidth: 1000,
      screenHeight: 600,
      worldWidth: 100 * 32,
      worldHeight: 100 * 32,
      interaction: app.renderer.plugins.interaction
    });

    this.drag()
      //.pinch()
      .wheel()
      .decelerate()
      .clamp({
        direction: "all"
      })
      .clampZoom({ maxWidth: 1500, minWidth: 1000 })

      .on("drag-start", () => (this.isDrag = true))
      .on("drag-end", () => (this.isDrag = false))
      .on("click", e => {
        const isShift = e.data.originalEvent.shiftKey;
        const p = e.data.global;
        const w = this.toWorld(p.x, p.y);
        if (!this.isDrag) onPointerClicked(w.x, w.y, isShift);
      })
      .on("mousemove", e => {
        const p = e.data.global;
        const w = this.toWorld(p.x, p.y);
        onMouseMoved && onMouseMoved(w.x, w.y);
      });
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
