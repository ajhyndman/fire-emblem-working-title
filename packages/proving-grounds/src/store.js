// @flow
import { createStore } from 'redux';

import reducer from './reducer';
import type { HeroInstance } from './heroInstance';


export type State = {
  host: string;
  activeHero: ?HeroInstance;
  activeSlot: 0 | 1 | void;
  heroSlots: [?HeroInstance, ?HeroInstance];
  notifications: Array<string>;
  previewLevel: 1 | 40;
  searchString: string;
  showGuide: boolean;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  heroSlots: [undefined, undefined],
  host: '',
  notifications: [],
  previewLevel: 40,
  searchString: '',
  showGuide: false,
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;
