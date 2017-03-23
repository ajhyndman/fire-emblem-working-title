// @flow
import { assocPath } from 'ramda';

import type { State } from './store';
import type { HeroInstance, Stat } from './heroHelpers';


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
            ? { ...state, ...clearActiveState, slot0: state.activeHero }
            : { ...state, ...clearActiveState, slot1: state.activeHero };
    case 'SELECT_HERO':
      return (state.activeSlot == null)
        ? { ...state, activeHero: action.hero }
        : (state.activeSlot === 0)
          ? { ...state, ...clearActiveState, slot0: action.hero }
          : { ...state, ...clearActiveState, slot1: action.hero };
    case 'SET_HOST':
      return { ...state, host: action.host };
    case 'SET_PREVIEW_LEVEL':
      return { ...state, previewLevel: action.level };
    case 'TOGGLE_AGGRESSOR':
      return {
        ...state,
        slot0: state.slot1,
        slot1: state.slot0,
      };
    case 'UPDATE_BANE':
      if (state.activeSlot == null) return state;
      // $FlowIssue: Flowtype definition for assocPath is too generic.
      return assocPath([`slot${state.activeSlot}`, 'bane'], action.stat, state);
    case 'UPDATE_BOON':
      if (state.activeSlot == null) return state;
      // $FlowIssue: Flowtype definition for assocPath is too generic.
      return assocPath([`slot${state.activeSlot}`, 'boon'], action.stat, state);
    case 'UPDATE_RARITY':
      if (state.activeSlot == null) return state;
      // $FlowIssue: Flowtype definition for assocPath is too generic.
      return assocPath([`slot${state.activeSlot}`, 'rarity'], action.rarity, state);
    default:
      return state;
  }
};

export default reducer;
