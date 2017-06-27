import fetch from 'isomorphic-fetch';
import {
  compose,
  map,
  replace,
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
