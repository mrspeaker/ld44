/* 
   Generate a sprite atlas for Pixi.js.

Turns the `areas` defined below into json `frames` that can be read by Pixi.js.
The game uses 1x1 tiles and 2x2 tiles (so far) - different areas can be defined
for different sizes. When I wrote this comment there were two areas, the first
was 1x1 tiles in the first 4 columns and 8 rows. Then 2x2 tiles for 2 columns, 4 rows.

   `node gen.js`

Outputs `res/sprite.json`

*/
const fs = require("fs");

const xt = 8;
const yt = 8;

const one = 32;
const two = one * 2;

const pw = xt * one;
const ph = yt * one;

const areas = [
  { x: 0, y: 0, w: one, h: one, tw: 4, th: 8 },
  { x: 4 * one, y: 0, w: two, h: two, tw: 2, th: 4 }
];

const json = {
  frames: {},
  meta: {
    version: "1.0",
    image: "sprites.png",
    size: { w: pw, h: ph },
    scale: "1"
  }
};

areas.forEach(({ x, y, w, h, tw, th }) => {
  for (let j = 0; j < th; j++) {
    for (let i = 0; i < tw; i++) {
      // the `ph - h` is because inkscape calls the bottom left (0,0).
      json.frames[`x${x / one + i}y${y / one + j}`] = {
        frame: { x: x + w * i, y: ph - h - (y + h * j), w, h },
        pivot: { x: 0, y: 0 }
      };
    }
  }
});

fs.writeFile("res/sprites.json", JSON.stringify(json, null, 2), err => {
  if (err) {
    return console.log(err);
  }
  console.log(JSON.stringify(json, null, 2));
  console.log("atlas generated");
});
