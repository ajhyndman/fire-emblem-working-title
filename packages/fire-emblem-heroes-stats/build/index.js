import fs from 'fs';
import {
  assoc,
  compose,
  dissoc,
  dropLast,
  flatten,
  identity,
  ifElse,
  indexBy,
  has,
  map,
  mapObjIndexed,
  merge,
  mergeWith,
  pick,
  prop,
  propEq,
  test,
  toUpper,
  values,
  zipObj,
} from 'ramda';

import { fetchPage, fetchAndParsePages } from './fetch';
import {
  parseHeroAggregateHtml,
  parseHeroStatsAndSkills,
  parseSkillsPage,
} from './parse';


/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

// Fetches heroes and their stats/skills
async function fetchHeroStats() {
  // TODO: switch to http://feheroes.wiki/Hero_List
  const heroes = await fetchPage('http://feheroes.wiki/Stats_Table')
    .then(parseHeroAggregateHtml)
    .then(map(pick(['name', 'moveType', 'weaponType', 'total'])))
    .catch(err => console.error('fetchAggregateStats', err));

  const heroNames = map(prop('name'), heroes);
  const heroStatsAndSkills = await fetchAndParsePages(
    'http://feheroes.wiki/',
    heroNames,
    parseHeroStatsAndSkills,
  );

  // Create an object that maps hero name to the hero object in order to merge in the hero skills.
  const detailedHeroes = values(
    mergeWith(
      merge,
      zipObj(heroNames, heroes),
      heroStatsAndSkills,
    ),
  );
  return detailedHeroes;
}

// Fetches detailed info for all skills
async function fetchSkills() {
  const skillPageNames = ['Weapons', 'Assists', 'Specials', 'Passives'];
  const skillsByType = await fetchAndParsePages(
    'http://feheroes.wiki/',
    skillPageNames,
    parseSkillsPage,
  );
  const skills = compose(
    map(
      (skill) => ifElse(
        has('passiveSlot'),
        compose(
          dissoc('passiveSlot'),
          assoc('type', skill['type'] + '_' + skill['passiveSlot']),
        ),
        identity,
      )(skill),
    ),
    flatten,
    values,
    mapObjIndexed(
      (skillList, skillType) => map(
        assoc('type', dropLast(1, toUpper(skillType))),
        skillList,
      ),
    ),
  )(skillsByType);
  return skills;
}

// Look at the weapons available to each hero to figure out weapon types.
function skillsWithWeaponsTypes(heroes, skills) {
  const skillsByName = indexBy(prop('name'), skills);
  var weaponTypeByName = {};
  for (let hero of heroes) {
    const heroWeaponType = test(/Beast/, hero.weaponType) ? 'Breath' : hero.weaponType;
    for (let skill of hero.skills) {
      const skillInfo = skillsByName[skill.name];
      if (skillInfo == null) {
        console.log('Warning: unknown skill: ' + skill.name);
      }
      if (skillInfo.type === 'WEAPON') {
        weaponTypeByName[skill.name] = heroWeaponType;
      }
    }
  }
  return map(
    ifElse(
      propEq('type', 'WEAPON'),
      (skill) => assoc('weaponType', weaponTypeByName[skill.name], skill),
      identity,
    ),
    skills
  );
}

// Fetch new data and write it to stats.json
async function fetchWikiStats(shouldFetchHeroes, shouldFetchSkills) {
  const existingStats = JSON.parse(fs.readFileSync('./dist/stats.json', 'utf8'));
  const heroes = shouldFetchHeroes ? await fetchHeroStats() : existingStats['heroes'];
  const skills = shouldFetchSkills ? await fetchSkills() : existingStats['skills'];

  // Infer weapon subtypes from the heroes that own them.
  const skillsV2 = skillsWithWeaponsTypes(heroes, skills);

  // WRITE STATS TO FILE
  const allStats = { heroes, skills: skillsV2 };
  fs.writeFileSync('./dist/stats.json', JSON.stringify(allStats, null, 2));
}

fetchWikiStats(true, true);
