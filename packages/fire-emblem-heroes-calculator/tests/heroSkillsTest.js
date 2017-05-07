// @flow
import test from 'tape';
import { contains, map, prop } from 'ramda';

import { getDefaultSkills, getInheritableSkills } from '../src/heroHelpers';


test('inheritableTomes', (t) => {
  t.plan(1);
  const weapons = getInheritableSkills('Leo', 'WEAPON');
  t.deepEqual(weapons, [
    'Bolganone',
    'Bolganone+',
    'Brynhildr', // Exclusive to Leo
    // Cymbeline is exclusive,
    'Elfire',
    'Fenrir',
    'Fenrir+',
    'Fire',
    'Flux',
    'Rauðrblade',
    'Rauðrblade+',
    'Rauðrraven',
    'Rauðrraven+',
    'Rauðrwolf',
    'Rauðrwolf+',
    'Ruin',
  ]);
});

test('inheritableBreaths', (t) => {
  t.plan(1);
  const weapons = getInheritableSkills('Fae', 'WEAPON');
  t.deepEqual(weapons, [
    'Dark Breath',
    'Dark Breath+',
    'Fire Breath',
    'Fire Breath+',
    'Flametongue',
    'Flametongue+',
    'Light Breath',
    'Light Breath+',
    'Lightning Breath',
    'Lightning Breath+',
  ]);
});

test('inheritableSeals', (t) => {
  t.plan(3);
  const seals = getInheritableSkills('Lilina', 'SEAL');
  t.equal(contains('Attack +1', seals), true);
  t.equal(contains('HP +3', seals), true);
  t.equal(contains('Speed +1', seals), true);
});

test('restrictions', (t) => {
  t.plan(10);
  const aPassives = getInheritableSkills('Catria', 'PASSIVE_A');
  const bPassives = getInheritableSkills('Catria', 'PASSIVE_B');
  const cPassives = getInheritableSkills('Catria', 'PASSIVE_C');
  t.equal(contains('Iote\'s Shield', aPassives), true); // Fliers Only
  t.equal(contains('Swordbreaker 3', bPassives), true); // Excludes Green
  t.equal(contains('B Tomebreaker 3', bPassives), true); // Excludes Red
  t.equal(contains('Poison Strike 3', bPassives), true); // Excludes Staves
  t.equal(contains('Hone Fliers', cPassives), true); // Fliers Only

  t.equal(contains('Close Counter', aPassives), false); // Ranged Only
  t.equal(contains('Svalinn Shield', aPassives), false); // Armored Only
  t.equal(contains('Bowbreaker 3', bPassives), false); // Excludes Fliers
  t.equal(contains('Axebreaker 3', bPassives), false); // Excludes Blue
  t.equal(contains('Hone Armor', cPassives), false); // Armored Only
});
