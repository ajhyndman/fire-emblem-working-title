// @flow
// eslint
import {
  clamp,
  compose,
  equals,
  filter,
  join,
  map,
  test,
  toPairs,
} from 'ramda';

import { getDefaultSkills, getInheritableSkills } from './heroHelpers';


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

export type InstanceState = {
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
  +state: InstanceState;
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

const getDefaultState = (): InstanceState => ({
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
const humanizeSkillKey = (skillKey: $Keys<InstanceSkills>): string => {
  switch (skillKey) {
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

// eslint-disable-next-line no-undef
const sanitizeSkillKey = (skillKey: ?string): ?$Keys<InstanceSkills> => {
  switch (skillKey) {
    case 'Weapon':
      return 'WEAPON';
    case 'Assist':
      return 'ASSIST';
    case 'Special':
      return 'SPECIAL';
    case 'A':
      return 'PASSIVE_A';
    case 'B':
      return 'PASSIVE_B';
    case 'C':
      return 'PASSIVE_C';
    case 'S':
      return 'SEAL';
    default:
      return undefined;
  }
};

const sanitizeStatKey = (statKey: ?string): ?Stat => {
  switch (statKey) {
    case 'hp':
    case 'atk':
    case 'spd':
    case 'def':
    case 'res':
      return statKey;
    default:
      return undefined;
  }
};

export const exportInstance = (heroInstance: HeroInstance): string => {
  // $FlowIssue: flow always gets lost in compose chains
  const skillList = compose(
    join('\n'),
    map(([slot, skillName]) => `${humanizeSkillKey(slot)}: ${skillName}`),
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

export const importInstance = (text: string): HeroInstance => {
  // Lines that do not match one of these regular expressions will be ignored.
  const titleRegex = /^(.*) \((\d)★\+?(\d+)?(?: \+)?([a-z]+)?(?: \-)?([a-z]+)?\)\s*/;
  const skillRegex = /^(Weapon|Assist|Special|A|B|C|S): (.*?)\s*$/;
  const buffRegex = /^Buffs:\s*(.*?)\s*$/;
  const debuffRegex = /^Debuffs:\s*(.*?)\s*$/;
  const damageRegex = /^Damage:\s*(\d*)\s*$/;
  const chargeRegex = /^Charge:\s*(\d*)\s*$/;

  // Initialize components of the hero instance we will build up.
  let name = 'Anna';
  let rarity = 0;
  let mergeLevel = 0;
  let boon = undefined;
  let bane = undefined;
  const skills: InstanceSkills = {
    WEAPON: undefined,
    ASSIST: undefined,
    SPECIAL: undefined,
    PASSIVE_A: undefined,
    PASSIVE_B: undefined,
    PASSIVE_C: undefined,
    SEAL: undefined,
  };
  const state: InstanceState = getDefaultState();

  // Split the input text into lines.
  const lines = text.split(/\n|;/);

  // Attempt to parse each line.
  for (let line of lines) {
    // If a line matches one of our regular expressions, apply it to the instance.
    // Otherwise, ignore it.
    if (test(titleRegex, line)) {
      // e.g. "Anna (4★+8 +atk -def)"

      [, name, rarity, mergeLevel, boon, bane] = line.match(titleRegex);
    } else if (test(skillRegex, line)) {
      // e.g. "Weapon: Silver Axe"

      const [, skillKey, skillName] = line.match(skillRegex);
      if (
        sanitizeSkillKey(skillKey)
        // $FlowIssue: Flow is worried about side effects here (but there aren't any)
        && getInheritableSkills(name, sanitizeSkillKey(skillKey)).indexOf(skillName) >= 0
      ) {
        // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
        skills[sanitizeSkillKey(skillKey)] = skillName;
      }
    } else if (test(buffRegex, line)) {
      // e.g. "Buffs: atk 4, spd 4, def 8"

      const [, buffList] = line.match(buffRegex);
      const buffs = buffList.split(/,\s*/);
      buffs.forEach(buff => {
        const [statKey, value] = buff.split(' ');
        if (sanitizeStatKey(statKey)) {
          // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
          state.buffs[sanitizeStatKey(statKey)] = parseInt(value) || 0;
        }
      });
    } else if (test(debuffRegex, line)) {
      // e.g. Debuffs: atk -3, spd -3, res -3

      const [, debuffList] = line.match(debuffRegex);
      const debuffs = debuffList.split(/,\s*/);
      debuffs.forEach(buff => {
        const [statKey, value] = buff.split(' ');
        if (sanitizeStatKey(statKey)) {
          // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
          state.debuffs[sanitizeStatKey(statKey)] = Math.abs(parseInt(value));
        }
      });
    } else if (test(damageRegex, line)) {
      // e.g. "Damage: 5"

      const [, value] = line.match(damageRegex);
      // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
      state.hpMissing = Math.max(0, parseInt(value));
    } else if (test(chargeRegex, line)) {
      // e.g. "Charge: 1"

      const [, value] = line.match(chargeRegex);
      // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
      state.specialCharge = Math.max(0, parseInt(value));
    }
  }

  // $FlowIssue: Flow can't do the math to see that this is satisfied
  rarity = (clamp(1, 5, parseInt(rarity)): Rarity);
  // $FlowIssue: Flow can't do the math to see that this is satisfied
  mergeLevel = (clamp(0, 10, parseInt(mergeLevel) || 0): MergeLevel);

  bane = sanitizeStatKey(bane);
  boon = sanitizeStatKey(boon);

  return {
    name,
    rarity,
    mergeLevel,
    boon,
    bane,
    skills,
    state,
  };
};
