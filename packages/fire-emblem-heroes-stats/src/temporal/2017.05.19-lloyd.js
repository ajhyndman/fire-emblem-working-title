// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
const startTime = new Date('2017-05-19T00:00:00-07:00');
const endTime = new Date('2017-05-25T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    shortName: 'Lloyd',
    name: 'Lloyd (Lloyd GHB)',
    moveType: 'Infantry',
    weaponType: 'Red Sword',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Regal Blade',
        rarity: '-',
      },
      {
        name: 'Iceberg',
        rarity: '-',
      },
      {
        name: 'Pass 3',
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
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Lloyd.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Lloyd.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Lloyd.png',
      },
    },
    growthPoints: {
      hp: 0,
      atk: 0,
      spd: 0,
      def: 0,
      res: 0,
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
          hp: [57],
          atk: [32],
          spd: [36],
          def: [20],
          res: [30],
        },
      },
    },
  },
  {
    shortName: 'Flier',
    name: 'Axe Flier (Lloyd GHB)',
    moveType: 'Flying',
    weaponType: 'Green Axe',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Silver Axe+',
        rarity: '-',
      },
      {
        name: 'Life and Death 3',
        rarity: '-',
      },
      {
        name: 'Lunge',
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
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Axe Flier.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Axe Flier.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Axe Flier.png',
      },
    },
    growthPoints: {
      hp: 0,
      atk: 0,
      spd: 0,
      def: 0,
      res: 0,
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
          atk: [28],
          spd: [36],
          def: [22],
          res: [37],
        },
      },
    },
  },
  {
    shortName: 'Cavalier',
    name: 'Lance Cavalier (Lloyd GHB)',
    moveType: 'Cavalry',
    weaponType: 'Blue Lance',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Silver Lance+',
        rarity: '-',
      },
      {
        name: 'Armored Blow 3',
        rarity: '-',
      },
      {
        name: 'Lunge',
        rarity: '-',
      },
      {
        name: 'Hone Cavalry',
        rarity: '-',
      },
      {
        name: 'Reposition',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Lance Cavalier.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Lance Cavalier.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Lance Cavalier.png',
      },
    },
    growthPoints: {
      hp: 0,
      atk: 0,
      spd: 0,
      def: 0,
      res: 0,
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
          hp: [49],
          atk: [35],
          spd: [25],
          def: [26],
          res: [30],
        },
      },
    },
  },
  {
    shortName: 'Cavalier',
    name: 'Bow Cavalier (Lloyd GHB)',
    moveType: 'Cavalry',
    weaponType: 'Colorless Bow',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Silver Bow+',
        rarity: '-',
      },
      {
        name: 'Fortify Cavalry',
        rarity: '-',
      },
      {
        name: 'Swordbreaker 3',
        rarity: '-',
      },
      {
        name: 'Death Blow 3',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Bow Cavalier.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Bow Cavalier.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Bow Cavalier.png',
      },
    },
    growthPoints: {
      hp: 0,
      atk: 0,
      spd: 0,
      def: 0,
      res: 0,
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
          hp: [48],
          atk: [36],
          spd: [23],
          def: [25],
          res: [24],
        },
      },
    },
  },
  {
    shortName: 'Blue Mage',
    name: 'Blue Mage (Lloyd GHB)',
    moveType: 'Infantry',
    weaponType: 'Blue Tome',
    releaseDate: 'N/A',
    poolDate: 'N/A',
    skills: [
      {
        name: 'Thoron+',
        rarity: '-',
      },
      {
        name: 'Darting Blow 3',
        rarity: '-',
      },
      {
        name: 'Rally Defense',
        rarity: '-',
      },
      {
        name: 'Daggerbreaker 3',
        rarity: '-',
      },
      {
        name: 'Hone Atk 3',
        rarity: '-',
      },
    ],
    assets: {
      portrait: {
        '75px':
          'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Blue Mage.png',
        '113px':
          'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Blue Mage.png',
        '150px':
          'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Blue Mage.png',
      },
    },
    growthPoints: {
      hp: 0,
      atk: 0,
      spd: 0,
      def: 0,
      res: 0,
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
];

export default { unitList, startTime, endTime };
