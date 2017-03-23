// @flow
import type { State } from './store';
import type { HeroInstance } from './heroHelpers';


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
} | {
  type: 'TOGGLE_AGGRESSOR';
} | {
  type: 'UPDATE_RARITY';
} | {
  type: 'UPDATE_BANE';
} | {
  type: 'UPDATE_BOON';
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
    case 'TOGGLE_AGGRESSOR':
      return {
        ...state,
        slot0: state.slot1,
        slot1: state.slot0,
      };
    default:
      return state;
  }
};

export default reducer;
