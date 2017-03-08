// @flow
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import { map, range } from 'ramda';

import Hero from '../src/components/Hero';

const Home = () => (
  <div>
    <style jsx>{`
      .grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
      }
      .grid:after {
        content: "";
        flex: auto;
      }
      div:empty {
        margin: 0 10px;
        width: 75px;
      }
    `}</style>
    <div className="grid">
      {map(
        (hero) => <Hero key={hero.name} name={hero.name} />,
        stats.heroes,
      )}
      {/**
        * Flexbox doesn't really provide grid support.  Add enough empty
        * elements to preserve grid layout of last row on large screens.
        */}
      {map((i) => <div key={i} />, range(0, 20))}
    </div>
  </div>
);

export default Home;
