// @flow
import React from 'react';
import cn from 'classnames';
import Color from 'color-js';
import { addIndex, map } from 'ramda';

import { colors, activateColor, fontFamilies, transition } from '../theme';

type Props = {
  selected?: number,
  options: string[],
  onChange: (nextSelected: number) => void,
  maxWidth?: number,
  small?: boolean,
};

const SegmentedControl = ({
  selected,
  options,
  onChange,
  maxWidth,
  small,
}: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        display: flex;
        justify-content: space-between;
        flex-basis: ${maxWidth ? `${maxWidth}px` : '100%'};
      }
      button {
        background: ${colors.elephant40};
        color: ${Color(colors.elephant)
          .setValue(0.7)
          .setSaturation(0.1)
          .toString()};
        cursor: pointer;
        font-family: ${fontFamilies.ui};
        font-weight: bold;
        font-size: ${small ? 14 : 16}px;
        letter-spacing: 0.05em;
        border-top: 2px solid ${colors.aquaIsland};
        border-bottom: 2px solid ${colors.fadedJade};
        border-right: none;
        border-left: none;
        padding: ${small ? 1 : 4.5}px;
        position: relative;
        transition: box-shadow ${transition}, border-top ${transition},
          border-bottom ${transition};
      }
      button:focus {
        outline: none;
      }
      button:hover,
      button.active {
        box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
      }
      button.active {
        border-top: 2px solid ${activateColor(colors.aquaIsland)};
        border-bottom: 2px solid ${activateColor(colors.fadedJade)};
        color: white;
      }
      button::before,
      button::after {
        background-image: linear-gradient(
          to bottom,
          ${colors.aquaIsland},
          ${colors.fadedJade}
        );
        content: '';
        display: block;
        position: absolute;
        top: -2px;
        bottom: -2px;
        transition: background-image ${transition};
        width: 2px;
      }
      button.active::before,
      button.active::after {
        background-image: linear-gradient(
          to bottom,
          ${activateColor(colors.aquaIsland)},
          ${activateColor(colors.fadedJade)}
        );
      }
      button::before {
        left: -2px;
      }
      button::after {
        right: -2px;
      }
    `}</style>
    {addIndex(map)(
      (option, i) => (
        <button
          key={option}
          className={cn({ active: selected === i })}
          style={{
            flexBasis: `${(1 / (options.length + (small ? 0.05 : 0.25))) *
              100}%`,
          }}
          onClick={() => onChange(i)}
        >
          {option}
        </button>
      ),
      options,
    )}
  </div>
);

export default SegmentedControl;
