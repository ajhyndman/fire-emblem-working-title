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

import Skill from './Skill';
import { getInheritableSkills } from '../heroHelpers';
import type { HeroInstance } from '../store';


type Props = {
  onClose: (skill: Object) => void;
  heroInstance: HeroInstance;
  skillType: SkillType;
};

const SkillSelector = ({ onClose, heroInstance, skillType }: Props) => (
  <div className="root">
    <style jsx>{`
      .skill-option:not(:last-of-type) {
        margin-bottom: 10px;
      }
    `}</style>
    {map(
      skill => (
        <div
          key={skill.name}
          className="skill-option"
          onClick={() => onClose(skill)}
        >
          <Skill
            // showGuide
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
          propOr('', 'name'),
        ),
        getInheritableSkills(heroInstance.name, skillType),
      ),
    )}
  </div>
);

export default SkillSelector;
