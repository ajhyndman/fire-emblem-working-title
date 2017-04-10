import fs from 'fs';
import {
  assoc,
  ascend,
  compose,
  contains,
  dissoc,
  dropLast,
  filter,
  flatten,
  has,
  identity,
  ifElse,
  indexBy,
  map,
  mapObjIndexed,
  merge,
  mergeWith,
  not,
  pick,
  prop,
  propEq,
  repeat,
  replace,
  sortWith,
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
  const heroes = await fetchPage('http://feheroes.wiki/Hero_List')
    .then(parseHeroAggregateHtml)
    .then(map(dissoc('icon')))
    .catch(err => console.error('parseHeroAggregateHtml', err));

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

  // Add short names to each hero for display purposes.
  const truncateParenthetical = replace(/\((.).*\)/, '($1)');
  const detailedHeroesWithShortNames = map(
    hero => (contains('(', hero.name)
      ? { ...hero, shortName: truncateParenthetical(hero.name) }
      : hero
    ),
    detailedHeroes,
  );

  return detailedHeroesWithShortNames;
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

// log warnings if data looks suspicious
function validate(heroes, skills) {
  const skillsByName = indexBy(prop('name'), skills);
  for (let hero of heroes) {
    for (let skill of hero.skills) {
      if (skillsByName[skill.name] == null) {
        console.log('Warning: ' + hero.name + ' has unknown skill: ' + skill.name);
      }
    }
    var level1Rarities = 0;
    var level40Rarities = 0;
    for (let rarity of [1,2,3,4,5]) {
      // level 1 stats:
      if (hero.stats[1][rarity] != null) {
        level1Rarities++;
      }
      // level 40 stats:
      if (hero.stats[40][rarity] != null) {
        level40Rarities++;
      }
    }
    if (level1Rarities != level40Rarities || level1Rarities == 0) {
      console.log('Warning: ' + hero.name + ' has level 1/40 stats for ' + level1Rarities
        + '/' + level40Rarities + ' rarities.');
    }
  }
  for (let skill of skills) {
    if (skill.type === 'WEAPON' && skill.weaponType == null) {
      console.log('Warning: Skill is unobtainable: ', skill.name);
    }
  }
}

// Look at the weapons available to each hero to figure out weapon types.
function skillsWithWeaponsTypes(heroes, skills) {
  const skillsByName = indexBy(prop('name'), skills);
  var weaponTypeByName = {};
  for (let hero of heroes) {
    const heroWeaponType = test(/Beast/, hero.weaponType) ? 'Breath' : hero.weaponType;
    for (let skill of hero.skills) {
      const skillInfo = skillsByName[skill.name];
      if (skillInfo != null && skillInfo.type === 'WEAPON') {
        weaponTypeByName[skill.name] = heroWeaponType;
      }
    }
  }
  const withWeaponTypes = map(
    ifElse(
      propEq('type', 'WEAPON'),
      (skill) => assoc('weaponType', weaponTypeByName[skill.name], skill),
      identity,
    ),
    skills,
  );
  return withWeaponTypes;
}

// Provides maps from id -> name for [heroes, weapons, assists, specials, a, b, c]
// Orders the heroes by id, name and skills in order of the heroes that.
// Unreleased heroes and unobtainable skills have no id.
// This will generate the same ids even after new heroes and skills are released,
// but it will fail if old content is renamed.
function computeIds(heroes, skills) {
  const skillsByName = indexBy(prop('name'), skills);
  const types = [
    'HERO',
    'WEAPON',
    'ASSIST',
    'SPECIAL',
    'PASSIVE_A',
    'PASSIVE_B',
    'PASSIVE_C',
  ];
  let idsByName = {};
  let namesByTypeAndId = zipObj(types, map((x) => {return {}}, types));
  let nextIdsByType = zipObj(types, repeat(0, types.length));
  const releasedHeroes = filter(compose(not, propEq('releaseDate', 'N/A')), heroes);
  const sortedHeroes = sortWith([
    ascend((h) => new Date(prop('releaseDate', h))),
    ascend(prop('name')),
  ])(releasedHeroes)
  for (let hero of sortedHeroes) {
    const heroId = nextIdsByType['HERO']++;
    idsByName[hero.name] = heroId;
    namesByTypeAndId['HERO'][heroId] = hero.name;
    for (let skillName of map(prop('name'), hero.skills)) {
      const sType = skillsByName[skillName].type;
      if (idsByName[skillName] == null) {
        const skillId = nextIdsByType[sType]++;
        idsByName[skillName] = skillId;
        namesByTypeAndId[sType][skillId] = skillName;
      }
    }
  }
  return {idsByName, namesByTypeAndId};
}

function validateIdsPreserved(oldIds, newIds) {
  if (oldIds == null) {
    return true;
  }
  let idsOk = true;
  for (let name in oldIds.idsByName) {
    if (oldIds.idsByName[name] != newIds.idsByName[name]) {
      console.log('Warning: id for', name, 'changed from',
                  oldIds.idsByName[name], 'to', newIds.idsByName[name]);
      idsOk = false;
    }
  }
  return idsOk;
}

// Fetch new data and write it to stats.json
async function fetchWikiStats(shouldFetchHeroes, shouldFetchSkills) {
  const existingStats = JSON.parse(fs.readFileSync('./dist/stats.json', 'utf8'));
  const heroes = shouldFetchHeroes ? await fetchHeroStats() : existingStats['heroes'];
  const skills = shouldFetchSkills ? await fetchSkills() : existingStats['skills'];

  // Infer weapon subtypes from the heroes that own them.
  const skillsV2 = skillsWithWeaponsTypes(heroes, skills);
  validate(heroes, skillsV2);
  
  let ids = computeIds(heroes, skills);
  const oldIds = existingStats['ids'];
  const idsOk = validateIdsPreserved(oldIds, ids);
  if (!idsOk) {
    // If any ids have changed, continue to use all of the old ids.
    ids = oldIds;
    console.log("Warning: Using old ids.");
  }

  // WRITE STATS TO FILE
  const allStats = { heroes, skills: skillsV2, ids };
  fs.writeFileSync('./dist/stats.json', JSON.stringify(allStats, null, 2));
}

fetchWikiStats(true, true);
