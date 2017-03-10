// @flow
import Head from 'next/head'
import React from 'react';
import stats from 'fire-emblem-heroes-stats';

import HeroGrid from '../src/components/HeroGrid';


const Home = () => (
  <div className="root">
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>{`
        body {
          background: #123346;
        }
      `}</style>
    </Head>
    <HeroGrid heroes={stats.heroes} />
  </div>
);

export default Home;
