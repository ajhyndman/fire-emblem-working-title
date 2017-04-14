// @flow
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


const matchHero: (searchString: string) => (hero: Hero) => boolean =
  (searchString) => {
    const cleanedSearchString = toLower(trim(searchString));

    return compose(
      anyPass([
        compose(
          name => (name.indexOf(cleanedSearchString) !== -1),
          toLower,
          // $FlowIssue typedef for prop isn't resolving correctly
          prop('name'),
        ),
        compose(
          name => (name.indexOf(cleanedSearchString) !== -1),
          toLower,
          // $FlowIssue typedef for prop isn't resolving correctly
          prop('moveType'),
        ),
        compose(
          name => (name.indexOf(cleanedSearchString) !== -1),
          toLower,
          // $FlowIssue typedef for prop isn't resolving correctly
          prop('weaponType'),
        ),
        compose(
          compose(not, equals(-1)),
          findIndex(
            compose(
              skillName => (skillName.indexOf(cleanedSearchString) !== -1),
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
