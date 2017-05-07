// @flow
import {
  map,
  max,
  replace,
  test,
} from 'ramda';

import {
  getMitigationType,
  getMoveType,
  getRange,
  getSkillName,
  getStat,
  getWeaponColor,
  getWeaponType,
  hasBraveWeapon,
  hasSkill,
} from './heroHelpers';
import {
  doesDefenseSpecialApply,
  getSkillNumbers,
  getSpecialAOEDamageAmount,
  getSpecialBonusDamageAmount,
  getSpecialChargeForAttack,
  getSpecialChargeWhenAttacked,
  getSpecialCooldown,
  getSpecialDefensiveMultiplier,
  getSpecialLifestealPercent,
  getSpecialMitigationMultiplier,
  getSpecialOffensiveMultiplier,
  getSpecialType,
  withPostCombatBuffs,
  withPostCombatDebuffs,
  withTurnStartBuffs,
  withTurnStartDebuffs,
} from './skillHelpers';
import type { HeroInstance } from './heroInstance';
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
  const heroBWeapon = getWeaponType(instanceB);
  let necessaryBreaker = replace(/(Red|Green|Blue|Neutral)\s/, '', heroBWeapon) + 'breaker';
  if (test(/Tome/, heroBWeapon)) {
    // R Tomebreaker, G Tomebreaker, B Tomebreaker
    necessaryBreaker = heroBWeapon[0] + ' ' + necessaryBreaker;
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
  if (isAttacker && (hasSkill(instanceA, 'PASSIVE_B', 'Windsweep')
      || hasSkill(instanceA, 'PASSIVE_B', 'Watersweep'))) {
    return false;
  }
  const aHasBreaker = hasWeaponBreaker(instanceA, instanceB);
  const bHasBreaker = hasWeaponBreaker(instanceB, instanceA);
  const guaranteedFollowup = aHasBreaker
    || (isAttacker && hasSkill(instanceA, 'PASSIVE_B', 'Brash Assault')
        && canRetaliate(instanceA, instanceB))
    || (!isAttacker && hasSkill(instanceA, 'WEAPON', 'Armads'))
    || (!isAttacker && hasSkill(instanceA, 'PASSIVE_B', 'Quick Riposte'));
  const cannotFollowup = bHasBreaker
    || hasSkill(instanceA, 'PASSIVE_B', 'Wary Fighter')
    || hasSkill(instanceB, 'PASSIVE_B', 'Wary Fighter');
  // Guaranteed-followup and cannot-followup skills cancel out and it comes down to speed.
  if (guaranteedFollowup && !cannotFollowup) {
    return true;
  } else if (cannotFollowup && !guaranteedFollowup) {
    return false;
  }
  return (
    (getStat(instanceA, 'spd', 40, isAttacker)
    - getStat(instanceB, 'spd', 40, !isAttacker))
    >= 5
  );
};

// Healers do half-damage
const classModifier = (instance: HeroInstance) =>
  getWeaponType(instance) === 'Neutral Staff' ? 0.5 : 1;

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
  const defenderMoveType = getMoveType(defender);
  if (
    getWeaponType(attacker) === 'Neutral Bow'
    && defenderMoveType === 'Flying'
  ) {
    return 1.5;
  }
  const weaponName = getSkillName(attacker, 'WEAPON');
  if ((test(/(Heavy Spear|Armorslayer|Hammer)/, weaponName) && defenderMoveType === 'Armored')
      || (test(/wolf/, weaponName) && defenderMoveType === 'Cavalry')
      || (test(/Poison Dagger/, weaponName) && defenderMoveType === 'Infantry')
      || (test(/Excalibur/, weaponName) && defenderMoveType === 'Flying')
      || (test(/(Falchion|Naga)/, weaponName) && test(/Breath/, getWeaponType(defender)))
    ) {
    return 1.5;
  }
  else return 1;
};

const canRetaliate = (attacker: HeroInstance, defender: HeroInstance) => {
  if (getSkillName(defender, 'WEAPON') === ''
      || hasSkill(attacker, 'WEAPON', 'Firesweep')
      || hasSkill(defender, 'WEAPON', 'Firesweep')) {
    return false;
  }
  // Windsweep checks for Sword/Lance/Axe/Bow/Dagger = all physical weapons.
  // Watersweep checks for Tome/Staff/Dragonstone = all magical weapons.
  if ((hasSkill(attacker, 'PASSIVE_B', 'Windsweep') && getMitigationType(defender) === 'def')
      || (hasSkill(attacker, 'PASSIVE_B', 'Watersweep') && getMitigationType(defender) === 'res')) {
    // The attacker must also be faster than the defender.
    const spdReq = getSkillNumbers(attacker, 'PASSIVE_B')[0];
    if (getStat(attacker, 'spd', 40, true) - getStat(defender, 'spd', 40, false) >= spdReq) {
      return false;
    }
  }
  if (getRange(defender) === getRange(attacker)) {
    return true;
  }
  const passiveA = getSkillName(defender, 'PASSIVE_A');
  const weaponName = getSkillName(defender, 'WEAPON');
  return (passiveA === 'Close Counter'
       || passiveA === 'Distant Counter'
       || weaponName === 'Gradivus'
       || weaponName === 'Raijinto'
       || weaponName === 'Ragnell'
       || weaponName === 'Siegfried'
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
) => hasSkill(defender, 'SEAL', 'Embla\'s Ward') ? 0 : dmgFormula(
  getStat(attacker, 'atk', 40, isAttacker),
  effectiveBonus(attacker, defender),
  advantageBonus(attacker, defender),
  getStat(defender, getMitigationType(attacker), 40, !isAttacker),
  classModifier(attacker),
  getSpecialBonusDamageAmount(attackerSpecial, attacker, isAttacker, attackerMissingHp),
  getSpecialOffensiveMultiplier(attackerSpecial),
  getSpecialMitigationMultiplier(attackerSpecial),
);

// Returns a list of 0s and 1s, representing hero-0 and hero-1 hitting each other.
export function computeAttackOrder(attacker: HeroInstance, defender: HeroInstance): Array<number> {
  // First, check for the ability to retaliate and skills that affect attack order.
  const attackerHasFollowup = doesFollowUp(attacker, defender, true);
  const defenderCanRetaliate = canRetaliate(attacker, defender);
  const defenderHasFollowup = defenderCanRetaliate && doesFollowUp(defender, attacker, false);
  const defenderCountersFirst = defenderCanRetaliate
    && (hasSkill(defender, 'PASSIVE_B', 'Vantage')
      || hasSkill(defender, 'WEAPON', 'Valaskjálf'));
  const attackerImmediateFollowup = attackerHasFollowup
    && (hasSkill(attacker, 'PASSIVE_B', 'Desperation')
      || hasSkill(attacker, 'WEAPON', 'Sol Katti'));

  // a list of 0s and 1s for attacker and defender.
  let attackOrder = [];
  if (getSkillName(attacker, 'WEAPON') === '') {
    return [];
  }
  // Vantage!
  if (defenderCountersFirst) {
    attackOrder.push(1);
  }
  // attacker hits defender
  attackOrder.push(0);
  if (hasBraveWeapon(attacker)) {
    attackOrder.push(0);
  }
  // Desperation!
  if (attackerImmediateFollowup) {
    attackOrder.push(0);
    if (hasBraveWeapon(attacker)) {
      attackOrder.push(0);
    }
  }
  // defender retaliates
  if (defenderCanRetaliate && !defenderCountersFirst) {
    attackOrder.push(1);
  }
  // attacker follow-up
  if (attackerHasFollowup && !attackerImmediateFollowup) {
    attackOrder.push(0);
    if (hasBraveWeapon(attacker)) {
      attackOrder.push(0);
    }
  }
  // defender follow-up
  if (defenderHasFollowup) {
    attackOrder.push(1);
  }
  return attackOrder;
}

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
) => {
  // Apply start-of-turn buffs/debuffs
  attacker = withTurnStartBuffs(attacker, true);
  defender = withTurnStartBuffs(defender, false);
  attacker = withTurnStartDebuffs(attacker, defender);
  defender = withTurnStartDebuffs(defender, attacker);

  const attackOrder = computeAttackOrder(attacker, defender);

  const heroes = [attacker, defender];
  const damages = [hitDmg(attacker, defender, true), hitDmg(defender, attacker, false)];
  const maxHps = [getStat(attacker, 'hp'), getStat(defender, 'hp')];
  const specialNames: Array<string> =
    [getSkillName(attacker, 'SPECIAL'), getSkillName(defender, 'SPECIAL')];
  // $FlowIssue $Iterable. This type is incompatible with array type
  const specialTypes: Array<SpecialType> = map(getSpecialType, heroes);
  let maxCds: Array<number> = [getSpecialCooldown(attacker), getSpecialCooldown(defender)];
  let specialCds: Array<number> = [
    maxCds[0] === -1 ? -1 : Math.max(0, maxCds[0] - attacker.state.specialCharge),
    maxCds[1] === -1 ? -1 : Math.max(0, maxCds[1] - defender.state.specialCharge),
  ];
  let numAttacks = [0, 0];
  let healths = [maxHps[0] - attacker.state.hpMissing, maxHps[1] - defender.state.hpMissing];
  // AOE Damage
  const aoeDamage = specialCds[0] === 0
    ? getSpecialAOEDamageAmount(specialNames[0], attacker, defender) : 0;
  let specialDamages = [aoeDamage, 0];
  healths[1] = hpRemaining(aoeDamage, healths[1], false);
  // Main combat loop.
  for (let heroIndex: number of attackOrder) {
    const isInitiator = (heroIndex === 0);
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
        isInitiator,
      );
      if (specialCds[heroIndex] === 0 && specialTypes[heroIndex] === 'ATTACK') {
        attackerSpecial = specialNames[heroIndex];
        lifestealPercent += getSpecialLifestealPercent(attackerSpecial);
        specialCds[heroIndex] = maxCds[heroIndex];
      } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[heroIndex] > 0) {
        specialCds[heroIndex] = Math.max(0, specialCds[heroIndex] - getSpecialChargeForAttack(
          heroes[heroIndex],
          heroes[otherHeroIndex],
          isInitiator,
        ));
      }
      let dmg = hitDmg(
        heroes[heroIndex],
        heroes[otherHeroIndex],
        isInitiator,
        attackerSpecial,
        getStat(heroes[heroIndex], 'hp') - healths[heroIndex],  // missing hp
      );
      specialDamages[heroIndex] += (dmg - dmgWithoutSpecial);

      // Defender Special
      if (specialCds[otherHeroIndex] === 0 && specialTypes[otherHeroIndex] === 'ATTACKED') {
        const specialName = specialNames[otherHeroIndex];
        if (specialName === 'Miracle' && dmg >= healths[otherHeroIndex]) {
          dmg = healths[otherHeroIndex] - 1;
          specialCds[otherHeroIndex] = maxCds[otherHeroIndex];
        // The unit that initiated combat decided the range of the battle.
        } else if (doesDefenseSpecialApply(specialName, getRange(attacker))) {
          dmg = Math.ceil(dmg * (1 - getSpecialDefensiveMultiplier(specialName)));
          specialCds[otherHeroIndex] = maxCds[otherHeroIndex];
        }
      } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[otherHeroIndex] > 0) {
        specialCds[otherHeroIndex] -= getSpecialChargeWhenAttacked(heroes[heroIndex]);
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
  // TODO: Galeforce (if specialCd[0] === 0). Effectively another round of combat but same turn.

  // Post combat damage and healing. These effects are simultaneous and nonlethal.
  let postCombatDmg = [0, 0];
  if (hasSkill(heroes[0], 'WEAPON', '(Egg|Carrot)')) {
    postCombatDmg[0] = -4;
  }
  // Poison Strike (only trigger while attacking and only if the attacker survived)
  if (healths[0] > 0 && hasSkill(heroes[0], 'PASSIVE_B', 'Poison Strike')) {
    postCombatDmg[1] += getSkillNumbers(heroes[0], 'PASSIVE_B')[0];
  }
  // Deathly Dagger (same conditions as poison strike). 1st number is debuff, 2nd is damage.
  if (healths[0] > 0 && hasSkill(heroes[0], 'WEAPON', 'Deathly Dagger')) {
    postCombatDmg[1] += getSkillNumbers(heroes[0], 'WEAPON')[1];
  }
  for (let heroIndex of [0, 1]) {
    // Fury
    if (hasSkill(heroes[heroIndex], 'PASSIVE_A', 'Fury')) {
      postCombatDmg[heroIndex] += getSkillNumbers(heroes[heroIndex], 'PASSIVE_A')[1];
    }
    // Pain (only triggers if the staff user survived and was able to retaliate)
    const otherHeroI = 1 - heroIndex;
    if (healths[otherHeroI] > 0
        && numAttacks[otherHeroI] > 0 && hasSkill(heroes[otherHeroI], 'WEAPON', 'Pain')) {
      postCombatDmg[heroIndex] += getSkillNumbers(heroes[otherHeroI], 'WEAPON')[0];
    }
    // Only apply postcombat damage to living units
    if (healths[heroIndex] > 0) {
      healths[heroIndex] = Math.min(
        hpRemaining(postCombatDmg[heroIndex], healths[heroIndex], false),
        maxHps[heroIndex],
      );
    }
  }

  // Apply new buffs and new debuffs.
  attacker = withPostCombatBuffs(attacker);
  defender = withPostCombatBuffs(defender);
  attacker = withPostCombatDebuffs(attacker, defender, true, healths[1] > 0);
  defender = withPostCombatDebuffs(defender, attacker, false, healths[0] > 0);

  return {
    combatInfo: {
      attackerDamage: damages[0],
      attackerNumAttacks: numAttacks[0],
      attackerSpecialDamage: specialDamages[0],
      attackerHp: healths[0],
      defenderDamage: damages[1],
      defenderNumAttacks: numAttacks[1],
      defenderSpecialDamage: specialDamages[1],
      defenderHp: healths[1],
    },
    attackerState: {
      ...attacker.state,
      hpMissing: maxHps[0] - healths[0],
      specialCharge: maxCds[0] === -1 ? 0 : maxCds[0] - specialCds[0],
    },
    defenderState: {
      ...defender.state,
      hpMissing: maxHps[1] - healths[1],
      specialCharge: maxCds[1] === -1 ? 0 : maxCds[1] - specialCds[1],
    },
  };
};
