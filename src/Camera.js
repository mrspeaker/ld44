import PIXI from "../lib/pixi.js";

class Camera extends PIXI.extras.Viewport {
  constructor(app, onPointerClicked, onMouseMoved) {
    super({
      screenWidth: app.renderer.width,
      screenHeight: app.renderer.height,
      interaction: app.renderer.plugins.interaction
    });

    this.drag()
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
}

export default Camera;
