// @flow
import Head from 'next/head'
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import { withReducer } from 'recompose';

import HeroGrid from '../src/components/HeroGrid';
import CombatPreview from '../src/components/CombatPreview';
import CombatResult from '../src/components/CombatResult';
import reducer from '../src/reducer';
import type { Dispatch, State } from '../src/reducer';


const initialState: State = {
  activeSlot: undefined,
  leftHero: undefined,
  rightHero: undefined,
};

const Home = withReducer(
  'state',
  'dispatch',
  reducer,
  initialState,
)(({ state, dispatch }: { state: State, dispatch: Dispatch }) => (
  <div className="root" onClick={() => dispatch({ type: 'ACTIVATE_SLOT', slot: undefined })}>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://fonts.googleapis.com/css?family=Mandali&text=→×0123456789" rel="stylesheet" />
      <style>{`
        body {
          background: #123346;
        }
      `}</style>
    </Head>
    <CombatResult
      leftHero={state.leftHero}
      rightHero={state.rightHero}
    />
    <CombatPreview
      activeSlot={state.activeSlot}
      dispatch={dispatch}
      leftHero={state.leftHero}
      rightHero={state.rightHero}
    />
    <HeroGrid dispatch={dispatch} heroes={stats.heroes} />
  </div>
));

export default Home;
