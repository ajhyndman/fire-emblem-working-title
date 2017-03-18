// @flow
import type { Hero } from 'fire-emblem-heroes-stats';

import type { State } from './store'

export type Action = {
  type: 'SEARCH_STRING_CHANGE';
  value: string;
} | {
  type: 'SELECT_HERO';
  hero: ?Hero;
} | {
  type: 'SELECT_SLOT';
  slot: 0 | 1 | void;
} | {
  type: 'TOGGLE_AGGRESSOR';
};

export type Dispatch = (action: Action) => void;

const clearActiveState = {
  activeHero: undefined,
  activeSlot: undefined,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SEARCH_STRING_CHANGE':
      return { ...state, searchString: action.value };
    case 'SELECT_SLOT':
      return (state.activeHero == null)
        ? { ...state, activeSlot: action.slot }
        : (action.slot == null)
          ? { ...state, ...clearActiveState }
          : (action.slot === 0)
            ? { ...state, ...clearActiveState, leftHero: state.activeHero }
            : { ...state, ...clearActiveState, rightHero: state.activeHero }
    case 'SELECT_HERO':
      return (state.activeSlot == null)
        ? { ...state, activeHero: action.hero }
        : (state.activeSlot == 0)
          ? { ...state, ...clearActiveState, leftHero: action.hero }
          : { ...state, ...clearActiveState, rightHero: action.hero }
    case 'TOGGLE_AGGRESSOR':
      return {
        ...state,
        aggressor: state.aggressor === 'LEFT' ? 'RIGHT' : 'LEFT',
      }
    default:
      return state;
  }
};

export default reducer;
