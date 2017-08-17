// @flow
import 'babel-polyfill';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import { isEmpty, pathOr } from 'ramda';
import { getDefaultInstance } from 'fire-emblem-heroes-calculator';

import Modal from '../src/components/Modal';
import Overlay from '../src/components/Overlay';
import Root, { panelHeight } from '../src/components/Root';
import Router from '../src/router';
import SkillSelector from '../src/components/SkillSelector';
import Toast from '../src/components/Toast';
import initStore from '../src/store';
import { decodeHero } from '../src/queryCodex';
import type { Dispatch } from '../src/reducer';
import type { State } from '../src/store';

type Props = {
  dispatch: Dispatch,
  state: State,
};

// TODO: redirect to non-build page instead of showing an Anna configuration.
const defaultInstance = getDefaultInstance('Anna');

class Build extends React.Component {
  props: Props;

  static async getInitialProps({ store, req, query }) {
    const dispatch: Dispatch = store.dispatch;
    if (!isEmpty(query)) {
      dispatch({
        type: 'SELECT_HERO',
        hero: decodeHero(query['0']) || 'CLEAR',
      });
      dispatch({
        type: 'SELECT_HERO',
        hero: decodeHero(query['1']) || 'CLEAR',
      });
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
    const heroInstance =
      state.activeSlot !== undefined
        ? state.heroSlots[state.activeSlot] || defaultInstance
        : defaultInstance;

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
          .skill-selector {
            width: 100%;
          }
        `}</style>
        <Root {...this.props} />
        <Overlay
          onClick={event => {
            event.stopPropagation();
            dispatch({
              type: 'SELECT_SLOT',
              slot: undefined,
            });
            Router.replace('/');
          }}
        >
          <div className="container">
            <Modal>
              <div className="skill-selector">
                <SkillSelector
                  activeSkillName={pathOr(
                    '',
                    ['skills', state.activeSkill],
                    heroInstance,
                  )}
                  dispatch={dispatch}
                  heroInstance={heroInstance}
                  onClose={skillName => {
                    // This one is technically correct, skillType could be voided before the
                    // callback is triggered.  But I know it won't be.
                    // $FlowIssue
                    dispatch({
                      type: 'UPDATE_SKILL',
                      skillType: state.activeSkill,
                      skill: skillName,
                    });
                    Router.back();
                  }}
                  showGuide={state.showGuide}
                  // TODO: if no skill is selected, we shouldn't be allowed on this route
                  skillType={state.activeSkill || 'WEAPON'}
                />
              </div>
            </Modal>
          </div>
        </Overlay>
        <Toast dispatch={dispatch} messages={state.notifications} />
      </div>
    );
  }
}

export default withRedux(initStore, state => ({ state }))(Build);
