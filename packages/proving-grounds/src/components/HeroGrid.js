// @flow
import React from 'react';
import Color from 'color-js';
import { map, range } from 'ramda';

import Hero from './Hero';
import {
  colors,
  fontFamilies,
  fontSizes,
  gridSize,
  lineHeights,
} from '../theme';
import type { Dispatch } from '../reducer';


type Props = {
  activeHeroName: ?string;
  dispatch: Dispatch;
  heroes: Array<Object>;
};

const HeroGrid = ({ activeHeroName, dispatch, heroes }: Props) => (
  <div className="grid">
    <style jsx>{`
      .grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
      }
      .grid:after {
        content: "";
        flex: auto;
      }
      .gridSquare {
        box-shadow: 0 0 10px rgba(70, 183, 227, 0.4);
        cursor: pointer;
        height: ${gridSize}px;
        margin: 5px;
        position: relative;
        transition: box-shadow 0.2s;
        user-select: none;
        width: ${gridSize}px;
      }
      .gridSquare:hover {
        box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
      }
      .active, .active:hover {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
      div:empty {
        margin: 0 5px;
        width: 56px;
      }
      .name {
        color: ${Color(colors.iceberg).setAlpha(0.75)};
        font-family: ${fontFamilies.ui};
        font-size: ${fontSizes.small}px;
        line-height: ${lineHeights.body};
        overflow: hidden;
        text-align: center;
        text-overflow: ellipsis;
        text-shadow: 0.5px 1px 2px rgba(0, 0, 0, 0.8);
        white-space: nowrap;
      }
    `}</style>
    {map(
      (hero) => (
        <div>
          <div
            key={hero.name}
            className={`gridSquare ${activeHeroName === hero.name ? 'active' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              dispatch({ type: 'SELECT_HERO', hero })
            }}
          >
            <Hero
              name={hero.name}
              weaponType={hero.weaponType}
            />
          </div>
          <div className="name">{hero.shortName || hero.name}</div>
        </div>
      ),
      heroes,
    )}
    {/**
      * Flexbox doesn't really provide grid support.  Add enough empty
      * elements to preserve grid layout of last row on large screens.
      */}
    {map((i) => <div key={i} />, range(0, 30))}
  </div>
);

export default HeroGrid;
