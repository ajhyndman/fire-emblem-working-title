// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-06-16T00:00:00-07:00');
const endTime = new Date('2017-06-21T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    shortName: 'Legion',
    name: 'Legion 1 (Legion GHB)',
    moveType: 'Infantry',
    weaponType: 'Green Axe',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: "Legion's Axe+",
        rarity: '-',
      },
      {
        name: 'Fury',
        rarity: '-',
      },
      {
        name: 'Seal Spd 3',
        rarity: '-',
      },
      {
        name: 'Savage Blow 3',
        rarity: '-',
      },
      {
        name: 'Aegis',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Legion.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Legion.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Legion.png',
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
          hp: [65],
          atk: [37],
          spd: [36],
          def: [26],
          res: [21],
        },
      },
    },
  },
  {
    shortName: 'Legion',
    name: 'Legion 2 (Legion GHB)',
    moveType: 'Infantry',
    weaponType: 'Green Axe',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: "Legion's Axe+",
        rarity: '-',
      },
      {
        name: 'Fury',
        rarity: '-',
      },
      {
        name: 'Axebreaker 3',
        rarity: '-',
      },
      {
        name: 'Hone Spd 3',
        rarity: '-',
      },
      {
        name: 'Reprisal',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Legion.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Legion.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Legion.png',
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
          hp: [65],
          atk: [37],
          spd: [36],
          def: [26],
          res: [21],
        },
      },
    },
  },
  {
    shortName: 'Red Mage',
    name: 'Red Mage (Legion GHB)',
    moveType: 'Infantry',
    weaponType: 'Red Tome',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Bolganone+',
        rarity: '-',
      },
      {
        name: 'Speed +3',
        rarity: '-',
      },
      {
        name: 'Swordbreaker 3',
        rarity: '-',
      },
      {
        name: 'Atk Ploy 3',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Red Mage.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Red Mage.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Red Mage.png',
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
          hp: [45],
          atk: [31],
          spd: [32],
          def: [20],
          res: [28],
        },
      },
    },
  },
  {
    shortName: 'Bow Fighter',
    name: 'Bow Fighter (Legion GHB)',
    moveType: 'Infantry',
    weaponType: 'Colorless Bow',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Brave Bow+',
        rarity: '-',
      },
      {
        name: 'Death Blow 3',
        rarity: '-',
      },
      {
        name: 'Guard 3',
        rarity: '-',
      },
      {
        name: 'Threaten Atk 3',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Bow Fighter.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Bow Fighter.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Bow Fighter.png',
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
          hp: [51],
          atk: [32],
          spd: [29],
          def: [29],
          res: [16],
        },
      },
    },
  },
  {
    shortName: 'Cavalier',
    name: 'Blue Cavalier (Legion GHB)',
    moveType: 'Cavalry',
    weaponType: 'Blue Tome',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Thoron+',
        rarity: '-',
      },
      {
        name: 'Warding Blow 3',
        rarity: '-',
      },
      {
        name: 'Lancebreaker 3',
        rarity: '-',
      },
      {
        name: 'Threaten Spd 3',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Blue Cavalier.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Blue Cavalier.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Blue Cavalier.png',
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
          hp: [40],
          atk: [36],
          spd: [26],
          def: [17],
          res: [35],
        },
      },
    },
  },
];

export default { unitList, startTime, endTime };
