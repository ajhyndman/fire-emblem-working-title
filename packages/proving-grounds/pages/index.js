// @flow
import 'babel-polyfill';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import { isEmpty } from 'ramda';

import Root from '../src/components/Root';
import Router from '../src/router';
import initStore from '../src/store';
import { decodeHero } from '../src/queryCodex';
import type { Dispatch } from '../src/reducer';
import type { State } from '../src/store';


type Props = {
  dispatch: Dispatch;
  state: State;
};

class Home extends React.Component {
  props: Props;

  static async getInitialProps ({ store, req, query }) {
    const dispatch: Dispatch = store.dispatch;
    if (!isEmpty(query)) {
      dispatch({ type: 'SELECT_HERO', hero: decodeHero(query['0']) || 'CLEAR' });
      dispatch({ type: 'SELECT_HERO', hero: decodeHero(query['1']) || 'CLEAR'});
    }

    if (req) dispatch({ type: 'SET_HOST', host: req.headers.host });
  }

  componentDidMount() {
    // The configure route is going to be frequently switched to and from.
    Router.prefetch('/configure');
  }

  render() {
    return <Root {...this.props} />;
  }
}

export default withRedux(initStore, state => ({ state }))(Home);
