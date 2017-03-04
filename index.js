/* eslint-disable no-console */
import fs from 'fs';
import fetch from 'isomorphic-fetch';
import {
  compose,
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

const parseHeroDetailHtml = (heroDetailHtml) => {
  const heroSkillTables = filter(
    compose(not, isNil),
    match(/<table.*?skills-table.*?>(.|\n)*?<\/table>/g, heroDetailHtml)
  );

  // console.log(heroSkillTables);
  const heroSkills = compose(
    filter(compose(not, isNil)),
    flatten,
    map(compose(
      map(compose(
        trim,
        replace(/<\/a>/g, ''),
        replace(/<a.*?>/g, '')
      )),
      match(/<a.*?>.*?<\/a>/g)
    ))
  )(heroSkillTables);

  return heroSkills;
};


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
            return promise.then(parseHeroDetailHtml)
              .catch(err => {
                console.error('parseHeroDetailHtml:', err);
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
