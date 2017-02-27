import fs from 'fs';
import fetch from 'isomorphic-fetch';
import {
  head,
  mergeAll,
  tail,
} from 'ramda';

const parseHeroRow = (heroRow) => {
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
}

fetch('http://feheroes.wiki/Stats_Table')
  .then(response => response.text())
  .then(html => {
    const heroRows = html.match(/<tr>((.|\n)*?)<\/tr>/g);
    const heroes = mergeAll(tail(heroRows).map(parseHeroRow));

    fs.writeFileSync('./lib/stats.json', JSON.stringify(heroes, null, 2));
  });
