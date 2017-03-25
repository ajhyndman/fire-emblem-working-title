// @flow
import Head from 'next/head';
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import {
  compose,
  filter,
  path,
  prop,
  toLower,
} from 'ramda';

import CombatPreview from './CombatPreview';
import CombatResult from './CombatResult';
import HeroGrid from './HeroGrid';
import ShareButton from './ShareButton';
import Input from './Input';
import { encodeHero } from '../queryCodex';
import { staticUrl } from '../../config';
import type { Dispatch } from '../reducer';
import type { State } from '../store';
import michalisUnits from '../temporal/2017.03.25-michalis';


type Props = {
  dispatch: Dispatch;
  state: State;
};

export const panelHeight = 212;

const backgroundUrl = 'triskel_by_codysymes-d7ewlm9.png';

const Root = ({ state, dispatch }: Props) => (
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
        href={'https://fonts.googleapis.com/css?family=Mandali&text='
          + '→×—0123456789abcdefghijklmnopqrstuvwxyz'}
        rel="stylesheet"
      />
      <style>{`
        body {
          margin: 0;
          background-image: -webkit-image-set(
            url(${staticUrl}${backgroundUrl}) 1x,
            url(${staticUrl}${backgroundUrl}) 1.5x
          );
          background-position: top center;
          background-attachment: fixed;
        }
      `}</style>
    </Head>
    <style jsx>{`
      .sticky-panel {
        position: fixed;
        width: 100%;
        background-image: -webkit-image-set(
          url(${staticUrl}${backgroundUrl}) 1x,
          url(${staticUrl}${backgroundUrl}) 1.5x
        );
        background-position: top center;
        background-attachment: fixed;
        height: ${panelHeight}px;
        z-index: 1;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 10px;
      }
      .column {
        width: 200px;
      }
      .spacer {
        height: ${panelHeight}px;
      }
    `}</style>
    <div className="sticky-panel">
      <CombatResult
        leftHero={state.heroSlots[0]}
        rightHero={state.heroSlots[1]}
      />
      <CombatPreview
        activeSlot={state.activeSlot}
        dispatch={dispatch}
        leftHero={state.heroSlots[0]}
        rightHero={state.heroSlots[1]}
      />
      <div className="row">
        <ShareButton
          link={`${
            state.host
          }/?0=${
            encodeHero(state.heroSlots[0])
          }&1=${
            encodeHero(state.heroSlots[1])
          }`}
        />
        <div className="column">
          <Input
            onChange={(value: string) => {
              dispatch({ type: 'SEARCH_STRING_CHANGE', value });
            }}
            placeholder="Type to filter"
            value={state.searchString}
          />
        </div>
      </div>
    </div>
    <div className="spacer" />
    <HeroGrid
      // $FlowIssue typedef for path isn't resolving correctly
      activeHeroName={path(['activeHero', 'name'], state)}
      dispatch={dispatch}
      heroes={filter(
        // $FlowIssue typedef for prop isn't resolving correctly
        compose(
          name => (name.indexOf(toLower(state.searchString)) !== -1),
          toLower,
          prop('name'),
        ),
        michalisUnits,
      )}
    />
    <HeroGrid
      // $FlowIssue typedef for path isn't resolving correctly
      activeHeroName={path(['activeHero', 'name'], state)}
      dispatch={dispatch}
      heroes={filter(
        // $FlowIssue typedef for prop isn't resolving correctly
        compose(
          name => (name.indexOf(toLower(state.searchString)) !== -1),
          toLower,
          prop('name'),
        ),
        stats.heroes,
      )}
    />
  </div>
);

export default Root;
