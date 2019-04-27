/* 
   Genearte a sprite atlas for Pixi.js.

I can't see how to do this without a json file, so I'm just generating a regular 
rectangular sprite sheet!


   `node gen.js`

Outputs `res/sprite.json`

*/

const fs = require("fs");

const xt = 4;
const yt = 4;
const size = 32;

const json = {
  frames: {},
  meta: {
    version: "1.0",
    image: "sprites.png",
    size: { w: xt * size, h: yt * size },
    scale: "1"
  }
};

for (let j = 0; j < yt; j++) {
  for (let i = 0; i < xt; i++) {
    json.frames[`x${i}y${j}`] = {
      frame: { x: i * size, y: (xt - j - 1) * size, w: size, h: size },
      pivot: { x: 0, y: 0 }
    };
  }
}

fs.writeFile("res/sprites.json", JSON.stringify(json, null, 2), err => {
  if (err) {
    return console.log(err);
  }

  console.log("atlas generated", xt * size, yt * size);
});
