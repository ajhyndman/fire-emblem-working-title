// @flow
import React from 'react';
import cn from 'classnames';
import { withState } from 'recompose';

import { colors, fontFamilies, transition } from '../theme';

type Props = {
  onChange: (value: string) => void;
  value: string;
};

type WithState = {
  isFocused: Boolean;
  setFocus: (value: boolean) => void;
};

const Input = withState('isFocused', 'setFocus', false)(
  ({ isFocused, setFocus, onChange, value, ...rest }: Props & WithState) => (
    <div
      className={cn({ root: true, active: isFocused })}
      onClick={event => event.stopPropagation()}
      onKeyDown={event => { if (event.keyCode === 27) onChange(''); }}
    >
      <style jsx>{`
        .root {
          border-top: 2px solid #9ad8da;
          border-bottom: 2px solid #40737d;
          position: relative;
          transition:
            box-shadow ${transition},
            border-top ${transition},
            border-bottom ${transition};
        }
        .root.active {
          border-top: 2px solid #dcf2f3;
          border-bottom: 2px solid #92d3d7;
        }
        .root:hover, .root.active {
          box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
        }
        .root::before, .root::after {
          background-image: linear-gradient(to bottom, #9ad8da, #40737d);
          content: "";
          display: block;
          position: absolute;
          top: -2px;
          bottom: -2px;
          transition: background-image ${transition};
          width: 2px;
        }
        .root.active::before, .root.active::after {
          background-image: linear-gradient(to bottom, #dcf2f3, #92d3d7);
        }
        .root::before {
          left: -2px;
        }
        .root::after {
          right: -2px;
        }
        input {
          background: ${colors.elephant};
          border: none;
          box-sizing: border-box;
          color: white;
          display: block;
          font-family: ${fontFamilies.ui};
          height: 2em;
          padding: 0 1.5em 0 0.5em;
          width: 100%;
        }
        input:focus {
          outline: none;
        }
        input::placeholder {
          font-family: ${fontFamilies.ui};
        }
        .close {
          cursor: pointer;
          color: white;
          padding: 0 0.25em;
          position: absolute;
          top: 50%;
          right: 0.25em;
          transform: translateY(-50%);
        }
      `}</style>
      <input
        {...rest}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={event => onChange(event.target.value)}
        value={value}
      />
      <span
        onClick={() => onChange('')}
        className="close"
        style={{ display: value === '' ? 'none' : 'block' }}
      >
        ×
      </span>
    </div>
  ),
);

export default Input;
