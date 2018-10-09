import fs from 'fs';
import {
  compose,
  concat,
  dissoc,
  equals,
  filter,
  groupBy,
  indexBy,
  map,
  not,
  pick,
  prop,
  range,
  reject,
  replace,
  sort,
  sortBy,
  trim,
  without,
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

const formatImageName = compose(
  replace(/\'/g, ''),
  replace(/\"/g, ''),
  replace(/\:/g, ''),
);

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

  const heroWeapons = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: [
      'Heroes',
      'HeroWeapons',
      'Weapons',
    ].join(','),
    fields: [
      'Heroes._pageName=HeroFullName',
      'HeroWeapons.skill',
      'HeroWeapons.skillPos',
      'HeroWeapons.unlockRarity',
      'HeroWeapons.defaultRarity',
    ].join(','),
    join_on: [
      'Heroes._pageName = HeroWeapons._pageName',
      'HeroWeapons.skill = Weapons._pageName',
    ].join(',')
  }).then(
      compose(
          map(
              compose(
                  sortBy(prop("skillPos")),
                  map(
                      dissoc("HeroFullName"),
                  ),
              ),
          ),
          groupBy(
              (weapon) => weapon.HeroFullName
          ),
      ),
  ).catch(error => {
    console.error('failed to parse hero weapons', error);
  });

  const heroAssists = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: [
      'Heroes',
      'HeroAssists',
      'Assists',
    ].join(','),
    fields: [
      'Heroes._pageName=HeroFullName',
      'HeroAssists.skill',
      'HeroAssists.skillPos',
      'HeroAssists.unlockRarity',
      'HeroAssists.defaultRarity',
    ].join(','),
    join_on: [
      'Heroes._pageName = HeroAssists._pageName',
      'HeroAssists.skill = Assists._pageName',
    ].join(',')
  }).then(
      compose(
          map(
              compose(
                  sortBy(prop("skillPos")),
                  map(
                      dissoc("HeroFullName"),
                  ),
                  reject(
                      (assist) => assist.skill === ""
                  ),
              ),
          ),
          groupBy(
              (assist) => assist.HeroFullName
          ),
      ),
  ).catch(error => {
    console.error('failed to parse hero assists', error);
  });

  const heroSpecials = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: [
      'Heroes',
      'HeroSpecials',
      'Specials',
    ].join(','),
    fields: [
      'Heroes._pageName=HeroFullName',
      'HeroSpecials.skill',
      'HeroSpecials.skillPos',
      'HeroSpecials.unlockRarity',
      'HeroSpecials.defaultRarity',
    ].join(','),
    join_on: [
      'Heroes._pageName = HeroSpecials._pageName',
      'HeroSpecials.skill = Specials._pageName',
    ].join(',')
  }).then(
      compose(
          map(
              compose(
                  sortBy(prop("skillPos")),
                  map(
                      dissoc("HeroFullName"),
                  ),
                  reject(
                      (special) => special.skill === ""
                  ),
              ),
          ),
          groupBy(
              (special) => special.HeroFullName
          ),
      ),
  ).catch(error => {
    console.error('failed to parse hero specials', error);
  });

  const heroPassives = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: [
      'Heroes',
      'HeroPassives',
      'PassiveSingle',
      'PassiveGroup',
    ].join(','),
    fields: [
      'Heroes._pageName=HeroFullName',
      'HeroPassives.skill',
      'HeroPassives.skillPos',
      'HeroPassives.unlockRarity',
      'PassiveGroup.Ptype',
    ].join(','),
    join_on: [
      'Heroes._pageName = HeroPassives._pageName',
      'HeroPassives.skill = PassiveSingle.Name',
      'PassiveSingle._pageName = PassiveGroup._pageName',
    ].join(',')
  }).then(
      compose(
          map(
              compose(
                  sort((lhs, rhs) => {
                    if (lhs.Ptype < rhs.Ptype) {
                      return -1;
                    } else if (lhs.Ptype > rhs.Ptype) {
                      return 1;
                    } else {
                      if (lhs.skillPos < rhs.skillPos) {
                        return -1;
                      } else if (lhs.skillPos > rhs.skillPos) {
                        return 1;
                      } else {
                        return 0;
                      }
                    }
                  }),
                  map(
                    dissoc("HeroFullName"),
                  ),
              ),
          ),
          groupBy(
              (passive) => passive.HeroFullName
          ),
      ),
  ).catch(error => {
    console.error('failed to parse hero passives', error);
  });

  const heroes = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: [
      'Heroes',
      'HeroBaseStats',
      'HeroGrowths',
    ].join(','),
    fields: [
      'Heroes._pageName=FullName',
      'Name',
      'Title',
      'Origin',
      'WeaponType',
      'MoveType',
      'SummonRarities',
      'RewardRarities',
      'ReleaseDate',
      'PoolDate',
      'HeroGrowths.HP',
      'HeroGrowths.Atk',
      'HeroGrowths.Spd',
      'HeroGrowths.Def',
      'HeroGrowths.Res',
    ].join(','),
    group_by: 'Heroes._pageName',
    join_on: [
      'HeroBaseStats._pageName = Heroes._pageName',
      'Heroes._pageName = HeroGrowths._pageName',
    ].join(','),
  })
    .then(
      compose(
        map(
          ({
            FullName,
            Name,
            Title,
            Origin,
            WeaponType,
            MoveType,
            RewardRarities,
            SummonRarities,
            ReleaseDate,
            PoolDate,

            HP: hpGrowths,
            Atk: atkGrowths,
            Spd: spdGrowths,
            Def: defGrowths,
            Res: resGrowths,
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

            const passiveSkills = map((passive) => ({
              name: passive.skill,
              rarity: Number.parseInt(passive.unlockRarity, 10) || '-',
            }))(heroPassives[FullName]);

            const otherSkills = map((otherSkill) => ({
              name: otherSkill.skill,
              default: Number.parseInt(otherSkill.defaultRarity, 10) || '-',
              rarity: Number.parseInt(otherSkill.unlockRarity, 10) || '-',
            }))(concat(concat(heroWeapons[FullName], heroAssists[FullName]), heroSpecials[FullName], []));

            const skills = [...otherSkills, ...passiveSkills];

            const growths = {
              hp: Number.parseInt(hpGrowths, 10),
              atk: Number.parseInt(atkGrowths, 10),
              spd: Number.parseInt(spdGrowths, 10),
              def: Number.parseInt(defGrowths, 10),
              res: Number.parseInt(resGrowths, 10),
            };

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
                )(heroBaseStatsByNameAndRarity[`${FullName}-${rarity}`]);

                stats['40'][rarity] = {
                  hp: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp - 1,
                      Number.parseInt(hpGrowths, 10) / 5 - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp,
                      Number.parseInt(hpGrowths, 10) / 5,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].hp + 1,
                      Number.parseInt(hpGrowths, 10) / 5 + 1,
                    ),
                  ],
                  atk: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk - 1,
                      Number.parseInt(atkGrowths, 10) / 5 - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk,
                      Number.parseInt(atkGrowths, 10) / 5,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].atk + 1,
                      Number.parseInt(atkGrowths, 10) / 5 + 1,
                    ),
                  ],
                  spd: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd - 1,
                      Number.parseInt(spdGrowths, 10) / 5 - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd,
                      Number.parseInt(spdGrowths, 10) / 5,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].spd + 1,
                      Number.parseInt(spdGrowths, 10) / 5 + 1,
                    ),
                  ],
                  def: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def - 1,
                      Number.parseInt(defGrowths, 10) / 5 - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def,
                      Number.parseInt(defGrowths, 10) / 5,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].def + 1,
                      Number.parseInt(defGrowths, 10) / 5 + 1,
                    ),
                  ],
                  res: [
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res - 1,
                      Number.parseInt(resGrowths, 10) / 5 - 1,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res,
                      Number.parseInt(resGrowths, 10) / 5,
                    ),
                    baseStatToMaxStat(
                      rarity,
                      stats['1'][rarity].res + 1,
                      Number.parseInt(resGrowths, 10) / 5 + 1,
                    ),
                  ],
                };
              });
            }

            const fullName = sanitizeDescription(FullName);

            const imageName = formatImageName(fullName);

            return {
              name: fullName,
              shortName: Name,
              title: sanitizeDescription(Title),
              origin: Origin,
              weaponType: WeaponType,
              moveType: MoveType,
              rarities,
              releaseDate,
              poolDate,
              assets: {
                portrait: {
                  '75px': `${CDN_HOST}/75px-Icon_Portrait_${imageName}.png`,
                  '113px': `${CDN_HOST}/113px-Icon_Portrait_${imageName}.png`,
                  '150px': `${CDN_HOST}/150px-Icon_Portrait_${imageName}.png`,
                },
              },
              skills,
              growths,
              stats,
            };
          },
        ),
      ),
    )
    .catch(error => {
      console.error('failed to parse hero stats', error);
    });

  return heroes;
}

// Fetches detailed info for all skills
async function fetchSkills() {
  const weapons = await fetchApiRows({
    action: 'cargoquery',
    format: 'json',
    tables: 'Weapons',
    fields: [
      'WeaponName',
      'Cost',
      'Effect',
      'Exclusive',
      'Might',
      'WeaponClass',
      'WeaponRange',
    ].join(','),
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
            WeaponClass,
            WeaponRange,
          }) => ({
            name: WeaponName,
            spCost: Number.parseInt(Cost, 10),
            'damage(mt)': Number.parseInt(Might, 10),
            'range(rng)': Number.parseInt(WeaponRange, 10),
            effect: sanitizeDescription(Effect),
            exclusive: Boolean(Number.parseInt(Exclusive, 10)),
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
    fields: [
      'Name',
      'Cost',
      'Effect',
      'AssistRange',
      'CanUseWeapon',
      'CanUseMove',
      'Exclusive',
      'SkillBuildCost',
    ].join(','),
    group_by: 'Name',
  })
    .then(
      compose(
        map(
          ({
            Name,
            Cost,
            Effect,
            CanUseMove,
            CanUseWeapon,
            Exclusive,
            AssistRange,
          }) => {
            return {
              name: Name,
              range: Number.parseInt(AssistRange, 10),
              effect: sanitizeDescription(Effect),
              exclusive: Boolean(Number.parseInt(Exclusive, 10)),
              spCost: Number.parseInt(Cost, 10),
              movementRestriction: CanUseMove.split(','),
              weaponRestriction: CanUseWeapon.split(','),
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
    fields: [
      'Name',
      'Cost',
      'Cooldown',
      'Effect',
      'CanUseWeapon',
      'CanUseMove',
      'Exclusive',
    ].join(','),
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
            CanUseMove,
            CanUseWeapon,
          }) => ({
            name: Name,
            cooldown: Number.parseInt(Cooldown, 10),
            effect: sanitizeDescription(Effect || '-'),
            exclusive: Boolean(parseInt(Exclusive)),
            spCost: Number.parseInt(Cost, 10),
            movementRestriction: CanUseMove.split(',  '),
            weaponRestriction: CanUseWeapon.split(',  '),
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
    fields: [
      'PassiveSingle.Name=Name',
      'Effect',
      'SPCost',
      'PassiveGroup.CanUseMove=CanUseMove',
      'PassiveGroup.CanUseWeapon=CanUseWeapon',
      'PassiveGroup.Exclusive=Exclusive',
      'PassiveGroup.Ptype=Ptype',
    ].join(','),
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
            CanUseMove,
            CanUseWeapon,
            Ptype,
          }) => {
            // Don't include passives that are only available as seals, here.
            if (Ptype === 'S') return {};

            return {
              name: Name,
              effect: sanitizeDescription(Effect),
              exclusive: Boolean(Number.parseInt(Exclusive, 10)),
              spCost: Number.parseInt(SPCost, 10),
              movementRestriction: CanUseMove.split(','),
              weaponRestriction: CanUseWeapon.split(','),
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
    fields: [
      'PassiveSingle.Name=Name',
      'SPCost',
      'Effect',
      'PassiveGroup.Seal=Seal',
      'PassiveGroup.CanUseMove=CanUseMove',
      'PassiveGroup.CanUseWeapon=CanUseWeapon',
    ].join(','),
    where: 'PassiveGroup.Seal="1"',
    join_on: 'PassiveGroup._pageName = PassiveSingle._pageName',
    group_by: 'Name',
  })
    .then(
      compose(
        filter(({ name }) => Boolean(name)),
        map(
          ({
            Name,
            SPCost,
            Effect,
            CanUseMove,
            CanUseWeapon,
          }) => ({
            name: Name,
            effect: sanitizeDescription(Effect),
            spCost: Number.parseInt(SPCost, 10),
            movementRestriction: CanUseMove.split(','),
            weaponRestriction: CanUseWeapon.split(','),
            type: 'SEAL',
          }),
        ),
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
