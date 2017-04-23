'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultInstance = undefined;

var _heroHelpers = require('./heroHelpers');

// NOT USED YET: Just conjecture for potential future support of
// user custom unit creation.

// export type CustomHero = {
//   custom: true,
//   weaponType: WeaponType,
//   moveType: MoveType,
//   name: string;
//   hp: number;
//   atk: number;
//   spd: number;
//   def: number;
//   res: number;
//   weapon: WeaponSkill;
//   assist: AssistSkill;
//   special: SpecialSkill;
//   passiveA: PassiveSkill;
//   passiveB: PassiveSkill;
//   passiveC: PassiveSkill;
// };

var getDefaultInstance = exports.getDefaultInstance = function getDefaultInstance(name) {
  var rarity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  return {
    name: name,
    bane: undefined,
    boon: undefined,
    rarity: rarity,
    mergeLevel: 0,
    skills: (0, _heroHelpers.getDefaultSkills)(name, rarity)
  };
};