// @flow
import type { Hero } from '..';

// TODO: correct end time, xander special, skills, and cavalier stats
// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-05-02T00:00:00-07:00');
const endTime = new Date('2017-05-05T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Xander',
    'name': 'Xander (Xander GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Siegfried',
        'rarity': '-',
      },
      {
        'name': 'Armored Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Spur Def 3',
        'rarity': '-',
      },
      {
        'name': 'Rising Light',
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
          'hp': [61],
          'atk': [48-16],
          'spd': [25],
          'def': [38],
          'res': [17],
        },
      },
    },
  },
  {
    'shortName': 'Cleric',
    'name': 'Cleric (Xander GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Staff',
    'skills': [
      {
        'name': 'Gravity',
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
  {
    'shortName': 'Cavalier',
    'name': 'Green Cavalier (Xander GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Green Tome',
    'skills': [
      {
        'name': 'Rexcalibur+',
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
          'atk': [36],
          'spd': [26],
          'def': [17],
          'res': [35],
        },
      },
    },
  },
  {
    'shortName': 'Fighter',
    'name': 'Lance Fighter (Xander GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Killer Lance+',
        'rarity': '-',
      },
      {
        'name': 'Ignis',
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
    'shortName': 'Fighter',
    'name': 'Sword Fighter (Xander GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Killing Edge+',
        'rarity': '-',
      },
      {
        'name': 'Ignis',
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
];

export default {unitList, startTime, endTime};
