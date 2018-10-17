"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default() {
  var clickThru = this.opts.clickThru || {
    url: 'http://www.example.com',
    trackID: 123,
    playerHandles: false
  };
  this.emit('AdClickThru', [clickThru.url, clickThru.trackID, clickThru.playerHandles]);
}