// @flow
import {
  map,
  max,
  replace,
  test,
} from 'ramda';

import {
  getMitigationType,
  getRange,
  getSkillName,
  getStat,
  getWeaponColor,
  hasBraveWeapon,
  hasSkill,
  lookupStats,
} from './heroHelpers';
import {
  doesDefenseSpecialApply,
  getSkillNumbers,
  getSpecialAOEDamageAmount,
  getSpecialBonusDamageAmount,
  getSpecialCooldown,
  getSpecialDefensiveMultiplier,
  getSpecialLifestealPercent,
  getSpecialMitigationMultiplier,
  getSpecialOffensiveMultiplier,
  getSpecialType,
} from './skillHelpers';
import type { HeroInstance } from './store';
import type { SpecialType } from './skillHelpers';
  
const truncate = (x: number) => x >= 0 ? Math.floor(x) : Math.ceil(x);

/**
 * Formula derived from:
 * http://feheroes.wiki/Damage_Calculation#Complete_formula
 * Defensive multiplier and precombat specials are applied separately.
 *
 * @param {number} atk Hero's attack
 * @param {number} eff Effective against bonus (e.g. Bow vs Flying Unit)
 * @param {number} adv Color advantage bonus (red > green > blue)
 * @param {number} mit Damage mitigation value (comes from resist or defence)
 * @param {number} classModifier At this time, Neutral Staff has a 0.5x net damage reduction.
 * @param {number} bonusDamage = 0;       // From skills like Bonfire
 * @param {number} offensiveMult = 0.0;   // From skills like Glimmer
 * @param {number} mitigationMult = 0.0;  // From skills like Luna
 * @returns {number} the damage a single hit will effect
 */
const dmgFormula = (
  atk: number,
  eff: number = 1.0,
  adv: number = 0.0,
  mit: number = 0,
  classModifier: number = 1.0,
  bonusDamage: number = 0,       // From skills like Bonfire
  offensiveMult: number = 0.0,   // From skills like Glimmer
  mitigationMult: number = 0.0,  // From skills like Luna
) => truncate(
  (1 + offensiveMult) * 
  truncate(
    (classModifier) * 
    max(
      truncate(atk * eff)
      + truncate(truncate(atk * eff) * adv)
      + truncate(bonusDamage)
      - (mit - truncate(mit * mitigationMult)),
      0,
    ),
  ),
);

const hasWeaponBreaker = (instanceA: HeroInstance, instanceB: HeroInstance) => {
  const heroB = lookupStats(instanceB.name);
  let necessaryBreaker = replace(/(Red|Green|Blue|Neutral)\s/, '', heroB.weaponType) + 'breaker';
  if (test(/Tome/, heroB.weaponType)) {
    // R Tomebreaker, G Tomebreaker, B Tomebreaker
    necessaryBreaker = heroB.weaponType[0] + ' ' + necessaryBreaker;
  }
  if (hasSkill(instanceA, 'PASSIVE_B', necessaryBreaker)) {
    return true;
  }
  if (necessaryBreaker === 'Daggerbreaker') {
    return hasSkill(instanceA, 'WEAPON', 'Assassin\'s Bow');
  }
  return false;
};

// Whether or not a unit will perform a follow-up attack.
const doesFollowUp = (instanceA: HeroInstance, instanceB: HeroInstance, isAttacker: boolean) => {
  // Supposedly x-breaker overrides wary-fighter, and multiple x-breakers cancel out.
  const aHasBreaker = hasWeaponBreaker(instanceA, instanceB);
  const bHasBreaker = hasWeaponBreaker(instanceB, instanceA);
  if (aHasBreaker && !bHasBreaker) {
    return true;
  } else if (bHasBreaker && !aHasBreaker) {
    return false;
  } else if (hasSkill(instanceA, 'PASSIVE_B', 'Wary Fighter')
             || hasSkill(instanceB, 'PASSIVE_B', 'Wary Fighter')) {
    return false;
  } else if (!isAttacker && (hasSkill(instanceA, 'WEAPON', 'Armads')
             || hasSkill(instanceA, 'PASSIVE_B', 'Quick Riposte'))) {
    return true;
  }
  return (
    (getStat(instanceA, 'spd', 40, isAttacker)
    - getStat(instanceB, 'spd', 40, !isAttacker))
    >= 5
  );
};

// Healers do half-damage
const classModifier = (instance: HeroInstance) => {
  const hero = lookupStats(instance.name);
  return (hero && (hero.weaponType === 'Neutral Staff')) ? 0.5 : 1;
};

const advantageBonus = (heroA: HeroInstance, heroB: HeroInstance) => {
  const colorA = getWeaponColor(heroA);
  const colorB = getWeaponColor(heroB);
  const weaponA = getSkillName(heroA, 'WEAPON');
  const weaponB = getSkillName(heroB, 'WEAPON');
  let advantage = 0;
  if (
    (colorA === 'RED' && colorB === 'GREEN')
    || (colorA === 'GREEN' && colorB === 'BLUE')
    || (colorA === 'BLUE' && colorB === 'RED')
  ) {
    advantage = 1;
  } else if (
    (colorA === 'RED' && colorB === 'BLUE')
    || (colorA === 'GREEN' && colorB === 'RED')
    || (colorA === 'BLUE' && colorB === 'GREEN')
  ) {
    advantage = -1;
  } else if (colorB === 'NEUTRAL' && test(/raven/, weaponA)) {
    advantage = 1;
  } else if (colorA === 'NEUTRAL' && test(/raven/, weaponB)) {
    advantage = -1;
  }
  const passiveA = getSkillName(heroA, 'PASSIVE_A');
  const passiveB = getSkillName(heroB, 'PASSIVE_A');
  // Weapon type advantage multipliers don't stack. Source:
  // https://feheroes.wiki/Damage_Calculation#Weapon_Triangle_Advantage
  let advantageMultiplier = 0.2;
  if (test(/(Ruby|Sapphire|Emerald)/, weaponA)
      || test(/(Ruby|Sapphire|Emerald)/, weaponB)
      || passiveA === 'Triangle Adept 3'
      || passiveB === 'Triangle Adept 3') {
    advantageMultiplier = 0.4;  // 20%
  } else if (passiveA === 'Triangle Adept 2' || passiveB === 'Triangle Adept 2') {
    advantageMultiplier = 0.35;  // 15%
  } else if (passiveA === 'Triangle Adept 1' || passiveB === 'Triangle Adept 1') {
    advantageMultiplier = 0.3;  // 10%
  }
  return advantage * advantageMultiplier;
};

const effectiveBonus = (attacker: HeroInstance, defender: HeroInstance) => {
  if (hasSkill(defender, 'PASSIVE_A', 'Shield')) {
    return 1;
  }
  const defenderMoveType = lookupStats(defender.name).moveType;
  if (
    lookupStats(attacker.name).weaponType === 'Neutral Bow'
    && defenderMoveType === 'Flying'
  ) {
    return 1.5;
  }
  const weaponName = getSkillName(attacker, 'WEAPON');
  if ((test(/(Heavy Spear|Armorslayer|Hammer)/, weaponName) && defenderMoveType === 'Armored')
      || (test(/wolf/, weaponName) && defenderMoveType === 'Cavalry')
      || (test(/Poison Dagger/, weaponName) && defenderMoveType === 'Infantry')
      || (test(/Excalibur/, weaponName) && defenderMoveType === 'Flying')
      || (test(/(Falchion|Naga)/, weaponName)
          && test(/Beast/, lookupStats(defender.name).weaponType))
    ) {
    return 1.5;
  }
  else return 1;
};

const canRetaliate = (attacker: HeroInstance, defender: HeroInstance) => {
  if (getSkillName(defender, 'WEAPON') === '') {
    return false;
  }
  if (getRange(defender) === getRange(attacker)) {
    return true;
  }
  const passiveA = getSkillName(defender, 'PASSIVE_A');
  const weaponName = getSkillName(defender, 'WEAPON');
  return (passiveA === 'Close Counter'
       || passiveA === 'Distant Counter'
       || weaponName === 'Raijinto'
       || weaponName === 'Lightning Breath'
       || weaponName === 'Lightning Breath+');
};

const hpRemaining = (dmg, hp, canBeLethal = true) => max(hp - dmg, canBeLethal ? 0 : 1);

const hitDmg = (
  attacker: HeroInstance,
  defender: HeroInstance,
  isAttacker: boolean,
  attackerSpecial: string = '',
  attackerMissingHp: number = 0,
) => dmgFormula(
  getStat(attacker, 'atk', 40, isAttacker),
  effectiveBonus(attacker, defender),
  advantageBonus(attacker, defender),
  getStat(defender, getMitigationType(attacker), 40, !isAttacker),
  classModifier(attacker),
  getSpecialBonusDamageAmount(attackerSpecial, attacker, isAttacker, attackerMissingHp),
  getSpecialOffensiveMultiplier(attackerSpecial),
  getSpecialMitigationMultiplier(attackerSpecial),
);

/**
 * Calculate the resulting damage per hit, number of hits, and final HP for each hero.
 *
 * @param {Hero} attacker
 * @param {Hero} defender
 * @returns {object}
 */
export const calculateResult = (
  attacker: HeroInstance,
  defender: HeroInstance,
  // Note: current implementation of skills assumes full health.
  attackerInitialHp: ?number = null,
  defenderInitialHp: ?number = null,
  attackerInitialCooldown: ?number = null,
  defenderInitialCooldown: ?number = null,
) => {
  // a list of 0s and 1s for attacker and defender.
  let attackOrder = [];
  if (getSkillName(attacker, 'WEAPON') !== '') {
    // attacker hits defender
    attackOrder.push(0);
    if (hasBraveWeapon(attacker)) {
      attackOrder.push(0);
    }
    // defender retaliates
    if (canRetaliate(attacker, defender)) {
      attackOrder.push(1);
    }
    // attacker follow-up
    if (doesFollowUp(attacker, defender, true)) {
      attackOrder.push(0);
      if (hasBraveWeapon(attacker)) {
        attackOrder.push(0);
      }
    }
    // defender follow-up
    if (canRetaliate(attacker, defender)
      && doesFollowUp(defender, attacker, false)) {
      attackOrder.push(1);
    }
  }
  // TODO: decide if Galeforce will trigger.

  const heroes = [attacker, defender];
  const damages = [hitDmg(attacker, defender, true), hitDmg(defender, attacker, false)];
  const maxHps = [getStat(attacker, 'hp'), getStat(defender, 'hp')];
  const specialNames: Array<string> =
    [getSkillName(attacker, 'SPECIAL'), getSkillName(defender, 'SPECIAL')];
  // $FlowIssue $Iterable. This type is incompatible with array type
  const specialTypes: Array<SpecialType> = map(getSpecialType, heroes);
  // $FlowIssue $Iterable. This type is incompatible with array type
  let specialCds: Array<number> = [
    attackerInitialCooldown == null ? getSpecialCooldown(attacker) : attackerInitialCooldown,
    defenderInitialCooldown == null ? getSpecialCooldown(defender) : defenderInitialCooldown,
  ]
  let numAttacks = [0, 0];
  let healths = [attackerInitialHp || maxHps[0], defenderInitialHp || maxHps[1]];
  // AOE Damage
  const aoeDamage = specialCds[0] === 0
    ? getSpecialAOEDamageAmount(specialNames[0], attacker, defender) : 0;
  let specialDamages = [aoeDamage, 0];
  healths[1] = hpRemaining(aoeDamage, healths[1], false);
  // Main combat loop.
  for (let heroIndex: number of attackOrder) {
    // heroIndex hits otherHeroIndex.
    numAttacks[heroIndex]++;
    if (healths[heroIndex] > 0) {
      const otherHeroIndex: number = 1 - heroIndex;
      const stillFighting = healths[0] > 0 && healths[1] > 0;
      let lifestealPercent = hasSkill(heroes[heroIndex], 'WEAPON', 'Absorb') ? 0.5 : 0.0;
            
      // Attacker Special. Use '' for no special.
      let attackerSpecial = '';
      let dmgWithoutSpecial = hitDmg(
        heroes[heroIndex],
        heroes[otherHeroIndex],
        heroIndex === 0,  // isAttacker
      );
      if (specialCds[heroIndex] === 0 && specialTypes[heroIndex] === 'ATTACK') {
        attackerSpecial = specialNames[heroIndex];
        lifestealPercent += getSpecialLifestealPercent(attackerSpecial);
        specialCds[heroIndex] = getSpecialCooldown(heroes[heroIndex]);
      } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[heroIndex] > 0) {
        specialCds[heroIndex]--;
      }
      let dmg = hitDmg(
        heroes[heroIndex],
        heroes[otherHeroIndex],
        heroIndex === 0,  // isAttacker
        attackerSpecial,
        getStat(heroes[heroIndex], 'hp') - healths[heroIndex],  // missing hp
      );
      specialDamages[heroIndex] += (dmg - dmgWithoutSpecial);

      // Defender Special
      if (specialCds[otherHeroIndex] === 0 && specialTypes[otherHeroIndex] === 'ATTACKED') {
        const specialName = specialNames[otherHeroIndex];
        if (specialName === 'Miracle' && dmg >= healths[otherHeroIndex]) {
          dmg = healths[otherHeroIndex] - 1;
          specialCds[otherHeroIndex] = getSpecialCooldown(heroes[otherHeroIndex]);
        // The unit that initiated combat decided the range of the battle.
        } else if (doesDefenseSpecialApply(specialName, getRange(attacker))) {
          dmg = Math.ceil(dmg * (1 - getSpecialDefensiveMultiplier(specialName)));
          specialCds[otherHeroIndex] = getSpecialCooldown(heroes[otherHeroIndex]);
        }
      } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[otherHeroIndex] > 0) {
        specialCds[otherHeroIndex]--;
      }
      // Apply damage
      healths[otherHeroIndex] = hpRemaining(dmg, healths[otherHeroIndex], true);
      if (stillFighting) {
        healths[heroIndex] = Math.min(
          healths[heroIndex] + Math.floor(dmg * lifestealPercent),
          maxHps[heroIndex],
        );
      }
    }
  }
  
  // Post combat damage and healing. These effects are simultaneous and nonlethal.
  let postCombatDmg = [0, 0];
  if (hasSkill(heroes[0], 'WEAPON', '(Egg|Carrot)')) {
    postCombatDmg[0] = -4;
  }
  // Poison Strike (only trigger while attacking and only if the attacker survived)
  if (healths[0] > 0 && hasSkill(heroes[0], 'PASSIVE_B', 'Poison Strike')) {
    postCombatDmg[1] += getSkillNumbers(getSkillName(heroes[0], 'PASSIVE_B'))[0];
  }
  for (let heroIndex of [0, 1]) {
    // Fury
    if (hasSkill(heroes[heroIndex], 'PASSIVE_A', 'Fury')) {
      postCombatDmg[heroIndex] += getSkillNumbers(getSkillName(heroes[heroIndex], 'PASSIVE_A'))[0];
    }
    // Pain (only triggers if the staff user survived and was able to retaliate)
    const otherHeroI = 1 - heroIndex;
    if (healths[otherHeroI] > 0
        && numAttacks[otherHeroI] > 0 && hasSkill(heroes[otherHeroI], 'WEAPON', 'Pain')) {
      postCombatDmg[heroIndex] += getSkillNumbers(getSkillName(heroes[otherHeroI], 'WEAPON'))[0];
    }
    // Only apply postcombat damage to living units
    if (healths[heroIndex] > 0) {
      healths[heroIndex] = Math.min(
        hpRemaining(postCombatDmg[heroIndex], healths[heroIndex], false),
        maxHps[heroIndex],
      );
    }
  }

  return {
    attackerSpecialDamage: specialDamages[0],
    defenderSpecialDamage: specialDamages[1],
    attackerNumAttacks: numAttacks[0],
    attackerDamage: damages[0],
    attackerHpRemaining: healths[0],
    defenderNumAttacks: numAttacks[1],
    defenderDamage: damages[1],
    defenderHpRemaining: healths[1],
  };
};
