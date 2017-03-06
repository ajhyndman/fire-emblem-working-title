import {
  compose,
  head,
  join,
  juxt,
  map,
  split,
  tail,
  toLower,
  toUpper,
} from 'ramda';


/**
 * Utility functions
 */

const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]))

// Convert a string to lowercase, capitalize every word other than the first, and remove spaces.
export const camelCase = compose(
  join(''),
  juxt([
    head,
    compose(
      join(''),
      map(capitalize),
      tail)]),
  split(' '), 
  toLower,
);
