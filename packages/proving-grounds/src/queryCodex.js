// @flow
import SHA1 from 'crypto-js/sha1';
import lzString from 'lz-string';
import stats from 'fire-emblem-heroes-stats';
import { assoc, compose, flatten, invertObj, map, prop, range, take, zipObj } from 'ramda';

import { getSkillInfo } from './skillHelpers';
import type { HeroInstance, Rarity, Stat } from './store';


/**
 * Flattening/Unflattening
 */

const statKeyToId = {'hp':1, 'atk':2, 'spd':3, 'def':4, 'res':5}
const idToStatKey = assoc(0, null, invertObj(statKeyToId));

export const flattenInstance = (instance: HeroInstance): Array<number> => map(
  (name) => stats.ids.idsByName[name] || null,
  [
    instance.name,
    instance.skills && instance.skills.ASSIST && instance.skills.ASSIST.name,
    instance.skills && instance.skills.PASSIVE_A && instance.skills.PASSIVE_A.name,
    instance.skills && instance.skills.PASSIVE_B && instance.skills.PASSIVE_B.name,
    instance.skills && instance.skills.PASSIVE_C && instance.skills.PASSIVE_C.name,
    instance.skills && instance.skills.SPECIAL && instance.skills.SPECIAL.name,
    instance.skills && instance.skills.WEAPON && instance.skills.WEAPON.name,
  ],
).concat(
  // Bane, Boon, and Rarity are all 0-5.
  [
    parseInt(instance.rarity)
      + ((statKeyToId[instance.bane] || 0) * 6)
      + ((statKeyToId[instance.boon] || 0) * 36)
  ],
);

export const extractInstance = ([
  nameId,
  assistId,
  passiveAId,
  passiveBId,
  passiveCId,
  specialId,
  weaponId,
  baneBoonRarity
]: Array<number>): HeroInstance => ({
  bane: idToStatKey[Math.floor(baneBoonRarity/6)%6],
  boon: idToStatKey[Math.floor(baneBoonRarity/36)],
  name: stats.ids.namesByTypeAndId['HERO'][nameId],
  rarity: baneBoonRarity%6,
  skills: map(
    (skill) => (skill && getSkillInfo(skill)) || null: any,
    {
      WEAPON: stats.ids.namesByTypeAndId['WEAPON'][weaponId],
      ASSIST: stats.ids.namesByTypeAndId['ASSIST'][assistId],
      SPECIAL: stats.ids.namesByTypeAndId['SPECIAL'][specialId],
      PASSIVE_A: stats.ids.namesByTypeAndId['PASSIVE_A'][passiveAId],
      PASSIVE_B: stats.ids.namesByTypeAndId['PASSIVE_B'][passiveBId],
      PASSIVE_C: stats.ids.namesByTypeAndId['PASSIVE_C'][passiveCId],
    },
  ),
});

/**
 * Use the above helpers to convert a hero instance to and from a base64 string.
 */

export function decodeHero(b64EncodedHero: string): ?HeroInstance {
  if (b64EncodedHero.length !== 12) {
    return null;
  }
  try {
    const charlist = new Buffer(b64EncodedHero, 'base64').toString().split("");
    return extractInstance(charlist.map(function(c) {return c.charCodeAt(0); }));
  } catch(e) {
    return null;
  }
}

export function encodeHero(instance: ?HeroInstance): string {
  if (instance == null) {
    return '';
  }
  const u8 = new Uint8Array(flattenInstance(instance));
  // Converts numbers to characters and character list to a base64 string
  return new Buffer(String.fromCharCode.apply(null, u8), 'binary').toString('base64');
}
