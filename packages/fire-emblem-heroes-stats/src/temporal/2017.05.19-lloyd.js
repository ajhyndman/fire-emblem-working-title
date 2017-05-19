// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-05-18T00:00:00-07:00');
// Actual end time is unknown.
const endTime = new Date('2017-05-22T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Lloyd',
    'name': 'Lloyd (Lloyd GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Regal Blade',
        'rarity': '-',
      },
      {
        'name': 'Iceberg',
        'rarity': '-',
      },
      {
        'name': 'Pass 3',
        'rarity': '-',
      },
      {
        'name': 'Threaten Atk 3',
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
          'hp': [57],
          'atk': [32],
          'spd': [36],
          'def': [20],
          'res': [30],
        },
      },
    },
  },
  {
    'shortName': 'Flier',
    'name': 'Axe Flier (Lloyd GHB)',
    'moveType': 'Flying',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Silver Axe+',
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
          'hp': [45],
          'atk': [28],
          'spd': [36],
          'def': [22],
          'res': [37],
        },
      },
    },
  },
  {
    'shortName': 'Blue Mage',
    'name': 'Blue Mage (Lloyd GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Thoron+',
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
          'hp': [45],
          'atk': [31],
          'spd': [32],
          'def': [20],
          'res': [28],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Lance Cavalier (Lloyd GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Silver Lance+',
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
          'hp': [49],
          'atk': [35],
          'spd': [25],
          'def': [26],
          'res': [30],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Bow Cavalier (Lloyd GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Neutral Bow',
    'skills': [
      {
        'name': 'Silver Bow+',
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
          'hp': [48],
          'atk': [36],
          'spd': [23],
          'def': [25],
          'res': [24],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
