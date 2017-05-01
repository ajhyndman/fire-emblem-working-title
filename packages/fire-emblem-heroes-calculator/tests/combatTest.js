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

function withSpecial(hero: HeroInstance, specialName: string): HeroInstance {
  return {...hero, initialSpecialCharge: 100, skills: {...hero.skills, SPECIAL: specialName }};
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

test('Brave Weapon, Darting Blow, Fury and Damage Special', (t) => {
  t.plan(4);
  // Camilla attacks 4 times while attacking and once when attacked
  // Draconic Aura will trigger and give +30% of atk = 11 bonus damage
  simulateCombat(t, makeHero('Camilla'), makeHero('Bartre'), 37-23, 49-(2*4)-11-6);
  simulateCombat(t, makeHero('Bartre'), makeHero('Camilla'), 49-2-6,  37-23);
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

test('Desperation', (t) => {
  t.plan(4);
  const desperationNino = makeHero('Nino', 5, {PASSIVE_B: 'Desperation 3'});
  simulateCombat(t, desperationNino, makeHero('Hector'), 0, 52-27);
  simulateCombat(t, {...desperationNino, initialHpMissing: 10}, makeHero('Hector'), 33-10, 0);
});

test('Vantage', (t) => {
  t.plan(4);
  const deathBlowCordelia = makeHero('Cordelia', 5, {PASSIVE_A: 'Death Blow 3'});
  const vantageTakumi = makeHero('Takumi', 5, {PASSIVE_B: 'Vantage 3'});
  simulateCombat(t, deathBlowCordelia, vantageTakumi, 40, 0);
  simulateCombat(t, deathBlowCordelia, {...vantageTakumi, initialHpMissing: 10}, 0, 40-10);
});

test('Specials', (assert) => {
  assert.test('Stat Based Specials', (t) => {
    // Beruka stats are 46, 40, 23, 37, 22
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Draconic Aura'), makeHero('Beruka'),
      46-3, 46-3-12);
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Dragon Fang'), makeHero('Beruka'),
      46-3, 46-3-20);
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Bonfire'), makeHero('Beruka'),
      46-3, 46-3-18);
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Ignis'), makeHero('Beruka'),
      46-3, 46-3-29);
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Iceberg'), makeHero('Beruka'),
      46-3, 46-3-11);
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Glacies'), makeHero('Beruka'),
      46-3, 46-3-17);
    t.end();
  });

  assert.test('Wo Dao and Damage-Taken Special', (t) => {
    // Karel attacks for 12, Chrom for 28. Karel's special does 8 and Wo Dao does 10.
    simulateCombat(t, makeHero('Karel'), makeHero('Chrom'), 47-28, 47-12-(12+8+10));
    t.end()
  });

  assert.test('Defense Reduction Special', (t) => {
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Moonbow'), makeHero('Beruka'),
      46-3, 46-3-11);
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Luna'), makeHero('Beruka'),
      46-3, 46-3-18);
    // The lifegain from Aether is not relevant because Beruka is full health when she attacks.
    simulateCombat(t, withSpecial(makeHero('Beruka'), 'Aether'), makeHero('Beruka'),
      46-3, 46-3-18);
    t.end()
  });

  assert.test('Damage multiplier special', (t) => {
    simulateCombat(t, withSpecial(makeHero('Odin'), 'Glimmer'), makeHero('Odin'), 43-10, 43-15);
    simulateCombat(t, withSpecial(makeHero('Odin'), 'Night Sky'), makeHero('Odin'), 43-10, 43-15);
    simulateCombat(t, withSpecial(makeHero('Odin'), 'Astra'), makeHero('Odin'), 43-10, 43-25);
    t.end()
  });

  assert.test('Lifesteal special', (t) => {
    simulateCombat(t, makeHero('Odin'), withSpecial(makeHero('Odin'), 'Sol'), 43-10, 43-10+5);
    simulateCombat(t, makeHero('Odin'), withSpecial(makeHero('Odin'), 'Noontime'), 43-10, 43-10+3);
    simulateCombat(t, makeHero('Odin'), withSpecial(makeHero('Odin'), 'Daylight'), 43-10, 43-10+3);
    // Aether will increase damage dealt to 22 => heal to full
    simulateCombat(t, makeHero('Odin'), withSpecial(makeHero('Odin'), 'Aether'), 43-22, 43);
    t.end()
  });

  // TODO:
  // heavy blade, guard, killer weapons, special slowing weapons
  // Damage-reduction special + rounding
  // Miracle
  // Which specials ignore color advantage etc (aoe, stat based, atk based)
  // but damage and armor based specials kind of care.
  // Specials include static and conditional passive stats (even atk)
  // Lifesteal ignores overkill

  assert.test('Killer Weapon and color disadvantage', (t) => {
    // Killer weapon and atk, attacked, atk pattern => 3CD Special will trigger.
    // 41 attack, 32 def, weapon disadvantage => 1x2
    // 25 def, 29 res => 14 from Iceberg.
    // Cherche hits for 63-25 = 38.
    simulateCombat(t, makeHero('Shanna'), makeHero('Cherche'), 39-38, 46-(1*2)-14);
    t.end()
  });
  assert.end()
});

// TODO:
// postcombat lifesteal (+ fury, no overheal, only if survives)
