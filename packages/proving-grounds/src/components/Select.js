// @flow
import React from 'react';
import Color from 'color-js';
import cn from 'classnames';
import { map } from 'ramda';

import { colors, fontFamilies } from '../theme';

type Props = {
  onChange: (option: string) => void,
  options: string[],
  selected: string,
};

type State = {
  active: boolean,
};

const height = 30;

class Select extends React.Component {
  state: State;
  props: Props;
  input: HTMLElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      active: false,
    };
  }

  blur = () => {
    this.setState(() => ({ active: false }));
  };

  focus = () => {
    this.setState(() => ({ active: true }));
  };

  render() {
    const { onChange, options, selected } = this.props;

    return (
      <div
        role="input"
        tabIndex="0"
        className={cn('root', { active: this.state.active })}
        ref={node => {
          this.input = node;
        }}
        onBlur={this.blur}
        onFocus={this.focus}
        onMouseDown={event => {
          event.preventDefault();
        }}
      >
        <style jsx>{`
          .root {
            cursor: pointer;
            height: ${height}px;
            overflow: hidden;
            position: relative;
          }
          .root:focus {
            outline: none;
          }
          .root.active {
            overflow: visible;
          }
          .arrow {
            pointer-events: none;
            position: absolute;
            right: 0.75em;
            top: 50%;
            transform: translateY(-50%);
          }
          .arrow::after {
            content: "";
            display: block;
            border-top: ${colors.iceberg} solid ${height / 4}px;
            border-left: transparent solid ${height / 4}px;
            border-right: transparent solid ${height / 4}px;
          }
          .option {
            align-items: center;
            display: flex;
            font-family: ${fontFamilies.ui};
            font-size: ${height / 2}px;
            font-weight: bold;
            height: ${height}px;
            justify-content: space-between;
            line-height: 1;
            padding: 0 2em 0 0.75em;
            user-select: none;
          }
          .options {
            background: transparent;
            border-radius: 8px;
            color: ${colors.iceberg};
            overflow: hidden;
            position: relative;
          }
          .options.active {
            background: ${colors.iceberg};
            color: ${colors.elephant};
            z-index: 1;
          }
          .option.active {
          }
          .option.active:hover {
            background: ${Color(colors.iceberg).darkenByAmount(0.05)};
          }
        `}</style>
        <div
          className={cn('options', { active: this.state.active })}
          style={{
            transform: `translateY(-${options.indexOf(selected) /
              options.length *
              100}%)`,
          }}
        >
          {map(
            option =>
              <div
                key={option}
                className={cn('option', { active: this.state.active })}
                onClick={() => {
                  if (this.state.active) {
                    onChange(option);
                    this.input.blur();
                  } else {
                    this.input.focus();
                  }
                }}
              >
                {option}
              </div>,
            options,
          )}
        </div>
        <div className="arrow" />
      </div>
    );
  }
}

export default Select;
