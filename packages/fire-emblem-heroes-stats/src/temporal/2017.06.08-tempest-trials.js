// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-06-08T17:00:00+10:00');
const endTime = new Date('2017-06-22T16:59:00+10:00');

const unitList: Array<Hero> = [
  {
    shortName: 'Veronica',
    name: 'Veronica (Tempest Trials)',
    moveType: 'Infantry',
    weaponType: 'Green Tome',
    skills: [
      {
        name: 'Élivágar',
        rarity: '-',
      },
      {
        name: 'Bonfire',
        rarity: '-',
      },
      {
        name: 'Fury 3',
        rarity: '-',
      },
      {
        name: 'Renewal 3',
        rarity: '-',
      },
      {
        name: 'Savage Blow 3',
        rarity: '-',
      },
      {
        name: 'Quickened Pulse',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Veronica.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Veronica.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Veronica.png',
      },
    },
    stats: {
      '1': {
        '5': {
          hp: '-',
          atk: '-',
          spd: '-',
          def: '-',
          res: '-',
        },
      },
      '40': {
        '5': {
          hp: [66],
          atk: [40],
          spd: [29],
          def: [33],
          res: [26],
        },
      },
    },
  },
];

export default { unitList, startTime, endTime };
