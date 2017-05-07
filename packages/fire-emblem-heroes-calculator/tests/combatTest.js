// @flow
import test from 'tape';
import { getSkillType } from 'fire-emblem-heroes-stats';

import { calculateResult } from '../src/damageCalculation';
import { getDefaultSkills } from '../src/heroHelpers';

import { getDefaultInstance } from '../src/heroInstance';
import type { HeroInstance, Rarity, Stat } from '../src/heroInstance';


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

// Sets the buff amount for a stat
function withBuff(statKey: Stat, amount: number, hero: HeroInstance): HeroInstance {
  // $FlowIssue flow doesn't like the buffs object literal
  return {...hero, state: {...hero.state, buffs: {...hero.state.buffs, [statKey]: amount}}};
}

// Sets the debuff amount for a stat
function withDebuff(statKey: Stat, amount: number, hero: HeroInstance): HeroInstance {
  // $FlowIssue flow doesn't like the debuffs object literal
  return {...hero, state: {...hero.state, debuffs: {...hero.state.debuffs, [statKey]: amount}}};
}

// Equips a skill for the hero.
function withSkill(skillName: string, hero: HeroInstance): HeroInstance {
  const skillType = getSkillType(skillName) || 'SEAL';
  // $FlowIssue flow doesn't like the skills object literal
  return {...hero, skills: {...hero.skills, [skillType]: skillName }};
}

function withCharge(chargeAmount: number, hero: HeroInstance): HeroInstance {
  return {...hero, state: {...hero.state, specialCharge: chargeAmount}};
}

// Equips a Special for the hero and also readies it.
function withSpecial(specialName: string, hero: HeroInstance): HeroInstance {
  return withCharge(100, withSkill(specialName, hero));
}

function withHpMissing(hpMissing: number, hero: HeroInstance): HeroInstance {
  return {...hero, state: {...hero.state, hpMissing}};
}

function simulateCombat(
  t, // test object
  hero1: HeroInstance,
  hero2: HeroInstance,
  expectedHp1: number,
  expectedHp2: number,
) {
  const result = calculateResult(hero1, hero2);
  if (result.combatInfo.attackerHp !== expectedHp1
      || result.combatInfo.defenderHp !== expectedHp2) {
    console.log(hero1.name, 'vs', hero2.name);
    console.log('Combat Result:\n', result);
  }
  t.equal(result.combatInfo.attackerHp, expectedHp1);
  t.equal(result.combatInfo.defenderHp, expectedHp2);
  return result;
}

test('Normal Combat', (t) => {
  t.plan(2);
  simulateCombat(t, makeHero('Lilina'), makeHero('Takumi'), 0, 40-35);
});

test('Quick Riposte and Gem Weapon', (t) => {
  t.plan(5);
  const result = simulateCombat(t, makeHero('Hana'), makeHero('Subaki'), 0, 40-(2*0));
  t.equal(result.combatInfo.attackerNumAttacks, 2);
  t.equal(result.combatInfo.defenderNumAttacks, 2);
  t.equal(result.combatInfo.defenderDamage, 33);
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
  t.equal(result.combatInfo.attackerNumAttacks, 4);
  t.equal(result.combatInfo.defenderNumAttacks, 1);
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
  simulateCombat(t, withHpMissing(10, desperationNino), makeHero('Hector'), 33-10, 0);
});

test('Vantage', (t) => {
  t.plan(4);
  const deathBlowCordelia = makeHero('Cordelia', 5, {PASSIVE_A: 'Death Blow 3'});
  const vantageTakumi = makeHero('Takumi', 5, {PASSIVE_B: 'Vantage 3'});
  simulateCombat(t, deathBlowCordelia, vantageTakumi, 40, 0);
  simulateCombat(t, deathBlowCordelia, withHpMissing(10, vantageTakumi), 0, 40-10);
});

test('Specials', (assert) => {
  assert.test('Stat Based Specials', (t) => {
    // Beruka stats are 46, 40, 23, 37, 22
    simulateCombat(t, withSpecial('Draconic Aura', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-12);
    simulateCombat(t, withSpecial('Dragon Fang', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-20);
    simulateCombat(t, withSpecial('Bonfire', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-18);
    simulateCombat(t, withSpecial('Ignis', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-29);
    simulateCombat(t, withSpecial('Iceberg', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-11);
    simulateCombat(t, withSpecial('Glacies', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-17);
    t.end();
  });

  assert.test('Wo Dao and Damage-Taken Special', (t) => {
    // Karel attacks for 12, Chrom for 28. Karel's special does 8 and Wo Dao does 10.
    simulateCombat(t, makeHero('Karel'), makeHero('Chrom'), 47-28, 47-12-(12+8+10));
    t.end()
  });

  assert.test('Defense Reduction Special', (t) => {
    simulateCombat(t, withSpecial('Moonbow', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-11);
    simulateCombat(t, withSpecial('Luna', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-18);
    // The lifegain from Aether is not relevant because Beruka is full health when she attacks.
    simulateCombat(t, withSpecial('Aether', makeHero('Beruka')), makeHero('Beruka'),
      46-3, 46-3-18);
    t.end()
  });

  assert.test('Damage multiplier special', (t) => {
    simulateCombat(t, withSpecial('Glimmer', makeHero('Odin')), makeHero('Odin'), 43-10, 43-15);
    simulateCombat(t, withSpecial('Night Sky', makeHero('Odin')), makeHero('Odin'), 43-10, 43-15);
    simulateCombat(t, withSpecial('Astra', makeHero('Odin')), makeHero('Odin'), 43-10, 43-25);
    t.end()
  });

  assert.test('Lifesteal special', (t) => {
    simulateCombat(t, makeHero('Odin'), withSpecial('Sol', makeHero('Odin')), 43-10, 43-10+5);
    simulateCombat(t, makeHero('Odin'), withSpecial('Noontime', makeHero('Odin')), 43-10, 43-10+3);
    simulateCombat(t, makeHero('Odin'), withSpecial('Daylight', makeHero('Odin')), 43-10, 43-10+3);
    // Aether will increase damage dealt to 22 => heal to full
    simulateCombat(t, makeHero('Odin'), withSpecial('Aether', makeHero('Odin')), 43-22, 43);
    t.end()
  });

  assert.test('Miracle', (t) => {
    simulateCombat(t, makeHero('Takumi'), withSpecial('Miracle', makeHero('Est')), 40, 1);
    // Miracle only prevents the first lethal attack. The second kills.
    simulateCombat(t, makeHero('Klein'), withSpecial('Miracle', makeHero('Est')), 40, 0);
    // Subaki survives the first attack so Miracle protects him from the second.
    simulateCombat(t, makeHero('Klein'), withSpecial('Miracle', makeHero('Subaki')), 40, 1);
    t.end()
  });

  // TODO:
  // special cooldown increasing weapons
  // Damage-reduction special + rounding
  // Which specials ignore color advantage etc (aoe, stat based, atk based)
  // but damage and armor based specials kind of care.
  // Specials include static and conditional passive stats (even atk)
  // Lifesteal ignores overkill

  assert.test('Killer Weapon and color disadvantage', (t) => {
    // Cherche hits 38, Shanna hits for 1x2 and Killer weapon allows her special to trigger.
    simulateCombat(t, makeHero('Shanna'), makeHero('Cherche'), 39-38, 46-(1*2)-14);
    t.end()
  });
  
  assert.test('Guard', (t) => {
    // Moonbow will trigger on Palla's second attack.
    simulateCombat(t, makeHero('Palla'), makeHero('Chrom'), 42-25, 47-(12*2)-9);
    const guardChrom = withSkill('Guard 3', makeHero('Chrom'));
    // cooldown: 1 => guard prevents special from charging
    simulateCombat(t, withCharge(1, makeHero('Palla')), guardChrom, 42-25, 47-(12*2));
    // cooldown: 0 => special is already charged so it activates
    simulateCombat(t, withCharge(2, makeHero('Palla')), guardChrom, 42-25, 47-(12*2)-9);
    t.end()
  });

  assert.test('Heavy Blade', (t) => {
    // Palla has 43 atk, 28 def. Draug has 38 atk, 39 def. Chrom has 53 atk 31 def.
    // Give Draug a spd bane to guarantee Palla doubles him.
    const bladePalla = withSkill('Heavy Blade 3', withSkill('Bonfire', makeHero('Palla')));
    const slowDraug = {...makeHero('Draug'), bane: 'spd'};
    // Blade: attack = 2 charges, attacked = 1 charge.
    // cooldown: 3 => special will trigger
    simulateCombat(t, bladePalla, slowDraug, 42-10, 50-(4*2)-14);
    // cooldown: 2 => special will not trigger
    simulateCombat(t, withSkill('Ignis', bladePalla), slowDraug, 42-10, 50-(4*2));
    // cooldown: 3 + lower atk than foe => blade does not work, special will not trigger
    simulateCombat(t, bladePalla, makeHero('Chrom'), 42-25, 47-(12*2));
    t.end()
  });

  assert.test('Heavy Blade vs Guard', (t) => {
    const bladePalla = withSkill('Heavy Blade 3', withSkill('Moonbow', makeHero('Palla')));
    const slowGuardDraug = {...withSkill('Guard 3', makeHero('Draug')), bane: 'spd'};
    // Blade vs Guard: attack = 1 charge, attacked = 0 charge.
    // cooldown: 2 => special will not trigger
    simulateCombat(t, bladePalla, slowGuardDraug, 42-10, 50-(4*2));
    // cooldown: 1 => special will trigger
    simulateCombat(t, withCharge(1, bladePalla), slowGuardDraug, 42-10, 50-(4*2)-11);
    t.end();
  });

  assert.end()
});

test('Buffs', (assert) => {
  const anna = makeHero('Anna');
  assert.test('Attacker buffs expire at start of turn', (t) => {
    const result = simulateCombat(t, withBuff('atk', 4, anna), anna, 41-23, 41-23);
    t.equal(result.attackerState.buffs.atk, 0);
    t.end();
  });
  assert.test('Defender buffs persist', (t) => {
    const result = simulateCombat(t, anna, withBuff('atk', 4, anna), 41-27, 41-23);
    t.equal(result.defenderState.buffs.atk, 4);
    t.end();
  });
  assert.test('Blade tome', (t) => {
    const nino = makeHero('Nino');
    const buffedNino = withBuff('def', 2, withBuff('spd', 4, withBuff('atk', 4, nino)));
    // Normal damage is 17, atk buff is 4, total buff is 10 => dmg is 31
    const result = simulateCombat(t, nino, buffedNino, 33-31, 33-17);
    t.equal(result.defenderState.buffs.atk, 4);
    t.end();
  });
  assert.test('Defiant Atk + Blade Tome', (t) => {
    const odin = makeHero('Odin');
    // Normal damage is 10, atk buff is 7 => dmg is 24
    const result = simulateCombat(t, withHpMissing(22, odin), odin, 21-10, 43-24);
    t.equal(result.attackerState.buffs.atk, 7);
    t.end();
  });
  assert.test('Rogue Dagger when able to retaliate', (t) => {
    const odin = makeHero('Odin');
    const matt = makeHero('Matthew');
    const result = simulateCombat(t, odin, matt, 43-7, 41-17);
    t.equal(result.attackerState.buffs.def, 0);
    t.equal(result.attackerState.buffs.res, 0);
    t.equal(result.attackerState.debuffs.def, 5);
    t.equal(result.attackerState.debuffs.res, 5);
    t.equal(result.defenderState.buffs.def, 5);
    t.equal(result.defenderState.buffs.res, 5);
    t.equal(result.defenderState.debuffs.def, 0);
    t.equal(result.defenderState.debuffs.res, 0);
    t.end();
  });
  assert.test('Rogue Dagger when unable to retaliate', (t) => {
    const palla = makeHero('Palla');
    const matt = makeHero('Matthew');
    const result = simulateCombat(t, palla, matt, 42, 41-13);
    t.equal(result.attackerState.debuffs.def, 0);
    t.equal(result.attackerState.debuffs.res, 0);
    t.equal(result.defenderState.buffs.def, 0);
    t.equal(result.defenderState.buffs.res, 0);
    t.end();
  });
  assert.end()
});

test('Debuffs', (assert) => {
  const anna = makeHero('Anna');
  assert.test('Attacker debuffs expire after combat', (t) => {
    const result = simulateCombat(t, withDebuff('atk', 4, anna), anna, 41-23, 41-19);
    t.equal(result.attackerState.debuffs.atk, 0);
    t.end();
  });
  assert.test('Defender debuffs persist', (t) => {
    const result = simulateCombat(t, anna, withDebuff('atk', 4, anna), 41-19, 41-23);
    t.equal(result.defenderState.debuffs.atk, 4);
    t.end();
  });
  assert.test('Seal X when attacking', (t) => {
    const result = simulateCombat(t, withSkill('Seal Atk 3', anna), anna, 41-23, 41-23);
    t.equal(result.attackerState.debuffs.atk, 0);
    t.equal(result.defenderState.debuffs.atk, 7);
    t.end();
  });
  assert.test('Seal X when attacked', (t) => {
    const result = simulateCombat(t, anna, withSkill('Seal Atk 3', anna), 41-23, 41-23);
    t.equal(result.attackerState.debuffs.atk, 7);
    t.equal(result.defenderState.debuffs.atk, 0);
    t.end();
  });
  assert.test('Seal X does not trigger when dead', (t) => {
    const cordelia = makeHero('Cordelia');
    const result = simulateCombat(t, cordelia, withSkill('Seal Atk 3', cordelia), 40, 0);
    t.equal(result.attackerState.debuffs.atk, 0);
    t.equal(result.defenderState.debuffs.atk, 0);
    t.end();
  });
  assert.end()
});

// TODO:
// Sweep weapons
// Brash Assault / Sol Katti
// postcombat lifesteal (+ fury, no overheal, only if survives)
