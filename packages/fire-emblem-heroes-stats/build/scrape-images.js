import { JSDOM } from 'jsdom';
import { test } from 'ramda';

import { WIKI_HOST } from './constants';
import { fetchPage, fetchImage } from './fetch';

// fetchImage('https://hydra-media.cursecdn.com/feheroes.gamepedia.com/thumb/e/eb/Icon_Portrait_Elise_%28Nohrian_Summer%29.png/75px-Icon_Portrait_Elise_%28Nohrian_Summer%29.png?version=ba429df0c60a833b6620e2bea2714f75');

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
