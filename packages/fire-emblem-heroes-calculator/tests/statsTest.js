// @flow
import test from 'tape';
import { getSkillType } from 'fire-emblem-heroes-stats';

import type { HeroInstance, Stat } from '../src/heroInstance';
import { getDefaultInstance } from '../src/heroInstance';
import { getStat } from '../src/heroHelpers';

test('lower rarity', t => {
  t.plan(5);
  const fourStarEffie = getDefaultInstance('Effie', 4);
  // Has Silver Lance
  t.equal(getStat(fourStarEffie, 'hp', 40), 47);
  t.equal(getStat(fourStarEffie, 'atk', 40), 38 + 11);
  t.equal(getStat(fourStarEffie, 'spd', 40), 20);
  t.equal(getStat(fourStarEffie, 'def', 40), 31);
  t.equal(getStat(fourStarEffie, 'res', 40), 21);
});

test('level 1 variance', t => {
  const olwen = { ...getDefaultInstance('Olwen'), boon: 'atk', bane: 'res' };
  t.plan(5);
  t.equal(getStat(olwen, 'hp', 1), 17);
  t.equal(getStat(olwen, 'atk', 1), 7 + 1);
  t.equal(getStat(olwen, 'spd', 1), 8);
  t.equal(getStat(olwen, 'def', 1), 5);
  t.equal(getStat(olwen, 'res', 1), 6 - 1);
});

test('level 40 variance', t => {
  const olwen = { ...getDefaultInstance('Olwen'), boon: 'atk', bane: 'res' };
  t.plan(5);
  // Includes Dire thunder.
  t.equal(getStat(olwen, 'hp', 40), 34);
  t.equal(getStat(olwen, 'atk', 40), 26 + 9 + 4);
  t.equal(getStat(olwen, 'spd', 40), 34 - 5);
  t.equal(getStat(olwen, 'def', 40), 20);
  t.equal(getStat(olwen, 'res', 40), 30 - 3);
});

test('merge bonuses', t => {
  const neutralOlwen = getDefaultInstance('Olwen');
  t.plan(10);
  // For neutral olwen the stat order is hp spd atk res def
  const olwen1 = { ...neutralOlwen, mergeLevel: 1 };
  t.equal(getStat(olwen1, 'hp', 40), 34 + 1);
  t.equal(getStat(olwen1, 'spd', 40), 34 - 5 + 1);
  const olwen2 = { ...neutralOlwen, mergeLevel: 2 };
  t.equal(getStat(olwen2, 'atk', 40), 26 + 9 + 1);
  t.equal(getStat(olwen2, 'res', 40), 30 + 1);
  const olwen3 = { ...neutralOlwen, mergeLevel: 3 };
  t.equal(getStat(olwen3, 'def', 40), 20 + 1);
  t.equal(getStat(olwen3, 'hp', 40), 34 + 2);
  const olwen4 = { ...neutralOlwen, mergeLevel: 4 };
  t.equal(getStat(olwen4, 'spd', 40), 34 - 5 + 2);
  t.equal(getStat(olwen4, 'atk', 40), 26 + 9 + 2);
  const olwen5 = { ...neutralOlwen, mergeLevel: 5 };
  t.equal(getStat(olwen5, 'res', 40), 30 + 2);
  t.equal(getStat(olwen5, 'def', 40), 20 + 2);
});

function withHpMissing(hpMissing: number, hero: HeroInstance): HeroInstance {
  return { ...hero, state: { ...hero.state, hpMissing } };
}

function testStatSkill(
  t, // test object
  skillName: string,
  statKey: Stat,
  statBonus: number,
  isAttacker: boolean = true,
  missingHp: number = 0,
) {
  const skillType = getSkillType(skillName) || 'SEAL';
  // Whether or not a hero can actually equip a skill doesn't matter to getStat.
  const hero = withHpMissing(missingHp, getDefaultInstance('Anna'));
  const withoutSkill = {
    ...hero,
    // $FlowIssue flow doesn't like the skills object literal
    skills: { ...hero.skills, [skillType]: undefined },
  };
  const withSkill = {
    ...hero,
    // $FlowIssue flow doesn't like the skills object literal
    skills: { ...hero.skills, [skillType]: skillName },
  };
  // Assume that a unit is fighting itself for these tests.
  const context = {
    enemy: hero,
    isAttacker: isAttacker,
    allies: [],
    otherEnemies: [],
  };
  t.equal(
    getStat(withSkill, statKey, 40, context) -
      getStat(withoutSkill, statKey, 40, context),
    statBonus,
  );
}

test('Context is optional', t => {
  t.plan(5);
  const hero = getDefaultInstance('Anna');
  t.equal(getStat(hero, 'hp', 40), 41);
  t.equal(getStat(hero, 'atk', 40), 45);
  t.equal(getStat(hero, 'spd', 40), 38);
  t.equal(getStat(hero, 'def', 40), 22);
  t.equal(getStat(hero, 'res', 40), 28);
});

test('Stat Skills', assert => {
  assert.test('Brave Weapons', t => {
    // Brave weapons
    testStatSkill(t, 'Brave Lance+', 'atk', 8);
    testStatSkill(t, 'Brave Lance+', 'spd', -5);
    testStatSkill(t, 'Dire Thunder', 'atk', 9);
    testStatSkill(t, 'Dire Thunder', 'spd', -5);
    t.end();
  });

  assert.test('Stat Bonuses with HP% conditions', t => {
    // bonus if HP < 50%
    testStatSkill(t, 'Tyrfing', 'def', 4, true, 30);
    testStatSkill(t, 'Tyrfing', 'def', 0, true, 0);

    // bonus if HP = 100%
    testStatSkill(t, 'Ragnarok', 'atk', 14 + 5, false, 0);
    testStatSkill(t, 'Ragnarok', 'spd', 5, false, 0);
    testStatSkill(t, 'Ragnarok', 'atk', 14, false, 1);
    testStatSkill(t, 'Ragnarok', 'spd', 0, false, 1);
    t.end();
  });

  assert.test('Attacker-Specific Weapon Bonuses', t => {
    testStatSkill(t, 'Durandal', 'atk', 20, true);
    testStatSkill(t, 'Durandal', 'atk', 16, false);

    testStatSkill(t, 'Yato', 'spd', 4, true);
    testStatSkill(t, 'Yato', 'spd', 0, false);

    testStatSkill(t, 'Naga', 'def', 0, true);
    testStatSkill(t, 'Naga', 'res', 0, true);
    testStatSkill(t, 'Naga', 'def', 2, false);
    testStatSkill(t, 'Naga', 'res', 2, false);

    testStatSkill(t, 'Binding Blade', 'def', 0, true);
    testStatSkill(t, 'Binding Blade', 'res', 0, true);
    testStatSkill(t, 'Binding Blade', 'def', 2, false);
    testStatSkill(t, 'Binding Blade', 'res', 2, false);

    testStatSkill(t, 'Parthia', 'res', 4, true);
    testStatSkill(t, 'Parthia', 'res', 0, false);
    t.end();
  });

  assert.test('Attacker-Specific Passive Bonuses', t => {
    testStatSkill(t, 'Death Blow 3', 'atk', 6, true);
    testStatSkill(t, 'Death Blow 3', 'atk', 0, false);
    testStatSkill(t, 'Darting Blow 3', 'spd', 6, true);
    testStatSkill(t, 'Darting Blow 3', 'spd', 0, false);
    testStatSkill(t, 'Armored Blow 3', 'def', 6, true);
    testStatSkill(t, 'Armored Blow 3', 'def', 0, false);
    testStatSkill(t, 'Warding Blow 3', 'res', 6, true);
    testStatSkill(t, 'Warding Blow 3', 'res', 0, false);

    testStatSkill(t, 'Swift Sparrow 2', 'atk', 4, true);
    testStatSkill(t, 'Swift Sparrow 2', 'spd', 4, true);
    testStatSkill(t, 'Swift Sparrow 2', 'atk', 0, false);
    testStatSkill(t, 'Swift Sparrow 2', 'spd', 0, false);
    t.end();
  });

  assert.test('Unconditional Passive Stats', t => {
    testStatSkill(t, 'HP +5', 'hp', 5);
    testStatSkill(t, 'Attack +3', 'atk', 3);
    testStatSkill(t, 'Speed +3', 'spd', 3);
    testStatSkill(t, 'Defense +3', 'def', 3);
    testStatSkill(t, 'Resistance +3', 'res', 3);

    testStatSkill(t, 'Fury 3', 'hp', 0);
    testStatSkill(t, 'Fury 3', 'atk', 3);
    testStatSkill(t, 'Fury 3', 'spd', 3);
    testStatSkill(t, 'Fury 3', 'def', 3);
    testStatSkill(t, 'Fury 3', 'res', 3);

    testStatSkill(t, 'Fortress Def 3', 'def', 5);
    testStatSkill(t, 'Fortress Def 3', 'atk', -3);

    testStatSkill(t, 'Life and Death 3', 'hp', 0);
    testStatSkill(t, 'Life and Death 3', 'atk', 5);
    testStatSkill(t, 'Life and Death 3', 'spd', 5);
    testStatSkill(t, 'Life and Death 3', 'def', -5);
    testStatSkill(t, 'Life and Death 3', 'res', -5);
    t.end();
  });

  assert.test('Passive Tiers', t => {
    testStatSkill(t, 'Death Blow 2', 'atk', 4, true);
    testStatSkill(t, 'Swift Sparrow 1', 'atk', 2, true);
    testStatSkill(t, 'Fortress Def 2', 'def', 4);
    testStatSkill(t, 'Fortress Def 2', 'atk', -3);
    testStatSkill(t, 'Life and Death 2', 'atk', 4);
    testStatSkill(t, 'Life and Death 2', 'def', -4);
    testStatSkill(t, 'Fury 1', 'atk', 1);
    testStatSkill(t, 'Fury 2', 'spd', 2);
    testStatSkill(t, 'HP +4', 'hp', 4);
    testStatSkill(t, 'Attack +1', 'atk', 1);
    t.end();
  });
});
