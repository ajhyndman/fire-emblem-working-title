// @flow
import { any, compose, isNil, not } from 'ramda';

import type { State } from './store';


const isNotNil = compose(not, isNil);

export const loadState = (initialState: State) => {
  // the user is loading a share link, or navigating internally
  if (any(isNotNil, initialState.heroSlots)) return initialState;

  try {
    const serializedHeroSlots = localStorage.getItem('heroSlots');

    // this is a new user
    if (!serializedHeroSlots) return initialState;

    // this is a returning user
    const heroSlots = JSON.parse(serializedHeroSlots);
    return {
      ...initialState,
      heroSlots,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('loadState: Something went wrong while accessing localStorage!', error);
    return initialState;
  }
};

export const saveState = (state: State) => {
  try {
    const serializedHeroSlots = JSON.stringify(state.heroSlots);
    localStorage.setItem('heroSlots', serializedHeroSlots);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('saveState: Something went wrong while accessing localStorage!', error);
  }
};
