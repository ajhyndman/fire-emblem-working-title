// @flow
import throttle from 'lodash.throttle';
import { all, any, compose, isNil, not } from 'ramda';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';

import type { State } from '.';


const isNotNil = compose(not, isNil);

const validateInstance = (instance: ?HeroInstance): boolean => {
  if (!instance) return true;
  if (typeof instance.name !== 'string') return false;
  if (typeof instance.rarity !== 'number') return false;
  if (!(typeof instance.boon === 'string' || instance.boon === undefined)) return false;
  if (!(typeof instance.bane === 'string' || instance.bane === undefined)) return false;
  if (typeof instance.mergeLevel !== 'number') return false;
  if (instance.skills === undefined || instance.state === undefined) return false;
  if (typeof instance.state.hpMissing !== 'number') return false;
  if (typeof instance.state.specialCharge !== 'number') return false;

  const skillsAllValid = all(
    (skill) => {
      if (typeof skill !== 'string') return false;
      return true;
    },
    Object.values(instance.skills),
  );
  if (!skillsAllValid) return false;

  return true;
};


export const loadState = (initialState: State) => {
  // the user is loading a share link, or navigating internally
  if (any(isNotNil, initialState.heroSlots)) return initialState;

  try {
    const serializedHeroSlots = localStorage.getItem('heroSlots');

    // this is a new user
    if (!serializedHeroSlots) return initialState;

    // this is a returning user
    const heroSlots = JSON.parse(serializedHeroSlots);
    if (!all(validateInstance, heroSlots)) return initialState;
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

export const saveState = throttle((state: State) => {
  try {
    const serializedHeroSlots = JSON.stringify(state.heroSlots);
    localStorage.setItem('heroSlots', serializedHeroSlots);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('saveState: Something went wrong while accessing localStorage!', error);
  }
}, 1000);
