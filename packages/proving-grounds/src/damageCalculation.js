// @flow
import {
  compose,
  find,
  isEmpty,
  match,
  max,
  multiply,
  not,
  prop,
} from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';


type Color = 'RED' | 'GREEN' | 'BLUE' | 'NEUTRAL';

type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';

/**
 * A helper for getting a stat value from a hero by key.
 * Defaults to level 40, 5 star, baseline variant.
 *
 * @param {*} hero Hero to look up stat on
 * @param {*} statKey Key of the stat to look up
 * @param {*} level Which level version of stat to look up
 * @param {*} rarity Which rarity version of stat to look up
 * @param {*} variance Which variant ('low', 'normal', 'high') to look up
 * @returns number the value of the stat
 */
export const getStat = (
  hero: Hero,
  statKey: Stat,
  level: '40' | '1' = '40',
  rarity: '1' | '2' | '3' | '4' | '5' = '5',
  variance: 'low' | 'normal' | 'high' = 'normal',
): number => {
  if (level === '1') {
    const value = parseInt(hero.stats[level][rarity][statKey], 10);
    return variance === 'normal'
      ? value
      : variance === 'low'
        ? value - 1
        : value + 1;
  }
  const values = hero.stats[level][rarity][statKey];
  const [low, normal, high] = values.length <= 1
    ? ['-', ...values]
    : values;
  return variance === 'normal'
    ? parseInt(normal, 10)
    : variance === 'low'
      ? parseInt(low, 10)
      : parseInt(high, 10)
}

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
const hitDmg = (
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

const doesFollowUp = (heroA: Hero, heroB: Hero) =>
  (getStat(heroA, 'spd') - getStat(heroB, 'spd') >= 5);
const isBraveWeapon = (hero: Hero) => find(
  compose(
    compose(not, isEmpty),
    match(/Brave|Dire/g),
    // $FlowIssue - prop() typedef doesn't reflect _which_ string it's passed.
    prop('name'),
  ),
  hero.skills,
);
const range = (hero: Hero) => {
  switch (hero.weaponType) {
    case 'Red Sword':
    case 'Green Axe':
    case 'Blue Lance':
    case 'Red Beast':
    case 'Green Beast':
    case 'Blue Beast':
      return 1;
    default:
      return 2;
  }
};
const classModifier = (hero: Hero) => hero.weaponType === 'Neutral Staff' ? 0.5 : 1;
const weaponColor = (hero: Hero) => {
  switch (hero.weaponType) {
    case 'Red Sword':
    case 'Red Tome':
    case 'Red Beast':
      return 'RED';
    case 'Green Axe':
    case 'Green Tome':
    case 'Green Beast':
      return 'GREEN';
    case 'Blue Lance':
    case 'Blue Tome':
    case 'Blue Beast':
      return 'BLUE';
    default:
      return 'NEUTRAL';
  }
};
const mitigationType = (hero: Hero) => {
  switch (hero.weaponType) {
    case 'Red Tome':
    case 'Red Beast':
    case 'Green Tome':
    case 'Green Beast':
    case 'Blue Tome':
    case 'Blue Beast':
    case 'Neutral Staff':
      return 'res';
    default:
      return 'def';
  }
};
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
const hpRemaining = (dmg, hp) => max(hp - dmg, 0);

/**
 * Calculate the resulting damage per hit, number of hits, and final HP for each hero.
 *
 * @param {Hero} attacker
 * @param {Hero} defender
 * @returns {object}
 */
export const calculateResult = (attacker: Hero, defender: Hero) => {
  const attackerDamage = hitDmg(
    getStat(attacker, "atk"),
    effectiveBonus(attacker, defender),
    advantageBonus(
      weaponColor(attacker),
      weaponColor(defender),
    ),
    getStat(defender, mitigationType(attacker)),
    classModifier(attacker),
  );

  const defenderDamage = hitDmg(
    getStat(defender, "atk"),
    effectiveBonus(defender, attacker),
    advantageBonus(
      weaponColor(defender),
      weaponColor(attacker),
    ),
    getStat(attacker, mitigationType(defender)),
    classModifier(defender),
  );

  let attackerHpRemaining = getStat(attacker, "hp");
  let attackerNumAttacks = 0;
  let defenderHpRemaining = getStat(defender, "hp");
  let defenderNumAttacks = 0;

  // attacker hits defender
  attackerNumAttacks += isBraveWeapon(attacker) ? 2 : 1;
  defenderHpRemaining = hpRemaining(
    attackerDamage * (isBraveWeapon(attacker) ? 2 : 1),
    defenderHpRemaining,
  );

  if (defenderHpRemaining > 0 && (range(defender) === range(attacker))) {
    // defender retaliates
    defenderNumAttacks += 1;
    attackerHpRemaining = hpRemaining(
      defenderDamage,
      attackerHpRemaining,
    );
  }

  if (attackerHpRemaining && doesFollowUp(attacker, defender)) {
    // attacker follow-up
    attackerNumAttacks += isBraveWeapon(attacker) ? 2 : 1;
    defenderHpRemaining = hpRemaining(
      attackerDamage * (isBraveWeapon(attacker) ? 2 : 1),
      defenderHpRemaining,
    );
  }

  if (
    defenderHpRemaining
    && (range(defender) === range(attacker))
    && doesFollowUp(defender, attacker)
  ) {
    // defender follow-up
    defenderNumAttacks += 1;
    attackerHpRemaining = hpRemaining(
      defenderDamage,
      attackerHpRemaining,
    );
  }

  return {
    attackerNumAttacks,
    attackerDamage,
    attackerHpRemaining,
    defenderNumAttacks,
    defenderDamage,
    defenderHpRemaining,
  };
};
