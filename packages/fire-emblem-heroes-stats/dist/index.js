'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stats = require('./stats.json');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_stats).default;
  }
});

var _events = require('./temporal/events');

Object.defineProperty(exports, 'getEventHeroes', {
  enumerable: true,
  get: function get() {
    return _events.getEventHeroes;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }