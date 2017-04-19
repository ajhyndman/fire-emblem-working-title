// @flow
import Head from 'next/head';
import React from 'react';
import MarkGithub from 'react-icons/lib/go/mark-github';
import Reddit from 'react-icons/lib/fa/reddit';
import stats from 'fire-emblem-heroes-stats';
import {
  allPass,
  compose,
  filter,
  map,
  path,
  pathOr,
  prop,
  propOr,
  split,
  toLower,
} from 'ramda';

import CombatPreview from './CombatPreview';
import CombatResult from './CombatResult';
import HeroGrid from './HeroGrid';
import Input from './Input';
import ShareButton from './ShareButton';
import Toast from './Toast';
import matchHero from '../matchHero';
import { encodeHero } from '../queryCodex';
import { fontFamilies } from '../theme';
import { getEventHeroes } from '../temporal/events';
import { deployTimestamp, staticUrl } from '../../config';
import type { Dispatch } from '../reducer';
import type { State } from '../store';


type Props = {
  dispatch: Dispatch;
  state: State;
};

export const panelHeight = 212;

const backgroundUrl = 'Bg_WorldMap2.png';

class Root extends React.Component {
  props: Props;
  searchInput: ReactClass<*>;

  componentDidMount() {
    window.document.onkeydown = event => {
      if (
        event.getModifierState('Alt')
        || event.getModifierState('Control')
        || event.getModifierState('Meta')
        || window.location.pathname !== '/'
      ) return;
      this.searchInput.focus();
    };
  }

  shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.state.heroSlots !== nextProps.state.heroSlots
      || this.props.state.activeSlot !== nextProps.state.activeSlot
      || this.props.state.activeHero !== nextProps.state.activeHero
      || this.props.state.searchString !== nextProps.state.searchString
      || this.props.state.notifications !== nextProps.state.notifications
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
          <meta name="google-site-verification"
            content="xhsgvhTSpxLtgLXLXXULMVsyO2AKWCFdavpoMp75Ffg" />
          <meta name="description"
            content="The authoritative Fire Emblem: Heroes combat simulator" />
          <meta name="keywords" content="damage calculator,fire emblem,combat simulator,heroes" />
          <meta name="robots" content="index,follow" />
          <meta name="msapplication-config" content="/static/browserconfig.xml" />
          <meta name="theme-color" content="#ffffff" />
          <meta property="og:title" content="Proving Grounds — Fire Emblem: Heroes" />
          <meta property="og:type" content="website" />
          <meta
            property="og:description"
            content="The authoritative Fire Emblem: Heroes combat simulator"
          />
          <meta property="og:url" content="https://proving-grounds.ajhyndman.com" />
          <meta
            property="og:image"
            content="https://proving-grounds.ajhyndman.com/static/site-preview.png"
          />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="564" />
          <meta property="og:image:height" content="448" />
          <link
            href={'https://fonts.googleapis.com/css?family=Mandali&text='
              + '→×—0123456789abcdefghijklmnopqrstuvwxyz'}
            rel="stylesheet"
          />
          <style>{`
            body {
              /* average of background-image color */
              background-color: #333939;
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
            align-items: baseline;
            color: rgba(255, 255, 255, 0.2);
            display: flex;
            font-family: ${fontFamilies.ui};
            font-size: 10px;
            justify-content: space-between;
            padding: 20px 15px 10px;
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
              dispatch={dispatch}
              link={`${
                typeof window !== 'undefined' ? window.location.protocol : ''
              }//${
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
                placeholder="Type a name, class, or skill"
                ref={node => { this.searchInput = node; }}
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
            getEventHeroes(),
          )}
        />
        <HeroGrid
          // $FlowIssue typedef for path isn't resolving correctly
          activeHeroName={pathOr(state.activeHero, ['activeHero', 'name'], state)}
          dispatch={dispatch}
          heroes={filter(
            allPass([
              // $FlowIssue iterable incompatible with array
              allPass(map(
                matchHero,
                split(' ', toLower(state.searchString)),
              )),
              // Exclude unreleased heroes.
              // $FlowIssue typedef for propOr isn't resolving correctly
              (hero) => propOr('N/A', 'releaseDate', hero) !== 'N/A',
            ]),
            stats.heroes,
          )}
          showUndo
        />
        <div className="footer">
          <span>
            Last updated: {deployTimestamp}
          </span>
          <span>
            Proving Grounds is an open source project licensed under GPL-3.0+
            <a href="https://github.com/ajhyndman/fire-emblem-working-title/issues">
              <MarkGithub />
            </a>
            <a
              href={'https://www.reddit.com/r/FireEmblemHeroes/comments/65cmhu'
              + '/proving_grounds_yet_another_duel_simulator/'}
            >
              <Reddit />
            </a>
          </span>
        </div>
        <Toast dispatch={dispatch} messages={state.notifications} />
      </div>
    );
  }
}

export default Root;
