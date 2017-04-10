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
  bane: 'spd',
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
        3,  // Name
        null,  // Assist
        null,  // A
        6,  // B
        6,  // C
        6,  // Special
        12,  // Weapon
        5 + 6*3 + 36*0,  // Rarity + 6xBane (spd=3) + 36xBoon (null=0)
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

test('encodeHero', (t) => {
  t.test('tranforms a hero instance to a string', (assert) => {
    assert.equal(
      typeof encodeHero(mockInstance),
      'string',
    );
    console.log('encoded hero is:', encodeHero(mockInstance));
    assert.equal(
      encodeHero(mockInstance),
      'AwAABgYGDBc=',
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