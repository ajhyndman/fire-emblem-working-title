// @flow
import type { Hero } from 'fire-emblem-heroes-stats';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-04-20T00:00:00-07:00');
const endTime = new Date('2017-04-19T23:59:00-07:00');

// TODO: confirm end date and stats/skills for other characters.
const unitList: Array<Hero> = [
  {
    'shortName': 'Zephiel',
    'name': 'Zephiel (Grand Hero Battle)',
    'moveType': 'Armored',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Eckesachs',
        'rarity': '-',
      },
      {
        'name': 'Life and Death 3',
        'rarity': '-',
      },
      {
        'name': 'Wary Fighter 3',
        'rarity': '-',
      },
      {
        'name': 'Reprisal',
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
          'hp': [78],
          'atk': [57-5-16], // Undo Life and death / Weapon
          'spd': [21-5],
          'def': [34+5],
          'res': [20+5],
        },
      },
    },
  },
  {
    'shortName': 'Knight',
    'name': 'Axe Knight',
    'moveType': 'Armored',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Iron Axe',
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
          'hp': [40],
          'atk': [30],
          'spd': [30],
          'def': [20],
          'res': [20],
        },
      },
    },
  },
  {
    'shortName': 'Knight',
    'name': 'Lance Knight',
    'moveType': 'Armored',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Iron Lance',
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
          'hp': [40],
          'atk': [30],
          'spd': [30],
          'def': [20],
          'res': [20],
        },
      },
    },
  },
  {
    'shortName': 'B Cavalier',
    'name': 'Blue Cavalier',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Thunder',
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
          'hp': [40],
          'atk': [30],
          'spd': [30],
          'def': [20],
          'res': [20],
        },
      },
    },
  },
  {
    'shortName': 'R Cavalier',
    'name': 'Red Cavalier',
    'moveType': 'Cavalry',
    'weaponType': 'Red Tome',
    'skills': [
      {
        'name': 'Fire',
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
          'hp': [40],
          'atk': [30],
          'spd': [30],
          'def': [20],
          'res': [20],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
