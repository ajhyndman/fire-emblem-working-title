'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


// Times were entered in PDT (UTC + 10)
var startTime = new Date('2017-04-24T17:00:00+10:00');

var endTime = new Date('2017-05-02T16:59:00+10:00');

var unitList = [{
  'shortName': 'Navarre',
  'name': 'Navarre (Navarre GHB)',
  'moveType': 'Infantry',
  'weaponType': 'Red Sword',
  'skills': [{
    'name': 'Killing Edge+',
    'rarity': '-'
  }, {
    'name': 'Blazing Wind',
    'rarity': '-'
  }, {
    'name': 'Desperation 3',
    'rarity': '-'
  }, {
    'name': 'Threaten Spd 3',
    'rarity': '-'
  }],
  'stats': {
    '1': {
      '5': {
        'hp': '-',
        'atk': '-',
        'spd': '-',
        'def': '-',
        'res': '-'
      }
    },
    '40': {
      '5': {
        'hp': [58],
        'atk': [31],
        'spd': [39],
        'def': [24],
        'res': [25]
      }
    }
  }
}, {
  'shortName': 'Thief 1',
  'name': 'Thief 1 (Navarre GHB)',
  'moveType': 'Infantry',
  'weaponType': 'Neutral Shuriken',
  'skills': [{
    'name': 'Silver Dagger+',
    'rarity': '-'
  }, {
    'name': 'Moonbow',
    'rarity': '-'
  }, {
    'name': 'Death Blow 3',
    'rarity': '-'
  }, {
    'name': 'Poison Strike 3',
    'rarity': '-'
  }, {
    'name': 'Hone Atk 3',
    'rarity': '-'
  }],
  'stats': {
    '1': {
      '5': {
        'hp': '-',
        'atk': '-',
        'spd': '-',
        'def': '-',
        'res': '-'
      }
    },
    '40': {
      '5': {
        'hp': [44],
        'atk': [28],
        'spd': [39],
        'def': [14],
        'res': [32]
      }
    }
  }
}, {
  'shortName': 'Thief 2',
  'name': 'Thief 2 (Navarre GHB)',
  'moveType': 'Infantry',
  'weaponType': 'Neutral Shuriken',
  'skills': [{
    'name': 'Rogue Dagger+',
    'rarity': '-'
  }, {
    'name': 'Moonbow',
    'rarity': '-'
  }, {
    'name': 'Armored Blow 3',
    'rarity': '-'
  }, {
    'name': 'Bowbreaker 3',
    'rarity': '-'
  }, {
    'name': 'Hone Spd 3',
    'rarity': '-'
  }],
  'stats': {
    '1': {
      '5': {
        'hp': '-',
        'atk': '-',
        'spd': '-',
        'def': '-',
        'res': '-'
      }
    },
    '40': {
      '5': {
        'hp': [44],
        'atk': [28],
        'spd': [39],
        'def': [14],
        'res': [32]
      }
    }
  }
}, {
  'shortName': 'Fighter',
  'name': 'Axe Fighter (Navarre GHB)',
  'moveType': 'Infantry',
  'weaponType': 'Green Axe',
  'skills': [{
    'name': 'Hammer+',
    'rarity': '-'
  }, {
    'name': 'Ardent Sacrifice',
    'rarity': '-'
  }, {
    'name': 'Death Blow 3',
    'rarity': '-'
  }, {
    'name': 'Obstruct 3',
    'rarity': '-'
  }, {
    'name': 'Spur Spd 3',
    'rarity': '-'
  }],
  'stats': {
    '1': {
      '5': {
        'hp': '-',
        'atk': '-',
        'spd': '-',
        'def': '-',
        'res': '-'
      }
    },
    '40': {
      '5': {
        'hp': [52],
        'atk': [31],
        'spd': [31],
        'def': [30],
        'res': [23]
      }
    }
  }
}, {
  'shortName': 'Cleric',
  'name': 'Cleric (Navarre GHB)',
  'moveType': 'Infantry',
  'weaponType': 'Neutral Staff',
  'skills': [{
    'name': 'Panic',
    'rarity': '-'
  }, {
    'name': 'Physic',
    'rarity': '-'
  }, {
    'name': 'Solid Earth Balm',
    'rarity': '-'
  }, {
    'name': 'Live to Serve 3',
    'rarity': '-'
  }, {
    'name': 'Fortify Def 3',
    'rarity': '-'
  }],
  'stats': {
    '1': {
      '5': {
        'hp': '-',
        'atk': '-',
        'spd': '-',
        'def': '-',
        'res': '-'
      }
    },
    '40': {
      '5': {
        'hp': [42],
        'atk': [28],
        'spd': [28],
        'def': [24],
        'res': [36]
      }
    }
  }
}];

exports.default = { unitList: unitList, startTime: startTime, endTime: endTime };