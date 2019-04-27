import PIXI from "../../lib/pixi.js";
import Logo from "../entities/Logo.js";

const { resources } = PIXI.loader;

class LogoScene extends PIXI.Container {
  constructor(bounds) {
    super();
    const logo = new Logo();
    logo.x = 170; // app.renderer.width / 2;
    logo.y = 150; // app.renderer.height / 2;
    logo.anchor.x = 0.5;
    logo.anchor.y = 0.5;

    const tilemap = new PIXI.tilemap.CompositeRectTileLayer(
      0,
      [resources.atlas_image.texture],
      true
    );
    this.addChild(tilemap);

    this.buildTilemap(tilemap, 1);

    this.addChild(logo);
  }

  buildTilemap(tilemap, frame) {
    tilemap.clear();

    var size = 32;
    // if you are too lazy, just specify filename and pixi will find it in cache
    for (var i = 0; i < 30; i++)
      for (var j = 0; j < 9; j++) {
        tilemap.addFrame("grass.png", i * size, j * size);
        if (i % 2 == 1 && j % 2 == 1)
          tilemap.addFrame("tough.png", i * size, j * size);
      }

    // if you are lawful citizen, please use textures from
    const textures = resources.atlas.textures;
    tilemap.addFrame(textures["brick.png"], 2 * size, 2 * size);
    tilemap.addFrame(textures["brick_wall.png"], 2 * size, 3 * size);

    tilemap.addFrame(
      textures[frame % 2 == 0 ? "chest.png" : "red_chest.png"],
      4 * size,
      4 * size
    );
  }
}

export default LogoScene;
