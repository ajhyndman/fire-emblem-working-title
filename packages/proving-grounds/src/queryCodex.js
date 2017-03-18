// @flow
import stats from 'fire-emblem-heroes-stats';
import { find, prop, propEq } from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';

export const decodeHero = (heroCode: string): ?Hero =>
  // $FlowIssue: flowtype for find is trying to account for the case where it is transducing
  find(propEq('name', decodeURIComponent(heroCode)), stats.heroes);

export const encodeHero = (hero: ?Hero): string =>
  // $FlowIssue typedef for prop isn't resolving correctly
  (hero ? encodeURIComponent(prop('name', hero)) : '');
