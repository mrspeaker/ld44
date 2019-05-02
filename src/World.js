import { Tiles, TilesById, size } from "./tiles.js";

class World {
  constructor(tx, ty, treePerc) {
    this.tx = tx;
    this.ty = ty;
    this.startTrees = (tx * tx * treePerc) | 0;
    this.cells = this.gen(tx, ty, this.startTrees);
  }

  gen(tx, ty, trees) {
    const cells = [...Array(tx * ty)].map((_, i) => {
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
      if (cells[ti].type == Tiles.grass.id) {
        cells[ti].type = Tiles.tree.id;
        trees--;
      }
    }

    return cells;
  }

  getNeighbours(idx, ns) {
    ns.length = 0;
    const { tx, ty, cells } = this;
    const x = idx % tx;
    const y = (idx / tx) | 0;

    for (let j = -1; j < 2; j++) {
      for (let i = -1; i < 2; i++) {
        if (x + i < 0 || x + i > tx - 1 || y + j < 0 || y + j > ty - 1) {
          ns.push(null);
        } else if (j == 0 && i == 0) {
          ns.push(null);
        } else {
          ns.push(cells[(y + j) * tx + (x + i)]);
        }
      }
    }
    return ns;
  }

  spawnCoinsAtIdx(idx) {
    const { cells } = this;
    // Force a spread
    cells[505].type = Tiles.coin.id;
    cells[506].type = Tiles.coin.id;
    cells[606].type = Tiles.coin.id;
  }

  getCellAtXY(x, y) {
    const { cells } = this;
    return cells[this.getIdxAtXY(x, y)];
  }

  getIdxAtXY(x, y) {
    const { tx } = this;
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    return yo * tx + xo;
  }

  getCellIndices(x, y) {
    const xo = (x / size) | 0;
    const yo = (y / size) | 0;
    return { xo, yo };
  }
}

export default World;
