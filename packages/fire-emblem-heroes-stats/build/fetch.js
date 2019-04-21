import fetch from 'isomorphic-fetch';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import {
  compose,
  concat,
  last,
  map,
  merge,
  prop,
  replace,
  split,
  toPairs,
  values,
} from 'ramda';

import { WIKI_HOST } from './constants';

const API_BATCH_SIZE = 500;

/**
 * Download an image and save it into assets, with the same name.
 */
export const fetchImage = url => {
  // extract a filename with a consistent naming scheme from our url
  const fileName = compose(
    replace(/_/g, (match, offset) => (offset < 20 ? match : ' ')),
    decodeURIComponent,
    last,
    split('/'),
    prop('pathname'),
    url => new URL(url),
  )(url);

  const filePath = path.join(__dirname, `../assets/${fileName}`);

  if (!fs.existsSync(filePath)) {
    fetch(url).then(response => {
      if (!response.ok) return Promise.reject({ type: '404' });

      const file = fs.createWriteStream(filePath);
      response.body.pipe(file);
    });
  }
};

/**
 * Use the semantic media wiki Ask API to submit an Ask Query string.
 *
 * @see {@link https://feheroes.gamepedia.com/Special:ApiSandbox}
 *
 * @param {*} queryString The Ask API Query string format.
 */
export const fetchAskApiQuery = queryString => {
  return fetch(
    `${WIKI_HOST}/api.php?action=ask&format=json&query=${encodeURIComponent(
      queryString,
    )}`,
  ).then(response => response.json());
};

/**
 * Make a request to the mediawiki API with arbitrary query parameters.
 *
 * @see {@link https://feheroes.gamepedia.com/Special:ApiSandbox}
 *
 * @param {*} queryParams An object containing query params as key-value pairs
 */
export const fetchApiQuery = (queryParams: { [param: string]: string }) => {
  const defaultQueryParams = {
    action: 'query',
    format: 'json',
  };

  const queryParamString = map(
    ([param, value]) => `${param}=${value}`,
    toPairs({ ...defaultQueryParams, ...queryParams }),
  ).join('&');

  return fetch(`${WIKI_HOST}/api.php?${queryParamString}`).then(response =>
    response.json(),
  );
};

export const fetchApiRows = (
  queryParams: { [param: string]: string },
  offset: number = 0,
) =>
  fetchApiQuery(
    merge(queryParams, { offset: offset, limit: API_BATCH_SIZE }),
  ).then(json => {
    const cargoRows = compose(
      map(prop('title')),
      values,
      prop('cargoquery'),
    )(json);

    if (cargoRows.length == API_BATCH_SIZE) {
      return fetchApiRows(queryParams, offset + API_BATCH_SIZE).then(
        nextCargoRows => concat(cargoRows, nextCargoRows),
      );
    } else {
      return cargoRows;
    }
  });
