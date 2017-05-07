// @flow
import {
  compose,
  head,
  join,
  juxt,
  map,
  match,
  tail,
  test,
  toLower,
  toUpper,
} from 'ramda';
import { getSkillObject } from 'fire-emblem-heroes-stats';
import type { SkillType } from 'fire-emblem-heroes-stats';

import {
  getStat,
  getMitigationType,
  getSkillName,
  getSkillEffect,
  hasSkill,
  hpAboveThreshold,
  hpBelowThreshold,
  resetBuffs,
} from './heroHelpers';
import type { HeroInstance, Stat } from './heroInstance';


export type SpecialType = 'INITIATE' | 'ATTACK' | 'ATTACKED' | 'HEAL' | 'OTHER' | void;


const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]));

// Returns a list of numbers from the effect of the skill, or [0].
export function getSkillNumbers(hero: HeroInstance, skillType: SkillType): Array<number> {
  const skill = getSkillObject(skillType, getSkillName(hero, skillType));
  if (skill === undefined) {
    return [0];
  }
  // $FlowIssue $Iterable. This type is incompatible with ... Array<number>
  return map(parseInt, match(/\d+/g, skill.effect));
}

// Returns whichever of 'hp', 'atk', 'spd', 'def', 'res' occurs first.
// Defaults to 'atk' but should only be called if a stat key is guaranteed to exist.
export function getStatKey(text: string): Stat {
  const textMatch = match(/(HP|Atk|Spd|Def|Res)/, text);
  // $FlowIssue: flow is worried that toLower might be called with undefined
  return toLower(textMatch ? textMatch[1] : 'atk');
}

export function hpRequirementSatisfied(hero: HeroInstance, skillType: SkillType) {
  const skill = getSkillObject(skillType, getSkillName(hero, skillType));
  if (skill !== undefined) {
    if (test(/≥\s*\d+%/, skill.effect)) {
      return hpAboveThreshold(hero, parseInt(match(/(\d+)%/, skill.effect)[1]));
    }
    if (test(/≤\s*\d+%/, skill.effect)) {
      return hpBelowThreshold(hero, parseInt(match(/(\d+)%/, skill.effect)[1]));
    }
  }
  return true;
}

// Returns the value for a stat provided by a passive skill
export function getStatValue(
  hero: HeroInstance,
  skillType: SkillType,
  statKey: Stat,
  isAttacker: boolean,
) {
  const skillName = getSkillName(hero, skillType);
  const skill = getSkillObject(skillType, skillName);
  if (skill === undefined) {
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
    } else if ((statKey === 'def' || statKey === 'res')
      && (skill.name === 'Binding Blade' || skill.name === 'Naga') && !isAttacker) {
      return 2;
    } else if (statKey === 'def' && skill.name === 'Tyrfing' && hpBelowThreshold(hero, 50)) {
      return 4;
    } else if (statKey === 'res' && skill.name === 'Parthia' && isAttacker) {
      return 4;
    }
  } else if (skill.type === 'PASSIVE_A' || skill.type === 'SEAL') {
    const statRegex = new RegExp(statKey === 'hp' ? 'max HP' : capitalize(statKey));
    if (test(statRegex, skill.effect)) {
      const skillNumbers = getSkillNumbers(hero, skillType);
      // Atk/Def/Spd/Res/HP+, 'Attack Def+', and Fury
      if (test(/(Fury|\+)/, skillName)) {
        return skillNumbers[0];
      }
      // Fortress Def
      if (test(/Fortress Def/, skillName)) {
        if (statKey === 'def') {
          return skillNumbers[0];
        } else if (statKey === 'atk') {
          return -skillNumbers[1];
        }
      }
      // Death/Darting/Armored/Warding Blow and Sparrow
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
  return test(/^(Iron|Steel|Fire Breath\+?$|Fire$|Flux$|Wind$|Thunder$)/, skillName);
}


/*
 * Special Related Helpers
 * https://feheroes.wiki/Specials
 */

// Returns the condition for the special to trigger. (Other is for Galefore)
export function getSpecialType(instance: HeroInstance): SpecialType {
  if (instance.skills['SPECIAL'] === undefined) return undefined;
  if (test(/When healing/, getSkillEffect(instance, 'SPECIAL'))) return 'HEAL';
  if (test(/Galeforce/, getSkillName(instance, 'SPECIAL'))) return 'OTHER';
  if (test(/Reduces damage/, getSkillEffect(instance, 'SPECIAL'))) return 'ATTACKED';
  if (test(/Miracle/, getSkillName(instance, 'SPECIAL'))) return 'ATTACKED';
  if (test(/(Blazing|Growing|Rising)/, getSkillName(instance, 'SPECIAL'))) return 'INITIATE';
  return 'ATTACK';
}

// Returns the cooldown of the special or -1. Accounts for killer weapons.
export const getSpecialCooldown = (instance: HeroInstance) => {
  const skill = getSkillObject('SPECIAL', getSkillName(instance, 'SPECIAL'));
  return ((!skill || typeof skill.cooldown !== 'number') ? -1
    : skill.cooldown
    + (test(/Accelerates S/, getSkillEffect(instance, 'WEAPON')) ? -1 : 0)
    + (test(/Slows Special/, getSkillEffect(instance, 'WEAPON')) ? +1 : 0));
};

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
  const woDaoBonus = (skillName !== '' && skillName !== undefined
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

// Returns the number of special charges generated per attack (usually 1).
export function getSpecialChargeForAttack(
  hero1: HeroInstance,
  hero2: HeroInstance,
  isAttacker: boolean,
) {
  let specialChargePerAtk = 1;
  if (hasSkill(hero1, 'PASSIVE_A', 'Heavy Blade')) {
    const atkReq = getSkillNumbers(hero1, 'PASSIVE_A')[0];
    if (getStat(hero1, 'atk', 40, isAttacker) - getStat(hero2, 'atk', 40, !isAttacker) >= atkReq) {
      specialChargePerAtk += 1;
    }
  }
  if (hasSkill(hero2, 'PASSIVE_B', 'Guard')) {
    specialChargePerAtk -= 1;
  }
  return specialChargePerAtk;
}

// Returns the number of special charges generated when opponent attacks you (usually 1).
// OtherHero is the one that is attacking you.
export function getSpecialChargeWhenAttacked(otherHero: HeroInstance) {
  return (hasSkill(otherHero, 'PASSIVE_B', 'Guard')) ? 0 : 1;
}

/*
 * Buffs and Debuffs
 */

// Returns a new hero with updated buffs
export function withTurnStartBuffs(hero: HeroInstance, isAttacker: boolean) {
  // Buffs from previous turns expire at the start of the turn.
  let buffs = isAttacker ? resetBuffs() : hero.state.buffs;
  // The 50% HP check is built into hasSkill.
  if (hasSkill(hero, 'PASSIVE_A', 'Defiant')) {
    const statKey = getStatKey(getSkillName(hero, 'PASSIVE_A'));
    const buffAmount = getSkillNumbers(hero, 'PASSIVE_A')[0];
    buffs = {...buffs, [statKey]: Math.max(buffs[statKey], buffAmount)};
  }
  if (hasSkill(hero, 'WEAPON', 'Fólkvangr')) {
    buffs = {...buffs, atk: Math.max(buffs.atk, 5)};
  }
  // TODO: Hone/Fortify once support for allies is added
  return {...hero, state: {...hero.state, buffs}};
}

// Returns a new version of hero with debuffs applied by otherHero
export function withTurnStartDebuffs(
  hero: HeroInstance,
  otherHero: HeroInstance,
  isAttacker: boolean,
) {
  let debuffs = hero.state.debuffs;
  // If this unit is the defender, it is the other unit's turn, and enemy threaten triggers.
  if (!isAttacker) {
    // TODO: threaten X
    // Eckesachs, Fensalir
  }
  return {...hero, state: {...hero.state, debuffs}};
}

// Returns a new hero with updated buffs
export function withPostCombatBuffs(hero: HeroInstance) {
  let buffs = hero.state.buffs;
  // Rogue Dagger
  if (hasSkill(hero, 'WEAPON', 'Rogue Dagger')) {
    // 1st number is debuff amount, 2nd is self-buff amount.
    const buffAmount = getSkillNumbers(hero, 'WEAPON')[1];
    buffs = {
      ...buffs,
      def: Math.max(buffs.def, buffAmount),
      res: Math.max(buffs.res, buffAmount),
    };
  }
  return {...hero, state: {...hero.state, buffs}};
}

// Returns a new version of hero with debuffs applied by otherHero
export function withPostCombatDebuffs(
  hero: HeroInstance,
  otherHero: HeroInstance,
  isAttacker: boolean,
  foeSurvived: boolean,
) {
  // Debuffs from previous turns expire after attacking.
  let debuffs = isAttacker ? resetBuffs() : hero.state.debuffs;
  if (foeSurvived) {
    // Seal X
    if (hasSkill(otherHero, 'PASSIVE_B', 'Seal ')) {
      const statKey = getStatKey(getSkillName(otherHero, 'PASSIVE_B'));
      const debuffAmount = getSkillNumbers(otherHero, 'PASSIVE_B')[0];
      debuffs = {...debuffs, [statKey]: Math.max(debuffs[statKey], debuffAmount)};
    }
    if (hasSkill(otherHero, 'WEAPON', 'Dagger')) {
      // Every dagger debuffs def/res by the same amount.
      const debuffAmount = getSkillNumbers(otherHero, 'WEAPON')[0];
      debuffs = {
        ...debuffs,
        def: Math.max(debuffs.def, debuffAmount),
        res: Math.max(debuffs.res, debuffAmount),
      };
    }
    if (hasSkill(otherHero, 'WEAPON', 'Fear')) {
      debuffs = {...debuffs, atk: Math.max(debuffs.atk, 6)};
    }
    if (hasSkill(otherHero, 'WEAPON', 'Slow')) {
      debuffs = {...debuffs, spd: Math.max(debuffs.spd, 6)};
    }
  }
  // TODO: Panic
  return {...hero, state: {...hero.state, debuffs}};
}
