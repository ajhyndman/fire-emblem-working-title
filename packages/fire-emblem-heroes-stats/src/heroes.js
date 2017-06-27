import {
  concat,
  filter,
  indexBy,
  prop,
  propOr,
} from 'ramda';

// eslint-disable-next-line import/no-unresolved
import stats from '../stats.json';
import { getEventHeroes } from './temporal/events';
import type { Hero } from '.';

type HeroesByName = { [key: string]: Hero };


export const getAllHeroes = () => concat(stats.heroes, getEventHeroes(true));

// $FlowIssue indexBy confuses flow
const heroesByName: HeroesByName = indexBy(prop('name'), getAllHeroes());

/**
 * Look up a hero's base stats by name.
 *
 * @param {string} name The name of the hero to look up.
 * @returns {Hero} A raw hero object, from fire-emblem-heroes-stats.
 */
export const getHero = (name: string): Hero => {
  const hero: ?Hero = heroesByName[name];
  return hero || heroesByName['Anna'];
};

export const getReleasedHeroes = () => filter(
  // Only consider a hero released if they have a release date and have level 1 stats.
  (hero) => (propOr('N/A', 'releaseDate', hero) !== 'N/A') && (hero.stats[1][5] !== undefined),
  stats.heroes,
);

