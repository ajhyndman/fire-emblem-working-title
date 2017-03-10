// @flow
import Head from 'next/head'
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import { map, range, replace } from 'ramda';

import Hero from '../src/components/Hero';

const Home = () => (
  <div>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
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
        margin: 0 5px;
        width: 56px;
      }
    `}</style>
    <div className="grid">
      {map(
        (hero) => <Hero key={hero.name} name={hero.name} weaponType={replace(' ', '_', hero.weaponType)} />,
        stats.heroes,
      )}
      {/**
        * Flexbox doesn't really provide grid support.  Add enough empty
        * elements to preserve grid layout of last row on large screens.
        */}
      {map((i) => <div key={i} />, range(0, 30))}
    </div>
  </div>
);

export default Home;
