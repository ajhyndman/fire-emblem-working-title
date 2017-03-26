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

test('calculateResult', (t) => {
  t.equal(
    simulateCombat(makeHero('Lilina'), makeHero('Takumi'), 0, 40-35),
    0,
  );

  // Triangle adept
  t.equal(
    simulateCombat(makeHero('Sanaki'), makeHero('Hector'), 33, 0),
    0,
  );

  t.equal(
    simulateCombat(makeHero('Camilla'), makeHero('Bartre'), 37-23, 49-(2*4)),
    0,
  );

  t.equal(
    simulateCombat(makeHero('Bartre'), makeHero('Camilla'), 49-2,  37-23),
    0,
  );

  t.end();
});
