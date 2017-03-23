// @flow
import React from 'react';
import stats from 'fire-emblem-heroes-stats';
import {
  compose,
  equals,
  filter,
  find,
  keys,
  not,
  propEq,
  values,
  zipObj,
} from 'ramda';
import type { Hero } from 'fire-emblem-heroes-stats';

import RaritySelector from './RaritySelector';
import SegmentedControl from './SegmentedControl';
import Select from './Select';
import StatSheet from './StatSheet';
import { colors, fontFamilies, fontSizes } from '../theme';
import { hasStatsForRarity } from '../heroHelpers';
import type { HeroInstance } from '../heroHelpers';
import type { Dispatch } from '../reducer';


type Props = {
  dispatch: Dispatch;
  heroInstance: HeroInstance;
  level: 1 | 40;
};

const HeroConfigurer = ({
  dispatch,
  heroInstance,
  level,
}: Props) => {
  // $FlowIssue flowtype for find is too generic
  const hero: Hero = find(propEq('name', heroInstance.name), stats.heroes);

  const varianceOptions = {
    HP: 'hp',
    ATK: 'atk',
    SPD: 'spd',
    DEF: 'def',
    RES: 'res',
  };

  const invertObject = (obj) => zipObj(values(obj), keys(obj));

  return (
    <div className="root">
      <style jsx>{`
        .root {
          align-items: center;
          background: ${colors.elephant};
          display: flex;
          flex-direction: column;
          max-width: 275px;
          padding: 1.5em 1em;
        }
        .row {
          align-items: baseline;
          color: ${colors.iceberg};
          display: flex;
          font-family: ${fontFamilies.ui};
          font-size: ${fontSizes.medium}px;
          font-weight: bold;
          justify-content: space-between;
          padding-left: 0.75em;
        }
        .section {
          width: 250px;
          margin: 0 0 25px;
          max-width: 100%;
        }
        .center {
          display: flex;
          justify-content: space-around;
        }
        .skills-placeholder {
          color: ${colors.iceberg};
          font-family: ${fontFamilies.ui};
          font-size: ${fontSizes.small}px;
          font-weight: bold;
          height: 100px;
          text-align: center;
        }
      `}</style>
      <div className="section">
        <SegmentedControl
          options={['Lv 1', 'Lv 40']}
          selected={level === 1 ? 0 : 1}
          onChange={i => dispatch({ type: 'SET_PREVIEW_LEVEL', level: ([1, 40])[i] })}
        />
      </div>
      <div className="section">
        <StatSheet
          heroInstance={heroInstance}
          level={level}
        />
      </div>
      <div className="section center">
        <RaritySelector
          disabled={[
            !hasStatsForRarity(hero, 1),
            !hasStatsForRarity(hero, 2),
            !hasStatsForRarity(hero, 3),
            !hasStatsForRarity(hero, 4),
            !hasStatsForRarity(hero, 5),
          ]}
          selected={heroInstance.rarity}
          onChange={rarity => dispatch({ type: 'UPDATE_RARITY', rarity })}
        />
      </div>
      <div className="section" style={{ width: 175 }}>
        <div className="row">
          Boon
          <div style={{ flexBasis: 75 }}>
            <Select
              onChange={selected => dispatch({
                type: 'UPDATE_BOON',
                stat: varianceOptions[selected],
              })}
              options={[
                '—',
                ...keys(filter(compose(not, equals(heroInstance.bane)), varianceOptions)),
              ]}
              selected={heroInstance.boon
                // $FlowIssue: Flow isn't confident that invertObject doesn't have side effects.
                ? invertObject(varianceOptions)[heroInstance.boon]
                : '—'}
            />
          </div>
        </div>
        <div className="row">
          Bane
          <div style={{ flexBasis: 75 }}>
            <Select
              onChange={selected => dispatch({
                type: 'UPDATE_BANE',
                stat: varianceOptions[selected],
              })}
              options={[
                '—',
                ...keys(filter(compose(not, equals(heroInstance.boon)), varianceOptions)),
              ]}
              selected={heroInstance.bane
                // $FlowIssue: Flow isn't confident that invertObject doesn't have side effects.
                ? invertObject(varianceOptions)[heroInstance.bane]
                : '—'}
            />
          </div>
        </div>
      </div>
      <div className="section">
        <div className="skills-placeholder">
          Skills coming soon.
        </div>
      </div>
    </div>
  );
};

export default HeroConfigurer;
