// @flow
import {
  compose,
  head,
  indexBy,
  join,
  juxt,
  map,
  match,
  prop,
  tail,
  test,
  toUpper,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type { Skill } from 'fire-emblem-heroes-stats';

export type SkillsByName = { [key: string]: Skill };


// $FlowIssue indexBy confuses flow
const skillsByName: SkillsByName = indexBy(prop('name'), stats.skills);

export const getSkillInfo = (skillName: string): Skill => skillsByName[skillName];

const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]));

// Returns the value for a stat provided by a passive skill
export function getStatValue(skillName: string, statKey: string, isAttacker: boolean) {
  const skill = getSkillInfo(skillName);
  if (skill == null) {
    return 0;
  } else if (skill.type === 'WEAPON') {
    if (statKey === 'atk') {
      // Flow does not like conversion directly to WeaponSkill so I convert to an any instead
      const anySkill: any = skill;
      const weaponMight = anySkill['damage(mt)'];
      if (isAttacker && skill.name === 'Durandal') {
        return weaponMight + 4;
      }
      return weaponMight;
    } else if (statKey === 'spd') {
      if (skill.name === 'Yato' && isAttacker) {
        return 4;
      }
      if (test(/Brave|Dire/, skill.name)) {
        return -5;
      }
    } else if ((skill.name === 'Binding Blade' || skill.name === 'Naga') && !isAttacker) {
      return 2;
    }
  } else if (skill.type === 'PASSIVE_A') {
    const statRegex = new RegExp(statKey === 'hp' ? 'max HP' : capitalize(statKey));
    if (test(statRegex, skill.effect)) {
      const skillNumbers = map(parseInt, match(/\d+/g, skill.effect));
      // Atk/Def/Spd/Res/HP+ and Fury
      if (test(/(Fury|\+)/, skillName)) {
        return skillNumbers[0];
      }
      // Death/Darting/Armored/Warding Blow
      if (isAttacker && test(/Blow/, skillName)) {
        return skillNumbers[0];
      }
      if (test(/Life and Death/, skillName)) {
        if (statKey === 'atk' || statKey === 'spd') {
          return skillNumbers[0];
        } else if (statKey === 'def' || statKey === 'res') {
          return -skillNumbers[1];
        }
      }
    }
  }
  return 0;
}
