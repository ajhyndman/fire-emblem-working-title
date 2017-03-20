// @flow
import {
  max,
  multiply,
  test,
} from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';

import {
  getMitigationType,
  getRange,
  getSkill,
  getStat,
  getWeaponColor,
  hasBraveWeapon,
} from './heroHelpers';


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

const doesFollowUp = (heroA: Hero, heroB: Hero, isAttacker: boolean) =>
  (getStat(heroA, 'spd', isAttacker) - getStat(heroB, 'spd', !isAttacker) >= 5);

// Healers do half-damage
const classModifier = (hero: Hero) => hero.weaponType === 'Neutral Staff' ? 0.5 : 1;

const advantageBonus = (heroA: Hero, heroB: Hero) => {
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
}

const effectiveBonus = (attacker: Hero, defender: Hero) => {
  if (attacker.weaponType === 'Neutral Bow' && defender.moveType === 'Flying') {
    return 1.5;
  }
  const weaponName = getSkill(attacker, 'WEAPON');
  if ((test(/(Heavy Spear|Armorslayer|Hammer)/, weaponName) && defender.moveType == 'Armored')
      || (test(/wolf/, weaponName) && defender.moveType == 'Cavalry')
      || (test(/Poison Dagger/, weaponName) && defender.moveType == 'Infantry')
      || (test(/Excalibur/, weaponName) && defender.moveType == 'Flying')
      || (test(/(Falchion|Naga)/, weaponName) && test(/Beast/, defender.weaponType))) {
    return 1.5;
  }
  else return 1;
};

const canRetaliate = (attacker: Hero, defender: Hero) => {
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
}

const hpRemaining = (dmg, hp) => max(hp - dmg, 0);

const hitDmg = (attacker: Hero, defender: Hero, isAttacker: boolean) => dmgFormula(
  getStat(attacker, "atk", isAttacker),
  effectiveBonus(attacker, defender),
  advantageBonus(attacker, defender),
  getStat(defender, getMitigationType(attacker), !isAttacker),
  classModifier(attacker),
);

/**
 * Calculate the resulting damage per hit, number of hits, and final HP for each hero.
 *
 * @param {Hero} attacker
 * @param {Hero} defender
 * @returns {object}
 */
export const calculateResult = (attacker: Hero, defender: Hero) => {
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

  let damages = [hitDmg(attacker, defender, true), hitDmg(defender, attacker, false)];
  let numAttacks = [0, 0];
  let healths = [getStat(attacker, "hp", true), getStat(defender, "hp", false)];
  for (let attackingHeroIndex of attackOrder) {
    numAttacks[attackingHeroIndex]++;
    if (healths[attackingHeroIndex] > 0) {
      const otherHeroIndex = 1 - attackingHeroIndex;
      healths[otherHeroIndex] = hpRemaining(damages[attackingHeroIndex], healths[otherHeroIndex]);
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
