/* eslint-disable no-console */
import fs from 'fs';
import fetch from 'isomorphic-fetch';
import {
  compose,
  dissoc,
  filter,
  flatten,
  isNil,
  map,
  match,
  merge,
  mergeAll,
  mergeWith,
  not,
  replace,
  tail,
  toLower,
  trim,
  zipObj,
} from 'ramda';


/**
 * HTML parsers
 */

const parseHeroRowHtml = (heroRow) => {
  const [
    colTitle,
    colMoveType,
    colWeaponType,
    colHp,
    colAtk,
    colSpd,
    colDef,
    colRes,
  ] = heroRow.match(/<td>((.|\n)*?)<\/td>/g);

  const [, name] = /<a.*?>([^<]*?)</.exec(colTitle);
  const [, moveType] = /alt="Icon Move (.*?)\.png"/.exec(colMoveType);
  const [, weaponType] = /alt="Icon Class (.*?)\.png"/.exec(colWeaponType);
  const hp = parseInt(/<td>(\d*?)\n<\/td>/.exec(colHp)[1], 10);
  const atk = parseInt(/<td>(\d*?)\n<\/td>/.exec(colAtk)[1], 10);
  const spd = parseInt(/<td>(\d*?)\n<\/td>/.exec(colSpd)[1], 10);
  const def = parseInt(/<td>(\d*?)\n<\/td>/.exec(colDef)[1], 10);
  const res = parseInt(/<td>(\d*?)\n<\/td>/.exec(colRes)[1], 10);
  const total = hp + atk + spd + def + res;

  return {
    [name]: {
      moveType,
      weaponType,
      hp,
      atk,
      spd,
      def,
      res,
      total,
    },
  };
};

const parseHeroAggregateHtml = (heroAggregateHtml) => {
  const heroRows = match(/<tr>((.|\n)*?)<\/tr>/g, heroAggregateHtml);
  return mergeAll(tail(heroRows).map(parseHeroRowHtml));
};

// Takes an html table and returns a list of objects corresponding to rows in the table.
// The keys of the object come from cells in the header and the values come from cells in the row
const parseTable = (tableHtml) => {
  const tableHeader = compose(
    map(compose(
      replace('unlock', 'rarity'),  // Some tables use unlock others use rarity.
      // convert to snake case.
      replace(/\s+/g, '_'),
      toLower,
      // remove unnecessary chars
      trim,
      replace(/<th.*?>/g, ''),
      replace(/<\/th.*?>/g, ''),
    )),
    match(/<th(\s.*?)?>(.|\n)*?<\/th.*?>/g) // needs to not match <thead>
  )(tableHtml);

  const tableRows = compose(
      // START for each row
      map(compose(
        // START for each cell
        map(compose(
          // remove unnecessary chars
          trim,
          replace(/<a.*?>/g, ''),
          replace(/<\/a>/g, ''),
          replace(/<td.*?>/g, ''),
          replace(/<\/td>/g, ''),
          replace(/<img.*?>/g, ''), // remove images
          replace(/<span.*?>(.|\n)*?<\/span>/g, ''), // remove spanned images
        )),
        match(/<td.*?>(.|\n)*?<\/td>/g))), // END for each cell
      tail, // remove the Header row
      match(/<tr.*?>(.|\n)*?<\/tr.*?>/g), // END for each row
    )(tableHtml);
  // some tables have a column of icons, ignore that.
  return map(dissoc(''), map(zipObj(tableHeader), tableRows));
}

// takes the html page for a hero and returns the skills
const parseHeroSkills = compose(
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(/<table.*?skills-table.*?>(.|\n)*?<\/table>/g)
);

const parseSkillsPage = compose(
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(/<table.*?wikitable.*?>(.|\n)*?<\/table>/g)
);


/**
 * Raw data fetchers
 */

const fetchPage = (url) =>
  fetch(url)
    .then(response => {
      if (!response.ok) return Promise.reject({ type: '404' });
      return response.text();
    })
    .catch(() => console.error('failed to fetch: ', url));

// Takes a url prefix, a list of page names, and a parse function.
// Returns a map from page name to parsed page.
async function fetchAndParsePages(host, pageNames, parseFunction) {
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
        (pageName) => host + encodeURIComponent(pageName)
      ))(pageNames)
    ).catch(err => console.error('fetchAndParsePages:', err))
  );
}


/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

async function fetchHeroStats() {
  const heroStats = await fetchPage('http://feheroes.wiki/Stats_Table')
    .then(parseHeroAggregateHtml)
    .catch(err => console.error('fetchAggregateStats', err));
  const heroSkills = map(
    skills => ({ skills }),
    await fetchAndParsePages('http://feheroes.wiki/', Object.keys(heroStats), parseHeroSkills)
  );

  // console.log('Hero stats:', heroStats);
  // console.log('Hero skills:', heroSkills);
  const heroStatsAndSkills = mergeWith(
    merge,
    heroStats,
    heroSkills
  );

  // console.log('Hero stats and skills:', heroStatsAndSkills);
  fs.writeFileSync('./lib/heroes.json', JSON.stringify(heroStatsAndSkills, null, 2));
}

async function fetchSkills() {
  const skillPageNames = ['Weapons', 'Assists', 'Specials', 'Passives'];
  const skillsByType = await fetchAndParsePages(
    'http://feheroes.wiki/',
    skillPageNames,
    parseSkillsPage
  );

  //console.log('Skills by type:', skillsByType);
  fs.writeFileSync('./lib/skills.json', JSON.stringify(skillsByType, null, 2));
}

fetchHeroStats();
fetchSkills();
