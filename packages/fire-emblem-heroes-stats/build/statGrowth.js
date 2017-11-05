/**
 * A table of actual stat growth with respect to growth points for each rarity.
 *
 * e.g. Neutral Jagen has 5 Atk growth points.
 * The difference between a 4 star Jagen's Atk at level 1 and level 40 would be
 * growthPoints[4][5] // === 18
 */
const growthPointTable = {
  1: [6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26],
  2: [7, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 26, 28],
  3: [7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33],
  4: [8, 10, 12, 14, 16, 18, 21, 22, 24, 26, 28, 31, 33, 35],
  5: [8, 10, 13, 15, 17, 19, 22, 24, 26, 28, 30, 33, 35, 37],
};

export const baseStatToMaxStat = (rarity, baseStat, growthPoints) =>
  baseStat + growthPointTable[rarity][growthPoints];
