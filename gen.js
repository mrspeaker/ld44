/* 
   Genearte a sprite atlas for Pixi.js.

I can't see how to do this without a json file, so I'm just generating a regular 
rectangular sprite sheet!


   `node gen.js`

Outputs `res/sprite.json`

*/

const fs = require("fs");

const xt = 8;
const yt = 8;

const one = 32;
const two = one * 2;
const three = one * 3;

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
  console.log("atlas generated", xt * one, yt * one);
});
