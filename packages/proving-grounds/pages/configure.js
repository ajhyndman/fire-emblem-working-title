// @flow
import React from 'react';
import Router from 'next/router';
import withRedux from 'next-redux-wrapper';
// import { isEmpty } from 'ramda';

import Root, { panelHeight } from '../src/components/Root';
import HeroConfigurer from '../src/components/HeroConfigurer';
import Overlay from '../src/components/Overlay';
import initStore from '../src/store';
// import { decodeHero } from '../src/queryCodex';
import type { Dispatch } from '../src/reducer';
import type { State } from '../src/store';


type Props = {
  dispatch: Dispatch;
  state: State;
};

class Configure extends React.Component {
  props: Props;

  static async getInitialProps ({ store, req }) {
    const dispatch: Dispatch = store.dispatch;
    // if (!isEmpty(query)) {
    //   dispatch({ type: 'SELECT_SLOT', slot: 0 });
    //   dispatch({ type: 'SELECT_HERO', hero: decodeHero(query['0']) });
    //   dispatch({ type: 'SELECT_SLOT', slot: 1 });
    //   dispatch({ type: 'SELECT_HERO', hero: decodeHero(query['1']) });
    // }

    if (req) dispatch({ type: 'SET_HOST', host: req.headers.host });
  }

  render() {
    return (
      <div>
        <style jsx>{`
          .container {
            margin: ${panelHeight / 2}px auto 0;
            width: 275px;
          }
        `}</style>
        <Root {...this.props} />
        <Overlay
          onClick={event => {
            event.stopPropagation();
            Router.push('/');
          }}
          onMouseEnter={() => {
            // The root route is going to be frequently switched to and from.
            Router.prefetch('/');
          }}
        >
          <div className="container">
            <HeroConfigurer
              dispatch={this.props.dispatch}
              heroInstance={this.props.state.heroSlots[this.props.state.activeSlot]}
              level={this.props.state.previewLevel}
            />
          </div>
        </Overlay>
      </div>
    );
  }
}

export default withRedux(initStore, state => ({ state }))(Configure);
