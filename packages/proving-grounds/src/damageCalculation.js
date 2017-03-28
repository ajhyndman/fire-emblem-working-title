// @flow
import {
  max,
  multiply,
  replace,
  test,
} from 'ramda';

import {
  getMitigationType,
  getRange,
  getSkill,
  getStat,
  getWeaponColor,
  hasBraveWeapon,
  hasSkill,
  lookupStats,
} from './heroHelpers';
import type { HeroInstance } from './store';


const truncate = (x: number) => x >= 0 ? Math.floor(x) : Math.ceil(x);

/**
 * Formula derived from:
 * http://feheroes.wiki/Damage_Calculation#Complete_formula
 *
 * @param {number} atk Hero's attack
 * @param {number} eff Effective against bonus (e.g. Bow vs Flying Unit)
 * @param {number} adv Color advantage bonus (red > green > blue)
 * @param {number} mit Damage mitigation value (comes from resist or defence)
 * @param {number} classModifier At this time, Neutral Staff has a 0.5x net damage reduction.
 * @returns {number} the damage a single hit will effect
 */
const dmgFormula = (
  atk: number,
  eff: number,
  adv: number,
  mit: number,
  classModifier: number,
) => Math.floor(
  multiply(
    max(
      Math.floor(atk * eff)
      + truncate(
        truncate(atk * eff)
        * adv)
      - mit,
      0,
    ),
    classModifier,
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
  const weaponA = getSkill(heroA, 'WEAPON');
  const weaponB = getSkill(heroB, 'WEAPON');
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
  const passiveA = getSkill(heroA, 'PASSIVE_A');
  const passiveB = getSkill(heroB, 'PASSIVE_A');
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
  const weaponName = getSkill(attacker, 'WEAPON');
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
  if (getRange(defender) === getRange(attacker)) {
    return true;
  }
  const passiveA = getSkill(defender, 'PASSIVE_A');
  const weaponName = getSkill(defender, 'WEAPON');
  return (passiveA === 'Close Counter'
       || passiveA === 'Distant Counter'
       || weaponName === 'Raijinto'
       || weaponName === 'Lightning Breath'
       || weaponName === 'Lightning Breath+');
};

const hpRemaining = (dmg, hp) => max(hp - dmg, 0);

const hitDmg = (attacker: HeroInstance, defender: HeroInstance, isAttacker: boolean) => dmgFormula(
  getStat(attacker, 'atk', 40, isAttacker),
  effectiveBonus(attacker, defender),
  advantageBonus(attacker, defender),
  getStat(defender, getMitigationType(attacker), 40, !isAttacker),
  classModifier(attacker),
);

/**
 * Calculate the resulting damage per hit, number of hits, and final HP for each hero.
 *
 * @param {Hero} attacker
 * @param {Hero} defender
 * @returns {object}
 */
export const calculateResult = (attacker: HeroInstance, defender: HeroInstance) => {
  // a list of 0s and 1s for attacker and defender.
  let attackOrder = [];
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

  const damages = [hitDmg(attacker, defender, true), hitDmg(defender, attacker, false)];
  const heroes = [attacker, defender];
  let numAttacks = [0, 0];
  let healths = [getStat(attacker, 'hp'), getStat(defender, 'hp')];
  for (let heroIndex of attackOrder) {
    // heroIndex hits otherHeroIndex.
    numAttacks[heroIndex]++;
    if (healths[heroIndex] > 0) {
      const otherHeroIndex = 1 - heroIndex;
      const stillFighting = healths[0] > 0 && healths[1] > 0;
      healths[otherHeroIndex] = hpRemaining(damages[heroIndex], healths[otherHeroIndex]);
      if (stillFighting && hasSkill(heroes[heroIndex], 'WEAPON', 'Absorb')) {
        healths[heroIndex] = Math.min(
          healths[heroIndex] + Math.floor(damages[heroIndex] / 2),
          getStat(heroes[heroIndex], 'hp'),
        );
      }
    }
  }

  return {
    attackerNumAttacks: numAttacks[0],
    attackerDamage: damages[0],
    attackerHpRemaining: healths[0],
    defenderNumAttacks: numAttacks[1],
    defenderDamage: damages[1],
    defenderHpRemaining: healths[1],
  };
};
