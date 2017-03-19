// @flow
import {
  max,
  multiply,
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


type Color = 'RED' | 'GREEN' | 'BLUE' | 'NEUTRAL';

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
      Math.floor(
        Math.floor(atk * eff) * adv,
      ) - mit,
      0,
    ),
    classModifier,
  ),
);

const doesFollowUp = (heroA: Hero, heroB: Hero, isAttacker: boolean) =>
  (getStat(heroA, 'spd', isAttacker) - getStat(heroB, 'spd', !isAttacker) >= 5);

// Healers do half-damage
const classModifier = (hero: Hero) => hero.weaponType === 'Neutral Staff' ? 0.5 : 1;

const advantageBonus = (colorA: Color, colorB: Color) => {
  if (
    (colorA === 'RED' && colorB === 'GREEN')
    || (colorA === 'GREEN' && colorB === 'BLUE')
    || (colorA === 'BLUE' && colorB === 'RED')
  ) {
    return 1.2;
  } else if (
    (colorA === 'RED' && colorB === 'BLUE')
    || (colorA === 'GREEN' && colorB === 'RED')
    || (colorA === 'BLUE' && colorB === 'GREEN')
  ) {
    return 0.8;
  }
  return 1;
}

const effectiveBonus = (attacker: Hero, defender: Hero) => {
  if (attacker.weaponType === 'Neutral Bow' && defender.moveType === 'Flying') {
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
  advantageBonus(
    getWeaponColor(attacker),
    getWeaponColor(defender),
  ),
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
