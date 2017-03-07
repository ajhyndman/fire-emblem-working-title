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
  prop,
  toUpper,
  values,
  zipObj,
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
  const heroNames = map(prop('name'), heroStats);
  const heroSkills = map(
    compose(
      skills => ({ skills }),
      map(pick(['name', 'default', 'rarity'])),
    ),
    await fetchAndParsePages('http://feheroes.wiki/', heroNames, parseHeroSkills),
  );
  // console.log('Hero stats:', heroStats);
  // console.log('Hero skills:', heroSkills);
  
  // Create an object that maps hero name to the hero object in order to merge in the hero skills.
  const heroes = values(
    mergeWith(
      merge,
      zipObj(heroNames, heroStats),
      heroSkills,
    ),
  );


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
