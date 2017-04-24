'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEventHeroes = getEventHeroes;

var _ramda = require('ramda');

var _ = require('./2017.03.09-ursula');

var _2 = _interopRequireDefault(_);

var _3 = require('./2017.03.25-michalis');

var _4 = _interopRequireDefault(_3);

var _5 = require('./2017.04.04-navarre');

var _6 = _interopRequireDefault(_5);

var _7 = require('./2017.04.20-zephiel');

var _8 = _interopRequireDefault(_7);

var _9 = require('./2017.04.24-navarre');

var _10 = _interopRequireDefault(_9);

var _11 = require('./2017.04.24-robin-f');

var _12 = _interopRequireDefault(_11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEventHeroes() {
  var allEvents = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var now = new Date();
  return (0, _ramda.compose)(_ramda.flatten, (0, _ramda.map)((0, _ramda.prop)('unitList')), (0, _ramda.filter)(function (event) {
    return allEvents || now >= event.startTime && now <= event.endTime;
  }))([_2.default, _4.default, _6.default, _8.default, _10.default, _12.default]);
}