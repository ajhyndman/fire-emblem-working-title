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
import { invertContext } from './heroInstance';
import type { Context, HeroInstance } from './heroInstance';
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

const hasWeaponBreaker = (hero: HeroInstance, context: Context) => {
  const heroBWeapon = getWeaponType(context.enemy);
  let necessaryBreaker = replace(/(Red|Green|Blue|Neutral)\s/, '', heroBWeapon) + 'breaker';
  if (test(/Tome/, heroBWeapon)) {
    // R Tomebreaker, G Tomebreaker, B Tomebreaker
    necessaryBreaker = heroBWeapon[0] + ' ' + necessaryBreaker;
  }
  if (hasSkill(hero, 'PASSIVE_B', necessaryBreaker)) {
    return true;
  }
  if (necessaryBreaker === 'Daggerbreaker') {
    return hasSkill(hero, 'WEAPON', 'Assassin\'s Bow');
  }
  return false;
};

// Whether or not a unit will perform a follow-up attack.
const doesFollowUp = (
  instanceA: HeroInstance,
  context: Context,
) => {
  const instanceB = context.enemy;
  if (context.isAttacker && (hasSkill(instanceA, 'PASSIVE_B', 'Windsweep')
      || hasSkill(instanceA, 'PASSIVE_B', 'Watersweep'))) {
    return false;
  }
  const aHasBreaker = hasWeaponBreaker(instanceA, context);
  const bHasBreaker = hasWeaponBreaker(instanceB, invertContext(instanceA, context));
  const guaranteedFollowup = aHasBreaker
    || (context.isAttacker && hasSkill(instanceA, 'PASSIVE_B', 'Brash Assault')
        && canRetaliate(instanceA, context))
    || (!context.isAttacker && hasSkill(instanceA, 'WEAPON', 'Armads'))
    || (!context.isAttacker && hasSkill(instanceA, 'PASSIVE_B', 'Quick Riposte'));
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
    (getStat(instanceA, 'spd', 40, context)
    - getStat(instanceB, 'spd', 40, invertContext(instanceA, context)))
    >= 5
  );
};

// Healers do half-damage
const classModifier = (instance: HeroInstance) =>
  (getWeaponType(instance) === 'Neutral Staff'
    && !hasSkill(instance, 'PASSIVE_B', 'Wrathful Staff')) ? 0.5 : 1;

const advantageBonus = (heroA: HeroInstance, context: Context) => {
  const heroB = context.enemy;
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

const effectiveBonus = (attacker: HeroInstance, context: Context) => {
  if (hasSkill(context.enemy, 'PASSIVE_A', 'Shield')) {
    return 1;
  }
  const defenderMoveType = getMoveType(context.enemy);
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
      || (test(/(Falchion|Naga)/, weaponName) && test(/Breath/, getWeaponType(context.enemy)))
    ) {
    return 1.5;
  }
  else return 1;
};

const canRetaliate = (attacker: HeroInstance, context: Context) => {
  const defender = context.enemy;
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
    if (getStat(attacker, 'spd', 40, context)
        - getStat(defender, 'spd', 40, invertContext(attacker, context)) >= spdReq) {
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
  context: Context,
  attackerSpecial: string = '',
  attackerMissingHp: number = 0,
) => hasSkill(context.enemy, 'SEAL', 'Embla\'s Ward') ? 0 : dmgFormula(
  getStat(attacker, 'atk', 40, context),
  effectiveBonus(attacker, context),
  advantageBonus(attacker, context),
  getStat(context.enemy, getMitigationType(attacker), 40, invertContext(attacker, context)),
  classModifier(attacker),
  getSpecialBonusDamageAmount(attackerSpecial, attacker, context, attackerMissingHp),
  getSpecialOffensiveMultiplier(attackerSpecial),
  getSpecialMitigationMultiplier(attackerSpecial),
);

// Returns a list of 0s and 1s, representing hero-0 and hero-1 hitting each other.
export function computeAttackOrder(attacker: HeroInstance, context: Context): Array<number> {
  const defender = context.enemy;
  // First, check for the ability to retaliate and skills that affect attack order.
  const attackerHasFollowup = doesFollowUp(attacker, context);
  const defenderCanRetaliate = canRetaliate(attacker, context);
  const defenderHasFollowup = defenderCanRetaliate
    && doesFollowUp(defender, invertContext(attacker, context));
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
  // create new Context objects
  let contexts: Array<Context> = [
    {enemy: defender, isAttacker: true, allies: [], otherEnemies: []},
    {enemy: attacker, isAttacker: false, allies: [], otherEnemies: []},
  ];
  // Apply start-of-turn buffs/debuffs
  attacker = withTurnStartBuffs(attacker, contexts[0]);
  defender = withTurnStartBuffs(defender, contexts[1]);
  attacker = withTurnStartDebuffs(attacker, contexts[0]);
  defender = withTurnStartDebuffs(defender, contexts[1]);
  // Update context objects to include new buffs/debuffs.
  contexts = [
    {enemy: defender, ...contexts[0]},
    {enemy: attacker, ...contexts[1]},
  ];

  const attackOrder = computeAttackOrder(attacker, contexts[0]);

  const heroes = [attacker, defender];
  const damages = [hitDmg(attacker, contexts[0]), hitDmg(defender, contexts[1])];
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
  // How many times the unit would attack according to attackOrder.
  let numAttacks = [0, 0];
  // How many times the unit actually attacked.
  let actualNumAttacks = [0, 0];
  let healths = [maxHps[0] - attacker.state.hpMissing, maxHps[1] - defender.state.hpMissing];
  // AOE Damage
  const aoeDamage = specialCds[0] === 0
    ? getSpecialAOEDamageAmount(specialNames[0], attacker, contexts[0]) : 0;
  let specialDamages = [aoeDamage, 0];
  healths[1] = hpRemaining(aoeDamage, healths[1], false);
  // Main combat loop.
  for (let heroIndex: number of attackOrder) {
    // heroIndex hits otherHeroIndex.
    numAttacks[heroIndex]++;
    if (healths[heroIndex] > 0 && healths[1] > 0) {
      actualNumAttacks[heroIndex]++;
      const otherHeroIndex: number = 1 - heroIndex;
      let lifestealPercent = hasSkill(heroes[heroIndex], 'WEAPON', 'Absorb') ? 0.5 : 0.0;

      // Attacker Special. Use '' for no special.
      let attackerSpecial = '';
      let dmgWithoutSpecial = hitDmg(
        heroes[heroIndex],
        contexts[heroIndex],
      );
      if (specialCds[heroIndex] === 0 && specialTypes[heroIndex] === 'ATTACK') {
        attackerSpecial = specialNames[heroIndex];
        lifestealPercent += getSpecialLifestealPercent(attackerSpecial);
        specialCds[heroIndex] = maxCds[heroIndex];
      } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[heroIndex] > 0) {
        specialCds[heroIndex] = Math.max(0, specialCds[heroIndex] - getSpecialChargeForAttack(
          heroes[heroIndex],
          contexts[heroIndex],
        ));
      }
      let dmg = hitDmg(
        heroes[heroIndex],
        contexts[heroIndex],
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
        specialCds[otherHeroIndex] -= getSpecialChargeWhenAttacked(contexts[otherHeroIndex]);
      }
      // Apply damage
      healths[otherHeroIndex] = hpRemaining(dmg, healths[otherHeroIndex], true);
      healths[heroIndex] = Math.min(
        healths[heroIndex] + Math.floor(dmg * lifestealPercent),
        maxHps[heroIndex],
      );
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
  // Deathly Dagger (only if attacking, survival optional). 1st number is debuff, 2nd is damage.
  if (hasSkill(heroes[0], 'WEAPON', 'Deathly Dagger')) {
    postCombatDmg[1] += getSkillNumbers(heroes[0], 'WEAPON')[1];
  }
  // Ragnarok damages the owner when attacking. HP% is ignored by hasSkill because no <>.
  if (hasSkill(heroes[0], 'WEAPON', 'Ragnarok')) {
    postCombatDmg[0] += 5;
  }
  for (let heroIndex of [0, 1]) {
    // Fury
    if (hasSkill(heroes[heroIndex], 'PASSIVE_A', 'Fury')) {
      postCombatDmg[heroIndex] += getSkillNumbers(heroes[heroIndex], 'PASSIVE_A')[1];
    }
    // Pain (only triggers if the staff user was able to hit something)
    const otherHeroI = 1 - heroIndex;
    if (actualNumAttacks[otherHeroI] > 0 && hasSkill(heroes[otherHeroI], 'WEAPON', 'Pain')) {
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

  // Apply new buffs and new debuffs. Daggers are conditional on attacking, seal-X on survival.
  attacker = withPostCombatBuffs(attacker, actualNumAttacks[0] > 0);
  defender = withPostCombatBuffs(defender, actualNumAttacks[1] > 0);
  attacker = withPostCombatDebuffs(
    attacker, contexts[0], actualNumAttacks[1] > 0, healths[1] > 0);
  defender = withPostCombatDebuffs(
    defender, contexts[1], actualNumAttacks[0] > 0, healths[0] > 0);

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
