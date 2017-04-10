// @flow
import React from 'react';
import cn from 'classnames';
import { head } from 'ramda';

import {
  breakPoints,
  colors,
  fontFamilies,
  fontSizes,
} from '../theme';
import type { Dispatch } from '../reducer';


type Props = {
  dispatch: Dispatch;
  messages: Array<string>;
};

type State = {
  isOpen: boolean;
  isReady: boolean;
};

const DISPLAY_DURATION = 3000;
const GUTTER_SIZE = 24;
const HEIGHT = 48;
const INIT_DELAY = 1000;
const TRANSITION_DURATION = 300;

class Toast extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
      isReady: false,
    };
  }

  componentDidMount() {
    window.setTimeout(
      () => { this.setState(state => ({ ...state, isReady: true })); },
      INIT_DELAY,
    );
  }

  componentDidUpdate() {
    if (this.props.messages.length > 0 && this.state.isReady) {
      this.show();
    }
  }

  hide = () => {
    this.setState(state => ({ ...state, isOpen: false }));

    window.setTimeout(
      () => {
        this.props.dispatch({ type: 'DEQUEUE_NOTIFICATION' });
        this.setState(state => ({ ...state, isReady: true }));
      },
      TRANSITION_DURATION,
    );
  }

  show = () => {
    this.setState(state => ({ ...state, isOpen: true, isReady: false }));

    window.setTimeout(
      () => { this.wait(); },
      TRANSITION_DURATION,
    );
  }

  wait = () => {
    window.setTimeout(
      () => {
        this.hide();
      },
      DISPLAY_DURATION,
    );
  }

  render() {
    const message = head(this.props.messages);

    return (
      <div className={cn('root', { open: this.state.isOpen })}>
        <style jsx>{`
          .root {
            bottom: 0;
            box-sizing: border-box;
            left: 0;
            position: fixed;
            right: 0;
            transform: translateY(100%);
            transition: transform ${TRANSITION_DURATION}ms;
          }
          .root.open {
            transform: translateY(0%);
          }

          .toast {
            align-items: center;
            background: #323232;
            color: ${colors.iceberg};
            display: flex;
            font-family: ${fontFamilies.ui};
            font-size: ${fontSizes.medium}px;
            height: ${HEIGHT}px;
            padding: 0 ${GUTTER_SIZE}px;
          }

          @media (min-width: ${breakPoints.small}px) {
            .toast {
              border-radius: 2px;
              display: inline-flex;
              margin: ${GUTTER_SIZE}px;
              max-width: 560px;
              min-width: 280px;
            }
          }
        `}</style>
        <div className="toast">
          {message}
        </div>
      </div>
    );
  }
}

export default Toast;
