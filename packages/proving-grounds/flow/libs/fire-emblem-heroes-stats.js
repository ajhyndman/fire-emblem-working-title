/**
 * This file provides type definitions for use with the Flow type checker.
 *
 * @flow
 */

declare module 'fire-emblem-heroes-stats' {
  declare type MoveType =
    | 'Armored'
    | 'Cavalry'
    | 'Flying'
    | 'Infantry';

  declare type WeaponType =
    | 'Blue Lance'
    | 'Blue Tome'
    | 'Blue Beast'
    | 'Green Axe'
    | 'Green Tome'
    | 'Green Beast'
    | 'Red Sword'
    | 'Red Tome'
    | 'Red Beast'
    | 'Neutral Bow'
    | 'Neutral Shuriken'
    | 'Neutral Staff';

  declare type StatValue = number | '-';

  declare type SingleValueStats = {
    +hp: StatValue;
    +atk: StatValue;
    +spd: StatValue;
    +def: StatValue;
    +res: StatValue;
  };

  declare type MultiValueStats = {
    +hp: Array<StatValue>;
    +atk: Array<StatValue>;
    +spd: Array<StatValue>;
    +def: Array<StatValue>;
    +res: Array<StatValue>;
  };

  declare type Level1Stats = {
    +'1'?: SingleValueStats;
    +'2'?: SingleValueStats;
    +'3'?: SingleValueStats;
    +'4'?: SingleValueStats;
    +'5'?: SingleValueStats;
  };

  declare type Level40Stats = {
    +'1'?: MultiValueStats;
    +'2'?: MultiValueStats;
    +'3'?: MultiValueStats;
    +'4'?: MultiValueStats;
    +'5'?: MultiValueStats;
  };

  declare type StatsByLevel = {
    +'1': Level1Stats;
    +'40': Level40Stats;
  };

  declare type Hero = {
    +name: string;
    +shortName?: string;
    +moveType: MoveType;
    +weaponType: WeaponType;
    +total?: number;
    +stats: StatsByLevel;
    +skills: Array<{
      +name: string;
      +default?: ?number;
      +rarity: ?number | '-';
    }>;
  };

  declare type SkillType =
    | 'WEAPON'
    | 'ASSIST'
    | 'SPECIAL'
    | 'PASSIVE_A'
    | 'PASSIVE_B'
    | 'PASSIVE_C';

  declare type WeaponSkill = {
    +type: 'WEAPON';
    +name: string;
    +cost: string;
    +'damage(mt)': number;
    +'range(rng)': number;
    +effect: string;
    // Hero is Red Beast, weapon is Breath
    +weaponType: WeaponType | 'Breath';
    +'exclusive?': 'Yes' | 'No';
  };

  declare type AssistSkill = {
    +type: 'ASSIST';
    +name: string;
    +range: number;
    +effect: string;
    +spCost: number;
    +inheritRestriction: string;
  };

  declare type SpecialSkill = {
    +type: 'SPECIAL';
    +name: string;
    +cooldown: number;
    +effect: string;
    +spCost: number;
    // The wiki no longer has trigger/target fields, but we likely want these in he future.
    // +trigger: 'Assist (Staff)' | 'Attack' | 'Enemy Attack';
    // +target: 'Ally' | 'Allies' | 'Enemies' | 'Self';
    +inheritRestriction: string;
  };

  declare type PassiveSkill = {
    +type: 'PASSIVE_A' | 'PASSIVE_B' | 'PASSIVE_C';
    +name: string;
    +effect: string;
    +spCost: number;
    +inheritRestriction: string;
  };

  declare type Skill =
    | WeaponSkill
    | AssistSkill
    | SpecialSkill
    | PassiveSkill;

  declare type Stats = {
    +heroes: Hero[];
    +grand_battle_heroes: Hero[];
    +skills: Skill[];
  };

  declare module.exports: Stats;
}
