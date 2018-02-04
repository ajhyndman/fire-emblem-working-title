// @flow
import test from 'tape';
import { contains } from 'ramda';

import { getInheritableSkills } from '../src/heroHelpers';

test('inheritableTomes', t => {
  t.plan(2);
  const weapons = getInheritableSkills('Leo', 'WEAPON');
  t.equal(contains('Brynhildr', weapons), true); // Exclusive to Leo
  t.equal(contains('Cymbeline', weapons), false); // Exclusive to Leo
});

test('inheritableBreaths', t => {
  t.plan(10);
  const weapons = getInheritableSkills('Fae', 'WEAPON');
  t.equal(contains('Dark Breath', weapons), true);
  t.equal(contains('Dark Breath+', weapons), true);
  t.equal(contains('Fire Breath', weapons), true);
  t.equal(contains('Fire Breath+', weapons), true);
  t.equal(contains('Flametongue', weapons), true);
  t.equal(contains('Flametongue+', weapons), true);
  t.equal(contains('Light Breath', weapons), true);
  t.equal(contains('Light Breath+', weapons), true);
  t.equal(contains('Lightning Breath', weapons), true);
  t.equal(contains('Lightning Breath+', weapons), true);
});

test('inheritableSeals', t => {
  t.plan(3);
  const seals = getInheritableSkills('Lilina', 'SEAL');
  t.equal(contains('Attack +1', seals), true);
  t.equal(contains('HP +3', seals), true);
  t.equal(contains('Speed +1', seals), true);
});

test('restrictions', t => {
  t.plan(10);
  const aPassives = getInheritableSkills('Catria', 'PASSIVE_A');
  const bPassives = getInheritableSkills('Catria', 'PASSIVE_B');
  const cPassives = getInheritableSkills('Catria', 'PASSIVE_C');
  t.equal(contains("Iote's Shield", aPassives), true); // Fliers Only
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
