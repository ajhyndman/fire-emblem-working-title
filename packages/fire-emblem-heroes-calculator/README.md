# fire-emblem-heroes-calculator

Calculate the result of combat between one hero and another

## Installation

```
npm install --save fire-emblem-heroes-calculator
```

## Usage

```js
var calculator = require('fire-emblem-heroes-calculator');

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
```
