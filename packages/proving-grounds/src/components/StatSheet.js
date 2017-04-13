// @flow
import React from 'react';
import Color from 'color-js';
import stats from 'fire-emblem-heroes-stats';
import { find, propEq } from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';

import { colors, fontFamilies, fontSizes, gridSize, lineHeights } from '../theme';
import { getStat } from '../heroHelpers';
import HeroPortrait from './Hero';
import type { HeroInstance } from '../heroInstance';


type Props = {
  heroInstance: HeroInstance;
  level: 1 | 40;
};

const StatSheet = ({
  heroInstance,
  level,
}: Props) => {
  // $FlowIssue: flowtype for find is too generic
  const hero: ?Hero = find(
    propEq('name', heroInstance.name),
    stats.heroes,
  );

  return (
    <div className="stats-root row">
      <style jsx>{`
        .stats-root {
          margin: 0 auto;
          max-width: 100%;
          width: 250px;
          height: ${gridSize}px;
        }
        .row {
          display: flex;
        }
        .col {
          display: flex;
          flex-direction: column;
        }
        .right {
          display: flex;
          flex-grow: 1;
          flex-direction: column;
          justify-content: space-between;
        }
        .name {
          color: ${Color(colors.iceberg).setAlpha(0.85)};
          font-family: ${fontFamilies.ui};
          font-size: ${fontSizes.small}px;
          font-weight: bold;
          line-height: ${lineHeights.body};
          overflow: hidden;
          text-align: center;
          text-overflow: ellipsis;
          text-shadow: 0.5px 1px 2px rgba(0, 0, 0, 0.8);
          white-space: nowrap;
        }
        .stat {
          color: ${Color(colors.iceberg).setAlpha(0.75)};
          font-family: ${fontFamilies.ui};
          font-size: ${fontSizes.small}px;
          font-weight: bold;
          line-height: ${lineHeights.body};
          padding: 0 0 0 2em;
          white-space: nowrap;
          align-items: baseline;
          flex-basis: 50%;
          display: flex;
          justify-content: space-between;
        }
        .stat .key {
          font-size: ${fontSizes.small * 0.75}px;
        }
      `}</style>
      <div className="left col">
        <HeroPortrait
          name={heroInstance.name}
          rarity={heroInstance.rarity}
          weaponType={hero ? hero.weaponType : undefined}
        />
      </div>
      <div className="right col">
        <div className="row">
          <div className="stat"></div>
          <div className="stat">
            <span className="key">HP</span>
            {getStat(heroInstance, 'hp', level)}
          </div>
        </div>
        <div className="row">
          <div className="stat">
            <span className="key">ATK</span>
            {getStat(heroInstance, 'atk', level)}
          </div>
          <div className="stat">
            <span className="key">SPD</span>
            {getStat(heroInstance, 'spd', level)}
          </div>
        </div>
        <div className="row">
          <div className="stat">
            <span className="key">DEF</span>
            {getStat(heroInstance, 'def', level)}
          </div>
          <div className="stat">
            <span className="key">RES</span>
            {getStat(heroInstance, 'res', level)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatSheet;
