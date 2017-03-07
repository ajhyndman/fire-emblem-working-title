// @flow
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import { map } from 'ramda';

const App = () => (
  <div>
    <ul>
      {map(
        (hero) => <li>{hero.name}</li>,
        stats.heroes,
      )}
    </ul>
  </div>
);

export default App;
