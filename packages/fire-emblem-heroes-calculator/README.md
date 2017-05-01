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
//   "attackerSpecialDamage": 0,
//   "defenderSpecialDamage": 0,
//   "attackerNumAttacks": 1,
//   "attackerDamage": 25,
//   "attackerHpRemaining": 24,
//   "defenderNumAttacks": 1,
//   "defenderDamage": 17,
//   "defenderHpRemaining": 18
// }

calculator.getInheritableSkills('Anna', 'WEAPON');

// => [
//   {
//     "name": "Brave Axe",
//     "spCost": 200,
//     "damage(mt)": 5,
//     "range(rng)": 1,
//     "effect": "Spd-5. Attack twice when initiating combat.",
//     "exclusive?": "No",
//     "type": "WEAPON",
//     "weaponType": "Green Axe"
//   },
//   {
//     "name": "Brave Axe+",
//     "spCost": 300,
//     "damage(mt)": 8,
//     "range(rng)": 1,
//     "effect": "Spd-5. Attack twice when initiating combat.",
//     "exclusive?": "No",
//     "type": "WEAPON",
//     "weaponType": "Green Axe"
//   },
//
//   ...
// ]

calculator.getStat(
  Anna, // hero instance
  'atk', // stat key, one of: 'atk' | 'def' | 'hp' | 'res' | 'spd'
  40, // level, one of: 1 | 40
  true, // isAttacker (optional): boolean
);

// => 45
```
