// @flow
import diacritics from 'diacritics';
import {
  any,
  compose,
  curry,
  filter,
  flatten,
  isNil,
  map,
  mapObjIndexed,
  none,
  not,
  prop,
  props,
  split,
  toLower,
} from 'ramda';
import { getAllHeroes, getSkillObject } from 'fire-emblem-heroes-stats';
import { getDefaultSkills } from 'fire-emblem-heroes-calculator';
import type { Hero } from 'fire-emblem-heroes-stats';

// A mapping from keywords to related words that someone might type.
const synonyms = {
  armored: 'armor', // Goad armor => armor is a keyword.
  breath: 'dragon',
  cavalry: 'horse',
  staff: 'healer',
  tome: 'mage',
  sing: 'dance', // Show Azura as a dancer
  neutral: 'colorless',
  dire: 'brave',
  ruby: 'gem',
  sapphire: 'gem',
  emerald: 'gem',
  bow: 'archer',
};

// Ignore skills that match move/weapon types. (Armored Blow and Dragon Gaze)
const wordsToIgnoreInSkills = new Set(['Dragon', 'Armored']);

const getKeywords: (hero: Hero) => Array<string> = (hero: Hero) =>
  compose(flatten, map(compose(split(' '), toLower)))(
    flatten([
      props(['name', 'moveType', 'weaponType'], hero),
      compose(
        filter(
          compose(none(word => wordsToIgnoreInSkills.has(word)), split(' ')),
        ),
        map(compose(diacritics.remove, prop('name'))),
        filter(compose(not, isNil)),
        Object.values,
        mapObjIndexed((skillName, skillType) =>
          getSkillObject(skillType, skillName),
        ),
        getDefaultSkills,
        prop('name'),
      )(hero),
    ]),
  );

const allKeywords = new Set(flatten(map(getKeywords, getAllHeroes())));

const isKeyword = (word: string) =>
  allKeywords.has(word) || synonyms[word] !== undefined;

const keywordContainsQuery = curry(
  (cleanedSearchTerm: string, keyword: string) =>
    keyword.indexOf(cleanedSearchTerm) !== -1 ||
    (synonyms[keyword] !== undefined &&
      synonyms[keyword].indexOf(cleanedSearchTerm) !== -1),
);

const keywordMatchesQuery = curry(
  (cleanedSearchTerm: string, keyword: string) =>
    keyword === cleanedSearchTerm || synonyms[keyword] === cleanedSearchTerm,
);

const matchHero: (searchTerm: string) => (hero: Hero) => boolean = searchTerm =>
  compose(
    any(
      isKeyword(searchTerm)
        ? keywordMatchesQuery(searchTerm)
        : keywordContainsQuery(searchTerm),
    ),
    getKeywords,
  );

export default matchHero;
