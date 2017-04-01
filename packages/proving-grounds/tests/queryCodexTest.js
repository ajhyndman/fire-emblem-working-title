// @flow
import test from 'tape';
import stats from 'fire-emblem-heroes-stats';

import { getSkillInfo } from '../src/skillHelpers';
import {
  decodeHero,
  encodeHero,
  extractInstance,
  flattenInstance,
  hash,
  // hashTable,
} from '../src/queryCodex';
import type { HeroInstance } from '../src/store';


const mockInstance: HeroInstance = {
  bane: null,
  boon: null,
  name: 'Anna',
  rarity: 5,
  skills: {
    // FlowIssue: getSkillInfo's typedef can't infer which skill type will be returned.
    WEAPON: (getSkillInfo('Nóatún'): any),
    ASSIST: null,
    SPECIAL: (getSkillInfo('Astra'): any),
    PASSIVE_A: null,
    PASSIVE_B: (getSkillInfo('Vantage 3'): any),
    PASSIVE_C: (getSkillInfo('Spur Res 3'): any),
  },
};

test('flattenInstance', (t) => {
  t.test('reduces an instance to an array', (assert) => {
    assert.deepEqual(
      flattenInstance(mockInstance),
      [
        null,
        null,
        'Anna',
        5,
        null,
        null,
        'Vantage 3',
        'Spur Res 3',
        'Astra',
        'Nóatún',
      ],
    );
    assert.end();
  });

  t.test('is reversible', (assert) => {
    assert.deepEqual(
      extractInstance(flattenInstance(mockInstance)),
      mockInstance,
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
      typeof encodeHero(mockInstance),
      'string',
    );
    assert.equal(
      encodeHero(mockInstance),
      'AwalwEwYwZhBWMSBMA2eUEEMqpDdLELGCLIA',
    );
    assert.end();
  });

  // console.log(hashTable);

  t.test('is reversible', (assert) => {
    assert.deepEqual(
      decodeHero(encodeHero(mockInstance)),
      mockInstance,
    );
    assert.end();
  });

  t.end();
});
