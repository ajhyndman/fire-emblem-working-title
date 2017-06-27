// @flow
import type { Hero } from '..';

// Times were entered in AEST (UTC + 10)
const startTime = new Date('2017-04-24T17:00:00+10:00');
const endTime = new Date('2017-05-02T16:59:00+10:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Robin (F)',
    'name': 'Robin (F) (Robin GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Green Tome',
    'skills': [
      {
        'name': 'Gronnwolf+',
        'rarity': '-',
      },
      {
        'name': 'Ignis',
        'rarity': '-',
      },
      {
        'name': 'Defiant Res 3',
        'rarity': '-',
      },
      {
        'name': 'B Tomebreaker 3',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Robin (F).png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Robin (F).png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Robin (F).png',
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
          'hp': [45],
          'atk': [25],
          'spd': [25],
          'def': [24],
          'res': [18],
        },
      },
    },
  },
  {
    'shortName': 'Fighter',
    'name': 'Lance Fighter (Robin GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Blue Lance',
    'skills': [
      {
        'name': 'Silver Lance',
        'rarity': '-',
      },
      {
        'name': 'Glimmer',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 2',
        'rarity': '-',
      },
      {
        'name': 'Drag Back',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Lance Fighter.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Lance Fighter.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Lance Fighter.png',
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
          'hp': [42],
          'atk': [27],
          'spd': [26],
          'def': [26],
          'res': [18],
        },
      },
    },
  },
  {
    'shortName': 'Red Mage',
    'name': 'Red Mage (Robin GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Red Tome',
    'skills': [
      {
        'name': 'Bolganone',
        'rarity': '-',
      },
      {
        'name': 'Bonfire',
        'rarity': '-',
      },
      {
        'name': 'Armored Blow 2',
        'rarity': '-',
      },
      {
        'name': 'Threaten Res 3',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Red Mage.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Red Mage.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Red Mage.png',
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
          'atk': [27],
          'spd': [28],
          'def': [17],
          'res': [23],
        },
      },
    },
  },
  {
    'shortName': 'Fighter',
    'name': 'Axe Fighter (Robin GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Killer Axe',
        'rarity': '-',
      },
      {
        'name': 'Glimmer',
        'rarity': '-',
      },
      {
        'name': 'Seal Res 2',
        'rarity': '-',
      },
      {
        'name': 'Threaten Atk 3',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Axe Fighter.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Axe Fighter.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Axe Fighter.png',
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
          'hp': [42],
          'atk': [27],
          'spd': [26],
          'def': [26],
          'res': [18],
        },
      },
    },
  },
  {
    'shortName': 'Blue Mage',
    'name': 'Blue Mage (Robin GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Thoron',
        'rarity': '-',
      },
      {
        'name': 'Bonfire',
        'rarity': '-',
      },
      {
        'name': 'Darting Blow 2',
        'rarity': '-',
      },
      {
        'name': 'Seal Def 3',
        'rarity': '-',
      },
    ],
    'assets': {
      'portrait': {
        '75px': 'https://proving-grounds-static.ajhyndman.com/75px-Icon_Portrait_Blue Mage.png',
        '113px': 'https://proving-grounds-static.ajhyndman.com/113px-Icon_Portrait_Blue Mage.png',
        '150px': 'https://proving-grounds-static.ajhyndman.com/150px-Icon_Portrait_Blue Mage.png',
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
          'atk': [27],
          'spd': [28],
          'def': [17],
          'res': [23],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};
