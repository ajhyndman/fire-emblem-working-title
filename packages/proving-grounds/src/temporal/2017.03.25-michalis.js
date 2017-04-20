// @flow
import type { Hero } from 'fire-emblem-heroes-stats';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-03-24T00:00:00-07:00');
const endTime = new Date('2017-03-27T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Flier',
    'name': 'Lance Flier (Michalis GHB)',
    'moveType': 'Flying',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Silver Lance+',
        'rarity': '-',
      },
      {
        'name': 'Iceberg',
        'rarity': '-',
      },
      {
        'name': 'Darting Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Drag Back',
        'rarity': '-',
      },
      {
        'name': 'Fortify Fliers',
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
    'shortName': 'Michalis',
    'name': 'Michalis (Michalis GHB)',
    'moveType': 'Flying',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Hauteclere',
        'rarity': '-',
      },
      {
        'name': 'Blazing Thunder',
        'rarity': '-',
      },
      {
        'name': 'Iote\'s Shield',
        'rarity': '-',
      },
      {
        'name': 'Threaten Def 3',
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
          'hp': [60],
          'atk': [35],
          'spd': [27],
          'def': [36],
          'res': [19],
        },
      },
    },
  },
  {
    'shortName': 'Flier',
    'name': 'Sword Flier (Michalis GHB)',
    'moveType': 'Flying',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Silver Sword+',
        'rarity': '-',
      },
      {
        'name': 'Iceberg',
        'rarity': '-',
      },
      {
        'name': 'Darting Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Drag Back',
        'rarity': '-',
      },
      {
        'name': 'Hone Fliers',
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
    'shortName': 'Cavalier',
    'name': 'Sword Cavalier (Michalis GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Silver Sword+',
        'rarity': '-',
      },
      {
        'name': 'Draconic Aura',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Bowbreaker 3',
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
    'shortName': 'Fighter',
    'name': 'Lance Fighter (Michalis GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Heavy Spear+',
        'rarity': '-',
      },
      {
        'name': 'Draconic Aura',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Bowbreaker 3',
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
          'atk': [28],
          'spd': [31],
          'def': [30],
          'res': [23],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
