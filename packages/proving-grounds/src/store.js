// @flow
import { createStore } from 'redux';
import type { Hero } from 'fire-emblem-heroes-stats';

import reducer from './reducer';

export type State = {
  activeHero: ?Hero;
  activeSlot: 0 | 1 | void;
  heroSlots: Array<?Hero>;
  searchString: string;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  heroSlots: [undefined, undefined],
  searchString: '',
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;
