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
  previewLevel: 1 | 40;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  host: '',
  slot0: undefined,
  slot1: undefined,
  searchString: '',
  previewLevel: 1,
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;
