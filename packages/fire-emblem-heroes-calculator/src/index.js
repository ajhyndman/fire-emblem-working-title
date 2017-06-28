// @flow

export {
  calculateResult,
} from './damageCalculation';

export {
  getCurrentHp,
  getDefaultSkills,
  getHeroesWithSkill,
  getInheritableSkills,
  getStat,
  updateRarity,
} from './heroHelpers';

export {
  exportInstance,
  getDefaultInstance,
  importInstance,
} from './heroInstance';

export type {
  HeroInstance,
  InstanceSkills,
  MergeLevel,
  Rarity,
  Stat,
} from './heroInstance';

export {
  getSpecialCooldown,
  isMaxTier,
} from './skillHelpers';
