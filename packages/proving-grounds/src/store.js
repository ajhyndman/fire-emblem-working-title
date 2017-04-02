// @flow
import { createStore } from 'redux';
import type {
  AssistSkill,
  PassiveSkill,
  SpecialSkill,
  WeaponSkill,
} from 'fire-emblem-heroes-stats';

import reducer from './reducer';


export type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';

export type Rarity = 1 | 2 | 3 | 4 | 5;

export type InstanceSkills = {
  +WEAPON: ?WeaponSkill;
  +ASSIST: ?AssistSkill;
  +SPECIAL: ?SpecialSkill;
  +PASSIVE_A: ?PassiveSkill;
  +PASSIVE_B: ?PassiveSkill;
  +PASSIVE_C: ?PassiveSkill;
};

export type HeroInstance = {
  // custom: false,
  +name: string;
  +rarity: Rarity;
  +boon: ?Stat;
  +bane: ?Stat;
  +skills: InstanceSkills;
};

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

export type State = {
  host: string;
  activeHero: ?HeroInstance;
  activeSlot: 0 | 1 | void;
  heroSlots: [?HeroInstance, ?HeroInstance];
  previewLevel: 1 | 40;
  searchString: string;
  showGuide: boolean;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  heroSlots: [undefined, undefined],
  host: '',
  previewLevel: 1,
  searchString: '',
  showGuide: false,
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;
