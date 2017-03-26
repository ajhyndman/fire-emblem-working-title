// @flow
import React from 'react';
import {
  anyPass,
  compose,
  filter,
  map,
  not,
  prop,
  test,
} from 'ramda';
import type { SkillType } from 'fire-emblem-heroes-stats';

import Skill from './Skill';
import { getInheritableSkills } from '../heroHelpers';
import type { HeroInstance } from '../heroHelpers';
import type { Dispatch } from '../reducer';


type Props = {
  dispatch: Dispatch;
  heroInstance: HeroInstance;
  skillType: SkillType;
};

const SkillSelector = ({ dispatch, heroInstance, skillType }: Props) => (
  <div className="root">
    <style jsx>{`
      .skill-option:not(:last-of-type) {
        margin-bottom: 10px;
      }
    `}</style>
    {map(
      skill => (
        <div
          className="skill-option"
          onClick={() => {
            dispatch({
              type: 'UPDATE_SKILL',
              skillType: skill.type,
              skill,
            });
          }}
        >
          <Skill
            showGuide
            name={skill.name}
          />
        </div>
      ),
      // TODO: Consider the merits of this filter.
      // Maybe the tradeoff in power for simplicity isn't worthwhile.
      filter(
        compose(
          not,
          anyPass([
            test(new RegExp('1')),
            test(new RegExp('2')),
            test(new RegExp('Iron')),
            test(new RegExp('Steel')),
          ]),
          prop('name'),
        ),
        getInheritableSkills(heroInstance.name, skillType),
      ),
    )}
  </div>
);

export default SkillSelector;
