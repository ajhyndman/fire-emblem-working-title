// @flow
import {
  any,
  compose,
  find,
  map,
  propEq,
  propOr,
  test,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type {
  Hero,
  AssistSkill,
  // MoveType,
  PassiveSkill,
  SpecialSkill,
  WeaponSkill,
  // WeaponType,
} from 'fire-emblem-heroes-stats';

import { getSkillInfo } from './skillHelpers';


type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';

type Rarity = 1 | 2 | 3 | 4 | 5;

export type HeroInstance = {
  // custom: false,
  name: string;
  rarity: Rarity;
  boon: ?Stat;
  bane: ?Stat;
  weapon: ?WeaponSkill;
  assist: ?AssistSkill;
  special: ?SpecialSkill;
  passiveA: ?PassiveSkill;
  passiveB: ?PassiveSkill;
  passiveC: ?PassiveSkill;
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

// Returns a map from skill type to the name of the skill.
export function getDefaultSkills(hero: Hero, rarity: number) {
  let skillsByType = {};
  for (let skill of hero.skills) {
    if (skill.rarity == null || skill.rarity === '-' || skill.rarity <= rarity) {
      // Assumes that the later version of a skill is the better version
      const skillInfo = getSkillInfo(skill.name);
      if (skillInfo != null) {
        skillsByType[skillInfo.type] = skill.name;
      }
    }
  }
  return skillsByType;
}

// Returns the skill object for the weapon
// $FlowIssue flow cannot determine what type of skill this will return
export function getWeapon(hero: Hero, rarity: number): WeaponSkill {
  const weaponName = getDefaultSkills(hero, rarity)['WEAPON'];
  // Convert to any because flow was blaming line 0 for a skill->weapon conversion
  const weaponInfo: any = getSkillInfo(weaponName);
  return weaponInfo;
}

export const hasBraveWeapon = (hero: Hero) => compose(
  any(test(/Brave|Dire/)),
  map(propOr('', 'name')),
)(hero.skills);

/**
 * A helper for getting a stat value from a hero by key.
 * Defaults to level 40, 5 star, baseline variant.
 *
 * @param {*} hero Hero to look up stat on
 * @param {*} statKey Key of the stat to look up
 * @param {*} level Which level version of stat to look up
 * @param {*} rarity Which rarity version of stat to look up
 * @param {*} variance Which variant ('low', 'normal', 'high') to look up
 * @returns number the value of the stat
 */
export const getStat = (
  heroInstance: HeroInstance,
  statKey: Stat,
  level: 1 | 40 = 40,
  // rarity: '1' | '2' | '3' | '4' | '5' = '5',
  // variance: 'low' | 'normal' | 'high' = 'normal',
): number => {
  // $FlowIssue: Flowtype for find is too generic.
  const hero: Hero = find(propEq('name', heroInstance.name), stats.heroes);
  const { rarity } = heroInstance;
  const variance = (heroInstance.boon === statKey
    ? 'high'
    : heroInstance.bane === statKey
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
      : parseInt(high, 10)
  const skillBonus = statKey === 'atk'
    ? getWeapon(hero, rarity)['damage(mt)']
    : hasBraveWeapon(hero)
      ? -5
      : 0

  return baseValue + skillBonus;
};

export const getRange = (hero: Hero) => {
  switch (hero.weaponType) {
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

export const getMitigationType = (hero: Hero) => {
  switch (hero.weaponType) {
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

export const getWeaponColor = (hero: Hero) => {
  switch (hero.weaponType) {
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

export const hasStatsForRarity = (hero: Hero, rarity: Rarity, level): boolean => {
  return Boolean(hero.stats['1'][`${rarity}`] && hero.stats['40'][`${rarity}`]);
};
