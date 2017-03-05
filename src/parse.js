import {
  compose,
  dissoc,
  filter,
  flatten,
  isNil,
  map,
  match,
  mergeAll,
  not,
  replace,
  tail,
  toLower,
  trim,
  zipObj,
} from 'ramda';


/**
 * HTML parsers
 */

export const parseHeroRowHtml = (heroRow) => {
  const [
    colTitle,
    colMoveType,
    colWeaponType,
    colHp,
    colAtk,
    colSpd,
    colDef,
    colRes,
  ] = heroRow.match(/<td>((.|\n)*?)<\/td>/g);

  const [, name] = /<a.*?>([^<]*?)</.exec(colTitle);
  const [, moveType] = /alt="Icon Move (.*?)\.png"/.exec(colMoveType);
  const [, weaponType] = /alt="Icon Class (.*?)\.png"/.exec(colWeaponType);
  const hp = parseInt(/<td>(\d*?)\n<\/td>/.exec(colHp)[1], 10);
  const atk = parseInt(/<td>(\d*?)\n<\/td>/.exec(colAtk)[1], 10);
  const spd = parseInt(/<td>(\d*?)\n<\/td>/.exec(colSpd)[1], 10);
  const def = parseInt(/<td>(\d*?)\n<\/td>/.exec(colDef)[1], 10);
  const res = parseInt(/<td>(\d*?)\n<\/td>/.exec(colRes)[1], 10);
  const total = hp + atk + spd + def + res;

  return {
    [name]: {
      moveType,
      weaponType,
      hp,
      atk,
      spd,
      def,
      res,
      total,
    },
  };
};

export const parseHeroAggregateHtml = (heroAggregateHtml) => {
  const heroRows = match(/<tr>((.|\n)*?)<\/tr>/g, heroAggregateHtml);
  return mergeAll(tail(heroRows).map(parseHeroRowHtml));
};

// Takes an html table and returns a list of objects corresponding to rows in the table.
// The keys of the object come from cells in the header and the values come from cells in the row
export const parseTable = (tableHtml) => {
  const tableHeader = compose(
    map(compose(
      replace('unlock', 'rarity'),  // Some tables use unlock others use rarity.
      // convert to snake case.
      replace(/\s+/g, '_'),
      toLower,
      // remove unnecessary chars
      trim,
      replace(/<th.*?>/g, ''),
      replace(/<\/th.*?>/g, ''),
    )),
    match(/<th(\s.*?)?>(.|\n)*?<\/th.*?>/g), // needs to not match <thead>
  )(tableHtml);

  const tableRows = compose(
      // START for each row
      map(compose(
        // START for each cell
        map(compose(
          // remove unnecessary chars
          trim,
          replace(/<a.*?>/g, ''),
          replace(/<\/a>/g, ''),
          replace(/<td.*?>/g, ''),
          replace(/<\/td>/g, ''),
          replace(/<img.*?>/g, ''), // remove images
          replace(/<span.*?>(.|\n)*?<\/span>/g, ''), // remove spanned images
        )),
        match(/<td.*?>(.|\n)*?<\/td>/g))), // END for each cell
      tail, // remove the Header row
      match(/<tr.*?>(.|\n)*?<\/tr.*?>/g), // END for each row
    )(tableHtml);
  // some tables have a column of icons, ignore that.
  return map(dissoc(''), map(zipObj(tableHeader), tableRows));
}

// takes the html page for a hero and returns the skills
export const parseHeroSkills = compose(
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(/<table.*?skills-table.*?>(.|\n)*?<\/table>/g),
);

export const parseSkillsPage = compose(
  flatten,
  map(parseTable),
  filter(compose(not, isNil)),
  match(/<table.*?wikitable.*?>(.|\n)*?<\/table>/g),
);
