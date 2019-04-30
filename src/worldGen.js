import { Tiles, TilesById } from "./tiles.js";

const worldGen = (tx, ty, trees) => {
  const world = [...Array(tx * ty)].map((_, i) => {
    const x = i % tx;
    const y = (i / tx) | 0;
    let type = Tiles.grass.id;

    if (y == 0 || x == 0 || x == tx - 1 || y == ty - 1) {
      type = Tiles.bedrock.id;
    }
    return {
      type
    };
  });

  // Add in the trees
  while (trees > 0) {
    const ti = (Math.random() * tx * ty) | 0;
    if (world[ti].type == Tiles.grass.id) {
      world[ti].type = Tiles.tree.id;
      trees--;
    }
  }

  return world;
};

export default worldGen;
