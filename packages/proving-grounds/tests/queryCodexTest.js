// @flow
import test from 'tape';
import { getAllHeroes, getAllSkills } from 'fire-emblem-heroes-stats';
import {
  getDefaultSkills,
  getDefaultInstance,
} from 'fire-emblem-heroes-calculator';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';

import {
  decodeHero,
  encodeHero,
  extractInstance,
  extractWithDefaults,
  flattenAndIgnoreDefaults,
  flattenInstance,
  hash,
} from '../src/queryCodex';

const customizedInstance: HeroInstance = {
  ...getDefaultInstance('Anna: Commander'),
  bane: 'atk',
  mergeLevel: 3,
  skills: {
    ...getDefaultSkills('Anna: Commander'),
    PASSIVE_A: 'Attack +3',
    // Convert to any because otherwise flow complains with incorrect line numbers.
    SEAL: 'Attack +1',
  },
};

test('flattenInstance', t => {
  t.test('reduces an instance to an array', assert => {
    assert.deepEqual(flattenInstance(customizedInstance), [
      'Anna: Commander',
      2, // atk bane
      'n', // no boon
      5,
      undefined,
      'Attack +3',
      'Vantage 3',
      'Spur Res 3',
      'Astra',
      'Nóatún',
      'Attack +1',
      3, // Merge level
      0, // initial missing hp
      0, // initial special charge
    ]);
    assert.end();
  });

  t.test('is reversible', assert => {
    assert.deepEqual(
      extractInstance(flattenInstance(customizedInstance)),
      customizedInstance,
    );
    assert.end();
  });

  t.end();
});

test('flattenAndIgnoreDefaults', t => {
  t.test('reduces an instance to an array', assert => {
    assert.deepEqual(flattenAndIgnoreDefaults(customizedInstance), [
      'Anna: Commander',
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
    ]);
    assert.end();
  });

  t.test('trims defaults', assert => {
    assert.deepEqual(
      flattenAndIgnoreDefaults(getDefaultInstance('Anna: Commander')),
      ['Anna: Commander'],
    );
    assert.end();
  });

  t.test('is reversible', assert => {
    assert.deepEqual(
      extractWithDefaults(flattenAndIgnoreDefaults(customizedInstance)),
      customizedInstance,
    );
    assert.end();
  });

  t.end();
});

test('hash', t => {
  t.test('hashes to a unicode string five characters long', assert => {
    assert.equal(hash('Anna: Commander').length, 5);
    assert.end();
  });

  t.test("doesn't collide", assert => {
    // console.log('raw:', stats.skills.map(skill => skill.name));
    // console.log('hashed:', stats.skills.map(skill => hash(skill.name)));

    const heroes = getAllHeroes();
    const skills = getAllSkills();
    // no collisions within skills
    assert.equal(
      new Set(skills.map(skill => hash(skill.name))).size,
      new Set(skills.map(skill => skill.name)).size,
    );

    // no collisions within heroes
    assert.equal(
      new Set(heroes.map(hero => hash(hero.name))).size,
      new Set(heroes.map(hero => hero.name)).size,
    );

    // no destructive collisions between heroes and skills
    assert.equal(
      new Set(heroes.concat(skills).map(item => hash(item.name))).size,
      new Set(heroes.concat(skills).map(item => item.name)).size,
    );

    assert.end();
  });

  t.end();
});

test('encodeHero', t => {
  t.test('tranforms a hero instance to a string', assert => {
    assert.equal(typeof encodeHero(customizedInstance), 'string');
    assert.end();
  });

  t.test('is reversible', assert => {
    assert.deepEqual(
      decodeHero(encodeHero(customizedInstance)),
      customizedInstance,
    );
    assert.end();
  });

  t.test('decoding is backwards compatible', assert => {
    assert.deepEqual(decodeHero('AwEwxgzGDUBMQ'), {
      ...getDefaultInstance('Anna: Commander'),
      bane: 'atk',
    });
    assert.deepEqual(
      decodeHero('MwRgxgrMDUAmcIJwDMBGB2AptALMzOAHNKsosNgEzpiXBA'),
      {
        ...getDefaultInstance('Cordelia: Knight Paragon'),
        skills: {
          WEAPON: 'Brave Lance+',
          ASSIST: 'Pivot',
          SPECIAL: 'Galeforce',
          PASSIVE_A: 'Swift Sparrow 2',
          PASSIVE_B: 'Drag Back',
          PASSIVE_C: 'Savage Blow 3',
          SEAL: undefined,
        },
      },
    );
    assert.end();
  });

  t.test('encode removed skills', assert => {
    const noSkillHero: HeroInstance = {
      ...getDefaultInstance('Anna: Commander'),
      skills: {
        WEAPON: undefined,
        ASSIST: undefined,
        SPECIAL: undefined,
        PASSIVE_A: undefined,
        PASSIVE_B: undefined,
        PASSIVE_C: undefined,
        SEAL: undefined,
      },
    };
    assert.deepEqual(decodeHero(encodeHero(noSkillHero)), noSkillHero);
    assert.end();
  });

  t.end();
});
