// @flow
import jdu from 'javascript-remove-diacritics';
import {
  anyPass,
  compose,
  equals,
  filter,
  findIndex,
  isNil,
  not,
  prop,
  toLower,
  trim,
} from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';

import { getDefaultSkills } from './heroHelpers';


const matchHero: (searchTerm: string) => (hero: Hero) => boolean =
  (searchTerm) => {
    const cleanedSearchTerm = toLower(jdu.replace(searchTerm));

    return compose(
      anyPass([
        compose(
          name => (name.indexOf(cleanedSearchTerm) !== -1),
          toLower,
          // $FlowIssue typedef for prop isn't resolving correctly
          prop('name'),
        ),
        compose(
          name => (name.indexOf(cleanedSearchTerm) !== -1),
          toLower,
          // $FlowIssue typedef for prop isn't resolving correctly
          prop('moveType'),
        ),
        compose(
          name => (name.indexOf(cleanedSearchTerm) !== -1),
          toLower,
          // $FlowIssue typedef for prop isn't resolving correctly
          prop('weaponType'),
        ),
        compose(
          compose(not, equals(-1)),
          findIndex(
            compose(
              skillName => (skillName.indexOf(cleanedSearchTerm) !== -1),
              jdu.replace,
              toLower,
              // $FlowIssue typedef for prop isn't resolving correctly
              prop('name'),
            ),
          ),
          filter(compose(not, isNil)),
          Object.values,
          getDefaultSkills,
          prop('name'),
        ),
      ]),
    );
  };

export default matchHero;
