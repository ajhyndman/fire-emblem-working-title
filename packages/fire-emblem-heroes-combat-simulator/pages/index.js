// @flow
import Head from 'next/head'
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import { find, isEmpty, path, propEq } from 'ramda';
import { withReducer } from 'recompose';

import CombatPreview from '../src/components/CombatPreview';
import CombatResult from '../src/components/CombatResult';
import HeroGrid from '../src/components/HeroGrid';
import ShareButton from '../src/components/ShareButton';
import reducer from '../src/reducer';
import { colors } from '../src/theme';
import type { Dispatch, State } from '../src/reducer';


type Props = {
  initialState: State;
  host: string;
};

const initialState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  leftHero: undefined,
  rightHero: undefined,
};

const panelHeight = 192;

class Home extends React.Component {
  static async getInitialProps ({ req, query }) {
    return {
      host: req.headers.host,
      initialState: isEmpty(query)
        ? initialState
        : {
          ...initialState,
          leftHero: find(propEq('name', query['0']), stats.heroes),
          rightHero: find(propEq('name', query['1']), stats.heroes),
        },
    };
  }

  props: Props;

  render() {
    const App = withReducer(
      'state',
      'dispatch',
      reducer,
      this.props.initialState,
    )(({ state, dispatch }: { state: State, dispatch: Dispatch }) => (
      <div className="root" onClick={() => dispatch({ type: 'SELECT_SLOT', slot: undefined })}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            href="https://fonts.googleapis.com/css?family=Mandali&text=→×0123456789"
            rel="stylesheet"
          />
          <style>{`
            body {
              background: ${colors.elephant};
              margin: 0;
            }
          `}</style>
        </Head>
        <style jsx>{`
          .sticky-panel {
            position: fixed;
            width: 100%;
            background: ${colors.elephant};
            height: ${panelHeight}px;
            z-index: 1;
          }
          .spacer {
            height: ${panelHeight}px;
          }
        `}</style>
        <div className="sticky-panel">
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
          <ShareButton
            link={`${
              this.props.host
            }/?0=${
              // $FlowIssue typedef for path isn't resolving correctly
              path(['leftHero', 'name'], state)
            }&1=${
              // $FlowIssue typedef for path isn't resolving correctly
              path(['rightHero', 'name'], state)
            }`}
          />
        </div>
        <div className="spacer" />
        <HeroGrid
          // $FlowIssue typedef for path isn't resolving correctly
          activeHeroName={path(['activeHero', 'name'], state)}
          dispatch={dispatch}
          heroes={stats.heroes}
        />
      </div>
    ));

    return (
      <App />
    );
  }
}

export default Home;
