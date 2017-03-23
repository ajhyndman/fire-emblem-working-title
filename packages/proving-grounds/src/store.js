// @flow
import { createStore } from 'redux';

import reducer from './reducer';
import type { HeroInstance } from './heroHelpers';

export type State = {
  host: string;
  activeHero: ?HeroInstance;
  activeSlot: 0 | 1 | void;
  slot0: ?HeroInstance;
  slot1: ?HeroInstance;
  searchString: string;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  host: '',
  slot0: undefined,
  slot1: undefined,
  searchString: '',
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;
