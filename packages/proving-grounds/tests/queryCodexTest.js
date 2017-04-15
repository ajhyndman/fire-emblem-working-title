// @flow
import test from 'tape';
import stats from 'fire-emblem-heroes-stats';

import {
  decodeHero,
  encodeHero,
  extractInstance,
  extractWithDefaults,
  flattenAndIgnoreDefaults,
  flattenInstance,
  hash,
} from '../src/queryCodex';
import type { HeroInstance } from '../src/heroInstance';
import { getDefaultInstance } from '../src/heroInstance';
import { getDefaultSkills } from '../src/heroHelpers';
import { getSkillInfo } from '../src/skillHelpers';


// $FlowIssue object literal. This type is incompatible with HeroInstance
const customizedInstance: HeroInstance = {
  ...getDefaultInstance('Anna'),
  bane: 'atk',
  mergeLevel: 3,
  skills: {
    ...getDefaultSkills('Anna'),
    // $FlowIssue Skill may not be PassiveSkill
    PASSIVE_A: getSkillInfo('Attack +3'),
    // Convert to any because otherwise flow complains with incorrect line numbers.
    SEAL: (getSkillInfo('Attack +1'): any),
  }
};

test('flattenInstance', (t) => {
  t.test('reduces an instance to an array', (assert) => {
    assert.deepEqual(
      flattenInstance(customizedInstance),
      [
        'Anna',
        2, // atk bane
        'n', // no boon
        5,
        null,
        'Attack +3',
        'Vantage 3',
        'Spur Res 3',
        'Astra',
        'Nóatún',
        'Attack +1',
        3,
      ],
    );
    assert.end();
  });

  t.test('is reversible', (assert) => {
    assert.deepEqual(
      extractInstance(flattenInstance(customizedInstance)),
      customizedInstance,
    );
    assert.end();
  });

  t.end();
});

test('flattenAndIgnoreDefaults', (t) => {
  t.test('reduces an instance to an array', (assert) => {
    assert.deepEqual(
      flattenAndIgnoreDefaults(customizedInstance),
      [
        'Anna',
        2, // atk bane
        'd',
        'd',
        'd',
        'Attack +3', // A Passive
        'd',
        'd',
        'd',
        'd',
        'Attack +1', // Seal
        3, // Merge level
      ],
    );
    assert.end();
  });

  t.test('is reversible', (assert) => {
    assert.deepEqual(
      extractWithDefaults(flattenAndIgnoreDefaults(customizedInstance)),
      customizedInstance,
    );
    assert.end();
  });

  t.end();
});

test('hash', (t) => {
  t.test('hashes to a unicode string four characters long', (assert) => {
    assert.equal(hash('Anna').length, 4);
    assert.end();
  });

  t.test('doesn\'t collide', (assert) => {
    // console.log('raw:', stats.skills.map(skill => skill.name));
    // console.log('hashed:', stats.skills.map(skill => hash(skill.name)));

    // no collisions within skills
    assert.equal(
      new Set(stats.skills.map(skill => hash(skill.name))).size,
      new Set(stats.skills.map(skill => skill.name)).size,
    );

    // no collisions within heroes
    assert.equal(
      new Set(stats.heroes.map(hero => hash(hero.name))).size,
      new Set(stats.heroes.map(hero => hero.name)).size,
    );

    // no destructive collisions between heroes and skills
    assert.equal(
      new Set(stats.heroes.concat(stats.skills).map(item => hash(item.name))).size,
      new Set(stats.heroes.concat(stats.skills).map(item => item.name)).size,
    );

    assert.end();
  });

  t.end();
});

test('encodeHero', (t) => {
  t.test('tranforms a hero instance to a string', (assert) => {
    assert.equal(
      typeof encodeHero(customizedInstance),
      'string',
    );
    assert.end();
  });

  t.test('is reversible', (assert) => {
    assert.deepEqual(
      decodeHero(encodeHero(customizedInstance)),
      customizedInstance,
    );
    assert.end();
  });

  t.test('decoding is backwards compatible', (assert) => {
    assert.deepEqual(
      decodeHero('AwEwxgzA1ATFL0Q5T5A'),
      { ...getDefaultInstance('Anna'), bane: 'atk'},
    );
    assert.deepEqual(
      decodeHero('MwRgxgrA1AJr8E4BmAjA7FALEgppqKSCwUATGmKfHDEA'),
      {
        bane: null,
        boon: null,
        name: 'Cordelia',
        rarity: 5,
        mergeLevel: 0,
        skills: {
          WEAPON: getSkillInfo('Brave Lance+'),
          ASSIST: getSkillInfo('Pivot'),
          SPECIAL: getSkillInfo('Galeforce'),
          PASSIVE_A: getSkillInfo('Swift Sparrow 2'),
          PASSIVE_B: getSkillInfo('Drag Back'),
          PASSIVE_C: getSkillInfo('Savage Blow 3'),
          SEAL: null,
        },
      },
    );
    assert.end();
  });

  t.test('encode removed skills', (assert) => {
    const noSkillHero: HeroInstance = {
      bane: null,
      boon: null,
      name: 'Anna',
      rarity: 5,
      mergeLevel: 0,
      skills: {
        WEAPON: null,
        ASSIST: null,
        SPECIAL: null,
        PASSIVE_A: null,
        PASSIVE_B: null,
        PASSIVE_C: null,
        SEAL: null,
      },
    };
    assert.deepEqual(
      decodeHero(encodeHero(noSkillHero)),
      noSkillHero,
    );
    assert.end();
  });

  t.end();
});
