// @flow
import { dissoc } from 'ramda';

import { calculateResult } from '../src/damageCalculation';
import { getDefaultSkills } from '../src/heroHelpers';
import type { HeroInstance } from '../src/heroHelpers';


function makeHero(name: string, rarity: number = 5): HeroInstance {
  return {
    name: name,
    bane: undefined,
    boon: undefined,
    rarity: rarity,
    skills: getDefaultSkills(name, rarity),
  }
}

function simulateCombat(
  hero1: HeroInstance,
  hero2: HeroInstance,
  expectedHp1: number,
  expectedHp2: number,
) {
  const result = calculateResult(hero1, hero2);
  if (result.attackerHpRemaining != expectedHp1 || result.defenderHpRemaining != expectedHp2) {
    console.log(
      'Unexpected combat result.',
      '\nHero1:', dissoc('skills', hero1),
      '\nHero2:', dissoc('skills', hero2),
      '\nExpected:', expectedHp1, expectedHp2,
      '\nResult:', result,
      '\n',
    );
    return 1;
  }
  return 0;
}

var errorCount = 0;
// Atk + 3
errorCount += simulateCombat(makeHero('Lilina'), makeHero('Takumi'), 0, 40-35);
// Triangle adept
errorCount += simulateCombat(makeHero('Sanaki'), makeHero('Hector'), 33, 0);
// Brave Axe and Darting blow vs Fury
errorCount += simulateCombat(makeHero('Camilla'), makeHero('Bartre'), 37-23, 49-(2*4));
errorCount += simulateCombat(makeHero('Bartre'), makeHero('Camilla'), 49-2,  37-23);

if (errorCount == 0) {
  console.log('PASS: All tests passed.');
} else {
  console.log('ERROR: ' + errorCount + ' tests failed.');
}
