# fire-emblem-heroes-calculator

Calculate the result of combat between one hero and another

## Installation

You can load `fire-emblem-heroes-calculator` via npm, or with a script tag.

You can also [try `fire-emblem-heroes-calculator` out](https://npm.runkit.com/fire-emblem-heroes-calculator) without installing, using Runkit!

### HTML (loaded via CDN)

```html
<!-- Dev -->
<script src="https://proving-grounds-static.ajhyndman.com/<version>/fire-emblem-heroes-calculator.js"></script>
<!-- Production -->
<script src="https://proving-grounds-static.ajhyndman.com/<version>/fire-emblem-heroes-calculator.min.js"></script>

<script type="text/javascript">
  // A new variable will be available here, named `calculator`.
  alert(calculator.getDefaultInstance('Anna'));
</script>
```

### Node (npm)

```bash
npm install --save fire-emblem-heroes-calculator
```

```js
var calculator = require('fire-emblem-heroes-calculator');
```

## Usage

```js

var Anna = calculator.getDefaultInstance('Anna');
var Sharena = calculator.getDefaultInstance('Sharena');

calculator.calculateResult(Anna, Sharena);

// => {
//   combatInfo: {
//     "attackerDamage": 25,
//     "attackerNumAttacks": 1,
//     "attackerSpecialDamage": 0,
//     "attackerHp": 24,
//     "defenderSpecialDamage": 0,
//     "defenderNumAttacks": 1,
//     "defenderDamage": 17,
//     "defenderHp": 18
//   }
//   attackerState: {
//     hpMissing: 17
//     specialCharge: 2,
//   },
//   defenderState: {
//     hpMissing: 25
//     specialCharge: 0,
//   },
// }

calculator.getInheritableSkills('Anna', 'WEAPON');

// => [
//   'Brave Axe',
//   'Brave Axe+',
//   'Carrot Axe',
//   'Carrot Axe+',
//   'Emerald Axe',
//   'Emerald Axe+',
//   'Hammer',
//   'Hammer+',
//   'Iron Axe',
//   'Killer Axe',
//   'Killer Axe+',
//   'Nóatún',
//   'Silver Axe',
//   'Silver Axe+',
//   'Steel Axe'
// ]

calculator.getStat(
  Anna, // hero instance
  'atk', // stat key, one of: 'atk' | 'def' | 'hp' | 'res' | 'spd'
  40, // level, one of: 1 | 40
  true, // isAttacker (optional): boolean
);

// => 45
```
