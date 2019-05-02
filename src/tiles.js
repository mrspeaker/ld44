export const Tiles = {
  grass: { sheet: "x0y0", base: true },
  coin: { sheet: "x1y0" },
  tree: { sheet: "x2y0", yo: -0.3 },
  concrete: { sheet: "x3y0", base: true },
  skull: { sheet: "x3y1", yo: -0.3 },
  bedrock: { sheet: "x1y2", base: false, noRule: true },
  building: { sheet: "x4y0", sheetAlt: "x5y0", base: true, noRule: true }
};

export const TilesById = Object.entries(Tiles).reduce((ac, [k, v], i) => {
  v.id = i;
  ac[v.id] = v;
  ac[v.id].name = k;
  return ac;
}, {});

export const size = 32;
