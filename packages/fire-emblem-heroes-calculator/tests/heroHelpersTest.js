// @flow
import test from 'tape';

import { getDefaultInstance } from '../src/heroInstance';
import { getArenaScore } from '../src/heroHelpers';

// TODO:
// We probably need a way to mock out the "stats" package entirely, to ensure
// these assertions are less brittle.
test('getArenaScore', t => {
  t.plan(4);

  t.equal(getArenaScore(getDefaultInstance('Abel: The Panther')), 672);
  t.equal(getArenaScore(getDefaultInstance('Alfonse: Prince of Askr')), 678);
  t.equal(getArenaScore(getDefaultInstance('Alm: Hero of Prophecy')), 676);
  t.equal(getArenaScore(getDefaultInstance('Anna: Commander')), 678);
});
