// @flow
import { getDefaultSkills } from './heroHelpers';


export type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';
export type Rarity = 1 | 2 | 3 | 4 | 5;
export type MergeLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type InstanceSkills = {
  +WEAPON: string | void;
  +ASSIST: string | void;
  +SPECIAL: string | void;
  +PASSIVE_A: string | void;
  +PASSIVE_B: string | void;
  +PASSIVE_C: string | void;
  +SEAL: string | void;
};

export type Buffs = {
  // HP cannot be buffed. It is in the buffs object for convenience.
  +hp: number;
  +atk: number;
  +spd: number;
  +def: number;
  +res: number;
};

export type HeroInstance = {
  // custom: false,
  +name: string;
  +rarity: Rarity;
  +boon: ?Stat;
  +bane: ?Stat;
  +mergeLevel: MergeLevel;
  +skills: InstanceSkills;
  +state: {
    +hpMissing: number;
    +specialCharge: number;
    +buffs: Buffs;
    +debuffs: Buffs;
  }
};

export type Context = {
  +isAttacker: boolean;
  +enemy: HeroInstance;
  +allies: Array<HeroInstance>;
  +otherEnemies: Array<HeroInstance>;
};

// NOT USED YET: Just conjecture for potential future support of
// user custom unit creation.

// export type CustomHero = {
//   custom: true,
//   weaponType: WeaponType,
//   moveType: MoveType,
//   name: string;
//   hp: number;
//   atk: number;
//   spd: number;
//   def: number;
//   res: number;
//   weapon: WeaponSkill;
//   assist: AssistSkill;
//   special: SpecialSkill;
//   passiveA: PassiveSkill;
//   passiveB: PassiveSkill;
//   passiveC: PassiveSkill;
// };

export const getDefaultBuffs = (): Buffs => ({
  hp: 0,
  atk: 0,
  spd: 0,
  def: 0,
  res: 0,
});

// Returns a context from the perspective of the enemy.
export const invertContext = (hero: HeroInstance, context: Context): Context => ({
  enemy: hero,
  allies: context.otherEnemies,
  otherEnemies: context.allies,
  isAttacker: !context.isAttacker,
});

export const getDefaultInstance = (name: string, rarity: Rarity = 5): HeroInstance => ({
  name: name,
  bane: undefined,
  boon: undefined,
  rarity: rarity,
  mergeLevel: 0,
  skills: getDefaultSkills(name, rarity),
  state: {
    hpMissing: 0,
    specialCharge: 0,
    buffs: getDefaultBuffs(),
    debuffs: getDefaultBuffs(),
  },
});
