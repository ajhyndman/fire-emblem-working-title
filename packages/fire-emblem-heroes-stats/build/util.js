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

export const inspect = x => {
  console.log(x);
  return x;
};

const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]));

// Convert a string to lowercase, capitalize every word other than the first, and remove spaces.
export const camelCase = compose(
  join(''),
  juxt([head, compose(join(''), map(capitalize), tail)]),
  split(' '),
  toLower,
);

// Converts numeric strings to numbers
// isNaN indicates that '1' is a number, '' is a number, and '1/2/3' is not
// parseInt converts '' to null, and 1/2/3 to 1
export const maybeToNumber = txt =>
  txt == '' || isNaN(txt) ? txt : parseInt(txt, 10);
