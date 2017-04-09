// @flow
import type { Hero } from 'fire-emblem-heroes-stats';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-04-04T00:00:00-07:00');
const endTime = new Date('2017-04-08T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'name': 'Navarre',
    'moveType': 'Infantry',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Killing Edge+',
        'rarity': '-',
      },
      {
        'name': 'Blazing Wind',
        'rarity': '-',
      },
      {
        'name': 'Desperation 3',
        'rarity': '-',
      },
      {
        'name': 'Threaten Spd 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [58],
          'atk': [31],
          'spd': [39],
          'def': [24],
          'res': [25],
        },
      },
    },
  },
  {
    'name': 'Thief',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Shuriken',
    'skills': [
      {
        'name': 'Silver Dagger+',
        'rarity': '-',
      },
      {
        'name': 'Moonbow',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Poison Strike 3',
        'rarity': '-',
      },
      {
        'name': 'Hone Atk 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [44],
          'atk': [28],
          'spd': [39],
          'def': [14],
          'res': [32],
        },
      },
    },
  },
  {
    'name': 'Thief',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Shuriken',
    'skills': [
      {
        'name': 'Rogue Dagger+',
        'rarity': '-',
      },
      {
        'name': 'Moonbow',
        'rarity': '-',
      },
      {
        'name': 'Armored Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Bowbreaker 3',
        'rarity': '-',
      },
      {
        'name': 'Hone Spd 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [44],
          'atk': [28],
          'spd': [39],
          'def': [14],
          'res': [32],
        },
      },
    },
  },
  {
    'shortName': 'Fighter',
    'name': 'Axe Fighter',
    'moveType': 'Infantry',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Hammer+',
        'rarity': '-',
      },
      {
        'name': 'Ardent Sacrifice',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Obstruct 3',
        'rarity': '-',
      },
      {
        'name': 'Spur Spd 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [52],
          'atk': [31],
          'spd': [31],
          'def': [30],
          'res': [23],
        },
      },
    },
  },
  {
    'name': 'Cleric',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Staff',
    'skills': [
      {
        'name': 'Panic',
        'rarity': '-',
      },
      {
        'name': 'Physic',
        'rarity': '-',
      },
      {
        'name': 'Solid Earth Balm',
        'rarity': '-',
      },
      {
        'name': 'Live to Serve 3',
        'rarity': '-',
      },
      {
        'name': 'Fortify Def 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [42],
          'atk': [28],
          'spd': [28],
          'def': [24],
          'res': [36],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
