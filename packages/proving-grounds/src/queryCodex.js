// @flow
import stats from 'fire-emblem-heroes-stats';
import { findIndex, prop, propEq } from 'ramda';

import { getDefaultSkills } from './heroHelpers';
import type { HeroInstance } from './store';


export const decodeHero = (heroCode: string): ?HeroInstance => {
  const name = decodeURIComponent(heroCode);

  // $FlowIssue: I'm confident this works.
  return (findIndex(propEq('name', name), stats.heroes) !== -1
    ? {
      name: decodeURIComponent(heroCode),
      bane: undefined,
      boon: undefined,
      rarity: 5,
      skills: getDefaultSkills(decodeURIComponent(heroCode), 5),
    }
    : undefined);
};

export const encodeHero = (hero: ?HeroInstance): string =>
  // $FlowIssue typedef for prop isn't resolving correctly
  (hero ? encodeURIComponent(prop('name', hero)) : '');
