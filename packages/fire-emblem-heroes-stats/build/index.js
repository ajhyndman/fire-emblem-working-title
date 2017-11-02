import fs from 'fs';
import {
  __,
  assoc,
  compose,
  concat,
  contains,
  dissoc,
  dropLast,
  flatten,
  has,
  head,
  identity,
  ifElse,
  indexBy,
  map,
  mapObjIndexed,
  merge,
  mergeWith,
  path,
  prop,
  propEq,
  replace,
  test,
  toUpper,
  trim,
  values,
  without,
  zipObj,
  zipWith,
} from 'ramda';

import { fetchPage, fetchAndParsePages, fetchAskApiQuery } from './fetch';
import {
  parseHeroAggregateHtml,
  parseHeroStatsAndSkills,
  parseSkillsPage,
} from './parse';
import { CDN_HOST, WIKI_HOST } from './constants';

// None of the queries we are making should have more than this many results
const ASK_API_LIMIT = 2000;

const sanitizeEffectString = compose(
  trim,
  replace(/<br.*?>/g, ' '),
  replace(/\[\[.*?\]\]/g, ''),
);

/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

// Fetches heroes and their stats/skills
async function fetchHeroStats() {
  const heroes = await fetchPage(`${WIKI_HOST}/Hero_List`)
    .then(parseHeroAggregateHtml)
    .then(map(dissoc('icon')))
    .catch(err => console.error('parseHeroAggregateHtml', err));

  const heroNames = map(prop('name'), heroes);

  const heroAssets = map(
    name => ({
      assets: {
        portrait: {
          '75px': `${CDN_HOST}/75px-Icon_Portrait_${name}.png`,
          '113px': `${CDN_HOST}/113px-Icon_Portrait_${name}.png`,
          '150px': `${CDN_HOST}/150px-Icon_Portrait_${name}.png`,
        },
      },
    }),
    heroNames,
  );

  const heroStatsAndSkills = await fetchAndParsePages(
    WIKI_HOST,
    heroNames,
    parseHeroStatsAndSkills,
  );

  // Create an object that maps hero name to the hero object in order to merge in the hero skills.
  const detailedHeroes = values(
    mergeWith(
      merge,
      zipObj(heroNames, zipWith(merge, heroes, heroAssets)),
      heroStatsAndSkills,
    ),
  );

  // Add short names to each hero for display purposes.
  const truncateParenthetical = replace(/\((.).*\)/, '($1)');
  const detailedHeroesWithShortNames = map(
    hero =>
      contains('(', hero.name)
        ? { ...hero, shortName: truncateParenthetical(hero.name) }
        : hero,
    detailedHeroes,
  );

  return detailedHeroesWithShortNames;
}

// Fetches detailed info for all skills
async function fetchSkills() {
  const skillPageNames = ['Assists', 'Specials', 'Passives'];
  const skillsByType = await fetchAndParsePages(
    WIKI_HOST,
    skillPageNames,
    parseSkillsPage,
  );

  const weapons = await fetchAskApiQuery(`
    [[Category:Weapons]]
      |?Category
      |?Cost1
      |?Effect1
      |?Is exclusive
      |?Might1
      |?Name1
      |?Range1
      |limit=${ASK_API_LIMIT}
  `).then(
    compose(
      map(
        ({
          Category,
          Cost1,
          Effect1,
          'Is exclusive': isExclusive,
          Might1,
          Name1,
          Range1,
        }) => {
          const categories = Category.filter(
            ({ fulltext }) =>
              !(
                fulltext === 'Category:Weapons' ||
                fulltext.includes('Legendary')
              ),
          );

          console.log(categories);

          const weaponType = (() => {
            switch (head(categories).fulltext) {
              case 'Category:Swords':
                return 'Red Sword';
              case 'Category:Red Tomes':
                return 'Red Tome';
              case 'Category:Red Breaths':
                return 'Red Breath';
              case 'Category:Lances':
                return 'Blue Lance';
              case 'Category:Blue Tomes':
                return 'Blue Tome';
              case 'Category:Blue Breaths':
                return 'Blue Breath';
              case 'Category:Axes':
                return 'Green Axe';
              case 'Category:Green Tomes':
                return 'Green Tome';
              case 'Category:Green Breaths':
                return 'Green Breath';
              case 'Category:Bows':
                return 'Neutral Bow';
              case 'Category:Daggers':
                return 'Neutral Shuriken';
              case 'Category:Staves':
                return 'Neutral Staff';
            }
          })();

          const effect =
            head(Effect1) !== undefined
              ? sanitizeEffectString(head(Effect1))
              : '-';

          return {
            name: head(Name1),
            spCost: head(Cost1),
            'damage(mt)': head(Might1),
            'range(rng)': head(Range1),
            effect,
            'exclusive?': head(isExclusive) === 't' ? 'Yes' : 'No',
            type: 'WEAPON',
            weaponType,
          };
        },
      ),
      map(prop('printouts')),
      values,
      path(['query', 'results']),
    ),
  );

  console.log(weapons);

  const seals = await fetchAskApiQuery(
    '[[Category:Sacred Seals]]|?Name1|?Effect1|?Name2|?Effect2|?Name3|?Effect3',
  ).then(
    compose(
      flatten,
      map(({ Name1, Effect1, Name2, Effect2, Name3, Effect3 }) =>
        [
          {
            name: head(Name1),
            effect: sanitizeEffectString(head(Effect1)),
            type: 'SEAL',
          },
          {
            name: head(Name2),
            effect: sanitizeEffectString(head(Effect2)),
            type: 'SEAL',
          },
          {
            name: head(Name3),
            effect: sanitizeEffectString(head(Effect3)),
            type: 'SEAL',
          },
        ].filter(({ name }) => name !== undefined),
      ),
      map(prop('printouts')),
      values,
      path(['query', 'results']),
    ),
  );

  const skills = compose(
    concat(__, seals),
    concat(weapons),
    map(skill =>
      ifElse(
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
    mapObjIndexed((skillList, skillType) =>
      map(assoc('type', dropLast(1, toUpper(skillType))), skillList),
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
        console.log(
          'Warning: ' + hero.name + ' has unknown skill: ' + skill.name,
        );
      }
    }
    var level1Rarities = 0;
    var level40Rarities = 0;
    for (let rarity of [1, 2, 3, 4, 5]) {
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
      console.log(
        'Warning: ' +
          hero.name +
          ' has level 1 stats for ' +
          level1Rarities +
          ' and level 40 stats for ' +
          level40Rarities +
          ' rarities.',
      );
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
    // Breath weapons are not color-specific.
    const heroWeaponType = test(/Breath/, hero.weaponType)
      ? 'Breath'
      : hero.weaponType;
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
      skill => assoc('weaponType', weaponTypeByName[skill.name], skill),
      identity,
    ),
    skills,
  );
  return withWeaponTypes;
}

// Fetch new data and write it to stats.json
async function fetchWikiStats(shouldFetchHeroes, shouldFetchSkills) {
  const existingStats = JSON.parse(fs.readFileSync('./stats.json', 'utf8'));
  const heroes = shouldFetchHeroes
    ? await fetchHeroStats()
    : existingStats['heroes'];
  const skills = shouldFetchSkills
    ? await fetchSkills()
    : existingStats['skills'];

  // Log new heroes/skills
  const getNames = map(prop('name'));
  const newHeroNames = without(
    getNames(existingStats['heroes']),
    getNames(heroes),
  );
  const newSkills = without(
    getNames(existingStats['skills']),
    getNames(skills),
  );
  map(x => console.log('New hero: ' + x), newHeroNames);
  map(x => console.log('New skill: ' + x), newSkills);

  // Infer weapon subtypes from the heroes that own them.
  const skillsV2 = skillsWithWeaponsTypes(heroes, skills);
  validate(heroes, skillsV2);

  // WRITE STATS TO FILE
  const allStats = { heroes, skills: skillsV2 };
  fs.writeFileSync('./stats.json', JSON.stringify(allStats, null, 2));
}

fetchWikiStats(true, true);
