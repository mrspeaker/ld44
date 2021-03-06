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

  tick() {
    const { cells } = this;
    let remainingTrees = 0;

    const addInPlace = []; // Added this tick (in place)
    const addAfterTick = []; // To be added after tick (so not double-processed)
    const ns = []; // tmp array for neighbours

    cells.forEach((t, i) => {
      if (t.hide || TilesById[t.type].noRule) {
        return;
      }

      // Dead trees become grass randomly (otherwise don't need processing)
      if (t.type === Tiles.skull.id) {
        if (Math.random() < 0.05) {
          t.type = Tiles.grass.id;
        }
        return;
      }

      this.getNeighbours(i, ns);
      const n = ns.reduce(
        (ac, el) => {
          // NOTE: counts are "unraveled" into specific types for perf.
          if (!el || el.type === Tiles.bedrock.id) {
            ac.concrete++;
            return ac;
          }
          if (el.type === Tiles.coin.id) ac.coin++;
          if (el.type === Tiles.grass.id) ac.grass++;
          if (el.type === Tiles.tree.id) ac.tree++;
          if (el.type === Tiles.concrete.id) ac.concrete++;
          if (el.type === Tiles.building.id) ac.building++;
          return ac;
        },
        { coin: 0, grass: 0, tree: 0, concrete: 0, building: 0 }
      );

      const crapThings = n.coin + n.concrete + n.building;

      // Cellular automata rules
      switch (t.type) {
        case Tiles.grass.id:
          if (n.coin >= 2 || crapThings > 7) {
            addAfterTick.push([i, Tiles.coin]);
          }
          break;

        case Tiles.tree.id:
          if (n.coin > 0 && n.grass === 0) {
            // Starved, so die
            addAfterTick.push([i, Tiles.skull]);
          } else {
            remainingTrees++;
          }
          break;

        case Tiles.coin.id:
          if (crapThings >= 8) {
            addAfterTick.push([i, Tiles.concrete]);
          }
          if (n.tree > 0) {
            // "Magic flip" to kill some trees randomly - stops pockets of green!
            if (Math.random() < 0.005) {
              ns.find(n => n && n.type === Tiles.tree.id).type = Tiles.skull.id;
            }
          }
          break;

        case Tiles.concrete.id:
          if (n.concrete > 3) {
            // Check if 4 tiles are concrete: convert to building
            const c = Tiles.concrete.id;
            const sq = [5, 7, 8];
            if (
              sq.every(ni => {
                const n = ns[ni];
                return n && n.type == c && !n.hide;
              })
            ) {
              // Set building directly (so other cells won't also build here)
              t.type = Tiles.building.id;
              t.frame =
                Math.random() < 0.7
                  ? Tiles.building.sheet
                  : Tiles.building.sheetAlt;
              sq.forEach(ni => (ns[ni].hide = true));
              addInPlace.push([i, Tiles.building]);
            }
          }
          break;
      }
    });

    // Make changes AFTER initial pass over tiles
    addAfterTick.forEach(([i, type]) => {
      const tile = cells[i];
      tile.type = type.id;
    });

    return {
      remainingTrees,
      added: [...addAfterTick, ...addInPlace]
    };
  }

  spawnCoinsAtCell(x, y) {
    const { cells, tx } = this;
    // Force a spread
    const idx = this.getIdxAtXY(x * size, y * size);
    cells[idx].type = Tiles.coin.id;
    cells[idx + 1].type = Tiles.coin.id;
    cells[idx + tx].type = Tiles.coin.id;
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
