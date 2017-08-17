// @flow
import { applyMiddleware, createStore } from 'redux';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';
import type { SkillType } from 'fire-emblem-heroes-stats';

import reducer from '../reducer';
import gaMiddleware from './gaMiddleware';
import { loadState, saveState } from './localStorage';

export type State = {
  activeHero: ?HeroInstance,
  activeSkill: ?SkillType,
  activeSlot: 0 | 1 | void,
  exportString: string,
  heroSlots: [?HeroInstance, ?HeroInstance],
  host: string,
  notifications: Array<string>,
  previewLevel: 1 | 40,
  searchString: string,
  showGuide: boolean,
};

const emptyState: State = {
  activeHero: undefined,
  activeSkill: undefined,
  activeSlot: undefined,
  exportString: '',
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
  const store = createStore(
    reducer,
    loadState(initialState),
    applyMiddleware(gaMiddleware),
  );
  store.subscribe(() => {
    saveState(store.getState());
  });
  return store;
};

export default initStore;
