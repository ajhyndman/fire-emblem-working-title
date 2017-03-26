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
