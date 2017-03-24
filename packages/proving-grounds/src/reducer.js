// @flow
import type { Hero } from 'fire-emblem-heroes-stats';
import { any, findIndex, isNil, reverse, update } from 'ramda';

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

const hasEmptySlot = (state: State) => any(isNil, state.heroSlots);
const getEmptySlot = (state: State) => findIndex(isNil, state.heroSlots);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SEARCH_STRING_CHANGE':
      return { ...state, searchString: action.value };
    case 'SELECT_SLOT':
      if (state.activeHero == null) {
        // Selected a slot.
        return { ...state, activeSlot: action.slot }
      } else if (action.slot == null){
        // Deselected a slot.
        return { ...state, ...clearActiveState }
      } else {
        // Move selected hero to the slot
        return {
          ...state,
          ...clearActiveState,
          heroSlots: update(
            action.slot,
            state.activeHero,
            state.heroSlots),
        };
      }
    case 'SELECT_HERO':
      if (state.activeSlot == null) {
        // Move hero to first empty slot or select hero.
        return hasEmptySlot(state)
          ? {
            ...state,
            ...clearActiveState,
            heroSlots: update(
              getEmptySlot(state),
              action.hero,
              state.heroSlots),
          }
          : { ...state, activeHero: action.hero }
      } else {
        // Move hero to selected slot.
        return {
          ...state,
          ...clearActiveState,
          heroSlots: update(
            state.activeSlot,
            action.hero,
            state.heroSlots),
        };
      }
    case 'TOGGLE_AGGRESSOR':
      return {
        ...state,
        heroSlots: reverse(state.heroSlots),
      }
    default:
      return state;
  }
};

export default reducer;
