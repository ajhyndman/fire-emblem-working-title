import fetch from 'isomorphic-fetch';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import {
  compose,
  last,
  map,
  prop,
  replace,
  split,
  zipObj,
} from 'ramda';


/**
 * Raw data fetchers
 */

export const fetchPage = (url) =>
  fetch(url)
    .then(response => {
      if (!response.ok) return Promise.reject({ type: '404' });
      return response.text();
    })
    .then(replace(/\n|\r/g, ''))
    .catch(() => console.error('failed to fetch: ', url),
  );

// Takes a url prefix, a list of page names, and a parse function.
// Returns a map from page name to parsed page.
export async function fetchAndParsePages(host, pageNames, parseFunction) {
  return zipObj(
    pageNames,
    await Promise.all(
      map(compose(
        promise => {
          return promise.then(parseFunction)
            .catch(err => {
              console.error(parseFunction.name + ': ', err);
              return [];
            })
        },
        fetchPage,
        (pageName) => `${host}/${encodeURIComponent(pageName)}`,
      ))(pageNames),
    ).catch(err => console.error('fetchAndParsePages:', err)),
  );
}

/**
 * Download an image and save it into assets, with the same name.
 */
export const fetchImage = (url) =>
  fetch(url)
    .then(response => {
      if (!response.ok) return Promise.reject({ type: '404' });

      // extract a filename with a consistent naming scheme from our url
      const fileName = compose(
        replace(/_/g, (match, offset) => (offset < 20 ? match : ' ')),
        decodeURIComponent,
        last,
        split('/'),
        prop('pathname'),
        url => new URL(url),
      )(url);

      const file = fs.createWriteStream(path.join(__dirname, `../assets/${fileName}`));
      response.body.pipe(file);
    })
