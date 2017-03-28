// @flow
import test from 'tape';

import { calculateResult } from '../src/damageCalculation';
import { getDefaultSkills } from '../src/heroHelpers';
import type { HeroInstance } from '../src/store';


function makeHero(name: string, rarity: 1 | 2 | 3 | 4 | 5 = 5): HeroInstance {
  return {
    name: name,
    bane: undefined,
    boon: undefined,
    rarity: rarity,
    skills: getDefaultSkills(name, rarity),
  };
}

function simulateCombat(
  t, // test object
  hero1: HeroInstance,
  hero2: HeroInstance,
  expectedHp1: number,
  expectedHp2: number,
) {
  const result = calculateResult(hero1, hero2);
  if (result.attackerHpRemaining !== expectedHp1 || result.defenderHpRemaining !== expectedHp2) {
    console.log('Combat Result:\n', result);
  }
  t.equal(result.attackerHpRemaining, expectedHp1);
  t.equal(result.defenderHpRemaining, expectedHp2);
  return result;
}

test('normalCombat', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Lilina'), makeHero('Takumi'), 0, 40-35);
});

test('quickRiposteAndGemWeapon', (t) => {
  t.plan(5);
  const result = simulateCombat(t, makeHero('Hana'), makeHero('Subaki'), 0, 40-(2*0));
  t.equal(result.attackerNumAttacks, 2);
  t.equal(result.defenderNumAttacks, 2);
  t.equal(result.defenderDamage, 33);
});

test('ravenWeapon', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Robin (M)'), makeHero('Takumi'), 40-8, 40-30);
});

test('triangleAdept', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Sanaki'), makeHero('Hector'), 33, 0);
});

test('armads', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Lilina'), makeHero('Hector'), 0, 52-44);
});

test('effectiveWeapons', (t) => {
  t.plan(4);
  simulateCombat(t, makeHero('Kagero'), makeHero('Lyn'), 31, 37-34);
  simulateCombat(t, makeHero('Niles'), makeHero('Catria'), 37, 39-22);
});

test('braveWeaponAndSwordBreaker', (t) => {
  t.plan(4);
  const result = simulateCombat(t, makeHero('Abel'), makeHero('Hana'), 44, 0);
  t.equal(result.attackerNumAttacks, 4);
  t.equal(result.defenderNumAttacks, 1);
});

test('waryFighter', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Effie'), makeHero('Catria'), 50-9, 39-26);
});

test('braveWeaponAndDartingBlow', (t) => {
  t.plan(4);
  // Camilla attacks 4 times while attacking and once when attacked
  simulateCombat(t, makeHero('Camilla'), makeHero('Bartre'), 37-23, 49-(2*4));
  simulateCombat(t, makeHero('Bartre'), makeHero('Camilla'), 49-2,  37-23);
});
