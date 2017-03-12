// @flow
import type { Hero } from 'fire-emblem-heroes-stats';


export type Action = {
  type: 'SELECT_HERO';
  hero: Hero;
} | {
  type: 'SELECT_SLOT';
  slot: 0 | 1 | void;
};

export type State = {
  activeHero: ?Hero;
  activeSlot: 0 | 1 | void;
  leftHero: ?Hero;
  rightHero: ?Hero;
};

export type Dispatch = (action: Action) => void;

const emptySlotAndHero = {
  activeHero: undefined,
  activeSlot: undefined,
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'SELECT_SLOT':
      return (state.activeHero == null)
        ? { ...state, activeSlot: action.slot }
        : (action.slot == null)
          ? { ...state, ...emptySlotAndHero }
          : (action.slot === 0)
            ? { ...state, ...emptySlotAndHero, leftHero: state.activeHero }
            : { ...state, ...emptySlotAndHero, rightHero: state.activeHero }
    case 'SELECT_HERO':
      return (state.activeSlot == null)
        ? { ...state, activeHero: action.hero }
        : (state.activeSlot == 0)
          ? { ...state, ...emptySlotAndHero, leftHero: action.hero }
          : { ...state, ...emptySlotAndHero, rightHero: action.hero }
    default:
      return state;
  }
};

export default reducer;
