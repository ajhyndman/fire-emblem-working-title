// @flow
import test from 'tape';

import type { HeroInstance } from '../src/heroInstance';
import { getDefaultInstance } from '../src/heroInstance';
import { getStat } from '../src/heroHelpers';


test('lower rarity', (t) => {
  t.plan(5);
  const fourStarEffie = getDefaultInstance('Effie', 4);
  // Has Silver Lance
  t.equal(getStat(fourStarEffie, 'hp',  40), 47);
  t.equal(getStat(fourStarEffie, 'atk', 40), 38+11);
  t.equal(getStat(fourStarEffie, 'spd', 40), 20);
  t.equal(getStat(fourStarEffie, 'def', 40), 31);
  t.equal(getStat(fourStarEffie, 'res', 40), 21);
});

test('level 1 variance', (t) => {
  const olwen = { ...getDefaultInstance('Olwen'), boon: 'atk', bane: 'res'};
  t.plan(5);
  t.equal(getStat(olwen, 'hp',  1), 17);
  t.equal(getStat(olwen, 'atk', 1), 7+1);
  t.equal(getStat(olwen, 'spd', 1), 8);
  t.equal(getStat(olwen, 'def', 1), 5);
  t.equal(getStat(olwen, 'res', 1), 6-1);
});

test('level 40 variance', (t) => {
  const olwen = { ...getDefaultInstance('Olwen'), boon: 'atk', bane: 'res'};
  t.plan(5);
  // Includes Dire thunder.
  t.equal(getStat(olwen, 'hp',  40), 34);
  t.equal(getStat(olwen, 'atk', 40), 26+9+4);
  t.equal(getStat(olwen, 'spd', 40), 34-5);
  t.equal(getStat(olwen, 'def', 40), 20);
  t.equal(getStat(olwen, 'res', 40), 30-3);
});

test('merge bonuses', (t) => {
  const neutralOlwen = getDefaultInstance('Olwen');
  t.plan(10);
  // For neutral olwen the stat order is hp spd atk res def
  const olwen1 = {...neutralOlwen, mergeLevel: 1};
  t.equal(getStat(olwen1, 'hp',  40), 34   +1);
  t.equal(getStat(olwen1, 'spd', 40), 34-5 +1);
  const olwen2 = {...neutralOlwen, mergeLevel: 2};
  t.equal(getStat(olwen2, 'atk', 40), 26+9 +1);
  t.equal(getStat(olwen2, 'res', 40), 30   +1);
  const olwen3 = {...neutralOlwen, mergeLevel: 3};
  t.equal(getStat(olwen3, 'def', 40), 20   +1);
  t.equal(getStat(olwen3, 'hp',  40), 34   +2);
  const olwen4 = {...neutralOlwen, mergeLevel: 4};
  t.equal(getStat(olwen4, 'spd', 40), 34-5 +2);
  t.equal(getStat(olwen4, 'atk', 40), 26+9 +2);
  const olwen5 = {...neutralOlwen, mergeLevel: 5};
  t.equal(getStat(olwen5, 'res', 40), 30   +2);
  t.equal(getStat(olwen5, 'def', 40), 20   +2);
});

