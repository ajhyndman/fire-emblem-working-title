// @flow
import {
  getAllSkills,
  getHero,
  getReleasedHeroes,
  getSkillObject,
  getSkillType,
} from 'fire-emblem-heroes-stats';
import {
  allPass,
  ascend,
  compose,
  contains,
  curry,
  descend,
  filter,
  find,
  indexBy,
  indexOf,
  map,
  mapObjIndexed,
  prop,
  propEq,
  propOr,
  pathOr,
  sort,
  sortWith,
  test,
  union,
  zipObj,
  __,
} from 'ramda';
import type {
  Hero,
  MoveType,
  SkillType,
  WeaponType,
} from 'fire-emblem-heroes-stats';

import { getStatValue, hpRequirementSatisfied } from './skillHelpers';
import type {
  Context,
  HeroInstance,
  InstanceSkills,
  Rarity,
  Stat,
} from './heroInstance';

export const getWeaponType = (instance: HeroInstance): WeaponType =>
  getHero(instance.name).weaponType;

export const getMoveType = (instance: HeroInstance): MoveType =>
  getHero(instance.name).moveType;

// Can be called with substrings of the skill name. Returns false if an hp requirement is not met.
export const hasSkill = (
  instance: HeroInstance,
  skillType: SkillType,
  expectedName: string,
) => {
  const skillName = getSkillName(instance, skillType);
  if (skillName !== undefined) {
    if (test(new RegExp(expectedName), skillName)) {
      return hpRequirementSatisfied(instance, skillType);
    }
  }
  return false;
};

export function getHeroesWithSkill(skillName: string) {
  const heroesWithSkill = filter(
    hero => contains(skillName, hero.skills),
    getReleasedHeroes(),
  );

  return map(
    hero => ({
      name: hero.name,
      rarity: find(skill => skill.name === skillName, hero.skills).rarity,
    }),
    heroesWithSkill,
  );
}

// Returns the name of the skill object for the skill type
export function getSkillName(
  instance: HeroInstance,
  skillType: SkillType,
): string {
  return instance.skills[skillType] || '';
}

// Returns the effect description of a skill
export function getSkillEffect(
  instance: HeroInstance,
  skillType: SkillType,
): string {
  const skill = getSkillObject(skillType, getSkillName(instance, skillType));
  return skill ? skill.effect : '';
}

// Returns a map from skill type to the skill object.
export function getDefaultSkills(
  name: string,
  rarity: Rarity = 5,
): InstanceSkills {
  const hero = getHero(name);
  // Flow can't follow this compose chain, so cast it to any.
  const skillsByType = (compose(
    indexBy(getSkillType),
    filter(skillName => getSkillType(skillName) !== undefined),
    map(prop('name')),
    filter(
      skill =>
        skill.rarity === undefined ||
        skill.rarity === '-' ||
        skill.rarity <= rarity,
    ),
  )(hero.skills): any);

  return {
    WEAPON: undefined,
    ASSIST: undefined,
    SPECIAL: undefined,
    PASSIVE_A: undefined,
    PASSIVE_B: undefined,
    PASSIVE_C: undefined,
    SEAL: undefined,
    ...skillsByType,
  };
}

// Updates the rarity and default skills for a hero.
export function updateRarity(
  hero: HeroInstance,
  newRarity: Rarity,
): HeroInstance {
  const oldDefault = getDefaultSkills(hero.name, hero.rarity);
  const newDefault = getDefaultSkills(hero.name, newRarity);
  return {
    ...hero,
    rarity: newRarity,
    skills: mapObjIndexed(
      (skill, skillType) =>
        propOr('', 'name', skill) === propOr('', 'name', oldDefault[skillType])
          ? newDefault[skillType]
          : skill,
      hero.skills,
    ),
  };
}

// skill is 'any' because some fields are weapon/passive specific
const canInherit = curry((hero: Hero, skill: any): boolean => {
  const moveType = hero.moveType;
  const weaponType = hero.weaponType;
  if (propEq('exclusive?', 'Yes', skill)) {
    return false;
  }
  // Unobtainable weapons (story only) currently have no weapon type.
  // Hero has weaponType 'Red Breath' and weapon has weaponType 'Breath'
  if (
    skill.type === 'WEAPON' &&
    (skill.weaponType === undefined ||
      (test(/Breath/, weaponType) ? 'Breath' : weaponType) !== skill.weaponType)
  ) {
    return false;
  }
  const restriction = propOr('None', 'inheritRestriction', skill);
  switch (restriction) {
    case 'Axe Users Only':
      return weaponType === 'Green Axe';
    case 'Bow Users Only':
      return weaponType === 'Neutral Bow';
    case 'Fliers Only':
      return moveType === 'Flying';
    case 'Cavalry Only':
      return moveType === 'Cavalry';
    case 'Armored Only':
      return moveType === 'Armored';
    case 'Excludes Fliers':
      return moveType !== 'Flying';
    case 'Melee Weapons Only':
    case 'Melee Weapon Users Only':
      return test(/(Sword|Axe|Lance|Breath)/, weaponType);
    case 'Sword, Lance, Axe Users Only':
      return test(/(Sword|Axe|Lance)/, weaponType);
    case 'Ranged Weapons Only':
    case 'Ranged Weapon Users Only':
      return test(/(Staff|Tome|Bow|Shuriken)/, weaponType);
    case 'Breath Users Only':
      return test(/Breath/, weaponType);
    case 'Staff Only':
    case 'Staff Users Only':
      return weaponType === 'Neutral Staff';
    case 'Excludes Staves':
    case 'Excludes Staff Users':
      return weaponType !== 'Neutral Staff';
    case 'Excludes Colorless Weapons':
    case 'Excludes Colorless Weapon Users':
      return !test(/Neutral/, weaponType);
    case 'Excludes Blue Weapons':
    case 'Excludes Blue Weapon Users':
      return !test(/Blue/, weaponType);
    case 'Excludes Red Weapons':
    case 'Excludes Red Weapon Users':
      return !test(/Red/, weaponType);
    case 'Excludes Green Weapons':
    case 'Excludes Green Weapon Users':
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

// Returns a list of skill names that a hero can obtain.
export function getInheritableSkills(
  name: string,
  skillType: SkillType,
): Array<string> {
  const hero = getHero(name);
  // Cast to any to prevent flow issues
  const allSkills: any = getAllSkills();
  const inheritable = filter(
    allPass([canInherit(hero), propEq('type', skillType)]),
    allSkills,
  );
  const ownSkills = compose(
    filter(x => propOr('', 'type', x) === skillType),
    map(skillName => getSkillObject(skillType, skillName)),
    map(prop('name')),
  )(hero.skills);
  return map(
    prop('name'),
    sort(ascend(prop('name')), union(inheritable, ownSkills)),
  );
}

export const hasBraveWeapon: (instance: HeroInstance) => boolean = compose(
  test(/Brave|Dire/),
  pathOr('', ['skills', 'WEAPON']),
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
 * @param {*} context Contextual info: enemy, allies, and isAttacker.
 * @returns number the value of the stat
 */
export const getStat = (
  instance: HeroInstance,
  statKey: Stat,
  level: 1 | 40 = 40,
  context: Context | void = undefined,
): number => {
  const hero = getHero(instance.name);
  const { rarity } = instance;
  const variance =
    instance.boon === statKey
      ? 'high'
      : instance.bane === statKey ? 'low' : 'normal';

  if (
    hero.stats[`${level}`] === undefined ||
    hero.stats[`${level}`][rarity] === undefined
  ) {
    return NaN;
  }
  if (level === 1) {
    const value = parseInt(hero.stats[`${level}`][rarity][statKey], 10);
    // skills and merges are currently not included in level 1 stats.
    return variance === 'normal'
      ? value
      : variance === 'low' ? value - 1 : value + 1;
  }

  const values = hero.stats[`${level}`][rarity][statKey];
  const [low, normal, high] = values.length <= 1 ? ['-', ...values] : values;
  const baseValue =
    variance === 'normal'
      ? parseInt(normal, 10)
      : variance === 'low' ? parseInt(low, 10) : parseInt(high, 10);

  let mergeBonus = 0;
  if (instance.mergeLevel > 0) {
    // Every bonus level gives +1 to the next 2 stats, with stats in decreasing level 1 order
    const statKeys = ['hp', 'atk', 'spd', 'def', 'res'];
    // Depends on the fact that level 1 stats currently exclude skills.
    const level1Stats = zipObj(
      statKeys,
      map(s => getStat(instance, s, 1, undefined), statKeys),
    );
    const orderedStatKeys = sortWith(
      [descend(prop(__, level1Stats)), ascend(indexOf(__, statKeys))],
      statKeys,
    );
    mergeBonus =
      Math.floor(2 * instance.mergeLevel / 5) +
      ((2 * instance.mergeLevel) % 5 > indexOf(statKey, orderedStatKeys)
        ? 1
        : 0);
  }

  // Stats cannot be negative, even with brave weapons, life and death, or debuffs.
  return Math.max(
    0,
    baseValue +
      mergeBonus +
      getStatValue(instance, 'PASSIVE_A', statKey, context) +
      getStatValue(instance, 'SEAL', statKey, context) +
      getStatValue(instance, 'WEAPON', statKey, context) +
      instance.state.buffs[statKey] -
      instance.state.debuffs[statKey],
  );
};

export const getRange = (instance: HeroInstance) =>
  test(/Sword|Axe|Lance|Breath/, getWeaponType(instance)) ? 1 : 2;

export const getMitigationType = (instance: HeroInstance) =>
  test(/Tome|Breath|Staff/, getWeaponType(instance)) ? 'res' : 'def';

export const getWeaponColor = (instance: HeroInstance) => {
  switch (getWeaponType(instance)) {
    case 'Red Sword':
    case 'Red Tome':
    case 'Red Breath':
      return 'RED';
    case 'Green Axe':
    case 'Green Tome':
    case 'Green Breath':
      return 'GREEN';
    case 'Blue Lance':
    case 'Blue Tome':
    case 'Blue Breath':
      return 'BLUE';
    default:
      return 'NEUTRAL';
  }
};

export function getCurrentHp(hero: HeroInstance): number {
  return getStat(hero, 'hp') - hero.state.hpMissing;
}

// Returns whether or not hp >= X% of hp, using the hp at the start of combat.
export function hpAboveThreshold(
  hero: HeroInstance,
  hpPercent: number,
): boolean {
  return getCurrentHp(hero) >= getStat(hero, 'hp') * hpPercent / 100;
}

// Returns whether or not hp <= X% of hp, using the hp at the start of combat.
export function hpBelowThreshold(
  hero: HeroInstance,
  hpPercent: number,
): boolean {
  return getCurrentHp(hero) <= getStat(hero, 'hp') * hpPercent / 100;
}
