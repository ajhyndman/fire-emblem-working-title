import {
  compose,
  filter,
  groupBy,
  indexBy,
  map,
  prop,
} from 'ramda';

// eslint-disable-next-line import/no-unresolved
import stats from '../stats.json';
import type { Skill, SkillType } from '.';

type SkillTypeByName = { [key: string]: SkillType };
type SkillsByTypeAndName = { [key: SkillType]: {[key: string]: Skill }};


const skillTypeByName: SkillTypeByName = compose(
  map(prop('type')),
  // $FlowIssue indexBy confuses flow
  indexBy(prop('name')),
  // Exclude seals so that 'Attack +1' is an a-passive.
  filter((s) => s.type !== 'SEAL'),
)(stats.skills);

const skillsByTypeAndName: SkillsByTypeAndName = compose(
  // $FlowIssue indexBy confuses flow
  map(indexBy(prop('name'))),
  // $FlowIssue groupBy confuses flow
  groupBy(prop('type')),
)(stats.skills);

export const getAllSkills = () => stats.skills;

export const getSkillType = (skillName: string): SkillType => skillTypeByName[skillName];

export const getSkillObject = (skillType: SkillType, skillName: string): Skill =>
  skillsByTypeAndName[skillType] && skillsByTypeAndName[skillType][skillName];
