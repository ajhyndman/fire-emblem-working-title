import { JSDOM } from 'jsdom';
import { test } from 'ramda';

import { WIKI_HOST } from './constants';
import { fetchPage, fetchImage } from './fetch';


async function scrapeImages() {
  fetchPage(`${WIKI_HOST}/Hero_List`)
    .then(html => {
      const { window: { document } } = new JSDOM(html);

      [...document.querySelectorAll('[alt~="Portrait"]')].forEach(img => {
        const src = img.getAttribute('src');
        const srcSet = img.getAttribute('srcSet');

        fetchImage(src);
        srcSet.split(' ').filter(test(/http/)).forEach(url => {
          fetchImage(url);
        })
      });
    })
}

scrapeImages();
