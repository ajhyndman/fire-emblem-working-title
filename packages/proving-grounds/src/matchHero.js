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
  none,
  not,
  prop,
  props,
  split,
  toLower,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type { Hero } from 'fire-emblem-heroes-stats';

import { getDefaultSkills } from './heroHelpers';


// A mapping from keywords to related words that someone might type.
const synonyms = {
  'armored': 'armor', // Goad armor => armor is a keyword.
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

// Ignore skills that match move/weapon types. (Armored Blow and Dragon Gaze)
const wordsToIgnoreInSkills = new Set(['Dragon', 'Armored']);

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
        filter(compose(
          none((word) => wordsToIgnoreInSkills.has(word)),
          split(' '),
        )),
        map(compose(jdu.replace, prop('name'))),
        filter(compose(not, isNil)),
        Object.values,
        getDefaultSkills,
        prop('name'),
      )(hero),
    ]),
  );

// $FlowIssue $Iterable. This type is incompatible with array type
const allKeywords = new Set(flatten(map(getKeywords, stats.heroes)));

const isKeyword = (word: string) =>
  allKeywords.has(word) || synonyms[word] !== undefined;

const keywordContainsQuery = curry((cleanedSearchTerm: string, keyword: string) =>
  (keyword.indexOf(cleanedSearchTerm) !== -1)
  || (synonyms[keyword] !== undefined && synonyms[keyword].indexOf(cleanedSearchTerm) !== -1));

const keywordMatchesQuery = curry((cleanedSearchTerm: string, keyword: string) =>
  (keyword === cleanedSearchTerm)
  || (synonyms[keyword] === cleanedSearchTerm));

const matchHero: (searchTerm: string) => (hero: Hero) => boolean =
  (searchTerm) => compose(
    any(
      isKeyword(searchTerm)
        ? keywordMatchesQuery(searchTerm)
        : keywordContainsQuery(searchTerm)),
    getKeywords,
  );

export default matchHero;
