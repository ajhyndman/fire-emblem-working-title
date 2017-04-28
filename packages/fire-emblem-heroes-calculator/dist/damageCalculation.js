'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateResult = undefined;

var _ramda = require('ramda');

var _heroHelpers = require('./heroHelpers');

var _skillHelpers = require('./skillHelpers');

var truncate = function truncate(x) {
  return x >= 0 ? Math.floor(x) : Math.ceil(x);
};

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

var dmgFormula = function dmgFormula(atk // From skills like Luna
) {
  var eff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
  var adv = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0;
  var mit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var classModifier = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1.0;
  var bonusDamage = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var offensiveMult = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0.0;
  var mitigationMult = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0.0;
  return truncate((1 + offensiveMult) * truncate(classModifier * (0, _ramda.max)(truncate(atk * eff) + truncate(truncate(atk * eff) * adv) + truncate(bonusDamage) - (mit - truncate(mit * mitigationMult)), 0)));
};

var hasWeaponBreaker = function hasWeaponBreaker(instanceA, instanceB) {
  var heroB = (0, _heroHelpers.lookupStats)(instanceB.name);
  var necessaryBreaker = (0, _ramda.replace)(/(Red|Green|Blue|Neutral)\s/, '', heroB.weaponType) + 'breaker';
  if ((0, _ramda.test)(/Tome/, heroB.weaponType)) {
    // R Tomebreaker, G Tomebreaker, B Tomebreaker
    necessaryBreaker = heroB.weaponType[0] + ' ' + necessaryBreaker;
  }
  if ((0, _heroHelpers.hasSkill)(instanceA, 'PASSIVE_B', necessaryBreaker)) {
    return true;
  }
  if (necessaryBreaker === 'Daggerbreaker') {
    return (0, _heroHelpers.hasSkill)(instanceA, 'WEAPON', 'Assassin\'s Bow');
  }
  return false;
};

// Whether or not a unit will perform a follow-up attack.
var doesFollowUp = function doesFollowUp(instanceA, instanceB, isAttacker) {
  if (isAttacker && ((0, _heroHelpers.hasSkill)(instanceA, 'PASSIVE_B', 'Windsweep') || (0, _heroHelpers.hasSkill)(instanceA, 'PASSIVE_B', 'Watersweep'))) {
    return false;
  }
  var aHasBreaker = hasWeaponBreaker(instanceA, instanceB);
  var bHasBreaker = hasWeaponBreaker(instanceB, instanceA);
  var guaranteedFollowup = aHasBreaker || isAttacker && (0, _heroHelpers.hasSkill)(instanceA, 'PASSIVE_B', 'Brash Assault') && canRetaliate(instanceA, instanceB) || !isAttacker && (0, _heroHelpers.hasSkill)(instanceA, 'WEAPON', 'Armads') || !isAttacker && (0, _heroHelpers.hasSkill)(instanceA, 'PASSIVE_B', 'Quick Riposte');
  var cannotFollowup = bHasBreaker || (0, _heroHelpers.hasSkill)(instanceA, 'PASSIVE_B', 'Wary Fighter') || (0, _heroHelpers.hasSkill)(instanceB, 'PASSIVE_B', 'Wary Fighter');
  // Guaranteed-followup and cannot-followup skills cancel out and it comes down to speed.
  if (guaranteedFollowup && !cannotFollowup) {
    return true;
  } else if (cannotFollowup && !guaranteedFollowup) {
    return false;
  }
  return (0, _heroHelpers.getStat)(instanceA, 'spd', 40, isAttacker) - (0, _heroHelpers.getStat)(instanceB, 'spd', 40, !isAttacker) >= 5;
};

// Healers do half-damage
var classModifier = function classModifier(instance) {
  var hero = (0, _heroHelpers.lookupStats)(instance.name);
  return hero && hero.weaponType === 'Neutral Staff' ? 0.5 : 1;
};

var advantageBonus = function advantageBonus(heroA, heroB) {
  var colorA = (0, _heroHelpers.getWeaponColor)(heroA);
  var colorB = (0, _heroHelpers.getWeaponColor)(heroB);
  var weaponA = (0, _heroHelpers.getSkillName)(heroA, 'WEAPON');
  var weaponB = (0, _heroHelpers.getSkillName)(heroB, 'WEAPON');
  var advantage = 0;
  if (colorA === 'RED' && colorB === 'GREEN' || colorA === 'GREEN' && colorB === 'BLUE' || colorA === 'BLUE' && colorB === 'RED') {
    advantage = 1;
  } else if (colorA === 'RED' && colorB === 'BLUE' || colorA === 'GREEN' && colorB === 'RED' || colorA === 'BLUE' && colorB === 'GREEN') {
    advantage = -1;
  } else if (colorB === 'NEUTRAL' && (0, _ramda.test)(/raven/, weaponA)) {
    advantage = 1;
  } else if (colorA === 'NEUTRAL' && (0, _ramda.test)(/raven/, weaponB)) {
    advantage = -1;
  }
  var passiveA = (0, _heroHelpers.getSkillName)(heroA, 'PASSIVE_A');
  var passiveB = (0, _heroHelpers.getSkillName)(heroB, 'PASSIVE_A');
  // Weapon type advantage multipliers don't stack. Source:
  // https://feheroes.wiki/Damage_Calculation#Weapon_Triangle_Advantage
  var advantageMultiplier = 0.2;
  if ((0, _ramda.test)(/(Ruby|Sapphire|Emerald)/, weaponA) || (0, _ramda.test)(/(Ruby|Sapphire|Emerald)/, weaponB) || passiveA === 'Triangle Adept 3' || passiveB === 'Triangle Adept 3') {
    advantageMultiplier = 0.4; // 20%
  } else if (passiveA === 'Triangle Adept 2' || passiveB === 'Triangle Adept 2') {
    advantageMultiplier = 0.35; // 15%
  } else if (passiveA === 'Triangle Adept 1' || passiveB === 'Triangle Adept 1') {
    advantageMultiplier = 0.3; // 10%
  }
  return advantage * advantageMultiplier;
};

var effectiveBonus = function effectiveBonus(attacker, defender) {
  if ((0, _heroHelpers.hasSkill)(defender, 'PASSIVE_A', 'Shield')) {
    return 1;
  }
  var defenderMoveType = (0, _heroHelpers.lookupStats)(defender.name).moveType;
  if ((0, _heroHelpers.lookupStats)(attacker.name).weaponType === 'Neutral Bow' && defenderMoveType === 'Flying') {
    return 1.5;
  }
  var weaponName = (0, _heroHelpers.getSkillName)(attacker, 'WEAPON');
  if ((0, _ramda.test)(/(Heavy Spear|Armorslayer|Hammer)/, weaponName) && defenderMoveType === 'Armored' || (0, _ramda.test)(/wolf/, weaponName) && defenderMoveType === 'Cavalry' || (0, _ramda.test)(/Poison Dagger/, weaponName) && defenderMoveType === 'Infantry' || (0, _ramda.test)(/Excalibur/, weaponName) && defenderMoveType === 'Flying' || (0, _ramda.test)(/(Falchion|Naga)/, weaponName) && (0, _ramda.test)(/Beast/, (0, _heroHelpers.lookupStats)(defender.name).weaponType)) {
    return 1.5;
  } else return 1;
};

var canRetaliate = function canRetaliate(attacker, defender) {
  if ((0, _heroHelpers.getSkillName)(defender, 'WEAPON') === '' || (0, _heroHelpers.hasSkill)(attacker, 'WEAPON', 'Firesweep') || (0, _heroHelpers.hasSkill)(defender, 'WEAPON', 'Firesweep')) {
    return false;
  }
  // Windsweep checks for Sword/Lance/Axe/Bow/Dagger = all physical weapons.
  // Watersweep checks for Tome/Staff/Dragonstone = all magical weapons.
  if ((0, _heroHelpers.hasSkill)(attacker, 'PASSIVE_B', 'Windsweep') && (0, _heroHelpers.getMitigationType)(defender) === 'def' || (0, _heroHelpers.hasSkill)(attacker, 'PASSIVE_B', 'Watersweep') && (0, _heroHelpers.getMitigationType)(defender) === 'res') {
    // The attacker must also be faster than the defender.
    var spdReq = (0, _skillHelpers.getSkillNumbers)(attacker, 'PASSIVE_B')[0];
    if ((0, _heroHelpers.getStat)(attacker, 'spd', 40, true) - (0, _heroHelpers.getStat)(defender, 'spd', 40, false) >= spdReq) {
      return false;
    }
  }
  if ((0, _heroHelpers.getRange)(defender) === (0, _heroHelpers.getRange)(attacker)) {
    return true;
  }
  var passiveA = (0, _heroHelpers.getSkillName)(defender, 'PASSIVE_A');
  var weaponName = (0, _heroHelpers.getSkillName)(defender, 'WEAPON');
  return passiveA === 'Close Counter' || passiveA === 'Distant Counter' || weaponName === 'Raijinto' || weaponName === 'Ragnell' || weaponName === 'Siegfried' || weaponName === 'Lightning Breath' || weaponName === 'Lightning Breath+';
};

var hpRemaining = function hpRemaining(dmg, hp) {
  var canBeLethal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  return (0, _ramda.max)(hp - dmg, canBeLethal ? 0 : 1);
};

var hitDmg = function hitDmg(attacker, defender, isAttacker) {
  var attackerSpecial = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var attackerMissingHp = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  return (0, _heroHelpers.hasSkill)(defender, 'SEAL', 'Embla\'s Ward') ? 0 : dmgFormula((0, _heroHelpers.getStat)(attacker, 'atk', 40, isAttacker), effectiveBonus(attacker, defender), advantageBonus(attacker, defender), (0, _heroHelpers.getStat)(defender, (0, _heroHelpers.getMitigationType)(attacker), 40, !isAttacker), classModifier(attacker), (0, _skillHelpers.getSpecialBonusDamageAmount)(attackerSpecial, attacker, isAttacker, attackerMissingHp), (0, _skillHelpers.getSpecialOffensiveMultiplier)(attackerSpecial), (0, _skillHelpers.getSpecialMitigationMultiplier)(attackerSpecial));
};

/**
 * Calculate the resulting damage per hit, number of hits, and final HP for each hero.
 *
 * @param {Hero} attacker
 * @param {Hero} defender
 * @returns {object}
 */
var calculateResult = exports.calculateResult = function calculateResult(attacker, defender) {
  // First, check for the ability to retaliate and skills that affect attack order.
  var attackerHasFollowup = doesFollowUp(attacker, defender, true);
  var defenderCanRetaliate = canRetaliate(attacker, defender);
  var defenderHasFollowup = defenderCanRetaliate && doesFollowUp(defender, attacker, false);
  var defenderCountersFirst = defenderCanRetaliate && ((0, _heroHelpers.hasSkill)(defender, 'PASSIVE_B', 'Vantage') || (0, _heroHelpers.hasSkill)(defender, 'WEAPON', 'Valaskjálf'));
  var attackerImmediateFollowup = attackerHasFollowup && ((0, _heroHelpers.hasSkill)(attacker, 'PASSIVE_B', 'Desperation') || (0, _heroHelpers.hasSkill)(attacker, 'WEAPON', 'Sol Katti'));

  // a list of 0s and 1s for attacker and defender.
  var attackOrder = [];
  if ((0, _heroHelpers.getSkillName)(attacker, 'WEAPON') !== '') {
    // Vantage!
    if (defenderCountersFirst) {
      attackOrder.push(1);
    }
    // attacker hits defender
    attackOrder.push(0);
    if ((0, _heroHelpers.hasBraveWeapon)(attacker)) {
      attackOrder.push(0);
    }
    // Desperation!
    if (attackerImmediateFollowup) {
      attackOrder.push(0);
      if ((0, _heroHelpers.hasBraveWeapon)(attacker)) {
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
      if ((0, _heroHelpers.hasBraveWeapon)(attacker)) {
        attackOrder.push(0);
      }
    }
    // defender follow-up
    if (defenderHasFollowup) {
      attackOrder.push(1);
    }
  }
  // TODO: decide if Galeforce will trigger.

  var heroes = [attacker, defender];
  var damages = [hitDmg(attacker, defender, true), hitDmg(defender, attacker, false)];
  var maxHps = [(0, _heroHelpers.getStat)(attacker, 'hp'), (0, _heroHelpers.getStat)(defender, 'hp')];
  var specialNames = [(0, _heroHelpers.getSkillName)(attacker, 'SPECIAL'), (0, _heroHelpers.getSkillName)(defender, 'SPECIAL')];
  // $FlowIssue $Iterable. This type is incompatible with array type
  var specialTypes = (0, _ramda.map)(_skillHelpers.getSpecialType, heroes);
  var maxCds = [(0, _skillHelpers.getSpecialCooldown)(attacker), (0, _skillHelpers.getSpecialCooldown)(defender)];
  var specialCds = [maxCds[0] === -1 ? -1 : Math.max(0, maxCds[0] - attacker.initialSpecialCharge), maxCds[1] === -1 ? -1 : Math.max(0, maxCds[1] - defender.initialSpecialCharge)];
  var numAttacks = [0, 0];
  var healths = [maxHps[0] - attacker.initialHpMissing, maxHps[1] - defender.initialHpMissing];
  // AOE Damage
  var aoeDamage = specialCds[0] === 0 ? (0, _skillHelpers.getSpecialAOEDamageAmount)(specialNames[0], attacker, defender) : 0;
  var specialDamages = [aoeDamage, 0];
  healths[1] = hpRemaining(aoeDamage, healths[1], false);
  // Main combat loop.
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = attackOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var heroIndex = _step.value;

      var isInitiator = heroIndex === 0;
      // heroIndex hits otherHeroIndex.
      numAttacks[heroIndex]++;
      if (healths[heroIndex] > 0) {
        var otherHeroIndex = 1 - heroIndex;
        var stillFighting = healths[0] > 0 && healths[1] > 0;
        var lifestealPercent = (0, _heroHelpers.hasSkill)(heroes[heroIndex], 'WEAPON', 'Absorb') ? 0.5 : 0.0;

        // Attacker Special. Use '' for no special.
        var attackerSpecial = '';
        var dmgWithoutSpecial = hitDmg(heroes[heroIndex], heroes[otherHeroIndex], isInitiator);
        if (specialCds[heroIndex] === 0 && specialTypes[heroIndex] === 'ATTACK') {
          attackerSpecial = specialNames[heroIndex];
          lifestealPercent += (0, _skillHelpers.getSpecialLifestealPercent)(attackerSpecial);
          specialCds[heroIndex] = maxCds[heroIndex];
        } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[heroIndex] > 0) {
          specialCds[heroIndex] = Math.max(0, specialCds[heroIndex] - (0, _skillHelpers.getSpecialChargeForAttack)(heroes[heroIndex], heroes[otherHeroIndex], isInitiator));
        }
        var dmg = hitDmg(heroes[heroIndex], heroes[otherHeroIndex], isInitiator, attackerSpecial, (0, _heroHelpers.getStat)(heroes[heroIndex], 'hp') - healths[heroIndex]);
        specialDamages[heroIndex] += dmg - dmgWithoutSpecial;

        // Defender Special
        if (specialCds[otherHeroIndex] === 0 && specialTypes[otherHeroIndex] === 'ATTACKED') {
          var specialName = specialNames[otherHeroIndex];
          if (specialName === 'Miracle' && dmg >= healths[otherHeroIndex]) {
            dmg = healths[otherHeroIndex] - 1;
            specialCds[otherHeroIndex] = maxCds[otherHeroIndex];
            // The unit that initiated combat decided the range of the battle.
          } else if ((0, _skillHelpers.doesDefenseSpecialApply)(specialName, (0, _heroHelpers.getRange)(attacker))) {
            dmg = Math.ceil(dmg * (1 - (0, _skillHelpers.getSpecialDefensiveMultiplier)(specialName)));
            specialCds[otherHeroIndex] = maxCds[otherHeroIndex];
          }
        } else if (specialTypes[heroIndex] !== 'HEAL' && specialCds[otherHeroIndex] > 0) {
          specialCds[otherHeroIndex] -= (0, _skillHelpers.getSpecialChargeWhenAttacked)(heroes[heroIndex]);
        }
        // Apply damage
        healths[otherHeroIndex] = hpRemaining(dmg, healths[otherHeroIndex], true);
        if (stillFighting) {
          healths[heroIndex] = Math.min(healths[heroIndex] + Math.floor(dmg * lifestealPercent), maxHps[heroIndex]);
        }
      }
    }

    // Post combat damage and healing. These effects are simultaneous and nonlethal.
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var postCombatDmg = [0, 0];
  if ((0, _heroHelpers.hasSkill)(heroes[0], 'WEAPON', '(Egg|Carrot)')) {
    postCombatDmg[0] = -4;
  }
  // Poison Strike (only trigger while attacking and only if the attacker survived)
  if (healths[0] > 0 && (0, _heroHelpers.hasSkill)(heroes[0], 'PASSIVE_B', 'Poison Strike')) {
    postCombatDmg[1] += (0, _skillHelpers.getSkillNumbers)(heroes[0], 'PASSIVE_B')[0];
  }
  var _arr = [0, 1];
  for (var _i = 0; _i < _arr.length; _i++) {
    var _heroIndex = _arr[_i];
    // Fury
    if ((0, _heroHelpers.hasSkill)(heroes[_heroIndex], 'PASSIVE_A', 'Fury')) {
      postCombatDmg[_heroIndex] += (0, _skillHelpers.getSkillNumbers)(heroes[_heroIndex], 'PASSIVE_A')[1];
    }
    // Pain (only triggers if the staff user survived and was able to retaliate)
    var otherHeroI = 1 - _heroIndex;
    if (healths[otherHeroI] > 0 && numAttacks[otherHeroI] > 0 && (0, _heroHelpers.hasSkill)(heroes[otherHeroI], 'WEAPON', 'Pain')) {
      postCombatDmg[_heroIndex] += (0, _skillHelpers.getSkillNumbers)(heroes[otherHeroI], 'WEAPON')[0];
    }
    // Only apply postcombat damage to living units
    if (healths[_heroIndex] > 0) {
      healths[_heroIndex] = Math.min(hpRemaining(postCombatDmg[_heroIndex], healths[_heroIndex], false), maxHps[_heroIndex]);
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
    defenderHpRemaining: healths[1]
  };
};