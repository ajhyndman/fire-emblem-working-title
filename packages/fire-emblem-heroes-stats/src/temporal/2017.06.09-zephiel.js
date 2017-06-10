// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-06-09T00:00:00-07:00');
const endTime = new Date('2017-06-15T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Blue Mage',
    'name': 'Blue Mage (Zephiel GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Thoron+',
        'rarity': '-',
      },
      {
        'name': 'Armored Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Seal Atk 3',
        'rarity': '-',
      },
      {
        'name': 'Breath of Life 3',
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
    'shortName': 'Knight',
    'name': 'Axe Knight (Zephiel GHB)',
    'moveType': 'Armored',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Brave Axe+',
        'rarity': '-',
      },
      {
        'name': 'Sol',
        'rarity': '-',
      },
      {
        'name': 'Swap',
        'rarity': '-',
      },
      {
        'name': 'Wary Fighter 3',
        'rarity': '-',
      },
      {
        'name': 'Fortify Res 3',
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
          'hp': [67],
          'atk': [39],
          'spd': [16],
          'def': [41],
          'res': [19],
        },
      },
    },
  },
  {
    'shortName': 'Zephiel',
    'name': 'Zephiel (Zephiel GHB)',
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
    'name': 'Lance Knight (Zephiel GHB)',
    'moveType': 'Armored',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Brave Lance+',
        'rarity': '-',
      },
      {
        'name': 'Sol',
        'rarity': '-',
      },
      {
        'name': 'Swap',
        'rarity': '-',
      },
      {
        'name': 'Wary Fighter 3',
        'rarity': '-',
      },
      {
        'name': 'Fortify Res 3',
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
          'hp': [67],
          'atk': [39],
          'spd': [16],
          'def': [41],
          'res': [19],
        },
      },
    },
  },
  {
    'shortName': 'Red Mage',
    'name': 'Red Mage (Zephiel GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Red Tome',
    'skills': [
      {
        'name': 'Bolganone+',
        'rarity': '-',
      },
      {
        'name': 'Armored Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Seal Atk 3',
        'rarity': '-',
      },
      {
        'name': 'Breath of Life 3',
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
];

export default {unitList, startTime, endTime};
