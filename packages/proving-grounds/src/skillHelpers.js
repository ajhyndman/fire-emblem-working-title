// @flow
import {
  compose,
  head,
  indexBy,
  join,
  juxt,
  map,
  match,
  prop,
  tail,
  test,
  toUpper,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type { Skill } from 'fire-emblem-heroes-stats';

import { getStat, getMitigationType, hasSkill, getSkillName, getSkillEffect } from './heroHelpers';
import type { HeroInstance } from './store';


export type SpecialType = 'INITIATE' | 'ATTACK' | 'ATTACKED' | 'HEAL' | 'OTHER' | null;
export type SkillsByName = { [key: string]: Skill };

// $FlowIssue indexBy confuses flow
const skillsByName: SkillsByName = indexBy(prop('name'), stats.skills);

export const getSkillInfo = (skillName: string): Skill => skillsByName[skillName];

const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]));

// Returns a list of numbers from the effect of the skill, or [0].
export function getSkillNumbers(skillName: string) {
  const skill = getSkillInfo(skillName);
  if (skill == null) {
    return [0];
  }
  return map(parseInt, match(/\d+/g, skill.effect));
}

// Returns the value for a stat provided by a passive skill
export function getStatValue(skillName: string, statKey: string, isAttacker: boolean) {
  const skill = getSkillInfo(skillName);
  if (skill == null) {
    return 0;
  } else if (skill.type === 'WEAPON') {
    if (statKey === 'atk') {
      // Flow does not like conversion directly to WeaponSkill so I convert to an any instead
      const anySkill: any = skill;
      const weaponMight = anySkill['damage(mt)'];
      if (isAttacker && skill.name === 'Durandal') {
        return weaponMight + 4;
      }
      return weaponMight;
    } else if (statKey === 'spd') {
      if (skill.name === 'Yato' && isAttacker) {
        return 4;
      }
      if (test(/Brave|Dire/, skill.name)) {
        return -5;
      }
    } else if ((skill.name === 'Binding Blade' || skill.name === 'Naga') && !isAttacker) {
      return 2;
    }
    if (statKey === 'res' && skill.name === 'Parthia' && isAttacker) {
      return 4;
    }
  } else if (skill.type === 'PASSIVE_A') {
    const statRegex = new RegExp(statKey === 'hp' ? 'max HP' : capitalize(statKey));
    if (test(statRegex, skill.effect)) {
      const skillNumbers = getSkillNumbers(skillName);
      // Atk/Def/Spd/Res/HP+, 'Attack Def+', and Fury
      if (test(/(Fury|\+)/, skillName)) {
        return skillNumbers[0];
      }
      // Death/Darting/Armored/Warding Blow
      if (isAttacker && test(/(Blow|Sparrow)/, skillName)) {
        return skillNumbers[0];
      }
      if (test(/Life and Death/, skillName)) {
        if (statKey === 'atk' || statKey === 'spd') {
          return skillNumbers[0];
        } else if (statKey === 'def' || statKey === 'res') {
          return -skillNumbers[1];
        }
      }
    }
  }
  return 0;
}


/*
 * Helpers to check a property of a skill by name.
 */
 
// Checks whether or not a skill (ex: Wary Fighter 3) is the final form of the skill.
export function isMaxTier(skillName: string): boolean {
  if (isFreeSkill(skillName)) {
    return false;
  }
  if (test(/(Swift Sparrow 2|Attack Def \+2)/, skillName)) {
    return true;
  }
  if (test(/HP \+(3|4)$/, skillName)) {
    return false;
  }
  // TODO: for weapons check if a + version of the skill exists.
  return !test(/(1|2)$/, skillName);
}

// Checks for skills that cost 0 SP.
export function isFreeSkill(skillName: string): boolean {
  return test(/(Iron|Steel|Fire Breath|Fire|Flux|Wind|Thunder)/, skillName);
}


/*
 * Special Related Helpers
 * https://feheroes.wiki/Specials
 */

// Returns the condition for the special to trigger. (Other is for Galefore)
export function getSpecialType(instance: HeroInstance): SpecialType {
  if (instance.skills['SPECIAL'] == null) return null;
  if (test(/When healing/, getSkillEffect(instance, 'SPECIAL'))) return 'HEAL';
  if (test(/Galeforce/, getSkillName(instance, 'SPECIAL'))) return 'OTHER';
  if (test(/Reduces damage/, getSkillEffect(instance, 'SPECIAL'))) return 'ATTACKED';
  if (test(/Miracle/, getSkillName(instance, 'SPECIAL'))) return 'ATTACKED';
  if (test(/(Blazing|Growing|Rising)/, getSkillName(instance, 'SPECIAL'))) return 'INITIATE';
  return 'ATTACK';
}

// Returns the cooldown of the special or -1. Accounts for killer weapons.
export const getSpecialCooldown = (instance: HeroInstance) =>
  instance.skills['SPECIAL'] == null ? -1
    : (instance.skills['SPECIAL'].cooldown
    + (test(/Accelerates S/, getSkillEffect(instance, 'WEAPON')) ? -1 : 0)
    + (test(/Slows Special/, getSkillEffect(instance, 'WEAPON')) ? +1 : 0));

// Only considers damage reduction specials
export function doesDefenseSpecialApply(skillName: string, attackRange: 1 | 2) {
  return (attackRange === 1 && test(/(Pavise|Buckler|Escutcheon)/, skillName))
    || (attackRange === 2 && test(/(Aegis|Holy Vestments|Sacred Cowl)/, skillName));
}
// Returns the percent of defense reduced by a special.
export function getSpecialMitigationMultiplier(skillName: string): number {
  return test(/(New Moon|Moonbow)/, skillName) ? 0.3
    : (test(/(Luna|Aether)/, skillName) ? 0.5 : 0);
}
// Returns a flat amount of nonLethal damage for an AOE special.
export function getSpecialAOEDamageAmount(
    skillName: string,
    attacker: HeroInstance,
    defender: HeroInstance,
): number {
  const atk = getStat(attacker, 'atk', 40, true);
  const def = getStat(defender, getMitigationType(attacker), 40, false);
  const multiplier = test(/(Blazing)/, skillName) ? 1.5
    : (test(/(Growing|Rising)/, skillName) ? 1.0 : 0);
  return Math.floor(multiplier * (atk - def));
}
// Returns a flat amount of bonus damage for a stat-based special (or missing HP special)
export function getSpecialBonusDamageAmount(
    skillName: string,
    attacker: HeroInstance,
    isAttacker: boolean,
    attackerMissingHp: number,
): number {
  const woDaoBonus = (skillName !== '' && skillName != null
                      && getSpecialType(attacker) === 'ATTACK'
                      && hasSkill(attacker, 'WEAPON', 'Wo Dao')) ? 10 : 0;
  let stat = 'def';
  if (test(/Dra(c|g)on/, skillName)) stat = 'atk';
  if (test(/(Bonfire|Glowing E|Ignis)/, skillName)) stat = 'def';
  if (test(/(Glacies|Chilling W|Iceberg)/, skillName)) stat = 'res';
  let ratio = 0.0;
  if (test(/(Glacies|Ignis)/, skillName)) ratio = 0.8;
  if (test(/(Bonfire|Glowing E|Chilling W|Iceberg|Dragon F|Vengeance)/, skillName)) ratio = 0.5;
  if (test(/(Draconic A|Dragon G|Reprisal|Retribution)/, skillName)) ratio = 0.3;
  if (test(/(Reprisal|Retribution|Vengeance)/, skillName)) {
    return woDaoBonus + Math.floor(attackerMissingHp * ratio);
  }
  return woDaoBonus + Math.floor(getStat(attacker, stat, 40, isAttacker) * ratio);
}
// Returns the percent of damage increased by a special
export function getSpecialOffensiveMultiplier(skillName: string): number {
  return test(/Astra/, skillName) ? 1.5
    : (test(/(Glimmer|Night Sky)/, skillName) ? 0.5 : 0);
}
// Returns the percent of damage reduced by a special.
export function getSpecialDefensiveMultiplier(skillName: string): number {
  return test(/(Pavise|Aegis)/, skillName) ? 0.5
    : (test(/(Buckler|Escutcheon|Holy Vestments|Sacred Cowl)/, skillName) ? 0.3 : 0);
}
// Returns the percent of damage increased by a special
export function getSpecialLifestealPercent(skillName: string): number {
  return test(/(Aether|Sol)/, skillName) ? 0.5
    : (test(/(Daylight|Noontime)/, skillName) ? 0.3 : 0.0);
}
