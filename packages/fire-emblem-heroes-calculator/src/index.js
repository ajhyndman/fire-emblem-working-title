// @flow

export {
  calculateResult,
} from './damageCalculation';

export {
  getCurrentHp,
  getDefaultSkills,
  getInheritableSkills,
  getStat,
  updateRarity,
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
  getSpecialCooldown,
  isMaxTier,
} from './skillHelpers';
