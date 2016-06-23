'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var clickThru = this._parameters.clickThru || {
    url: 'http://www.example.com',
    trackID: 123,
    playerHandles: false
  };

  _trigger2.default.call(this, 'AdClickThru', [clickThru.url, clickThru.trackID, clickThru.playerHandles]);

  // Babel 6 can'mt seem to compile this
  // if (!clickThru.playerHandles) {
  //   window.open(clickThru.url, '_blank')
  // }
};

var _trigger = require('../trigger');

var _trigger2 = _interopRequireDefault(_trigger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }