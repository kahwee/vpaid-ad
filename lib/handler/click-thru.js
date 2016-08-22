'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var clickThru = this._options.clickThru || {
    url: 'http://www.example.com',
    trackID: 123,
    playerHandles: false
  };
  this.emit('AdClickThru', [clickThru.url, clickThru.trackID, clickThru.playerHandles]);
};