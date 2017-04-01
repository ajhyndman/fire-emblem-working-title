// @flow
import SHA1 from 'crypto-js/sha1';
import lzString from 'lz-string';
import stats from 'fire-emblem-heroes-stats';
import { compose, flatten, map, prop, range, take, zipObj } from 'ramda';

import { getSkillInfo } from './skillHelpers';
import type { HeroInstance, Rarity, Stat } from './store';


/**
 * Flattening/Unflattening
 */

type SerialInstance = [
  ?Stat, // bane
  ?Stat, // boon
  string, // name
  Rarity, // rarity
  ?string, // assist
  ?string, // passive a
  ?string, // passive b
  ?string, // passive c
  ?string, // special
  ?string, // weapon
];

export const flattenInstance = (instance: HeroInstance): SerialInstance => [
  instance.bane,
  instance.boon,
  instance.name,
  instance.rarity,
  // I'm avoiding Ramda path() calls here, just because flow
  // does better inference this way.  :(
  instance.skills && instance.skills.ASSIST && instance.skills.ASSIST.name,
  instance.skills && instance.skills.PASSIVE_A && instance.skills.PASSIVE_A.name,
  instance.skills && instance.skills.PASSIVE_B && instance.skills.PASSIVE_B.name,
  instance.skills && instance.skills.PASSIVE_C && instance.skills.PASSIVE_C.name,
  instance.skills && instance.skills.SPECIAL && instance.skills.SPECIAL.name,
  instance.skills && instance.skills.WEAPON && instance.skills.WEAPON.name,
];

export const extractInstance = ([
  bane,
  boon,
  name,
  rarity,
  assist,
  passiveA,
  passiveB,
  passiveC,
  special,
  weapon,
]: SerialInstance): HeroInstance => ({
  bane,
  boon,
  name,
  rarity,
  skills: {
    // Technically, if we get bogus skill names somehow, this could
    // return a corrupt hero instance.
    WEAPON: (weapon && getSkillInfo(weapon): any),
    ASSIST: (assist && getSkillInfo(assist): any),
    SPECIAL: (special && getSkillInfo(special): any),
    PASSIVE_A: (passiveA && getSkillInfo(passiveA): any),
    PASSIVE_B: (passiveB && getSkillInfo(passiveB): any),
    PASSIVE_C: (passiveC && getSkillInfo(passiveC): any),
  },
});

/**
 * Hashing
 */

export const hash = (value: any): string => (
  value == null
    ? '0'
    : (typeof value === 'number')
      ? value
      : take(4, SHA1(value).toString())
);

const values = flatten([
  // Explicitly add `null` to the hash table.
  // This is a workaround for issue #52
  null,
  range(1, 999),
  ['hp', 'atk', 'spd', 'def', 'res'],
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), stats.skills),
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), stats.heroes),
]);

// $FlowIssue: flowtypes for ramda aren't precise
export const hashTable = zipObj(map(hash, values), values);

/**
 * These do everything above.
 */

export const decodeHero = (heroCode: string): ?HeroInstance => (
  heroCode
    ? compose(
      extractInstance,
      map(hash => hashTable[hash]),
      string => string.split('+'),
      lzString.decompressFromBase64,
    )(heroCode)
    : undefined
);

export const encodeHero = (instance: ?HeroInstance): string => (
  instance
    ? compose(
      lzString.compressToBase64,
      hashes => [...hashes].join('+'),
      map(hash),
      flattenInstance,
    )(instance)
    : ''
);
