// @flow
import {
  any,
  compose,
  map,
  propOr,
  test,
} from 'ramda';
import type { Hero, WeaponSkill } from 'fire-emblem-heroes-stats';

import { getSkillInfo } from './skillHelpers'; 


type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';

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
export function getWeapon(hero: Hero, rarity: number) : WeaponSkill {
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
  hero: Hero,
  statKey: Stat,
  level: '40' | '1' = '40',
  rarity: '1' | '2' | '3' | '4' | '5' = '5',
  variance: 'low' | 'normal' | 'high' = 'normal',
): number => {
  if (level === '1') {
    const value = parseInt(hero.stats[level][rarity][statKey], 10);
    return variance === 'normal'
      ? value
      : variance === 'low'
        ? value - 1
        : value + 1;
  }
  const values = hero.stats[level][rarity][statKey];
  const [low, normal, high] = values.length <= 1
    ? ['-', ...values]
    : values;
  const baseValue = variance === 'normal'
    ? parseInt(normal, 10)
    : variance === 'low'
      ? parseInt(low, 10)
      : parseInt(high, 10)
  let skillBonus = 0;
  if (statKey == "atk") {
    skillBonus += getWeapon(hero, rarity)["damage(mt)"];
  } else if (statKey == "spd") {
    skillBonus += hasBraveWeapon(hero) ? -5 : 0;
  }
  return baseValue + skillBonus;
}

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
