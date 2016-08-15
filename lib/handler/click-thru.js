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

  this.emit('AdClickThru', [clickThru.url, clickThru.trackID, clickThru.playerHandles]);

  // Babel 6 can'mt seem to compile this
  // if (!clickThru.playerHandles) {
  //   window.open(clickThru.url, '_blank')
  // }
};