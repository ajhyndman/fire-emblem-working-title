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
import { staticUrl } from '../config';
import type { Dispatch, State } from '../src/reducer';


type Props = {
  backgroundUrl: string;
  host: string;
  initialState: State;
};

const initialState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  leftHero: undefined,
  rightHero: undefined,
};

const panelHeight = 192;

const backgroundList = [
  '_request__fire_emblem_awakening___lon_qu_by_krukmeister-d7rlyap.png',
  'fire_emblem_awakening___cordelia_by_krukmeister-d7rlyky.png',
  'fire_emblem_awakening___lucina_by_krukmeister-d7rgzln.png',
  'fire_emblem_awakening___nowi_by_krukmeister-d7rs1b8.png',
  'fire_emblem_awakening___tiki_by_krukmeister-d7s3qqh.png',
  'fire_emblem_awakening___tharja_by_krukmeister-d8e934d.png',
];

class Home extends React.Component {
  static async getInitialProps ({ req, query }) {
    return {
      backgroundUrl: backgroundList[Math.floor(Math.random() * backgroundList.length)],
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
    const backgroundUrl = this.props.backgroundUrl;

    const App = withReducer(
      'state',
      'dispatch',
      reducer,
      this.props.initialState,
    )(({ state, dispatch }: { state: State, dispatch: Dispatch }) => (
      <div className="root" onClick={() => dispatch({ type: 'SELECT_SLOT', slot: undefined })}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Proving Grounds — Fire Emblem: Heroes</title>
          <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
          <link rel="icon" type="image/png" href="/static/favicon-32x32.png" sizes="32x32" />
          <link rel="icon" type="image/png" href="/static/favicon-16x16.png" sizes="16x16" />
          <link rel="manifest" href="/static/manifest.json" />
          <link rel="mask-icon" href="/static/safari-pinned-tab.svg" color="#5bbad5" />
          <link rel="shortcut icon" href="/static/favicon.ico" />
          <meta name="msapplication-config" content="/static/browserconfig.xml" />
          <meta name="theme-color" content="#ffffff" />
          <link
            href="https://fonts.googleapis.com/css?family=Mandali&text=→×0123456789"
            rel="stylesheet"
          />
          <style>{`
            body {
              background: top center fixed url(${staticUrl}${backgroundUrl});
              margin: 0;
            }
          `}</style>
        </Head>
        <style jsx>{`
          .sticky-panel {
            position: fixed;
            width: 100%;
            background: top center fixed url(${staticUrl}${backgroundUrl});
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
