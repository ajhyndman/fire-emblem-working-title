// @flow
import { applyMiddleware, createStore } from 'redux';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';
import type { SkillType } from 'fire-emblem-heroes-stats';

import reducer from '../reducer';
import gaMiddleware from './gaMiddleware';
import { loadState, saveState } from './localStorage';

export type Tab = 'ALL_HEROES' | 'MY_SHELF';

export type State = {
  activeHero: HeroInstance | void,
  activeShelfSlot: number | void,
  activeSkill: SkillType | void,
  activeSlot: 0 | 1 | void,
  activeTab: Tab,
  exportString: string,
  heroShelf: Array<HeroInstance>,
  // Hero slot values may be null (this is to support serialization to JSON)
  heroSlots: [?HeroInstance, ?HeroInstance],
  host: string,
  notifications: Array<string>,
  previewLevel: 1 | 40,
  searchString: string,
  showGuide: boolean,
};

const emptyState: State = {
  activeHero: undefined,
  activeShelfSlot: undefined,
  activeSkill: undefined,
  activeSlot: undefined,
  activeTab: 'MY_SHELF',
  exportString: '',
  heroShelf: [],
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
