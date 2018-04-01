// @flow
import React from 'react';
import Color from 'color-js';
import { map, addIndex } from 'ramda';
import { getHero } from 'fire-emblem-heroes-stats';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';

import HeroPortrait from './Hero';
import HeroSlot from './HeroSlot';
import {
  colors,
  fontFamilies,
  fontSizes,
  gridSize,
  lineHeights,
} from '../theme';
import type { Dispatch } from '../reducer';

type Props = {
  activeShelfSlot: ?number,
  dispatch: Dispatch,
  heroShelf: Array<HeroInstance>,
};

const GUTTER_HEIGHT = 5;
const GUTTER_WIDTH = 8;

const HeroShelf = ({ activeShelfSlot, dispatch, heroShelf }: Props) => (
  <div className="grid">
    <style jsx>{`
      .grid {
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${gridSize}px, 1fr));
        grid-column-gap: ${GUTTER_WIDTH * 2}px;
        grid-row-gap: ${GUTTER_HEIGHT}px;
        margin: ${GUTTER_HEIGHT}px ${GUTTER_WIDTH}px;
      }
      .gridSquareOuter {
        align-items: center;
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .add {
        align-items: center;
        background-color: ${Color(colors.aquaIsland).setAlpha(0.2)};
        box-shadow: inset 0 0 12px ${colors.aquaIsland};
        color: white;
        display: flex;
        font-family: ${fontFamilies.ui};
        font-size: ${fontSizes.medium};
        height: ${gridSize}px;
        justify-content: center;
        line-height: 1;
        width: ${gridSize}px;
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
    <div className="gridSquareOuter">
      <HeroSlot
        isActive={false}
        onClick={() => {
          dispatch({ type: 'ADD_TO_SHELF' });
        }}
      >
        <div className="add">Add</div>
      </HeroSlot>
    </div>
    {addIndex(map)((hero: HeroInstance, i: number) => {
      const heroStats = getHero(hero.name);

      return (
        <div className="gridSquareOuter" key={`${i}-${hero.name}`}>
          <HeroSlot
            isActive={activeShelfSlot === i}
            onClick={() => {
              dispatch({
                type: 'SELECT_SHELF_HERO',
                hero,
                index: i,
              });
            }}
          >
            <HeroPortrait
              mergeLevel={hero.mergeLevel}
              name={hero.name}
              rarity={hero.rarity}
              assets={heroStats.assets}
              weaponType={heroStats.weaponType}
            />
          </HeroSlot>
          <div className="name">{heroStats.shortName || heroStats.name}</div>
        </div>
      );
    }, heroShelf)}
  </div>
);

export default HeroShelf;
