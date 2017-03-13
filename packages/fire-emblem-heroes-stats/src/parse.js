import {
  compose,
  dissoc,
  filter,
  flatten,
  isNil,
  map,
  match,
  not,
  pick,
  prop,
  replace,
  split,
  tail,
  test,
  trim,
  zipObj,
} from 'ramda';

import { camelCase, maybeToNumber, objectsByField } from './util';


/**
 * HTML parsers
 */

// Takes an html table and returns a list of objects corresponding to rows in the table.
// The keys of the object come from cells in the header and the values come from cells in the row
export const parseTable = (tableHtml) => {
  const tableHeader = compose(
    map(compose(
      replace('unlock', 'rarity'),  // Some tables use unlock others use rarity
      camelCase,
      trim,
      replace(/<.*?>/g, ''),  // Remove all html tags (th, span)
    )),
    match(/<th(\s.*?)?>(.|\n)*?<\/th.*?>/g),  // Match <th> tags without matching <thead>
  )(tableHtml);

  const tableRows = compose(
    map(compose(
      map(compose(
        maybeToNumber,
        trim,
        replace(/<.*?>/g, ''),  // Remove all html tags (td, a, span, img, b)
      )),
      match(/<td.*?>(.|\n)*?<\/td>/g))),
    tail,  // Remove the header row
    match(/<tr.*?>(.|\n)*?<\/tr.*?>/g),
    replace(/&#160;/g, ''),  // &nbsp, also known as \xa0
  )(tableHtml);
  // Some tables have a column of icons, ignore that.
  return map(dissoc(''), map(zipObj(tableHeader), tableRows));
}

// Takes a table class name and returns a function to match and parse all tables on a page
export const parseTables = (tableClass) => compose(
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(new RegExp("<table.*?" + tableClass + ".*?>(.|\n)*?<\/table>", "g")),
);

// Takes the html page for a hero and parses all skill tables
const parseHeroSkills = compose(
      map(pick(['name', 'default', 'rarity'])),
      parseTables("skills-table"),
);

// Takes a parsed stat table and restructures it to be by rarity and have stat variants
// [ {rarity, stat: "lo/med/high"}, ] -> {rarity: {stat: [lo, med, high]} }
const processStatTable =  compose(
  map(map(
    compose(
      map(maybeToNumber),
      split('/'),
      (x) => x.toString(),
    ),
  )),  // For each rarity and stat
  objectsByField('rarity'),
);

// Takes the html page for a hero and parses all stat tables
// outputs {1: {rarity: {stat: number}}, 40: {rarity: {stat: [lo med high]}}}
const parseHeroStats = compose(
  (processedTables) => ({
    '1': map(  // for each rarity
      map(  // for each stat
        (variations) => (variations.length == 3 ? variations[1] : variations[0]),
      ),
      processedTables[0],
    ),
    '40': processedTables[1],
  }),
  map(processStatTable),
  map(parseTable),
  filter(compose(not, test(/ibox/))),
  filter(compose(not, test(/skills-table/))),
  match(/<table.*?>(.|\n)*?<\/table>/g),
  replace(/(\?+|-+)/g, '-'), // standardize unknown values
);

export function parseHeroStatsAndSkills(heroPageHtml) {
  const skills = parseHeroSkills(heroPageHtml);
  const stats = parseHeroStats(heroPageHtml);
  return { skills, stats };
}

// Takes an html page and parses all tables
export const parseSkillsPage = parseTables("wikitable");

// Takes an html page and parses the only table for stats of all heroes
export const parseHeroAggregateHtml = compose(
  parseTable,
  // Replace move and weapon type icons with their name
  replace(/\.png.*?>/g, ''),
  replace(/<img.*?Icon Class /g, ''),
  replace(/<img.*?Icon Move /g, ''),
  replace(/<th.*?>\n*<\/th>/, '<th>Weapon Type</th>'),  // The second unnamed header entry
  replace(/<th.*?>\n*<\/th>/, '<th>Move Type</th>'),  // The first unnamed header entry
  prop(0),  // match [0] is the entire matching string
  match(/<table(.|\n)*?\/table>/),
);
