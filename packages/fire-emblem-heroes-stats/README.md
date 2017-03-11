# fire-emblem-heroes-stats

[![yarn compatible](https://img.shields.io/badge/yarn-compatible-4BC51D.svg?style=flat)](https://yarnpkg.com/)

Scrapes http://feheroes.wiki/Stats_Table for all available heroes and their average level 50 stats.

Latest scraped stats are available in JSON format here:

https://github.com/ajhyndman/fire-emblem-working-title/blob/master/lib/stats.json

## Usage

To scrape the latest wiki updates yourself:

```bash
$ git clone https://github.com/ajhyndman/fire-emblem-working-title.git
$ cd fire-emblem-working-title
$ lerna bootstrap
$ cd fire-emblem-heroes-stats
$ npm start
```
