// @flow
import React from 'react';
import {
  anyPass,
  compose,
  filter,
  map,
  not,
  propOr,
  test,
} from 'ramda';
import type { SkillType } from 'fire-emblem-heroes-stats';

import SegmentedControl from './SegmentedControl';
import Skill from './Skill';
import { colors, fontFamilies, fontSizes } from '../theme';
import { getInheritableSkills } from '../heroHelpers';
import { isMaxTier } from '../skillHelpers';
import type { Dispatch } from '../reducer';
import type { HeroInstance } from '../store';


type Props = {
  activeSkillName: string;
  dispatch: Dispatch;
  onClose: (skill: ?Object) => void;
  heroInstance: HeroInstance;
  showGuide: boolean;
  skillType: SkillType;
};

const SkillSelector = ({
  activeSkillName,
  dispatch,
  onClose,
  heroInstance,
  showGuide,
  skillType,
}: Props) => (
  <div className="root">
    <style jsx>{`
      .section {
        margin-bottom: 10px;
      }
      .title {
        color: ${colors.iceberg};
        font-family: ${fontFamilies.ui};
        font-size: ${fontSizes.medium}px;
        line-height: 1;
        margin: 0;
      }
      .skill-option:not(:last-of-type) {
        margin-bottom: 10px;
      }
    `}</style>
    <div className="section">
      <h1 className="title">Show detail:</h1>
    </div>
    <div className="section">
      <SegmentedControl
        options={['On', 'Off']}
        onChange={option => {
          if (option === 0) {
            dispatch({ type: 'SHOW_GUIDE_CHANGE', value: true });
          } else {
            dispatch({ type: 'SHOW_GUIDE_CHANGE', value: false });
          }
        }}
        selected={showGuide === true ? 0 : 1}
      />
    </div>
    {map(
      skill => (
        <div
          key={skill ? skill.name : ''}
          className="skill-option"
          onClick={() => onClose(skill)}
        >
          <Skill
            active={(skill ? skill.name : '') === activeSkillName}
            showGuide={showGuide}
            name={skill ? skill.name : '--'}
          />
        </div>
      ),
      // TODO: Consider the merits of this filter.
      // Maybe the tradeoff in power for simplicity isn't worthwhile.
      filter(
        compose(
          isMaxTier,
          propOr('', 'name'),
        ),
        [null].concat(getInheritableSkills(heroInstance.name, skillType)),
      ),
    )}
  </div>
);

export default SkillSelector;
