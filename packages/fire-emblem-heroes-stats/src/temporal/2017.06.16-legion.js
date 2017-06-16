// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-06-16T00:00:00-07:00');
const endTime = new Date('2017-06-21T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Legion',
    'name': 'Legion 1 (Legion GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Legion\'s Axe+',
        'rarity': '-',
      },
      {
        'name': 'Fury',
        'rarity': '-',
      },
      {
        'name': 'Seal Spd 3',
        'rarity': '-',
      },
      {
        'name': 'Savage Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Aegis',
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
          'hp': [65],
          'atk': [37],
          'spd': [36],
          'def': [26],
          'res': [21],
        },
      },
    },
  },
  {
    'shortName': 'Legion',
    'name': 'Legion 2 (Legion GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Legion\'s Axe+',
        'rarity': '-',
      },
      {
        'name': 'Fury',
        'rarity': '-',
      },
      {
        'name': 'Axebreaker 3',
        'rarity': '-',
      },
      {
        'name': 'Hone Spd 3',
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
          'hp': [65],
          'atk': [37],
          'spd': [36],
          'def': [26],
          'res': [21],
        },
      },
    },
  },
  {
    'shortName': 'Red Mage',
    'name': 'Red Mage (Legion GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Red Tome',
    'skills': [
      {
        'name': 'Bolganone+',
        'rarity': '-',
      },
      {
        'name': 'Speed +3',
        'rarity': '-',
      },
      {
        'name': 'Swordbreaker 3',
        'rarity': '-',
      },
      {
        'name': 'Atk Ploy 3',
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
    'shortName': 'Bow Fighter',
    'name': 'Bow Fighter (Legion GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Bow',
    'skills': [
      {
        'name': 'Brave Bow+',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Guard 3',
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
          'hp': [51],
          'atk': [32],
          'spd': [29],
          'def': [29],
          'res': [16],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Blue Cavalier (Legion GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Thoron+',
        'rarity': '-',
      },
      {
        'name': 'Warding Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Lancebreaker 3',
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
          'hp': [40],
          'atk': [36],
          'spd': [26],
          'def': [17],
          'res': [35],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
