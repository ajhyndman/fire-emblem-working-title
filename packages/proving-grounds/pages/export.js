// @flow
import 'babel-polyfill';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import { isEmpty } from 'ramda';
import { importInstance } from 'fire-emblem-heroes-calculator';

import ImportExportPanel from '../src/components/ImportExportPanel';
import Modal from '../src/components/Modal';
import Overlay from '../src/components/Overlay';
import Root, { panelHeight } from '../src/components/Root';
import Toast from '../src/components/Toast';
import Router from '../src/router';
import initStore from '../src/store';
import { decodeHero } from '../src/queryCodex';
import type { Dispatch } from '../src/reducer';
import type { State } from '../src/store';


type Props = {
  dispatch: Dispatch;
  state: State;
};

class Build extends React.Component {
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
    // These routes are likely to be frequently switched to and from.
    Router.prefetch('/');
    Router.prefetch('/build');
  }

  render() {
    const { dispatch, state } = this.props;

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
            Router.replace('/');
          }}
        >
          <div className="container">
            <Modal>
              <ImportExportPanel
                dispatch={dispatch}
                onChange={value => {
                  const activeSlot = state.activeSlot;
                  dispatch({ type: 'SELECT_HERO', hero: importInstance(value) });
                  dispatch({ type: 'SELECT_SLOT', slot: activeSlot });
                  dispatch({ type: 'CHANGE_EXPORT_STRING', value });
                }}
                value={state.exportString}
              />
            </Modal>
          </div>
        </Overlay>
        <Toast dispatch={dispatch} messages={state.notifications} />
      </div>
    );
  }
}

export default withRedux(initStore, state => ({ state }))(Build);
