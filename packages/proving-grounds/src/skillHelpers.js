// @flow
import {
  find,
  propEq,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type { Skill } from 'fire-emblem-heroes-stats';

// $FlowIssue flow thinks this will return an Array
export const getSkillInfo = (skillName: string) : Skill =>
    find(propEq('name', skillName), stats.skills);
