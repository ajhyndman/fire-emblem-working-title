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

const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]))

// toLower the string and capitalize every word other than the first word.
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
