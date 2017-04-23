// @flow
import SHA1 from 'crypto-js/sha1';
import lzString from 'lz-string';
import stats, { getEventHeroes } from 'fire-emblem-heroes-stats';
import {
  assoc,
  compose,
  concat,
  dropLastWhile,
  equals,
  flatten,
  invertObj,
  map,
  prepend,
  prop,
  range,
  repeat,
  tail,
  take,
  zipObj,
  zipWith,
} from 'ramda';
import { getDefaultInstance, getSkillInfo } from 'fire-emblem-heroes-calculator';
import type { HeroInstance, Rarity, MergeLevel } from 'fire-emblem-heroes-calculator';


/**
 * Flattening/Unflattening
 */

// Convert no-stat to 'n' to distinguish from null-skill which is hashed as 0
// The actual value doesn't matter too much because no-variant will be USE_DEFAULT.
const NO_VARIANT = 'n';
// Use 'd' when a hero has a default skill.
const USE_DEFAULT = 'd';

type SerialInstance = [
  string, // name
  'n' | 1 | 2 | 3 | 4 | 5, // bane
  'n' | 1 | 2 | 3 | 4 | 5, // boon
  Rarity, // rarity
  ?string, // assist
  ?string, // passive a
  ?string, // passive b
  ?string, // passive c
  ?string, // special
  ?string, // weapon
  ?string, // sacred seal
  MergeLevel, // mergeLevel
];

type SerialInstanceWithDefaults = [
  string, // name
  'd' | 'n' | 1 | 2 | 3 | 4 | 5, // bane
  'd' | 'n' | 1 | 2 | 3 | 4 | 5, // boon
  'd' | Rarity, // rarity
  'd' | ?string, // assist
  'd' | ?string, // passive a
  'd' | ?string, // passive b
  'd' | ?string, // passive c
  'd' | ?string, // special
  'd' | ?string, // weapon
  'd' | ?string, // sacred seal
  'd' | MergeLevel, // mergeLevel
];

const statKeyToId = { hp: 1, atk: 2, spd: 3, def: 4, res: 5 };
const idToStatKey = assoc(NO_VARIANT.toString(), undefined, invertObj(statKeyToId));

// Converts a hero instance to a list of values.
export const flattenInstance = (instance: HeroInstance): SerialInstance => [
  instance.name,
  instance.bane ? statKeyToId[instance.bane] : NO_VARIANT,
  instance.boon ? statKeyToId[instance.boon] : NO_VARIANT,
  instance.rarity,
  // I'm avoiding Ramda path() calls here, just because flow
  // does better inference this way.  :(
  instance.skills && instance.skills.ASSIST && instance.skills.ASSIST.name,
  instance.skills && instance.skills.PASSIVE_A && instance.skills.PASSIVE_A.name,
  instance.skills && instance.skills.PASSIVE_B && instance.skills.PASSIVE_B.name,
  instance.skills && instance.skills.PASSIVE_C && instance.skills.PASSIVE_C.name,
  instance.skills && instance.skills.SPECIAL && instance.skills.SPECIAL.name,
  instance.skills && instance.skills.WEAPON && instance.skills.WEAPON.name,
  instance.skills && instance.skills.SEAL && instance.skills.SEAL.name,
  instance.mergeLevel,
];

// Converts a list of values to a hero instance.
// If the input list is too short the remaining elements will be null or undefined.
export const extractInstance = ([
  name,
  bane,
  boon,
  rarity,
  assist,
  passiveA,
  passiveB,
  passiveC,
  special,
  weapon,
  seal,
  mergeLevel,
// $FlowIssue bane/boon string is incompatible with ?Stat
]: SerialInstance): HeroInstance => ({
  name,
  bane: idToStatKey[bane.toString()],
  boon: idToStatKey[boon.toString()],
  rarity,
  mergeLevel: mergeLevel || 0,
  skills: {
    // Technically, if we get bogus skill names somehow, this could
    // return a corrupt hero instance.
    WEAPON: (weapon && getSkillInfo(weapon): any),
    ASSIST: (assist && getSkillInfo(assist): any),
    SPECIAL: (special && getSkillInfo(special): any),
    PASSIVE_A: (passiveA && getSkillInfo(passiveA): any),
    PASSIVE_B: (passiveB && getSkillInfo(passiveB): any),
    PASSIVE_C: (passiveC && getSkillInfo(passiveC): any),
    SEAL: (seal && getSkillInfo(seal): any),
  },
});

// Identical to flattenInstance except that any default values will be replaced with USE_DEFAULT
// Additionally, any trailing USE_DEFAULTS will be dropped.
export function flattenAndIgnoreDefaults(instance: HeroInstance): SerialInstanceWithDefaults {
  const flatDefault = flattenInstance(getDefaultInstance(instance.name));
  const flatInstance = flattenInstance(instance);
  return dropLastWhile(equals('d'),
    prepend(instance.name, tail(
      // $FlowIssue Function cannot be called on member of intersection type
      zipWith(
        (defaultV, actualV) => (actualV === defaultV ? USE_DEFAULT : actualV),
        flatDefault,
        flatInstance,
      ),
    )),
  );
}

// Identical to extractInstance except that USE_DEFAULT will be replaced with the default value
// Additionally, if the input is too short it will be extended with USE_DEFAULTS.
export function extractWithDefaults(flattenedInstance: SerialInstanceWithDefaults): ?HeroInstance {
  if (flattenedInstance === undefined || flattenedInstance[0] === undefined) {
    return undefined;
  }
  const flatDefault = flattenInstance(getDefaultInstance(flattenedInstance[0]));
  // $FlowIssue ... tuple type ... is incompatible with ... array type
  const flatInstanceWithDefaults = zipWith(
    (defaultV, actualV) => (actualV === USE_DEFAULT ? defaultV : actualV),
    flatDefault,
    concat(flattenedInstance, repeat('d', flatDefault.length - flattenedInstance.length)),
  );
  return extractInstance(flatInstanceWithDefaults);
}

/**
 * Hashing
 */

export const hash = (value: any): string => (
  value === undefined
    ? '0'
    : (typeof value === 'number' || (typeof value === 'string' && value.length < 4))
      ? value
      // 36^4 possible values and 500 items hashed => 5% chance of some collision existing.
      : take(4, SHA1(value).toString())
);

const values = flatten([
  [USE_DEFAULT, NO_VARIANT],
  range(1, 99), // Rarity, Bane/Boon ids, and USE_DEFAULT are 1-7
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), stats.skills),
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), concat(stats.heroes, getEventHeroes(true))),
]);

// A map from hash(x) to x
// $FlowIssue: flowtypes for ramda aren't precise
export const hashTable = zipObj(map(hash, values), values);

/**
 * These do everything above.
 */

export const decodeHero = (heroCode: string): ?HeroInstance => (
  heroCode
    ? compose(
      extractWithDefaults,
      map(hashedValue => hashTable[hashedValue]),
      string => (string || '').split('+'),
      lzString.decompressFromEncodedURIComponent,
    )(heroCode)
    : undefined
);

export const encodeHero = (instance: ?HeroInstance): string => (
  instance
    ? compose(
      lzString.compressToEncodedURIComponent,
      hashes => [...hashes].join('+'),
      map(hash),
      flattenAndIgnoreDefaults,
    )(instance)
    : ''
);
