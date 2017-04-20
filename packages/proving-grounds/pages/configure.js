// @flow
import 'babel-polyfill';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import { isEmpty } from 'ramda';

import HeroConfigurer from '../src/components/HeroConfigurer';
import Overlay from '../src/components/Overlay';
import Root, { panelHeight } from '../src/components/Root';
import Router from '../src/router';
import initStore from '../src/store';
import { getDefaultSkills } from '../src/heroHelpers';
import { decodeHero } from '../src/queryCodex';
import type { Dispatch } from '../src/reducer';
import type { State } from '../src/store';


type Props = {
  dispatch: Dispatch;
  state: State;
};

// TODO: redirect to non-configure page instead of showing an Anna configuration.
const defaultInstance = {
  name: 'Anna',
  bane: undefined,
  boon: undefined,
  rarity: 5,
  skills: getDefaultSkills('Anna', 5),
};

class Configure extends React.Component {
  props: Props;

  static async getInitialProps ({ store, req, query }) {
    const dispatch: Dispatch = store.dispatch;
    if (!isEmpty(query)) {
      dispatch({ type: 'SELECT_HERO', hero: decodeHero(query['0']) || 'CLEAR' });
      dispatch({ type: 'SELECT_HERO', hero: decodeHero(query['1']) || 'CLEAR'});
      dispatch({ type: 'SELECT_SLOT', slot: query['slot'] || 0 });
    }

    if (req) dispatch({ type: 'SET_HOST', host: req.headers.host });
  }

  componentDidMount() {
    // The root route is going to be frequently switched to and from.
    Router.prefetch('/');
  }

  render() {
    return (
      <div>
        <style jsx>{`
          .container {
            left: 50%;
            margin-bottom: 2em;
            max-width: 90%;
            position: absolute;
            top: ${panelHeight / 4}px;
            transform: translateX(-50%);
            width: 350px;
          }
        `}</style>
        <Root {...this.props} />
        <Overlay
          onClick={event => {
            event.stopPropagation();
            this.props.dispatch({
              type: 'SELECT_SLOT',
              slot: undefined,
            });
            Router.push('/');
          }}
        >
          <div className="container">
            <HeroConfigurer
              dispatch={this.props.dispatch}
              heroInstance={this.props.state.heroSlots[this.props.state.activeSlot || 0]
                || defaultInstance}
              level={this.props.state.previewLevel}
              showGuide={this.props.state.showGuide}
            />
          </div>
        </Overlay>
      </div>
    );
  }
}

export default withRedux(initStore, state => ({ state }))(Configure);
