# fire-emblem-heroes-stats

[![yarn compatible](https://img.shields.io/badge/yarn-compatible-4BC51D.svg?style=flat)](https://yarnpkg.com/)

Scrapes http://feheroes.wiki/Stats_Table for all available heroes and their average level 50 stats.

Latest scraped stats are available in raw JSON format here:

https://github.com/ajhyndman/fire-emblem-working-title/blob/master/packages/fire-emblem-heroes-stats/dist/stats.json

## Usage

To use the stats in your app:

```bash
$ npm install --save fire-emblem-heroes-stats
```

```js
var stats = require('fire-emblem-heroes-stats');
```

To scrape the latest wiki updates yourself:

```bash
$ git clone https://github.com/ajhyndman/fire-emblem-working-title.git
$ cd fire-emblem-working-title
$ lerna bootstrap
$ cd fire-emblem-heroes-stats
$ npm start
```

## Format

### Example

#### Package Root

The JSON file exported by this package has the following format:

```js
{
  heroes: [/* List of heroes */],
  skills: [/* List of skills */],
}
```

#### Heroes

The stats for each hero in this package have the following format:

```js
{
  "name": "Abel",
  "moveType": "Cavalry",
  "weaponType": "Blue Lance",
  "total": 154,
  "skills": [
    {
      "name": "Iron Lance",
      "default": "-",
      "rarity": "-"
    },
    {
      "name": "Steel Lance",
      "default": "-",
      "rarity": "-"
    },

    // ...

    {
      "name": "Swordbreaker 2",
      "rarity": "-"
    },
    {
      "name": "Swordbreaker 3",
      "rarity": 4
    }
  ],
  "stats": {
    // Level 1 stats do not include variance.
    "1": {
      // Stats are further broken down by rarity.
      "4": { "hp": 16, "atk": 6, "spd": 8, "def": 8, "res": 5 },
      "5": { "hp": 17, "atk": 7, "spd": 8, "def": 8, "res": 6 }
    },
    // Level 40 stats include all known variances, as defined in the wiki.
    "40": {
      "4": {
        // Format here is [Low, Med, High].  In some cases, when only two values
        // are known, and it is not clear which is high and which is low, there
        // may only be two values here.
        "hp": [33, 36, 39],
        "atk": ["-", 30, 33],
        "spd": [27, 30 ,33],
        "def": [21, 24 ,27],
        "res": [20, 23, 26]
      },
      "5": {
        "hp": [35, 39, 42],
        "atk": [30, 33, 36],
        "spd": [29, 32, 35],
        "def": [22, 25, 28],
        "res": [22, 25, 29]
      }
    }
  }
}
```

#### Skills

Skills each have a type key and stats relevant to their skill slot.

```js
{
  // Every skill has these keys.
  "name": "Raijinto",
  "type": "WEAPON",
  "effect": "Enables counterattack regardless of distance if this unit is attacked",

  // Every weapon skill has these keys.
  "cost": "400 SP",
  "damage(mt)": 16,
  "range(rng)": 1,
  "exclusive?": "Yes",
  "weaponType": "Red Sword"
},
```

### Formal definition

A full type definition can be found here.  This can also be consumed by Facebook's
[Flowtype](https://flowtype.org/) static type checker in your javascript applications!

https://github.com/ajhyndman/fire-emblem-working-title/blob/master/packages/fire-emblem-heroes-stats/dist/index.js.flow
