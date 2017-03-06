import {
  compose,
  dissoc,
  filter,
  flatten,
  isNil,
  map,
  match,
  not,
  prop,
  replace,
  tail,
  trim,
  zipObj,
} from 'ramda';

import { camelCase } from './util';


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
        (txt) => isNaN(txt) ? txt : parseInt(txt, 10),  // Convert numeric strings to numbers.
        trim,
        replace(/<.*?>/g, ''),  // Remove all html tags (td, a, span, img, b)
      )),
      match(/<td.*?>(.|\n)*?<\/td>/g))),
    tail,  // Remove the header row
    match(/<tr.*?>(.|\n)*?<\/tr.*?>/g),
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
export const parseHeroSkills = parseTables("skills-table");

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
