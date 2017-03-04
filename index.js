/* eslint-disable no-console */
import fs from 'fs';
import fetch from 'isomorphic-fetch';
import {
  compose,
  equals,
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
  split,
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
  const hp = parseInt(/<td>(\d*?)\s<\/td>/.exec(colHp)[1], 10);
  const atk = parseInt(/<td>(\d*?)\s<\/td>/.exec(colAtk)[1], 10);
  const spd = parseInt(/<td>(\d*?)\s<\/td>/.exec(colSpd)[1], 10);
  const def = parseInt(/<td>(\d*?)\s<\/td>/.exec(colDef)[1], 10);
  const res = parseInt(/<td>(\d*?)\s<\/td>/.exec(colRes)[1], 10);
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
          replace(/<\/a>/g, ''),
          replace(/<a.*?>/g, ''),
          replace(/<td>/g, ''),
          replace(/<\/td>/g, ''),
          replace(/<span.*?>(.|\n)*?<\/span>/g, ''), // remove images
        )),  
        match(/<td>(.|\n)*?<\/td>/g))), // END for each cell
      tail, // remove the Header row
      match(/<tr.*?>(.|\n)*?<\/tr.*?>/g), // END for each row
    )(tableHtml);
    
  return map(zipObj(tableHeader), tableRows);
}

// takes the html page for a hero and returns the skills
const parseHeroSkills = compose(
  // filter(compose(not, equals({}))),
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(/<table.*?skills-table.*?>(.|\n)*?<\/table>/g));

/**
 * Raw data fetchers
 */

const fetchAggregateStats = () =>
  fetch('http://feheroes.wiki/Stats_Table')
    .then(response => response.text());

const fetchDetailStats = (heroName) =>
  fetch(`http://feheroes.wiki/${encodeURIComponent(heroName)}`)
    .then(response => {
      if (!response.ok) return Promise.reject({ type: '404' });
      // console.log('response status', `http://feheroes.wiki/${encodeURIComponent(heroName)}`, response.status);
      return response.text();
    })
    .catch(() => console.error('failed to fetch: ', `http://feheroes.wiki/${encodeURIComponent(heroName)}`));


/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

async function fetchStats() {
  const heroStats = await fetchAggregateStats()
    .then(parseHeroAggregateHtml)
    .catch(err => console.error('fetchAggregateStats', err));

  const heroSkills = map(
    skills => ({ skills }),
    zipObj(
      Object.keys(heroStats),
      await Promise.all(
        map(compose(
          promise => {
            return promise.then(parseHeroSkills)
              .catch(err => {
                console.error('parseHeroSkills:', err);
                return [];
              })
          },
          fetchDetailStats
        ))(Object.keys(heroStats))
      ).catch(err => console.error('heroDetailStats:', err))
    )
  );

  // console.log('Hero stats:', heroStats);

  // console.log('Hero skills:', heroSkills);

  const heroStatsAndSkills = mergeWith(
    merge,
    heroStats,
    heroSkills
  );

  // console.log('Hero stats and skills:', heroStatsAndSkills);
  fs.writeFileSync('./lib/stats.json', JSON.stringify(heroStatsAndSkills, null, 2));
  
}


// TODO: Consume fetchStats in some more sophisticated scenario?
fetchStats();
