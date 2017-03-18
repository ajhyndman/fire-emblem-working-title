import {
  compose,
  curry,
  dissoc,
  head,
  join,
  juxt,
  map,
  prop,
  split,
  tail,
  toLower,
  toUpper,
  zipObj,
} from 'ramda';


/**
 * Utility functions
 */

export const inspect = (x) => {console.log(x); return x};

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

// Converts numeric strings to numbers
// isNaN indicates that '1' is a number, '' is a number, and '1/2/3' is not
// parseInt converts '' to null, and 1/2/3 to 1
export const maybeToNumber = (txt) => (txt == '' || isNaN(txt)) ? txt : parseInt(txt, 10);

// Converts a list of objects that have a field to a map from that field to the object.
// Assumes that the field values are all distinct.
export const objectsByField = curry(
  (field, objects)  => {
    return zipObj(
      map(prop(field), objects),
      map(dissoc(field), objects),
    );
  },
);
