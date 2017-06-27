// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-06-02T03:00:00-04:00');
const endTime = new Date('2017-06-09T02:59:00-04:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Camus',
    'name': 'Camus (Camus GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Gradivus',
        'rarity': '-',
      },
      {
        'name': 'Growing Thunder',
        'rarity': '-',
      },
      {
        'name': 'Grani\'s Shield',
        'rarity': '-',
      },
      {
        'name': 'Goad Cavalry',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Camus.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Camus.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Camus.png',
      },
    },
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
          'atk': [48],
          'spd': [33],
          'def': [31],
          'res': [17],
        },
      },
    },
  },
  {
    'shortName': 'Troubadour',
    'name': 'Troubadour (Camus GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Neutral Staff',
    'skills': [
      {
        'name': 'Fear',
        'rarity': '-',
      },
      {
        'name': 'Rehabilitate',
        'rarity': '-',
      },
      {
        'name': 'Miracle',
        'rarity': '-',
      },
      {
        'name': 'Wings of Mercy 3',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Troubador.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Troubador.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Troubador.png',
      },
    },
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
          'hp': [36],
          'atk': [32],
          'spd': [22],
          'def': [20],
          'res': [42],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Red Cavalier (Camus GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Red Tome',
    'skills': [
      {
        'name': 'Bolganone+',
        'rarity': '-',
      },
      {
        'name': 'Rally Attack',
        'rarity': '-',
      },
      {
        'name': 'Moonbow',
        'rarity': '-',
      },
      {
        'name': 'Darting Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Goad Cavalry',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Red Cavalier.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Red Cavalier.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Red Cavalier.png',
      },
    },
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
          'atk': [49],
          'spd': [26],
          'def': [17],
          'res': [35],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Axe Cavalier 1 (Camus GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Silver Axe+',
        'rarity': '-',
      },
      {
        'name': 'Rally Defense',
        'rarity': '-',
      },
      {
        'name': 'Grani\'s Shield',
        'rarity': '-',
      },
      {
        'name': 'Pass 3',
        'rarity': '-',
      },
      {
        'name': 'Ward Cavalry',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Axe Cavalier.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Axe Cavalier.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Axe Cavalier.png',
      },
    },
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
          'atk': [50],
          'spd': [25],
          'def': [26],
          'res': [30],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Axe Cavalier 2 (Camus GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Silver Axe+',
        'rarity': '-',
      },
      {
        'name': 'Rally Defense',
        'rarity': '-',
      },
      {
        'name': 'Grani\'s Shield',
        'rarity': '-',
      },
      {
        'name': 'Pass 3',
        'rarity': '-',
      },
      {
        'name': 'Ward Cavalry',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Axe Cavalier.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Axe Cavalier.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Axe Cavalier.png',
      },
    },
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
          'atk': [50],
          'spd': [25],
          'def': [26],
          'res': [30],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
