"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (event, msg) {
  var subscribers = this._subscribers[event] || [];
  subscribers.forEach(function (handlers) {
    handlers.callback.apply(handlers.context, msg);
  });
};