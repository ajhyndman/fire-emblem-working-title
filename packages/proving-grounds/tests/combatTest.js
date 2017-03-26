// @flow
import test from 'tape';
import { dissoc } from 'ramda';

import { calculateResult } from '../src/damageCalculation';
import { getDefaultSkills } from '../src/heroHelpers';
import type { HeroInstance } from '../src/heroHelpers';


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
  if (result.attackerHpRemaining != expectedHp1 || result.defenderHpRemaining != expectedHp2) {
    console.log('Combat Result:\n', result);
  }
  t.equal(result.attackerHpRemaining, expectedHp1);
  t.equal(result.defenderHpRemaining, expectedHp2);
}

// Basic test
test('normalCombat', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Lilina'), makeHero('Takumi'), 0, 40-35);
});

test('triangleAdept', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Sanaki'), makeHero('Hector'), 33, 0);
});

test('braveWeaponAndDartingBlow', (t) => {
  t.plan(4);
  // Camilla attacks 4 times while attacking and once when attacked
  simulateCombat(t, makeHero('Camilla'), makeHero('Bartre'), 37-23, 49-(2*4));
  simulateCombat(t, makeHero('Bartre'), makeHero('Camilla'), 49-2,  37-23);
});
