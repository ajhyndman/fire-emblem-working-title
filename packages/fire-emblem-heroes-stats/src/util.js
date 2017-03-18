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

// converts numeric strings to numbers
export const maybeToNumber = (txt) => isNaN(parseInt(txt, 10)) ? txt : parseInt(txt, 10);

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
