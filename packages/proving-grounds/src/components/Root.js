// @flow
import Head from 'next/head';
import React from 'react';
import MarkGithub from 'react-icons/lib/go/mark-github';
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
import { fontFamilies } from '../theme';
import { encodeHero } from '../queryCodex';
import { staticUrl } from '../../config';
import type { Dispatch } from '../reducer';
import type { State } from '../store';
// import eventUnits from '../temporal/2017.03.25-michalis';


type Props = {
  dispatch: Dispatch;
  state: State;
};

export const panelHeight = 212;

const backgroundUrl = 'Bg_WorldMap2.png';

class Root extends React.Component {
  props: Props;

  shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.state.heroSlots !== nextProps.state.heroSlots
      || this.props.state.activeSlot !== nextProps.state.activeSlot
      || this.props.state.activeHero !== nextProps.state.activeHero
      || this.props.state.searchString !== nextProps.state.searchString
      || this.props.state.previewLevel !== nextProps.state.previewLevel
    );
  }

  render() {
    const { state, dispatch }: Props = this.props;

    return (
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
              background-image: url(${staticUrl}${backgroundUrl});
              background-image: -webkit-image-set(
                url(${staticUrl}${backgroundUrl}) 1x,
                url(${staticUrl}${backgroundUrl}) 1.5x
              );
              background-position: top center;
              background-size: 100% auto;
              background-attachment: fixed;
              margin: 0;
              position: relative;
            }
          `}</style>
        </Head>
        <style jsx>{`
          .footer {
            color: rgba(255, 255, 255, 0.2);
            font-family: ${fontFamilies.ui};
            font-size: 10px;
            padding: 20px 15px 10px;
            text-align: right;
          }
          .footer a:link, .footer a:visited, .footer a:active, .footer a:focus {
            color: rgba(255, 255, 255, 0.3) !important;
            font-size: 16px;
            margin-left: 1em;
          }
          .footer a:link:hover,
          .footer a:visited:hover,
          .footer a:active:hover,
          .footer a:focus:hover {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          .sticky-panel {
            position: fixed;
            width: 100%;
            background-image: url(${staticUrl}${backgroundUrl});
            background-image:
              -webkit-image-set(
                url(${staticUrl}${backgroundUrl}) 1x,
                url(${staticUrl}${backgroundUrl}) 1.5x
              );
            background-position: top center;
            background-size: 100% auto;
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
        {/* <HeroGrid
          activeHeroName={path(['activeHero', 'name'], state)}
          dispatch={dispatch}
          heroes={filter(
            compose(
              name => (name.indexOf(toLower(state.searchString)) !== -1),
              toLower,
              prop('name'),
            ),
            eventUnits,
          )}
        /> */}
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
        <div className="footer">
          Proving Grounds is an open source project licensed under GPL-3.0+
          <a href="https://github.com/ajhyndman/fire-emblem-working-title/issues">
            <MarkGithub />
          </a>
        </div>
      </div>
    );
  }
}

export default Root;
