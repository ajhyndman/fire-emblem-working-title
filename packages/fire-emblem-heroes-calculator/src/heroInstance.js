// @flow
// eslint
import diacritics from 'diacritics';
import {
  clamp,
  compose,
  equals,
  filter,
  findIndex,
  indexOf,
  invertObj,
  join,
  keys,
  map,
  match,
  sort,
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

const SKILL_KEY_MAP = {
  WEAPON: 'Weapon',
  ASSIST: 'Assist',
  SPECIAL: 'Special',
  PASSIVE_A: 'A',
  PASSIVE_B: 'B',
  PASSIVE_C: 'C',
  SEAL: 'S',
};

const findObjectIndex = (key, obj) => findIndex(equals(key), keys(obj));

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
  if (SKILL_KEY_MAP.hasOwnProperty(skillKey)) {
    return SKILL_KEY_MAP[skillKey];
  }
  return '';
};

// eslint-disable-next-line no-undef
const sanitizeSkillKey = (skillKey: ?string): ?$Keys<InstanceSkills> => {
  const map = invertObj(SKILL_KEY_MAP);
  if (map.hasOwnProperty(skillKey)) {
    return map[skillKey];
  }
  return undefined;
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
  const skillList = compose(
    join('\r\n'),
    map(([slot, skillName]) => `${humanizeSkillKey(slot)}: ${skillName}`),
    sort(([a], [b]) =>
      findObjectIndex(a, SKILL_KEY_MAP) - findObjectIndex(b, SKILL_KEY_MAP)),
    filter(([, skillName]) => skillName !== undefined),
    toPairs,
  )(heroInstance.skills);

  const buffList = equals(getDefaultBuffs(), heroInstance.state.buffs)
    ? ''
    : `Buffs: ${
      compose(
        join(', '),
        map(([statKey, value]) => `${statKey} ${value}`),
        filter(([, value]) => value !== 0),
        toPairs,
      )(heroInstance.state.buffs)
    }\r\n`;

  const debuffList = equals(getDefaultBuffs(), heroInstance.state.buffs)
    ? ''
    : `Debuffs: ${
      compose(
        join(', '),
        map(([statKey, value]) => `${statKey} -${value}`),
        filter(([, value]) => value !== 0),
        toPairs,
      )(heroInstance.state.debuffs)
    }\r\n`;

  const status = equals(getDefaultState(), heroInstance.state)
    ? ''
    : `:::Status\r\n${
      buffList
    }${
      debuffList
    }${
      heroInstance.state.hpMissing
        ? `Damage: ${heroInstance.state.hpMissing}\r\n`
        : ''
    }${
      heroInstance.state.specialCharge
        ? `Charge: ${heroInstance.state.specialCharge}\r\n`
        : ''
    }`;

  return `${heroInstance.name} (${heroInstance.rarity}★${
    heroInstance.mergeLevel ? `+${heroInstance.mergeLevel}` : ''
  }${
    heroInstance.boon ? ` +${heroInstance.boon}` : ''
  }${
    heroInstance.bane ? ` -${heroInstance.bane}` : ''
  })\r\n${
    skillList
  }\r\n${
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
  const lines = text.split(/\r?\n|;/);

  // Attempt to parse each line.
  for (let line of lines) {
    // If a line matches one of our regular expressions, apply it to the instance.
    // Otherwise, ignore it.
    if (test(titleRegex, line)) {
      // e.g. "Anna (4★+8 +atk -def)"

      [, name, rarity, mergeLevel, boon, bane] = match(titleRegex, line);
    } else if (test(skillRegex, line)) {
      // e.g. "Weapon: Silver Axe"

      const [, skillKey, skillName] = match(skillRegex, line);
      const sanitizedSkillKey = sanitizeSkillKey(skillKey);
      const inheritableSkills = sanitizedSkillKey
        ? getInheritableSkills(name, sanitizedSkillKey)
        : [];
      const validSkillIndex = compose(
        indexOf(diacritics.remove(skillName)),
        map(diacritics.remove),
      )(inheritableSkills);

      if (
        sanitizedSkillKey
        && validSkillIndex >= 0
      ) {
        const validSkill = inheritableSkills[validSkillIndex];
          // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
        skills[sanitizedSkillKey] = validSkill;
      }
    } else if (test(buffRegex, line)) {
      // e.g. "Buffs: atk 4, spd 4, def 8"

      const [, buffList] = match(buffRegex, line);
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

      const [, debuffList] = match(debuffRegex, line);
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

      const [, value] = match(damageRegex, line);
      // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
      state.hpMissing = Math.max(0, parseInt(value));
    } else if (test(chargeRegex, line)) {
      // e.g. "Charge: 1"

      const [, value] = match(chargeRegex, line);
      // $FlowIssue: Flow doesn't have enough info to be sure that this is covariant-safe
      state.specialCharge = Math.max(0, parseInt(value));
    }
  }

  rarity = (clamp(1, 5, parseInt(rarity)): Rarity);
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
