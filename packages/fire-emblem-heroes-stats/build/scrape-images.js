import { compose, forEach, head, propOr, tap, values } from 'ramda';

import { fetchApiQuery, fetchImage } from './fetch';

const portraitIconQueryParams = {
  action: 'query',
  continue: '||',
  format: 'json',
  prop: 'imageinfo',
  generator: 'allimages',
  iiprop: 'url',
  gaiprefix: 'Icon Portrait',
  // THe API will not return any more than 50 thumbnails at a time.
  gailimit: '50',
};

async function scrapeImages(thumbnailSize: string, gaicontinue?: string = '') {
  fetchApiQuery({
    ...portraitIconQueryParams,
    iiurlwidth: thumbnailSize,
    gaicontinue,
  }).then(json => {
    forEach(
      compose(
        url => {
          if (url !== '') fetchImage(url);
        },
        tap(console.log.bind(console)),
        propOr('', 'thumburl'),
        head,
        propOr([], 'imageinfo'),
      ),
      values(json.query.pages),
    );

    // Recursively paginate through results until complete.
    if (json.continue != null && json.continue.gaicontinue != null) {
      scrapeImages(thumbnailSize, json.continue.gaicontinue);
    }
  });
}

scrapeImages('75');
scrapeImages('113');
scrapeImages('150');
