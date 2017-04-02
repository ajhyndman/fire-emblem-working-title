// @flow
import React from 'react';
import {
  compose,
  equals,
  filter,
  keys,
  mapObjIndexed,
  not,
  values,
  zipObj,
} from 'ramda';
import { withState } from 'recompose';
import type { Hero, Skill as SkillShape, SkillType } from 'fire-emblem-heroes-stats';

import RaritySelector from './RaritySelector';
import SegmentedControl from './SegmentedControl';
import Select from './Select';
import Skill from './Skill';
import SkillSelector from './SkillSelector';
import StatSheet from './StatSheet';
import { colors, fontFamilies, fontSizes } from '../theme';
import { hasStatsForRarity, lookupStats } from '../heroHelpers';
import { staticUrl } from '../../config';
import type { HeroInstance } from '../store';
import type { Dispatch } from '../reducer';


// eslint-disable-next-line
type Props = {|
  +dispatch: Dispatch;
  +heroInstance: HeroInstance;
  +level: 1 | 40;
|};

// eslint-disable-next-line
type State = {
  open: true;
  skillType: SkillType;
} | {
  open: false;
  skillType: void;
};

const HeroConfigurer = withState(
  'state',
  'setState',
  { open: false, skillType: undefined },
)(({
  dispatch,
  heroInstance,
  level,
  state,
  setState,
  // eslint can't parse type spreads yet: https://github.com/babel/babylon/pull/418
}/* : { ...Props, +setState: (state: State) => void; +state: State; } */) => {
  const hero: Hero = lookupStats(heroInstance.name);

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
          border: 46px solid transparent;
          border-image: url(${staticUrl}Border_Blue.png) 46 fill stretch;
          display: flex;
          flex-direction: column;
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
          margin: 0 auto 25px;
          max-width: 100%;
        }
        .skill-selector {
          width: 100%;
        }
        .center {
          display: flex;
          justify-content: space-around;
        }
        .active-skill:not(:last-of-type) {
          margin-bottom: 10px;
        }
      `}</style>
      {!state.open
        ? (
          <div>
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
                      // $FlowIssue: Flow isn't thinks invertObject might have side effects
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
                      // $FlowIssue: Flow isn't thinks invertObject might have side effects
                      ? invertObject(varianceOptions)[heroInstance.bane]
                      : '—'}
                  />
                </div>
              </div>
            </div>
            <div className="section">
              {
                // $FlowIssue: I think flow thinks skillType could be any string.
                values(mapObjIndexed(
                  (skill: ?SkillShape, skillType: SkillType) => (
                    <div
                      key={skillType}
                      className="active-skill"
                    >
                      <Skill
                        name={skill ? skill.name : '--'}
                        onClick={() => { setState({ open: true, skillType: skillType }); }}
                      />
                    </div>
                  ),
                  heroInstance.skills,
                ))
              }
            </div>
          </div>
        )
        : (
          <div className="skill-selector">
            <SkillSelector
              onClose={skill => {
                // This one is technically correct, skillType could be voided before the
                // callback is triggered.  But I know it won't be.
                // $FlowIssue
                dispatch({
                  type: 'UPDATE_SKILL',
                  skillType: state.skillType,
                  skill,
                });
                setState({ open: false, skillType: undefined });
              }}
              heroInstance={heroInstance}
              skillType={state.skillType}
            />
          </div>
        )
      }
    </div>
  );
});

export default HeroConfigurer;
