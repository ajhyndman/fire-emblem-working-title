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
  activeSlot: 0 | 1 | void;
  leftHero: ?Hero;
  rightHero: ?Hero;
};

export type Dispatch = (action: Action) => void;

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'SELECT_SLOT':
      return { ...state, activeSlot: action.slot };
    case 'SELECT_HERO':
      switch (state.activeSlot) {
        case 0:
          return { ...state, activeSlot: undefined, leftHero: action.hero };
        case 1:
          return { ...state, activeSlot: undefined, rightHero: action.hero };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default reducer;
