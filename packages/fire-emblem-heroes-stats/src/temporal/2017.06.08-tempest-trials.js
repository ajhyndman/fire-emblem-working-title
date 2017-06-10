// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-06-09T00:00:00-07:00');
const endTime = new Date('2017-06-15T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Veronica',
    'name': 'Veronica (Tempest Trials)',
    'moveType': 'Infantry',
    'weaponType': 'Green Tome',
    'skills': [
      {
        'name': 'Élivágar',
        'rarity': '-',
      },
      {
        'name': 'Bonfire',
        'rarity': '-',
      },
      {
        'name': 'Fury 3',
        'rarity': '-',
      },
      {
        'name': 'Renewal 3',
        'rarity': '-',
      },
      {
        'name': 'Savage Blow 3',
        'rarity': '-',
      },
      {
        'name': 'Quickened Pulse',
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
          'hp': [63],
          'atk': [40],
          'spd': [29],
          'def': [33],
          'res': [26],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
