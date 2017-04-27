// @flow
import test from 'tape';

import { calculateResult } from '../src/damageCalculation';
import { getDefaultSkills } from '../src/heroHelpers';
import { getDefaultInstance } from '../src/heroInstance';
import type { HeroInstance, Rarity } from '../src/heroInstance';


function makeHero(
  name: string,
  rarity: Rarity = 5,
  customSkills: {} = {},
): HeroInstance {
  return {
    ...getDefaultInstance(name, rarity),
    skills: {
      ...getDefaultSkills(name, rarity),
      ...customSkills,
    },
  };
}

function withSpecial(specialName: string): { SPECIAL: ?string } {
  return { SPECIAL: specialName };
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
    console.log(hero1.name, 'vs', hero2.name);
    console.log('Combat Result:\n', result);
  }
  t.equal(result.attackerHpRemaining, expectedHp1);
  t.equal(result.defenderHpRemaining, expectedHp2);
  return result;
}

test('Normal Combat', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Lilina'), makeHero('Takumi'), 0, 40-35);
});

test('Quick Riposte and Gem Weapon', (t) => {
  t.plan(5);
  const result = simulateCombat(t, makeHero('Hana'), makeHero('Subaki'), 0, 40-(2*0));
  t.equal(result.attackerNumAttacks, 2);
  t.equal(result.defenderNumAttacks, 2);
  t.equal(result.defenderDamage, 33);
});

test('Raven Weapon', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Robin (M)'), makeHero('Takumi'), 40-8, 40-30);
});

test('Triangle Adept', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Sanaki'), makeHero('Hector'), 33, 0);
});

test('Armads', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Lilina'), makeHero('Hector'), 0, 52-44);
});

test('Effective Weapons', (t) => {
  t.plan(4);
  simulateCombat(t, makeHero('Kagero'), makeHero('Lyn'), 31, 37-34);
  simulateCombat(t, makeHero('Niles'), makeHero('Catria'), 37, 39-22);
});

test('Brave Weapon and Sword Breaker', (t) => {
  t.plan(4);
  const result = simulateCombat(t, makeHero('Abel'), makeHero('Hana'), 44, 0);
  t.equal(result.attackerNumAttacks, 4);
  t.equal(result.defenderNumAttacks, 1);
});

test('Wary Fighter', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Effie'), makeHero('Catria'), 50-9, 39-32);
});

test('Defense Reduction Special', (t) => {
  t.plan(2);
  // 43 attack, 31 def => 12 dmg and 21 dmg.
  simulateCombat(t, makeHero('Palla'), makeHero('Chrom'), 42-25, 47-12-21);
});

test('Stat Based Special and Killer Weapon', (t) => {
  t.plan(4);
  // Killer weapon and atk, attacked, atk pattern => 3CD Special will trigger.
  // 41 attack, 32 def, weapon disadvantage => 1x2
  // 25 def, 29 res => 12 from Bonfire and 14 from Iceberg.
  // Cherche hits for 63-25 = 38.
  simulateCombat(t, makeHero('Shanna', 5, withSpecial('Iceberg')), makeHero('Cherche'), 39-38, 46-(1*2)-14);
  simulateCombat(t, makeHero('Shanna', 5, withSpecial('Bonfire')), makeHero('Cherche'), 39-38, 46-(1*2)-12);
});

test('Brave Weapon, Darting Blow, Fury and Damage Special', (t) => {
  t.plan(4);
  // Camilla attacks 4 times while attacking and once when attacked
  // Draconic Aura will trigger and give +30% of atk = 11 bonus damage
  simulateCombat(t, makeHero('Camilla'), makeHero('Bartre'), 37-23, 49-(2*4)-11-6);
  simulateCombat(t, makeHero('Bartre'), makeHero('Camilla'), 49-2-6,  37-23);
});

test('Wo Dao and Damage-Taken Special', (t) => {
  t.plan(2);
  // Karel attacks for 12, Chrom for 28. Karel's special does 8 and Wo Dao does 10.
  simulateCombat(t, makeHero('Karel'), makeHero('Chrom'), 47-28, 47-12-(12+8+10));
});

test('Pain and Poison Strike', (t) => {
  t.plan(10);
  // Pain/Poison do not trigger if Azama/Matthew die
  simulateCombat(t, makeHero('Azama'), makeHero('Linde'), 0, 35);
  simulateCombat(t, makeHero('Matthew'), makeHero('Linde'), 0, 35-18);
  // Pain does not trigger if Azama cannot retaliate
  simulateCombat(t, makeHero('Chrom'), makeHero('Azama'), 47, 43-21);
  // Pain triggers both when Attacking and when Attacked. Poison only triggers when attacking.
  simulateCombat(t, makeHero('Azama'), makeHero('Matthew'), 43-0,    41-3-10);
  simulateCombat(t, makeHero('Matthew'), makeHero('Azama'), 41-3-10, 43-0-10);
});

// other special types
// lifesteal (+ fury, no overheal, only if survives)
// pain (when attacked from a distance and only if survives)
// miracle
