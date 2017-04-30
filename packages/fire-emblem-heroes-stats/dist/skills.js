'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSkillObject = exports.getSkillType = exports.getAllSkills = undefined;

var _ramda = require('ramda');

var _stats = require('./stats.json');

var _stats2 = _interopRequireDefault(_stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var skillTypeByName = (0, _ramda.compose)((0, _ramda.map)((0, _ramda.prop)('type')),
// $FlowIssue indexBy confuses flow
(0, _ramda.indexBy)((0, _ramda.prop)('name')),
// Exclude seals so that 'Attack +1' is an a-passive.
(0, _ramda.filter)(function (s) {
  return s.type !== 'SEAL';
}))(_stats2.default.skills);

// eslint-disable-next-line import/no-unresolved


var skillsByTypeAndName = (0, _ramda.compose)(
// $FlowIssue indexBy confuses flow
(0, _ramda.map)((0, _ramda.indexBy)((0, _ramda.prop)('name'))),
// $FlowIssue groupBy confuses flow
(0, _ramda.groupBy)((0, _ramda.prop)('type')))(_stats2.default.skills);

var getAllSkills = exports.getAllSkills = function getAllSkills() {
  return _stats2.default.skills;
};

var getSkillType = exports.getSkillType = function getSkillType(skillName) {
  return skillTypeByName[skillName];
};

var getSkillObject = exports.getSkillObject = function getSkillObject(skillType, skillName) {
  return skillsByTypeAndName[skillType] && skillsByTypeAndName[skillType][skillName];
};