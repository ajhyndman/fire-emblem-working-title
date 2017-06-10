// @flow
// eslint
import {
  compose,
  equals,
  filter,
  join,
  map,
  toPairs,
} from 'ramda';

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

export type State = {
  +hpMissing: number;
  +specialCharge: number;
  +buffs: Buffs;
  +debuffs: Buffs;
};

export type HeroInstance = {
  // custom: false,
  +name: string;
  +rarity: Rarity;
  +boon: ?Stat;
  +bane: ?Stat;
  +mergeLevel: MergeLevel;
  +skills: InstanceSkills;
  +state: State;
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

const getDefaultState = (): State => ({
  hpMissing: 0,
  specialCharge: 0,
  buffs: getDefaultBuffs(),
  debuffs: getDefaultBuffs(),
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
  state: getDefaultState(),
});

// eslint-disable-next-line no-undef
const humanizeSkillSlot = (slot: $Keys<InstanceSkills>): string => {
  switch (slot) {
    case 'WEAPON':
      return 'Weapon';
    case 'ASSIST':
      return 'Assist';
    case 'SPECIAL':
      return 'Special';
    case 'PASSIVE_A':
      return 'A';
    case 'PASSIVE_B':
      return 'B';
    case 'PASSIVE_C':
      return 'C';
    case 'SEAL':
      return 'S';
    default:
      return '';
  }
};

export const exportInstance = (heroInstance: HeroInstance): string => {
  // $FlowIssue: flow always gets lost in compose chains
  const skillList = compose(
    join('\n'),
    map(([slot, skillName]) => `${humanizeSkillSlot(slot)}: ${skillName}`),
    filter(([, skillName]) => skillName !== undefined),
    toPairs,
  )(heroInstance.skills);

  const buffList = equals(getDefaultBuffs(), heroInstance.state.buffs)
    ? ''
    : `Buffs: ${
      // $FlowIssue: flow always gets lost in compose chains
      compose(
        join(', '),
        map(([statKey, value]) => `${statKey} ${value}`),
        filter(([, value]) => value !== 0),
        toPairs,
      )(heroInstance.state.buffs)
    }\n`;

  const debuffList = equals(getDefaultBuffs(), heroInstance.state.buffs)
    ? ''
    : `Debuffs: ${
      // $FlowIssue: flow always gets lost in compose chains
      compose(
        join(', '),
        map(([statKey, value]) => `${statKey} -${value}`),
        filter(([, value]) => value !== 0),
        toPairs,
      )(heroInstance.state.debuffs)
    }\n`;

  const status = equals(getDefaultState(), heroInstance.state)
    ? ''
    : `:::Status\n${
      buffList
    }${
      debuffList
    }${
      heroInstance.state.hpMissing
        ? `Damage: ${heroInstance.state.hpMissing}\n`
        : ''
    }${
      heroInstance.state.specialCharge
        ? `Charge: ${heroInstance.state.specialCharge}\n`
        : ''
    }`;

  return `${heroInstance.name} (${heroInstance.rarity}★${
    heroInstance.mergeLevel ? `+${heroInstance.mergeLevel}` : ''
  }${
    heroInstance.boon ? ` +${heroInstance.boon}` : ''
  }${
    heroInstance.bane ? ` -${heroInstance.bane}` : ''
  })\n${
    skillList
  }\n${
    status
  }`;
};

// export const importInstance = (shareText: string): HeroInstance => {
// };
