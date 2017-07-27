/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Linear = __webpack_require__(1);

window.getVPAIDAd = function () {
  return new Linear();
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TinyEmitter = __webpack_require__(2);
var vpaidMethods = __webpack_require__(3);
var VideoTracker = __webpack_require__(4);
var isSupported = __webpack_require__(6);

function $removeAll() {
  this._destroyed = true;
  this._videoSlot.src = '';
  this._slot.innerHTML = '';
  this._ui = null;
}

var Linear = function (_TinyEmitter) {
  _inherits(Linear, _TinyEmitter);

  function Linear() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Linear);

    var _this = _possibleConstructorReturn(this, (Linear.__proto__ || Object.getPrototypeOf(Linear)).call(this));

    _this.baseUrl = '';
    _this.emitVpaidMethodInvocations();
    _this._ui = {};
    _this.quartileIndexEmitted = -1;
    _this.hasEngaged = false;

    _this._attributes = {
      companions: '',
      desiredBitrate: 256,
      duration: 30,
      remainingTime: -1,
      expanded: false,
      icons: false,
      linear: true,
      adSkippableState: false,
      viewMode: 'normal',
      width: 0,
      height: 0,
      volume: 1.0
    };

    _this.previousAttributes = Object.assign({}, _this._attributes);

    // open interactive panel -> AdExpandedChange, AdInteraction
    // when close panel -> AdExpandedChange, AdInteraction

    _this.opts = opts;
    _this.opts.videos = _this.opts.videos || [];
    return _this;
  }

  _createClass(Linear, [{
    key: 'set',
    value: function set(attribute, newValue) {
      this.previousAttributes[attribute] = this._attributes[attribute];
      this._attributes[attribute] = newValue;
    }

    /**
     * The video player calls handshakeVersion immediately after loading the ad unit to indicate to the ad unit that VPAID will be used.
     * The video player passes in its latest VPAID version string.
     * The ad unit returns a version string minimally set to “1.0”, and of the form “major.minor.patch” (i.e. “2.1.05”).
     * The video player must verify that it supports the particular version of VPAID or cancel the ad.
     *
     * @param {string} playerVPAIDVersion
     * @return {string} adUnit VPAID version format 'major.minor.patch' minimum '1.0'
     */

  }, {
    key: 'handshakeVersion',
    value: function handshakeVersion(playerVPAIDVersion) {
      return '2.0';
    }
  }, {
    key: 'appendStylesheet',
    value: function appendStylesheet(path) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = this.baseUrl + path;
      link.media = 'all';
      head.appendChild(link);
    }

    /**
     * After the ad unit is loaded and the video player calls handshakeVersion, the video player calls initAd() to initialize the ad experience.
     *
     * The video player may preload the ad unit and delay calling initAd() until nearing the ad playback time; however, the ad unit does not load its assets until initAd() is called. Once the ad unit’s assets are loaded, the ad unit sends the AdLoaded event to notify the video player that it is ready for display. Receiving the AdLoaded response indicates that the ad unit has verified that all files are ready to execute.
     *
     * @param {number} width    indicates the available ad display area width in pixels
     * @param {number} height   indicates the available ad display area height in pixels
     * @param {string} viewMode indicates either “normal”, “thumbnail”, or “fullscreen” as the view mode
    for the video player as defined by the publisher. Default is “normal”.
     * @param {number} desiredBitrate indicates the desired bitrate as number for kilobits per second
    (kbps). The ad unit may use this information to select appropriate bitrate for any
    streaming content.
     * @param {object} creativeData (optional) used for additional initialization data. In a VAST context,
    the ad unit should pass the value for either the Linear or Nonlinear AdParameter
    element specified in the VAST document.
     * @param {object} environmentVars (optional) used for passing implementation-specific runtime
    variables. Refer to the language specific API description for more details.
     */

  }, {
    key: 'initAd',
    value: function initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      var _this2 = this;

      this._attributes.width = width;
      this._attributes.height = height;
      this._attributes.viewMode = viewMode;
      this._attributes.desiredBitrate = desiredBitrate;

      this._slot = environmentVars.slot || this.emit('AdError', 'Video slot is invalid');
      this._videoSlot = environmentVars.videoSlot || this.emit('AdError', 'Slot is invalid');
      this.useBestVideo().then(function () {
        _this2.emit('AdLoaded');
      }).catch(function (reason) {
        _this2.emit('AdLog', reason);
        _this2.emit('AdLoaded');
      });
      this.videoTracker = new VideoTracker(this._videoSlot, this);
    }
  }, {
    key: 'useBestVideo',
    value: function useBestVideo() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var bestVideo = _this3.opts.videos.filter(function (video) {
          return isSupported(video.type);
        });
        if (bestVideo[0]) {
          _this3.setVideoSource(bestVideo[0].url, bestVideo[0].type).then(resolve).catch(reject);
        } else {
          reject(new Error('no supported video found'));
        }
      });
    }
  }, {
    key: 'setVideoSource',
    value: function setVideoSource(src, type) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        // As Google is not using an actual DOM video, it doesn't implement
        // `onloadeddata`. In normal cases, `onloadeddata` is `null` when no
        // handler function is assigned to it. However in Google's case, it
        // returns as undefined.
        if (typeof _this4._videoSlot.onloadeddata === 'undefined') {
          resolve();
        } else {
          _this4._videoSlot.onloadeddata = resolve;
        }
        _this4._videoSlot.onerror = function (ev) {
          var msg = void 0;
          /* istanbul ignore next */
          switch (ev.target.error.code) {
            case ev.target.error.MEDIA_ERR_ABORTED:
              msg = 'You aborted the video playback.';
              break;
            case ev.target.error.MEDIA_ERR_NETWORK:
              msg = 'A network error caused the video download to fail part-way.';
              break;
            case ev.target.error.MEDIA_ERR_DECODE:
              msg = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
              break;
            case ev.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              msg = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
              break;
            default:
              msg = 'An unknown error occurred.';
              break;
          }
          reject(new Error(msg + ' Type: ' + type + ', source: ' + src));
        };
        _this4._videoSlot.src = src;
        _this4._videoSlot.type = type;
      });
    }

    /**
     * startAd() is called by the video player when the video player is ready for the ad to
     * display. The ad unit responds by sending an AdStarted event that notifies the video player
     * when the ad unit has started playing. Once started, the video player cannot restart the ad unit
     * by calling startAd() and stopAd() multiple times.
     */

  }, {
    key: 'startAd',
    value: function startAd() {
      var _this5 = this;

      // As Google is not using an actual DOM video, it doesn't implement
      // `onloadeddata`. In normal cases, `onloadeddata` is `null` when no
      // handler function is assigned to it. However in Google's case, it
      // returns as undefined.
      if (typeof this._videoSlot.onloadeddata === 'undefined') {
        this.emit('AdStarted');
      } else {
        // Ideally we want to wait till the first frame is present
        this._videoSlot.onloadeddata = function () {
          _this5.emit('AdStarted');
        };
      }
      this._videoSlot.load();
    }

    /**
     * The video player calls stopAd() when it will no longer display the ad or needs to cancel
     * the ad unit. The ad unit responds by closing the ad, cleaning up its resources and then sending
     * the AdStopped event. The process for stopping an ad may take time.
     */

  }, {
    key: 'stopAd',
    value: function stopAd() {
      /* istanbul ignore if */
      if (this._destroyed) return;
      $removeAll.call(this);
      this.emit('AdStopped');
    }

    /**
     * skipAd
     *
     */

  }, {
    key: 'skipAd',
    value: function skipAd() {
      /* istanbul ignore if */
      if (this._destroyed) return;
      if (!this._attributes.adSkippableState) {
        return false;
      }
      $removeAll.call(this);
      this.emit('AdSkipped');
      this.emit('AdStopped');
    }

    /**
     * The resizeAd() method is only called when the video player changes the width and
     * height of the video content container, which prompts the ad unit to scale or reposition. The ad
     * unit then resizes itself to a width and height that is equal to or less than the width and height
     * supplied by the video player. Once resized, the ad unit writes updated dimensions to the
     * adWidth and adHeight properties and sends the AdSizeChange event to confirm that
     * it has resized itself.
     *
     * @param  {number} width    The maximum display area allotted for the ad. The ad unit must resize itself to a width and height that is within the values provided. The video player must always provide width and height unless it is in fullscreen mode. In fullscreen mode, the ad unit can ignore width/height parameters and resize to any dimension.
     * @param  {number} height   The maximum display area allotted for the ad. The ad unit must resize itself to a width and height that is within the values provided. The video player must always provide width and height unless it is in fullscreen mode. In fullscreen mode, the ad unit can ignore width/height parameters and resize to any dimension.
     * @param  {string} viewMode Can be one of “normal” “thumbnail” or “fullscreen” to indicate the mode to which the video player is resizing. Width and height are not required when viewmode is fullscreen.
     * @return {[type]}          [description]
     */

  }, {
    key: 'resizeAd',
    value: function resizeAd(width, height, viewMode) {
      this._attributes.width = width;
      this._attributes.height = height;
      this._attributes.viewMode = viewMode;
      this.emit('AdSizeChange');
    }

    /**
     * pauseAd
     *
     */

  }, {
    key: 'pauseAd',
    value: function pauseAd() {
      this._videoSlot.pause();
      this.emit('AdPaused');
    }

    /**
     * resumeAd
     *
     */

  }, {
    key: 'resumeAd',
    value: function resumeAd() {
      this._videoSlot.play();
      this.emit('AdPlaying');
    }

    /**
     * expandAd
     *
     */

  }, {
    key: 'expandAd',
    value: function expandAd() {
      this.hasEngaged = true;
      this.set('expanded', true);
      this.emit('AdExpandedChange');
    }

    /**
     * collapseAd
     *
     */

  }, {
    key: 'collapseAd',
    value: function collapseAd() {
      this.set('expanded', false);
      this.emit('AdExpandedChange');
    }

    /**
     * The video player calls this method to register a listener to a particular event
     *
     * @param  {Function} fn            fn is a reference to the function that needs to be called when the specified event occurs
     * @param  {string}   event         event is the name of the event that the video player is subscribing to
     * @param  {[type]}   listenerScope [optional] listenerScope is a reference to the object in which the function is
    defined
     */

  }, {
    key: 'subscribe',
    value: function subscribe(fn, event, listenerScope) {
      this.on(event, fn, listenerScope);
    }

    /**
     * The video player calls this method to remove a listener for a particular event
     *
     * @param  {Function} fn    the event listener that is being removed
     * @param  {string}   event event is the name of the event that the video player is unsubscribing from
     */

  }, {
    key: 'unsubscribe',
    value: function unsubscribe(fn, event) {
      this.off(event, fn);
    }

    /**
     * getAdLinear
     *
     * @return {boolean}
     */

  }, {
    key: 'getAdLinear',
    value: function getAdLinear() {
      return this._attributes.linear;
    }

    /**
     * added to provide current width of ad unit after ad has resized
     *
     * @return {number} pixel's size of the ad, is equal to or less than the values passed in resizeAd/initAd
     */

  }, {
    key: 'getAdWidth',
    value: function getAdWidth() {
      return this._attributes.width;
    }

    /**
     * added to provide current height of ad unit after ad has resized
     *
     * @return {number} pixel's size of the ad, is equal to or less than the values passed in resizeAd/initAd
     */

  }, {
    key: 'getAdHeight',
    value: function getAdHeight() {
      return this._attributes.height;
    }

    /**
     * getAdExpanded
     *
     * @return {boolean}
     */

  }, {
    key: 'getAdExpanded',
    value: function getAdExpanded() {
      return this._attributes.expanded;
    }

    /**
     * in support of skippable ads, this feature enables the video
     * player to identify when the ad is in a state where it can be skipped
     *
     * @return {boolean}
     */

  }, {
    key: 'getAdSkippableState',
    value: function getAdSkippableState() {
      return this._attributes.adSkippableState;
    }

    /**
     * getAdRemainingTime
     *
     * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
     */

  }, {
    key: 'getAdRemainingTime',
    value: function getAdRemainingTime() {
      return this._videoSlot.duration <= 0 || this._videoSlot.currentTime < 0 ? -2 : this._videoSlot.duration - this._videoSlot.currentTime;
    }

    /**
     * reports total duration to more clearly report on the changing
     * duration, which is confusing when both remaining time and duration can
     * change
     *
     * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
     */

  }, {
    key: 'getAdDuration',
    value: function getAdDuration() {
      return this._videoSlot.duration <= 0 ? -2 : this._videoSlot.duration;
    }

    /**
     * getAdVolume
     *
     * @return {number} between 0 and 1, if is not implemented will return -1
     */

  }, {
    key: 'getAdVolume',
    value: function getAdVolume() {
      return this._attributes.volume;
    }

    /**
     * getAdCompanions - companions are banners outside the video player to reinforce the ad
     *
     * @return {string} VAST 3.0 formart string for <CompanionAds>
     */

  }, {
    key: 'getAdCompanions',
    value: function getAdCompanions() {
      return this._attributes.companions;
    }

    /**
     * included to support various industry programs which require the
     * overlay of icons on the ad.
     *
     * @return {boolean} if true videoplayer may hide is own icons to not duplicate
     */

  }, {
    key: 'getAdIcons',
    value: function getAdIcons() {
      return this._attributes.icons;
    }

    /**
     * setAdVolume
     *
     * @param {number} volume  between 0 and 1
     */

  }, {
    key: 'setAdVolume',
    value: function setAdVolume(volume) {
      if (this.previousAttributes.volume === volume) {
        // no change, no fire
        return;
      }
      if (volume < 0 || volume > 1) {
        return this.emit('AdError', 'volume is not valid');
      }
      this.set('volume', volume);
      this._videoSlot.volume = volume;
      this.emit('AdVolumeChange');
    }
  }, {
    key: 'emitVpaidMethodInvocations',
    value: function emitVpaidMethodInvocations() {
      var _this6 = this;

      vpaidMethods.forEach(function (name) {
        var originalReference = _this6[name];
        _this6[name] = function () {
          for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
            rest[_key] = arguments[_key];
          }

          _this6.emit.apply(_this6, [name + '()'].concat(rest));
          return originalReference.apply(_this6, rest);
        };
      }, this);
    }
  }]);

  return Linear;
}(TinyEmitter);

module.exports = Linear;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function E() {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function on(name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function once(name, callback, ctx) {
    var self = this;
    function listener() {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback;
    return this.on(name, listener, ctx);
  },

  emit: function emit(name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function off(name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    liveEvents.length ? e[name] = liveEvents : delete e[name];

    return this;
  }
};

module.exports = E;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = ['handshakeVersion', 'initAd', 'startAd', 'stopAd', 'skipAd', 'resizeAd', 'pauseAd', 'resumeAd', 'expandAd', 'collapseAd', 'getAdLinear', 'getAdWidth', 'getAdHeight', 'getAdExpanded', 'getAdadSkippableState', 'getAdRemainingTime', 'getAdDuration', 'getAdVolume', 'getAdCompanions', 'getAdIcons', 'setAdVolume'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var vpaidLifeCycle = __webpack_require__(5);
var quartiles = [{
  value: 0,
  name: vpaidLifeCycle[0]
}, {
  value: 0.25,
  name: vpaidLifeCycle[1]
}, {
  value: 0.50,
  name: vpaidLifeCycle[2]
}, {
  value: 0.75,
  name: vpaidLifeCycle[3]
}];
function handleTimeupdate() {
  var upcomingQuartileIndex = this.quartileIndexEmitted + 1;
  var upcomingQuartile = quartiles[upcomingQuartileIndex];
  if (upcomingQuartile && this.el.currentTime / this.el.duration > upcomingQuartile.value) {
    this.emit(upcomingQuartile.name);
    this.quartileIndexEmitted = upcomingQuartileIndex;
  }
}

function handleEnded() {
  this.emit(vpaidLifeCycle[4]);
  // Garbage collect event listeners
  this.removeEventListeners();
}

var VideoTracker = function () {
  /**
   * [constructor description]
   * @param  {[type]} el      [description]
   * @param  {TinyEmitter} emitter [description]
   * @return {[type]}         [description]
   */
  function VideoTracker(el, emitter) {
    var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'AdVideo';

    _classCallCheck(this, VideoTracker);

    this.el = el;
    this.emitter = emitter;
    this.prefix = prefix;
    this.quartileIndexEmitted = -1;
    this.addEventListeners();
  }

  _createClass(VideoTracker, [{
    key: 'emit',
    value: function emit() {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      var eventName = this.prefix + rest[0];
      return this.emitter.emit.apply(this.emitter, [eventName].concat(rest.splice(1)));
    }
  }, {
    key: 'addEventListeners',
    value: function addEventListeners() {
      this.events = {
        handleTimeupdate: handleTimeupdate.bind(this),
        handleEnded: handleEnded.bind(this)
      };
      this.el.addEventListener('timeupdate', this.events.handleTimeupdate);
      this.el.addEventListener('ended', this.events.handleEnded);
    }
  }, {
    key: 'removeEventListeners',
    value: function removeEventListeners() {
      this.el.removeEventListener('timeupdate', this.events.handleTimeupdate);
      this.el.removeEventListener('ended', this.events.handleEnded);
    }
  }]);

  return VideoTracker;
}();

module.exports = VideoTracker;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = ['Start', 'FirstQuartile', 'Midpoint', 'ThirdQuartile', 'Complete'];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var el = void 0;
module.exports = function (type) {
  if (!el) {
    el = document.createElement('video');
  }
  return !!el.canPlayType(type).replace(/no/, '');
};

/***/ })
/******/ ]);