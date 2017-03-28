// @flow
import { any, assocPath, findIndex, isNil, reverse, update } from 'ramda';
import type { Skill, SkillType } from 'fire-emblem-heroes-stats';

import type { HeroInstance, Stat, State } from './store';


export type Action = {
  type: 'SEARCH_STRING_CHANGE';
  value: string;
} | {
  type: 'SELECT_HERO';
  hero: ?HeroInstance;
} | {
  type: 'SELECT_SLOT';
  slot: 0 | 1 | void;
} | {
  type: 'SET_HOST';
  host: string;
} | {
  type: 'SET_PREVIEW_LEVEL';
  level: 1 | 40;
} | {
  type: 'TOGGLE_AGGRESSOR';
} | {
  type: 'UPDATE_BANE';
  stat: Stat;
} | {
  type: 'UPDATE_BOON';
  stat: Stat;
} | {
  type: 'UPDATE_RARITY';
  rarity: 1 | 2 | 3 | 4 | 5;
} | {
  type: 'UPDATE_SKILL';
  skill: Skill;
  skillType: SkillType;
};

export type Dispatch = (action: Action) => void;

const clearActiveState = {
  activeHero: undefined,
  activeSlot: undefined,
};

const hasEmptySlot = (state: State) => any(isNil, state.heroSlots);
const getEmptySlot = (state: State) => findIndex(isNil, state.heroSlots);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SEARCH_STRING_CHANGE':
      return { ...state, searchString: action.value };
    case 'SELECT_SLOT':
      return (state.activeHero == null)
        ? { ...state, activeSlot: action.slot }
        : (action.slot == null)
          ? { ...state, ...clearActiveState }
          : {
            ...state,
            ...clearActiveState,
            heroSlots: update(action.slot, state.activeHero, state.heroSlots),
          };
    case 'SELECT_HERO':
      return (state.activeSlot == null)
        // Move hero to first empty slot or select hero.
        ? hasEmptySlot(state)
          ? {
            ...state,
            ...clearActiveState,
            heroSlots: update(getEmptySlot(state), action.hero, state.heroSlots),
          }
          : { ...state, activeHero: action.hero }
        // Move hero to selected slot.
        : {
          ...state,
          ...clearActiveState,
          heroSlots: update(state.activeSlot, action.hero, state.heroSlots),
        };
    case 'SET_HOST':
      return { ...state, host: action.host };
    case 'SET_PREVIEW_LEVEL':
      return { ...state, previewLevel: action.level };
    case 'TOGGLE_AGGRESSOR':
      return {
        ...state,
        heroSlots: reverse(state.heroSlots),
      };
    case 'UPDATE_BANE':
      if (state.activeSlot == null) return state;
      // $FlowFixMe: We are still not handling the case where slot is selected but hero is not set.
      return assocPath(['heroSlots', state.activeSlot, 'bane'], action.stat, state);
    case 'UPDATE_BOON':
      if (state.activeSlot == null) return state;
      // $FlowFixMe: We are still not handling the case where slot is selected but hero is not set.
      return assocPath(['heroSlots', state.activeSlot, 'boon'], action.stat, state);
    case 'UPDATE_RARITY':
      if (state.activeSlot == null) return state;
      // $FlowFixMe: We are still not handling the case where slot is selected but hero is not set.
      return assocPath(['heroSlots', state.activeSlot, 'rarity'], action.rarity, state);
    case 'UPDATE_SKILL':
      if (state.activeSlot == null) return state;
      // $FlowFixMe: We are still not handling the case where slot is selected but hero is not set.
      return assocPath(
        ['heroSlots', state.activeSlot, 'skills', action.skillType],
        action.skill,
        state,
      );
    default:
      return state;
  }
};

export default reducer;
