// @flow
import { applyMiddleware, createStore } from 'redux';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';

import reducer from '../reducer';
import gaMiddleware from './gaMiddleware';
import { loadState, saveState } from './localStorage';


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
  // if we are on the server, init the store
  if (typeof window === 'undefined') {
    return createStore(reducer, initialState);
  }

  // if we are on the client, hook into localStorage and apply gaMiddleware
  const store = createStore(reducer, loadState(initialState), applyMiddleware(gaMiddleware));
  store.subscribe(() => {
    saveState(store.getState());
  });
  return store;
};

export default initStore;
