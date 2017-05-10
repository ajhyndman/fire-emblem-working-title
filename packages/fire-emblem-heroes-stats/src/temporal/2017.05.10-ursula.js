// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-05-10T17:00:00+10:00');
const endTime = new Date('2017-05-17T16:59:00+10:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Ursula',
    'name': 'Ursula (Ursula GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Blárwolf+',
        'rarity': '-',
      },
      {
        'name': 'Growing Thunder',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Threaten Res 3',
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
          'hp': [50],
          'atk': [29],
          'spd': [32],
          'def': [19],
          'res': [30],
        },
      },
    },
  },
  {
    'shortName': 'Knight',
    'name': 'Axe Knight (Ursula GHB)',
    'moveType': 'Armored',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Silver Axe+',
        'rarity': '-',
      },
      {
        'name': 'Aegis',
        'rarity': '-',
      },
      {
        'name': 'Wings of Mercy 3',
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
    'shortName': 'Cavalier',
    'name': 'Sword Cavalier (Ursula GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Silver Sword+',
        'rarity': '-',
      },
      {
        'name': 'Draw Back',
        'rarity': '-',
      },
      {
        'name': 'Aegis',
        'rarity': '-',
      },
      {
        'name': 'Obstruct 3',
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
    'shortName': 'Thief 1',
    'name': 'Thief 1 (Ursula GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Shuriken',
    'skills': [
      {
        'name': 'Poison Dagger+',
        'rarity': '-',
      },
      {
        'name': 'Reciprocal Aid',
        'rarity': '-',
      },
      {
        'name': 'Seal Atk 3',
        'rarity': '-',
      },
      {
        'name': 'Savage Blow 3',
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
    'shortName': 'Thief 2',
    'name': 'Thief 2 (Ursula GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Shuriken',
    'skills': [
      {
        'name': 'Poison Dagger+',
        'rarity': '-',
      },
      {
        'name': 'Reciprocal Aid',
        'rarity': '-',
      },
      {
        'name': 'Escape Route 3',
        'rarity': '-',
      },
      {
        'name': 'Savage Blow 3',
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
];

export default {unitList, startTime, endTime};
