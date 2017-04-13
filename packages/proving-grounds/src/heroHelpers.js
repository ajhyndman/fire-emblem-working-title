// @flow
import stats from 'fire-emblem-heroes-stats';
import {
  allPass,
  // $FlowIssue flow does not think that ascend exists.
  ascend,
  compose,
  concat,
  curry,
  filter,
  indexBy,
  isNil,
  map,
  not,
  prop,
  propEq,
  propOr,
  pathOr,
  sort,
  test,
  union,
} from 'ramda';
import type {
  Hero,
  Skill,
  SkillType,
} from 'fire-emblem-heroes-stats';

import { getEventHeroes } from './temporal/events';
import { getSkillInfo, getStatValue } from './skillHelpers';
import type { HeroInstance, InstanceSkills, Rarity, Stat } from './heroInstance';


export type HeroesByName = { [key: string]: Hero };

// $FlowIssue indexBy confuses flow
const heroesByName: HeroesByName = indexBy(
  prop('name'),
  // stats.heroes,
  concat(stats.heroes, getEventHeroes()),
);

/**
 * Look up a hero's base stats by name.
 *
 * @param {string} name The name of the hero to look up.
 * @returns {Hero} A raw hero object, from fire-emblem-heroes-stats.
 */
export const lookupStats = (name: string): Hero => {
  const hero: ?Hero = heroesByName[name];
  return hero || {
    name,
    weaponType: 'Red Sword',
    stats: { '1': {}, '40': {} },
    skills: [],
    moveType: 'Infantry',
  };
};

// Can be called with substrings of the skill name
export const hasSkill = (instance: HeroInstance, skillType: SkillType, expectedName: string) => {
  const skillName = getSkillName(instance, skillType);
  if (skillName != null) {
    return test(new RegExp(expectedName), skillName);
  }
  return false;
};

// Returns the name of the skill object for the skill type
export function getSkillName(
  instance: HeroInstance,
  skillType: SkillType,
): string {
  return instance.skills[skillType] ? instance.skills[skillType].name : '';
}

// Returns the effect description of a skill
export function getSkillEffect(
  instance: HeroInstance,
  skillType: SkillType,
): string {
  return instance.skills[skillType] ? instance.skills[skillType].effect : '';
}

// Returns a map from skill type to the name of the skill.
export function getDefaultSkills(name: string, rarity: Rarity): InstanceSkills {
  const hero = lookupStats(name);

  // Flow can't follow this compose chain, so cast it to any.
  const skillsByType = (compose(
    indexBy((skill: Skill) => skill.type),
    filter(compose(not, isNil)),
    map(skill => getSkillInfo(skill.name)),
    filter(skill => (skill.rarity == null || skill.rarity === '-' || skill.rarity <= rarity)),
  )(hero.skills): any);

  return {
    WEAPON: null,
    ASSIST: null,
    SPECIAL: null,
    PASSIVE_A: null,
    PASSIVE_B: null,
    PASSIVE_C: null,
    ...skillsByType,
  };
}

// skill is 'any' because some fields are weapon/passive specific
const canInherit = curry((hero: Hero, skill: any): boolean => {
  const moveType = hero.moveType;
  const weaponType = hero.weaponType ;
  if (propEq('exclusive?', 'Yes', skill)) {
    return false;
  }
  // Unobtainable weapons (story only) currently have no weapon type.
  // Hero has weaponType 'Red Beast' and weapon has weaponType 'Breath'
  if (skill.type === 'WEAPON' && (skill.weaponType == null
    || (test(/Beast/, weaponType) ? 'Breath' : weaponType) !== skill.weaponType)) {
    return false;
  }
  const restriction = propOr('None', 'inheritRestriction', skill);
  switch (restriction) {
    case 'Fliers Only':
      return moveType === 'Flying';
    case 'Cavalry Only':
      return moveType === 'Cavalry';
    case 'Armored Only':
      return moveType === 'Armored';
    case 'Excludes Fliers':
      return moveType !== 'Flying';
    case 'Melee Weapons Only':
      return test(/(Sword|Axe|Lance|Breath)/, weaponType);
    case 'Ranged Weapons Only':
      return test(/(Staff|Tome|Bow|Shuriken)/, weaponType);
    case 'Breath Users Only':
      return test(/Breath/, weaponType);
    case 'Staff Only':
      return weaponType === 'Neutral Staff';
    case 'Excludes Staves':
      return weaponType !== 'Neutral Staff';
    case 'Excludes Colorless Weapons':
      return !test(/Neutral/, weaponType);
    case 'Excludes Blue Weapons':
      return !test(/Blue/, weaponType);
    case 'Excludes Red Weapons':
      return !test(/Red/, weaponType);
    case 'Excludes Green Weapons':
      return !test(/Green/, weaponType);
    case 'Is exclusive':
      return false;
    case 'None':
      return true;
    default:
      // console.log('Warning: unknown inherit restriction: ' + restriction);
  }
  return true;
});

// Returns a list of skills that a hero can obtain.
export function getInheritableSkills(name: string, skillType: SkillType): Array<Skill> {
  const hero = lookupStats(name);
  // Cast to any to prevent flow issues
  const allSkills: any = stats.skills;
  const inheritable = filter(
    allPass([
      // $FlowIssue canInherit is curried
      canInherit(hero),
      propEq('type', skillType),
    ]),
    allSkills,
  );
  const ownSkills = compose(
    filter(propEq('type', skillType)),
    map((skill: any) => getSkillInfo(skill.name)),
  )(hero.skills);
  return sort(ascend(prop('name')), union(inheritable, ownSkills));
}

export const hasBraveWeapon: (instance: HeroInstance)=> boolean = compose(
  test(/Brave|Dire/),
  pathOr('', ['skills', 'WEAPON', 'name']),
);

/**
 * A helper for getting a stat value from a hero by key.
 * Defaults to level 40, 5 star, baseline variant.
 *
 * @param {*} hero Hero to look up stat on
 * @param {*} statKey Key of the stat to look up
 * @param {*} level Which level version of stat to look up
 * @param {*} rarity Which rarity version of stat to look up
 * @param {*} variance Which variant ('low', 'normal', 'high') to look up
 * @param {*} isAttacker Whether or not the hero is the attacker.
 * @returns number the value of the stat
 */
export const getStat = (
  instance: HeroInstance,
  statKey: Stat,
  level: 1 | 40 = 40,
  isAttacker: boolean = false,
): number => {
  const hero = lookupStats(instance.name);
  const { rarity } = instance;
  const variance = (instance.boon === statKey
    ? 'high'
    : instance.bane === statKey
      ? 'low'
      : 'normal');

  if (level === 1) {
    const value = parseInt(hero.stats[`${level}`][rarity][statKey], 10);
    return variance === 'normal'
      ? value
      : variance === 'low'
        ? value - 1
        : value + 1;
  }

  const values = hero.stats[`${level}`][rarity][statKey];
  const [low, normal, high] = values.length <= 1
    ? ['-', ...values]
    : values;
  const baseValue = variance === 'normal'
    ? parseInt(normal, 10)
    : variance === 'low'
      ? parseInt(low, 10)
      : parseInt(high, 10);

  const passiveA = getSkillName(instance, 'PASSIVE_A');
  const weapon = getSkillName(instance, 'WEAPON');

  //console.log('GetStat.', instance.name, statKey, baseValue
  //  + (passiveA ? getStatValue(passiveA, statKey, isAttacker) : 0)
  //  + (weapon ? getStatValue(weapon, statKey, isAttacker) : 0));
  return baseValue
    + (passiveA ? getStatValue(passiveA, statKey, isAttacker) : 0)
    + (weapon ? getStatValue(weapon, statKey, isAttacker) : 0);
};

export const getRange = (instance: HeroInstance) => {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Sword':
    case 'Green Axe':
    case 'Blue Lance':
    case 'Red Beast':
    case 'Green Beast':
    case 'Blue Beast':
      return 1;
    default:
      return 2;
  }
};

export const getMitigationType = (instance: HeroInstance) => {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Tome':
    case 'Red Beast':
    case 'Green Tome':
    case 'Green Beast':
    case 'Blue Tome':
    case 'Blue Beast':
    case 'Neutral Staff':
      return 'res';
    default:
      return 'def';
  }
};

export const getWeaponColor = (instance: HeroInstance) => {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Sword':
    case 'Red Tome':
    case 'Red Beast':
      return 'RED';
    case 'Green Axe':
    case 'Green Tome':
    case 'Green Beast':
      return 'GREEN';
    case 'Blue Lance':
    case 'Blue Tome':
    case 'Blue Beast':
      return 'BLUE';
    default:
      return 'NEUTRAL';
  }
};

export const hasStatsForRarity = (hero: Hero, rarity: Rarity/* , level?: 1 | 40 */): boolean => {
  return Boolean(hero.stats['1'][`${rarity}`] && hero.stats['40'][`${rarity}`]);
};
