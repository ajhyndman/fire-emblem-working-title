import fs from 'fs';
import {
  assoc,
  compose,
  contains,
  filter,
  flatten,
  head,
  identity,
  ifElse,
  indexBy,
  isNil,
  map,
  merge,
  not,
  path,
  prop,
  propEq,
  range,
  replace,
  sortBy,
  test,
  trim,
  values,
  without,
  zipWith,
} from 'ramda';

import { baseStatToMaxStat } from './statGrowth';
import { fetchAskApiQuery, fetchApiQuery } from './fetch';
import { CDN_HOST } from './constants';

// None of the queries we are making should expect more than this many results.
const API_LIMIT = 2000;

const sanitizeEffectString = compose(
  trim,
  replace(/<br.*?>/g, ' '),
  // remove [[]] around links
  replace(/\[\[[^\|]*?\|?(.*?)\]\]/g, '$1'),
  // remove text before | in links
  replace(/\[\[[^|]*\|(.*?)\]\]/g, '[[$1]]'),
  // completely strip [[File:]] links
  replace(/\[\[File.*?\]\]/g, ''),
  replace(/\&gt\;/g, '>'),
  replace(/\&lt\;/g, '<'),
);

const extractPrintouts = compose(
  map(prop('printouts')),
  values,
  path(['query', 'results']),
);

const extractCargoResults = compose(
  map(prop('title')),
  values,
  prop('cargoquery'),
);

const truncateParenthetical = replace(/\((.).*\)/, '($1)');

/**
 * Fetch and collate the data.
 * (Do all the things!)
 */

// Fetches heroes and their stats/skills
async function fetchHeroStats() {
  const basicHeroData = await fetchAskApiQuery(`
    [[Category: Heroes]]
      |?HeroName
      |?Title

      |?Origin
      |?WeaponType
      |?MoveType

      |?RewardRarities
      |?SummonRarities
      |?Has release date

      |?Has Atk Growth Point
      |?Has Def Growth Point
      |?Has HP Growth Point
      |?Has Res Growth Point
      |?Has Spd Growth Point

      |?Has Lv1 R1 ATK Neut
      |?Has Lv1 R1 DEF Neut
      |?Has Lv1 R1 HP Neut
      |?Has Lv1 R1 RES Neut
      |?Has Lv1 R1 SPD Neut

      |?Has Lv1 R2 ATK Neut
      |?Has Lv1 R2 DEF Neut
      |?Has Lv1 R2 HP Neut
      |?Has Lv1 R2 RES Neut
      |?Has Lv1 R2 SPD Neut

      |?Has Lv1 R3 ATK Neut
      |?Has Lv1 R3 DEF Neut
      |?Has Lv1 R3 HP Neut
      |?Has Lv1 R3 RES Neut
      |?Has Lv1 R3 SPD Neut

      |?Has Lv1 R4 ATK Neut
      |?Has Lv1 R4 DEF Neut
      |?Has Lv1 R4 HP Neut
      |?Has Lv1 R4 RES Neut
      |?Has Lv1 R4 SPD Neut

      |?Has Lv1 R5 ATK Neut
      |?Has Lv1 R5 DEF Neut
      |?Has Lv1 R5 HP Neut
      |?Has Lv1 R5 RES Neut
      |?Has Lv1 R5 SPD Neut

      |?Has assist1
      |?Has assist1 default
      |?Has assist1 unlock

      |?Has assist2
      |?Has assist2 default
      |?Has assist2 unlock

      |?Has assist3
      |?Has assist3 default
      |?Has assist3 unlock

      |?Has passiveA1
      |?Has passiveA1 unlock

      |?Has passiveA2
      |?Has passiveA2 unlock

      |?Has passiveA3
      |?Has passiveA3 unlock

      |?Has passiveB1
      |?Has passiveB1 unlock

      |?Has passiveB2
      |?Has passiveB2 unlock

      |?Has passiveB3
      |?Has passiveB3 unlock

      |?Has passiveC1
      |?Has passiveC1 unlock

      |?Has passiveC2
      |?Has passiveC2 unlock

      |?Has passiveC3
      |?Has passiveC3 unlock

      |?Has special1
      |?Has special1 default
      |?Has special1 unlock

      |?Has special2
      |?Has special2 default
      |?Has special2 unlock

      |?Has special3
      |?Has special3 default
      |?Has special3 unlock

      |?Has weapon1
      |?Has weapon1 default
      |?Has weapon1 unlock

      |?Has weapon2
      |?Has weapon2 default
      |?Has weapon2 unlock

      |?Has weapon3
      |?Has weapon3 default
      |?Has weapon3 unlock

      |?Has weapon4
      |?Has weapon4 default
      |?Has weapon4 unlock

      |limit=${API_LIMIT}
  `)
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
            HeroName,
            Title,
            Origin,
            WeaponType,
            MoveType,
            RewardRarities,
            SummonRarities,
            'Has release date': hasReleaseDate,

            'Has HP Growth Point': [hpGrowthPoints],
            'Has Atk Growth Point': [atkGrowthPoints],
            'Has Spd Growth Point': [spdGrowthPoints],
            'Has Def Growth Point': [defGrowthPoints],
            'Has Res Growth Point': [resGrowthPoints],

            'Has Lv1 R1 HP Neut': [lv1R1Hp],
            'Has Lv1 R1 ATK Neut': [lv1R1Atk],
            'Has Lv1 R1 SPD Neut': [lv1R1Spd],
            'Has Lv1 R1 DEF Neut': [lv1R1Def],
            'Has Lv1 R1 RES Neut': [lv1R1Res],

            'Has Lv1 R2 HP Neut': [lv1R2Hp],
            'Has Lv1 R2 ATK Neut': [lv1R2Atk],
            'Has Lv1 R2 SPD Neut': [lv1R2Spd],
            'Has Lv1 R2 DEF Neut': [lv1R2Def],
            'Has Lv1 R2 RES Neut': [lv1R2Res],

            'Has Lv1 R3 HP Neut': [lv1R3Hp],
            'Has Lv1 R3 ATK Neut': [lv1R3Atk],
            'Has Lv1 R3 SPD Neut': [lv1R3Spd],
            'Has Lv1 R3 DEF Neut': [lv1R3Def],
            'Has Lv1 R3 RES Neut': [lv1R3Res],

            'Has Lv1 R4 HP Neut': [lv1R4Hp],
            'Has Lv1 R4 ATK Neut': [lv1R4Atk],
            'Has Lv1 R4 SPD Neut': [lv1R4Spd],
            'Has Lv1 R4 DEF Neut': [lv1R4Def],
            'Has Lv1 R4 RES Neut': [lv1R4Res],

            'Has Lv1 R5 HP Neut': [lv1R5Hp],
            'Has Lv1 R5 ATK Neut': [lv1R5Atk],
            'Has Lv1 R5 SPD Neut': [lv1R5Spd],
            'Has Lv1 R5 DEF Neut': [lv1R5Def],
            'Has Lv1 R5 RES Neut': [lv1R5Res],

            'Has assist1': assist1,
            'Has assist1 default': assist1Default,
            'Has assist1 unlock': assist1Unlock,

            'Has assist2': assist2,
            'Has assist2 default': assist2Default,
            'Has assist2 unlock': assist2Unlock,

            'Has assist3': assist3,
            'Has assist3 default': assist3Default,
            'Has assist3 unlock': assist3Unlock,

            'Has passiveA1': passiveA1,
            'Has passiveA1 unlock': passiveA1Unlock,

            'Has passiveA2': passiveA2,
            'Has passiveA2 unlock': passiveA2Unlock,

            'Has passiveA3': passiveA3,
            'Has passiveA3 unlock': passiveA3Unlock,

            'Has passiveB1': passiveB1,
            'Has passiveB1 unlock': passiveB1Unlock,

            'Has passiveB2': passiveB2,
            'Has passiveB2 unlock': passiveB2Unlock,

            'Has passiveB3': passiveB3,
            'Has passiveB3 unlock': passiveB3Unlock,

            'Has passiveC1': passiveC1,
            'Has passiveC1 unlock': passiveC1Unlock,

            'Has passiveC2': passiveC2,
            'Has passiveC2 unlock': passiveC2Unlock,

            'Has passiveC3': passiveC3,
            'Has passiveC3 unlock': passiveC3Unlock,

            'Has special1': special1,
            'Has special1 default': special1Default,
            'Has special1 unlock': special1Unlock,

            'Has special2': special2,
            'Has special2 default': special2Default,
            'Has special2 unlock': special2Unlock,

            'Has special3': special3,
            'Has special3 default': special3Default,
            'Has special3 unlock': special3Unlock,

            'Has weapon1': weapon1,
            'Has weapon1 default': weapon1Default,
            'Has weapon1 unlock': weapon1Unlock,

            'Has weapon2': weapon2,
            'Has weapon2 default': weapon2Default,
            'Has weapon2 unlock': weapon2Unlock,

            'Has weapon3': weapon3,
            'Has weapon3 default': weapon3Default,
            'Has weapon3 unlock': weapon3Unlock,

            'Has weapon4': weapon4,
            'Has weapon4 default': weapon4Default,
            'Has weapon4 unlock': weapon4Unlock,
          }) => {
            // Compute the available rarities for this character.
            const availableRarities = [
              ...new Set([...RewardRarities, ...SummonRarities]),
            ].sort();

            const minRarity = availableRarities[0];
            const maxRarity = availableRarities[availableRarities.length - 1];

            const rarities =
              minRarity === undefined
                ? 'N/A'
                : minRarity === maxRarity
                  ? `${minRarity}`
                  : `${minRarity}-${maxRarity}`;

            // Convert the release date into expected format.
            const releaseDate = compose(
              timestamp =>
                timestamp === undefined
                  ? 'N/A'
                  : new Date(
                      parseInt(timestamp) * 1000,
                    ).toLocaleDateString('en-NA', {
                      timeZone: 'UTC',
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    }),
              path(['timestamp']),
              head,
            )(hasReleaseDate);

            // Reformat the hero's skills into a list.
            const passiveSkills = compose(
              map(([skill, unlock]) => ({
                name: head(skill),
                rarity: head(unlock) || '-',
              })),
              filter(compose(not, isNil, compose(head, head))),
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
                name: head(skillPageReference).fulltext,
                default: head(defaultRarity) || '-',
                rarity: head(unlockRarity) || '-',
              })),
              filter(compose(not, isNil, compose(head, head))),
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
                let lv1Stats;
                switch (rarity) {
                  case 1:
                    lv1Stats = {
                      hp: parseInt(lv1R1Hp),
                      atk: parseInt(lv1R1Atk),
                      spd: parseInt(lv1R1Spd),
                      def: parseInt(lv1R1Def),
                      res: parseInt(lv1R1Res),
                    };
                    break;
                  case 2:
                    lv1Stats = {
                      hp: parseInt(lv1R2Hp),
                      atk: parseInt(lv1R2Atk),
                      spd: parseInt(lv1R2Spd),
                      def: parseInt(lv1R2Def),
                      res: parseInt(lv1R2Res),
                    };
                    break;
                  case 3:
                    lv1Stats = {
                      hp: parseInt(lv1R3Hp),
                      atk: parseInt(lv1R3Atk),
                      spd: parseInt(lv1R3Spd),
                      def: parseInt(lv1R3Def),
                      res: parseInt(lv1R3Res),
                    };
                    break;
                  case 4:
                    lv1Stats = {
                      hp: parseInt(lv1R4Hp),
                      atk: parseInt(lv1R4Atk),
                      spd: parseInt(lv1R4Spd),
                      def: parseInt(lv1R4Def),
                      res: parseInt(lv1R4Res),
                    };
                    break;
                  case 5:
                    lv1Stats = {
                      hp: parseInt(lv1R5Hp),
                      atk: parseInt(lv1R5Atk),
                      spd: parseInt(lv1R5Spd),
                      def: parseInt(lv1R5Def),
                      res: parseInt(lv1R5Res),
                    };
                    break;
                }

                stats['1'][rarity] = lv1Stats;

                stats['40'][rarity] = {
                  hp: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp - 1,
                      hpGrowthPoints - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp,
                      hpGrowthPoints,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp + 1,
                      hpGrowthPoints + 1,
                    ),
                  ],
                  atk: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk - 1,
                      atkGrowthPoints - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk,
                      atkGrowthPoints,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk + 1,
                      atkGrowthPoints + 1,
                    ),
                  ],
                  spd: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd - 1,
                      spdGrowthPoints - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd,
                      spdGrowthPoints,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd + 1,
                      spdGrowthPoints + 1,
                    ),
                  ],
                  def: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def - 1,
                      defGrowthPoints - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def,
                      defGrowthPoints,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def + 1,
                      defGrowthPoints + 1,
                    ),
                  ],
                  res: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res - 1,
                      resGrowthPoints - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res,
                      resGrowthPoints,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res + 1,
                      resGrowthPoints + 1,
                    ),
                  ],
                };
              });
            }

            const name = head(HeroName) || '';

            return {
              name,
              title: head(Title),
              origin: head(Origin),
              weaponType: head(WeaponType),
              moveType: head(MoveType),
              rarities,
              releaseDate,
              assets: {
                portrait: {
                  '75px': `${CDN_HOST}/75px-Icon_Portrait_${name}.png`,
                  '113px': `${CDN_HOST}/113px-Icon_Portrait_${name}.png`,
                  '150px': `${CDN_HOST}/150px-Icon_Portrait_${name}.png`,
                },
              },
              skills,
              stats,
            };
          },
        ),
        extractPrintouts,
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
  const weapons = await fetchApiQuery({
    action: 'cargoquery',
    format: 'json',
    limit: API_LIMIT,
    tables: 'Weapons',
    fields: 'WeaponClass,WeaponName,Range,Cost,Effect,Might,Exclusive',
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
            Range,
            WeaponClass,
          }) => ({
            name: WeaponName,
            spCost: Number.parseInt(Cost, 10),
            'damage(mt)': Number.parseInt(Might, 10),
            'range(rng)': Number.parseInt(Range, 10),
            effect: sanitizeEffectString(Effect),
            'exclusive?': Boolean(Number.parseInt(Exclusive, 10))
              ? 'Yes'
              : 'No',
            type: 'WEAPON',
            weaponType: WeaponClass,
          }),
        ),
        extractCargoResults,
      ),
    )
    .catch(error => {
      console.error('failed to parse weapon skill stats', error);
    });

  const assists = await fetchApiQuery({
    action: 'cargoquery',
    format: 'json',
    limit: API_LIMIT,
    tables: 'Assists',
    fields:
      '_pageName=Name,Cost,Effect,Range,WeaponRestriction,MovementRestriction,PrerequisiteSkill,Exclusive,SkillTier,SkillBuildCost',
    group_by: '_pageName',
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
            Range,
          }) => {
            return {
              name: Name,
              range: Number.parseInt(Range, 10),
              effect: sanitizeEffectString(Effect),
              exclusive: Boolean(Number.parseInt(Exclusive, 10)),
              spCost: Number.parseInt(Cost, 10),
              movementRestriction: MovementRestriction.split(','),
              weaponRestriction: WeaponRestriction.split(','),
              type: 'ASSIST',
            };
          },
        ),
        extractCargoResults,
      ),
    )
    .catch(error => {
      console.error('failed to parse assist skill stats', error);
    });

  const specials = await fetchApiQuery({
    action: 'cargoquery',
    format: 'json',
    limit: API_LIMIT,
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
            effect: sanitizeEffectString(Effect || '-'),
            exclusive: Boolean(parseInt(Exclusive)),
            spCost: Number.parseInt(Cost, 10),
            movementRestriction: MovementRestriction.split(','),
            weaponRestriction: WeaponRestriction.split(','),
            type: 'SPECIAL',
          }),
        ),
        extractCargoResults,
      ),
    )
    .catch(error => {
      console.error('failed to parse special skill stats', error);
    });

  const passives = await fetchApiQuery({
    action: 'cargoquery',
    format: 'json',
    limit: API_LIMIT,
    tables: 'PassiveGroup,PassiveSingle',
    fields:
      'Name,Effect,SkillTier,SPCost,PassiveGroup.MovementRestriction=MovementRestriction,PassiveGroup.WeaponRestriction=WeaponRestriction,PassiveGroup.Exclusive=Exclusive,PassiveGroup.Ptype=Ptype',
    join_on: 'PassiveGroup._pageName = PassiveSingle._pageName',
    group_by: 'PassiveSingle.Name',
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
              effect: sanitizeEffectString(Effect),
              exclusive: Boolean(Number.parseInt(Exclusive, 10)),
              spCost: Number.parseInt(SPCost, 10),
              movementRestriction: MovementRestriction.split(','),
              weaponRestriction: WeaponRestriction.split(','),
              type: `PASSIVE_${Ptype}`,
            };
          },
        ),
        extractCargoResults,
      ),
    )
    .catch(error => {
      console.error('failed to parse passive skill stats', error);
    });

  const seals = await fetchApiQuery({
    action: 'cargoquery',
    format: 'json',
    limit: API_LIMIT,
    tables: 'PassiveGroup,PassiveSingle',
    fields:
      'Name,Effect,SkillTier,PassiveGroup.Seal=Seal,PassiveGroup.MovementRestriction=MovementRestriction,PassiveGroup.WeaponRestriction=WeaponRestriction',
    where: 'PassiveGroup.Seal="1"',
    join_on: 'PassiveGroup._pageName = PassiveSingle._pageName',
    group_by: 'PassiveSingle.Name',
  })
    .then(a => {
      console.log(a);
      return a;
    })
    .then(
      compose(
        filter(({ name }) => Boolean(name)),
        map(
          ({
            Name,
            Effect,
            SkillTier,
            MovementRestriction,
            WeaponRestriction,
          }) => ({
            name: Name,
            effect: sanitizeEffectString(Effect),
            // skillTier: Number.parseInt(SkillTier, 10),
            // movementRestriction: MovementRestriction.split(','),
            // weaponRestriction: WeaponRestriction.split(','),
            type: 'SEAL',
          }),
        ),
        extractCargoResults,
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

  // Infer weapon subtypes from the heroes that own them.
  const skillsV2 = skillsWithWeaponsTypes(heroes, skills);
  validate(heroes, skillsV2);

  // WRITE STATS TO FILE
  const allStats = { heroes, skills: skillsV2 };
  fs.writeFileSync('./stats.json', JSON.stringify(allStats, null, 2));
}

fetchWikiStats(true, true);
