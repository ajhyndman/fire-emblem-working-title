// @flow
import SHA1 from 'crypto-js/sha1';
import lzString from 'lz-string';
import { getAllHeroes, getAllSkills } from 'fire-emblem-heroes-stats';
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
import { getDefaultInstance } from 'fire-emblem-heroes-calculator';
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
  string | void, // assist
  string | void, // passive a
  string | void, // passive b
  string | void, // passive c
  string | void, // special
  string | void, // weapon
  string | void, // sacred seal
  MergeLevel, // mergeLevel
  number, // hpMissing
  number, // specialCharge
];

type SerialInstanceWithDefaults = [
  string, // name
  'd' | 'n' | 1 | 2 | 3 | 4 | 5, // bane
  'd' | 'n' | 1 | 2 | 3 | 4 | 5, // boon
  'd' | Rarity, // rarity
  'd' | string | void, // assist
  'd' | string | void, // passive a
  'd' | string | void, // passive b
  'd' | string | void, // passive c
  'd' | string | void, // special
  'd' | string | void, // weapon
  'd' | string | void, // sacred seal
  'd' | MergeLevel, // mergeLevel
  'd' | number, // hpMissing
  'd' | number, // specialCharge
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
  instance.skills.ASSIST,
  instance.skills.PASSIVE_A,
  instance.skills.PASSIVE_B,
  instance.skills.PASSIVE_C,
  instance.skills.SPECIAL,
  instance.skills.WEAPON,
  instance.skills.SEAL,
  instance.mergeLevel,
  instance.state.hpMissing,
  instance.state.specialCharge,
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
  hpMissing,
  specialCharge,
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
    WEAPON: weapon,
    ASSIST: assist,
    SPECIAL: special,
    PASSIVE_A: passiveA,
    PASSIVE_B: passiveB,
    PASSIVE_C: passiveC,
    SEAL: seal,
  },
  state: {
    ...getDefaultInstance(name).state,
    hpMissing,
    specialCharge,
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
      : take(5, SHA1(value).toString())
);

const values = flatten([
  [USE_DEFAULT, NO_VARIANT],
  // Allow all 1-3 digit numbers. undefined hashes to 0 and names might hash to 4 digit numbers.
  range(1, 999),
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), getAllSkills()),
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), getAllHeroes()),
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
