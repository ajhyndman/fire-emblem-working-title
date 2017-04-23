// @flow

export {
  calculateResult,
} from './damageCalculation';

export {
  // canInherit,
  getDefaultSkills,
  getInheritableSkills,
  getStat,
  hasStatsForRarity,
  lookupStats,
  updateRarity,
} from './heroHelpers';

export type {
  HeroesByName,
} from './heroHelpers';

export {
  getDefaultInstance,
} from './heroInstance';

export type {
  HeroInstance,
  InstanceSkills,
  MergeLevel,
  Rarity,
  Stat,
} from './heroInstance';

export {
  getSkillInfo,
  getSpecialCooldown,
  isMaxTier,
} from './skillHelpers';

export type {
  SkillsByName,
} from './skillHelpers';
