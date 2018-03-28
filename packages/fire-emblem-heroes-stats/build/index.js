import fs from 'fs';
import {
  compose,
  contains,
  equals,
  filter,
  head,
  indexBy,
  map,
  merge,
  not,
  pick,
  prop,
  range,
  replace,
  sortBy,
  trim,
  without,
  zipWith,
} from 'ramda';

import { baseStatToMaxStat } from './statGrowth';
import { fetchApiRows } from './fetch';
import { CDN_HOST } from './constants';

const sanitizeDescription = compose(
  trim,
  replace(/<br.*?>/g, ' '),
  // remove [[]] around links
  replace(/\[\[[^\|\]]*?\|?(.*?)\]\]/g, '$1'),
  // remove text before | in links
  replace(/\[\[[^|\]]*\|(.*?)\]\]/g, '[[$1]]'),
  // completely strip [[File:]] links
  replace(/\[\[File.*?\]\]/g, ''),
  replace(/\&gt\;/g, '>'),
  replace(/\&lt\;/g, '<'),
  replace(/\&quot\;/g, '"'),
);

const truncateParenthetical = replace(/\((.).*\)/, '($1)');

/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

// Fetches heroes and their stats/skills
async function fetchHeroStats() {
  const heroBaseStats = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'HeroBaseStats,Heroes',
    fields:
      'Heroes._pageName=Name,HeroBaseStats.Variation,HeroBaseStats.Rarity,HP,Atk,Spd,Def,Res',
    where: 'HeroBaseStats.Variation="Neut"',
    join_on: 'HeroBaseStats._pageName = Heroes._pageName',
  }).then(
    compose(
      map(({ Name, Rarity, HP, Atk, Spd, Def, Res }) => ({
        name: Name,
        rarity: Number.parseInt(Rarity, 10),
        hp: Number.parseInt(HP, 10),
        atk: Number.parseInt(Atk, 10),
        spd: Number.parseInt(Spd, 10),
        def: Number.parseInt(Def, 10),
        res: Number.parseInt(Res, 10),
      })),
    ),
  );

  const heroBaseStatsByNameAndRarity = indexBy(
    ({ name, rarity }) => `${name}-${rarity}`,
    heroBaseStats,
  );

  const basicHeroData = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: [
      'Heroes',
      'HeroBaseStats',
      'HeroGrowthPoints',
      'HeroWeapons',
      'HeroSpecials',
      'HeroAssists',
      'HeroPassives',
    ].join(','),
    fields: [
      // 'Name',
      'Heroes._pageName=Name',
      'Title',
      'Origin',
      'WeaponType',
      'MoveType',
      'SummonRarities',
      'RewardRarities',
      'ReleaseDate',
      'PoolDate',
      'HeroGrowthPoints.HP',
      'HeroGrowthPoints.Atk',
      'HeroGrowthPoints.Spd',
      'HeroGrowthPoints.Def',
      'HeroGrowthPoints.Res',
      'HeroWeapons.weapon1',
      'HeroWeapons.weapon2',
      'HeroWeapons.weapon3',
      'HeroWeapons.weapon4',
      'HeroWeapons.weapon1Unlock',
      'HeroWeapons.weapon2Unlock',
      'HeroWeapons.weapon3Unlock',
      'HeroWeapons.weapon4Unlock',
      'HeroWeapons.weapon1Default',
      'HeroWeapons.weapon2Default',
      'HeroWeapons.weapon3Default',
      'HeroWeapons.weapon4Default',
      'HeroAssists.assist1',
      'HeroAssists.assist2',
      'HeroAssists.assist3',
      'HeroAssists.assist4',
      'HeroAssists.assist1Unlock',
      'HeroAssists.assist2Unlock',
      'HeroAssists.assist3Unlock',
      'HeroAssists.assist4Unlock',
      'HeroAssists.assist1Default',
      'HeroAssists.assist2Default',
      'HeroAssists.assist3Default',
      'HeroAssists.assist4Default',
      'HeroSpecials.special1',
      'HeroSpecials.special2',
      'HeroSpecials.special3',
      'HeroSpecials.special4',
      'HeroSpecials.special1Unlock',
      'HeroSpecials.special2Unlock',
      'HeroSpecials.special3Unlock',
      'HeroSpecials.special4Unlock',
      'HeroSpecials.special1Default',
      'HeroSpecials.special2Default',
      'HeroSpecials.special3Default',
      'HeroSpecials.special4Default',
      'HeroPassives.passiveA1',
      'HeroPassives.passiveA2',
      'HeroPassives.passiveA3',
      'HeroPassives.passiveB1',
      'HeroPassives.passiveB2',
      'HeroPassives.passiveB3',
      'HeroPassives.passiveC1',
      'HeroPassives.passiveC2',
      'HeroPassives.passiveC3',
      'HeroPassives.passiveA1Unlock',
      'HeroPassives.passiveA2Unlock',
      'HeroPassives.passiveA3Unlock',
      'HeroPassives.passiveB1Unlock',
      'HeroPassives.passiveB2Unlock',
      'HeroPassives.passiveB3Unlock',
      'HeroPassives.passiveC1Unlock',
      'HeroPassives.passiveC2Unlock',
      'HeroPassives.passiveC3Unlock',
    ].join(','),
    group_by: 'Heroes._pageName',
    join_on: [
      'HeroBaseStats._pageName = Heroes._pageName',
      'Heroes._pageName = HeroGrowthPoints._pageName',
      'Heroes._pageName = HeroWeapons._pageName',
      'Heroes._pageName = HeroSpecials._pageName',
      'Heroes._pageName = HeroAssists._pageName',
      'Heroes._pageName = HeroPassives._pageName',
    ].join(','),
  })
    .then(
      compose(
        map(
          hero =>
            contains('(', hero.name)
              ? { ...hero, shortName: truncateParenthetical(hero.name) }
              : hero,
        ),
        map(
          ({
            Name,
            Title,
            Origin,
            WeaponType,
            MoveType,
            RewardRarities,
            SummonRarities,
            ReleaseDate,
            PoolDate,

            HP: hpGrowthPoints,
            Atk: atkGrowthPoints,
            Spd: spdGrowthPoints,
            Def: defGrowthPoints,
            Res: resGrowthPoints,

            assist1,
            assist1Default,
            assist1Unlock,

            assist2,
            assist2Default,
            assist2Unlock,

            assist3,
            assist3Default,
            assist3Unlock,

            passiveA1,
            passiveA1Unlock,

            passiveA2,
            passiveA2Unlock,

            passiveA3,
            passiveA3Unlock,

            passiveB1,
            passiveB1Unlock,

            passiveB2,
            passiveB2Unlock,

            passiveB3,
            passiveB3Unlock,

            passiveC1,
            passiveC1Unlock,

            passiveC2,
            passiveC2Unlock,

            passiveC3,
            passiveC3Unlock,

            special1,
            special1Default,
            special1Unlock,

            special2,
            special2Default,
            special2Unlock,

            special3,
            special3Default,
            special3Unlock,

            weapon1,
            weapon1Default,
            weapon1Unlock,

            weapon2,
            weapon2Default,
            weapon2Unlock,

            weapon3,
            weapon3Default,
            weapon3Unlock,

            weapon4,
            weapon4Default,
            weapon4Unlock,
          }) => {
            const enumerateRarities: (
              rarityString: string,
            ) => number[] = compose(
              map(Number.parseInt),
              filter(compose(not, equals(''))),
              str => str.split(','),
            );

            // Compute the available rarities for this character.
            const availableRarities = [
              ...new Set([
                ...enumerateRarities(RewardRarities),
                ...enumerateRarities(SummonRarities),
              ]),
            ].sort();

            const minRarity = availableRarities[0];
            const maxRarity = availableRarities[availableRarities.length - 1];

            const rarities =
              minRarity === undefined
                ? 'N/A'
                : minRarity === maxRarity
                  ? `${minRarity}`
                  : `${minRarity}-${maxRarity}`;

            // Convert release dates into expected format.
            const formatDate = timestamp =>
              new Date(timestamp).toISOString().substring(0, 10);

            const releaseDate = ReleaseDate ? formatDate(ReleaseDate) : 'N/A';

            const poolDate = PoolDate ? formatDate(PoolDate) : 'N/A';

            // Reformat the hero's skills into a list.
            const passiveSkills = compose(
              map(([skill, unlock]) => ({
                name: skill,
                rarity: Number.parseInt(unlock, 10) || '-',
              })),
              filter(compose(Boolean, head)),
            )([
              [passiveA1, passiveA1Unlock],
              [passiveA2, passiveA2Unlock],
              [passiveA3, passiveA3Unlock],
              [passiveB1, passiveB1Unlock],
              [passiveB2, passiveB2Unlock],
              [passiveB3, passiveB3Unlock],
              [passiveC1, passiveC1Unlock],
              [passiveC2, passiveC2Unlock],
              [passiveC3, passiveC3Unlock],
            ]);

            const otherSkills = compose(
              map(([skillPageReference, defaultRarity, unlockRarity]) => ({
                name: skillPageReference,
                default: Number.parseInt(defaultRarity, 10) || '-',
                rarity: Number.parseInt(unlockRarity, 10) || '-',
              })),
              filter(compose(Boolean, head)),
            )([
              [weapon1, weapon1Default, weapon1Unlock],
              [weapon2, weapon2Default, weapon2Unlock],
              [weapon3, weapon3Default, weapon3Unlock],
              [weapon4, weapon4Default, weapon4Unlock],
              [assist1, assist1Default, assist1Unlock],
              [assist2, assist2Default, assist2Unlock],
              [assist3, assist3Default, assist3Unlock],
              [special1, special1Default, special1Unlock],
              [special2, special2Default, special2Unlock],
              [special3, special3Default, special3Unlock],
            ]);

            const skills = [...otherSkills, ...passiveSkills];

            // Compute the hero's stats at level 1 and 40 for all available
            // rarities.
            const stats = {
              '1': {},
              '40': {},
            };

            if (minRarity !== undefined) {
              range(minRarity, 6).forEach(rarity => {
                stats['1'][rarity] = compose(
                  map(value => Number.parseInt(value, 10)),
                  pick(['hp', 'atk', 'spd', 'def', 'res']),
                )(heroBaseStatsByNameAndRarity[`${Name}-${rarity}`]);

                stats['40'][rarity] = {
                  hp: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp - 1,
                      Number.parseInt(hpGrowthPoints, 10) - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp,
                      Number.parseInt(hpGrowthPoints, 10),
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp + 1,
                      Number.parseInt(hpGrowthPoints, 10) + 1,
                    ),
                  ],
                  atk: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk - 1,
                      Number.parseInt(atkGrowthPoints, 10) - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk,
                      Number.parseInt(atkGrowthPoints, 10),
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk + 1,
                      Number.parseInt(atkGrowthPoints, 10) + 1,
                    ),
                  ],
                  spd: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd - 1,
                      Number.parseInt(spdGrowthPoints, 10) - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd,
                      Number.parseInt(spdGrowthPoints, 10),
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd + 1,
                      Number.parseInt(spdGrowthPoints, 10) + 1,
                    ),
                  ],
                  def: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def - 1,
                      Number.parseInt(defGrowthPoints, 10) - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def,
                      Number.parseInt(defGrowthPoints, 10),
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def + 1,
                      Number.parseInt(defGrowthPoints, 10) + 1,
                    ),
                  ],
                  res: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res - 1,
                      Number.parseInt(resGrowthPoints, 10) - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res,
                      Number.parseInt(resGrowthPoints, 10),
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res + 1,
                      Number.parseInt(resGrowthPoints, 10) + 1,
                    ),
                  ],
                };
              });
            }

            return {
              name: Name,
              title: sanitizeDescription(Title),
              origin: Origin,
              weaponType: WeaponType,
              moveType: MoveType,
              rarities,
              releaseDate,
              poolDate,
              assets: {
                portrait: {
                  '75px': `${CDN_HOST}/75px-Icon_Portrait_${Name}.png`,
                  '113px': `${CDN_HOST}/113px-Icon_Portrait_${Name}.png`,
                  '150px': `${CDN_HOST}/150px-Icon_Portrait_${Name}.png`,
                },
              },
              skills,
              stats,
            };
          },
        ),
      ),
    )
    .catch(error => {
      console.error('failed to parse hero stats', error);
    });

  const heroNames = map(prop('name'), basicHeroData);

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

  const heroes = zipWith(merge, basicHeroData, heroAssets);

  return heroes;
}

// Fetches detailed info for all skills
async function fetchSkills() {
  const weapons = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'Weapons',
    fields: 'WeaponClass,WeaponName,WeaponRange,Cost,Effect,Might,Exclusive',
    group_by: 'WeaponName',
  })
    .then(
      compose(
        sortBy(prop('name')),
        map(
          ({
            WeaponName,
            Cost,
            Effect,
            Exclusive,
            Might,
            WeaponRange,
            WeaponClass,
          }) => ({
            name: WeaponName,
            spCost: Number.parseInt(Cost, 10),
            'damage(mt)': Number.parseInt(Might, 10),
            'range(rng)': Number.parseInt(WeaponRange, 10),
            effect: sanitizeDescription(Effect),
            'exclusive?': Number.parseInt(Exclusive, 10) === 1 ? 'Yes' : 'No',
            type: 'WEAPON',
            weaponType: WeaponClass,
          }),
        ),
      ),
    )
    .catch(error => {
      console.error('failed to parse weapon skill stats', error);
    });

  const assists = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'Assists',
    fields:
      'Name,Cost,Effect,AssistRange,WeaponRestriction,MovementRestriction,PrerequisiteSkill,Exclusive,SkillTier,SkillBuildCost',
    group_by: 'Name',
  })
    .then(
      compose(
        map(
          ({
            Name,
            Cost,
            Effect,
            MovementRestriction,
            WeaponRestriction,
            Exclusive,
            AssistRange,
          }) => {
            return {
              name: Name,
              range: Number.parseInt(AssistRange, 10),
              effect: sanitizeDescription(Effect),
              exclusive: Boolean(Number.parseInt(Exclusive, 10)),
              spCost: Number.parseInt(Cost, 10),
              movementRestriction: MovementRestriction.split(','),
              weaponRestriction: WeaponRestriction.split(','),
              type: 'ASSIST',
            };
          },
        ),
      ),
    )
    .catch(error => {
      console.error('failed to parse assist skill stats', error);
    });

  const specials = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'Specials',
    fields:
      'Name,Cost,Cooldown,Effect,WeaponRestriction,MovementRestriction,Exclusive,SkillTier',
    group_by: 'Name',
  })
    .then(
      compose(
        map(
          ({
            Name,
            Cooldown,
            Cost,
            Effect,
            Exclusive,
            MovementRestriction,
            // SkillTier,
            WeaponRestriction,
          }) => ({
            name: Name,
            cooldown: Number.parseInt(Cooldown, 10),
            effect: sanitizeDescription(Effect || '-'),
            exclusive: Boolean(parseInt(Exclusive)),
            spCost: Number.parseInt(Cost, 10),
            movementRestriction: MovementRestriction.split(','),
            weaponRestriction: WeaponRestriction.split(','),
            type: 'SPECIAL',
          }),
        ),
      ),
    )
    .catch(error => {
      console.error('failed to parse special skill stats', error);
    });

  const passives = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'PassiveGroup,PassiveSingle',
    fields:
      'PassiveSingle.Name=Name,Effect,SkillTier,SPCost,PassiveGroup.MovementRestriction=MovementRestriction,PassiveGroup.WeaponRestriction=WeaponRestriction,PassiveGroup.Exclusive=Exclusive,PassiveGroup.Ptype=Ptype',
    join_on: 'PassiveGroup._pageName = PassiveSingle._pageName',
    group_by: 'Name',
  })
    .then(
      compose(
        filter(({ name }) => Boolean(name)),
        sortBy(prop('type')),
        map(
          ({
            Name,
            SPCost,
            Effect,
            Exclusive,
            MovementRestriction,
            WeaponRestriction,
            // SkillTier,
            Ptype,
          }) => {
            // Don't include passives that are only available as seals, here.
            if (Ptype === 'S') return {};

            return {
              name: Name,
              effect: sanitizeDescription(Effect),
              exclusive: Boolean(Number.parseInt(Exclusive, 10)),
              spCost: Number.parseInt(SPCost, 10),
              movementRestriction: MovementRestriction.split(','),
              weaponRestriction: WeaponRestriction.split(','),
              type: `PASSIVE_${Ptype}`,
            };
          },
        ),
      ),
    )
    .catch(error => {
      console.error('failed to parse passive skill stats', error);
    });

  const seals = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'PassiveGroup,PassiveSingle',
    fields:
      'PassiveSingle.Name=Name,Effect,SkillTier,PassiveGroup.Seal=Seal,PassiveGroup.MovementRestriction=MovementRestriction,PassiveGroup.WeaponRestriction=WeaponRestriction',
    where: 'PassiveGroup.Seal="1"',
    join_on: 'PassiveGroup._pageName = PassiveSingle._pageName',
    group_by: 'Name',
  })
    .then(
      compose(
        filter(({ name }) => Boolean(name)),
        map(({ Name, Effect }) => ({
          name: Name,
          effect: sanitizeDescription(Effect),
          // skillTier: Number.parseInt(SkillTier, 10),
          // movementRestriction: MovementRestriction.split(','),
          // weaponRestriction: WeaponRestriction.split(','),
          type: 'SEAL',
        })),
      ),
    )
    .catch(error => {
      console.error('failed to parse seal skill stats', error);
    });

  const skills = [...weapons, ...assists, ...specials, ...passives, ...seals];

  return skills;
}

// log warnings if data looks suspicious
function validate(heroes, skills) {
  const skillsByName = indexBy(prop('name'), skills);
  for (let hero of heroes) {
    for (let skill of hero.skills) {
      if (skillsByName[skill.name] == null) {
        console.warn(
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
      console.warn(
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
      console.warn('Warning: Skill is unobtainable: ', skill.name);
    }
  }
}

// Fetch new data and write it to stats.json
async function fetchWikiStats(shouldFetchHeroes, shouldFetchSkills) {
  const existingStats = JSON.parse(fs.readFileSync('./stats.json', 'utf8'));
  const heroes = shouldFetchHeroes
    ? await fetchHeroStats()
    : existingStats.heroes;
  const skills = shouldFetchSkills ? await fetchSkills() : existingStats.skills;

  // Log new heroes/skills
  const getNames = map(prop('name'));
  const newHeroNames = without(
    getNames(existingStats.heroes),
    getNames(heroes),
  );
  const newSkills = without(getNames(existingStats.skills), getNames(skills));
  map(x => console.log('New hero: ' + x), newHeroNames);
  map(x => console.log('New skill: ' + x), newSkills);

  validate(heroes, skills);

  // WRITE STATS TO FILE
  const allStats = { heroes, skills };
  fs.writeFileSync('./stats.json', JSON.stringify(allStats, null, 2));
}

fetchWikiStats(true, true);
