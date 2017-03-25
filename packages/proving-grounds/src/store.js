// @flow
import { createStore } from 'redux';

import reducer from './reducer';
import type { HeroInstance } from './heroHelpers';


export type State = {
  host: string;
  activeHero: ?HeroInstance;
  activeSlot: 0 | 1 | void;
  heroSlots: [?HeroInstance, ?HeroInstance];
  searchString: string;
  previewLevel: 1 | 40;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  heroSlots: [undefined, undefined],
  host: '',
  searchString: '',
  previewLevel: 1,
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;
