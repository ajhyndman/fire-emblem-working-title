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
  toLower,
  trim,
  zipObj,
} from 'ramda';


/**
 * HTML parsers
 */

// Takes an html table and returns a list of objects corresponding to rows in the table.
// The keys of the object come from cells in the header and the values come from cells in the row
export const parseTable = (tableHtml) => {
  const tableHeader = compose(
    map(compose(
      replace('unlock', 'rarity'),  // Some tables use unlock others use rarity.
      // convert to snake case.
      replace(/\s+/g, '_'),
      toLower,
      trim,
      replace(/<.*?>/g, ''), // remove all tags. td, a, span, image, bold, etc.
    )),
    match(/<th(\s.*?)?>(.|\n)*?<\/th.*?>/g), // needs to not match <thead>
  )(tableHtml);

  const tableRows = compose(
    // START for each row
    map(compose(
      // START for each cell
      map(compose(
        (txt) => isNaN(txt) ? txt : parseInt(txt, 10), // convert numeric to numbers
        trim,
        replace(/<.*?>/g, ''), // remove all tags. td, a, span, image, bold, etc.
      )),
      match(/<td.*?>(.|\n)*?<\/td>/g))), // END for each cell
    tail, // remove the Header row
    match(/<tr.*?>(.|\n)*?<\/tr.*?>/g), // END for each row
  )(tableHtml);
  // some tables have a column of icons, ignore that.
  return map(dissoc(''), map(zipObj(tableHeader), tableRows));
}

// Takes a regex pattern and returns a function to match and parse 
export const parseTables = (tableClass) => compose(
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(new RegExp("<table.*?" + tableClass + ".*?>(.|\n)*?<\/table>", "g")),
);

// Takes the html page for a hero and parses all skill tables.
export const parseHeroSkills = parseTables("skills-table");

// Takes an html page and parses all tables.
export const parseSkillsPage = parseTables("wikitable");

// Takes an html page and parses the only table for stats of all heroes.
export const parseHeroAggregateHtml = compose(
  parseTable,
  // Replace move and weapon type icons with their name.
  replace(/\.png.*?>/g, ''),
  replace(/<img.*?Icon Class /g, ''),
  replace(/<img.*?Icon Move /g, ''),
  replace(/<th.*?>\n*<\/th>/, '<th>Weapon Type</th>'), // The second unnamed header entry
  replace(/<th.*?>\n*<\/th>/, '<th>Move Type</th>'), // The first unnamed header entry
  prop(0), // match [0] is the entire matching string.
  match(/<table(.|\n)*?\/table>/),
);
