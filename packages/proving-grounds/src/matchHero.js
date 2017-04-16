// @flow
import jdu from 'javascript-remove-diacritics';
import {
  any,
  compose,
  curry,
  filter,
  flatten,
  isNil,
  map,
  not,
  prop,
  props,
  split,
  toLower,
} from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';

import { getDefaultSkills } from './heroHelpers';


// A mapping from keywords to related words that someone might type.
const synonyms = {
  'beast': 'dragon',
  'cavalry': 'horse',
  'staff': 'healer',
  'tome': 'mage',
  'sing': 'dance', // Show Azura as a dancer
  'neutral': 'colorless',
  'dire': 'brave',
  'ruby': 'gem',
  'sapphire': 'gem',
  'emerald': 'gem',
  'bow': 'archer',
};

const queryMatchesKeyword = curry((cleanedSearchTerm: string, keyword: string) =>
  (keyword.indexOf(cleanedSearchTerm) !== -1)
  || (synonyms[keyword] !== undefined && synonyms[keyword].indexOf(cleanedSearchTerm) !== -1));

const getKeywords: (hero: Hero) => Array<string> =
  (hero: Hero) => compose(
    flatten,
    map(compose(split(' '), toLower)),
  )(
    flatten([
      // $FlowIssue function cannot be called on any member of intersection type.
      props(['name', 'moveType', 'weaponType'], hero),
      // $FlowIssue function cannot be called on any member of intersection type.
      compose(
        map(compose(jdu.replace, prop('name'))),
        filter(compose(not, isNil)),
        Object.values,
        getDefaultSkills,
        prop('name'),
      )(hero),
    ]),
  );

const matchHero: (searchTerm: string) => (hero: Hero) => boolean =
  (searchTerm) => compose(
    any(queryMatchesKeyword(toLower(jdu.replace(searchTerm)))),
    getKeywords,
  );

export default matchHero;
