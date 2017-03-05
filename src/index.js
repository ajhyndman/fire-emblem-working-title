import fs from 'fs';
import {
  assoc,
  compose,
  dropLast,
  flatten,
  map,
  mapObjIndexed,
  merge,
  mergeWith,
  pick,
  toUpper,
} from 'ramda';

import { fetchPage, fetchAndParsePages } from './fetch';
import {
  parseHeroAggregateHtml,
  parseHeroSkills,
  parseSkillsPage,
} from './parse';


/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

async function fetchWikiStats() {
  // COLLATE HERO STATS
  const heroStats = await fetchPage('http://feheroes.wiki/Stats_Table')
    .then(parseHeroAggregateHtml)
    .catch(err => console.error('fetchAggregateStats', err));
  const heroSkills = map(
    compose(
      skills => ({ skills }),
      map(pick(['name', 'default', 'rarity'])),
    ),
    await fetchAndParsePages('http://feheroes.wiki/', Object.keys(heroStats), parseHeroSkills),
  );

  // console.log('Hero stats:', heroStats);
  // console.log('Hero skills:', heroSkills);
  const heroes = compose(
    Object.values,
    mapObjIndexed(
      (hero, heroName) => assoc('name', heroName, hero),
    ),
  )(mergeWith(merge, heroStats, heroSkills));


  // COLLATE SKILL STATS
  const skillPageNames = ['Weapons', 'Assists', 'Specials', 'Passives'];
  const skillsByType = await fetchAndParsePages(
    'http://feheroes.wiki/',
    skillPageNames,
    parseSkillsPage,
  );
  const skills = compose(
    flatten,
    Object.values,
    mapObjIndexed(
      (skillList, skillType) => map(
        assoc('type', dropLast(1, toUpper(skillType))),
        skillList,
      ),
    ),
  )(skillsByType);


  // WRITE STATS TO FILE
  const allStats = { heroes, skills };
  fs.writeFileSync('./lib/stats.json', JSON.stringify(allStats, null, 2));
}

fetchWikiStats();
