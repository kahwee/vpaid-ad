'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _toggles = require('./toggles');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TinyEmitter = require('tiny-emitter');
var vpaidMethods = require('./vpaid-methods.json');

var VideoTracker = require('./video-tracker').default;

function _setSize(el, size) {
  el.width = size[0];
  el.height = size[1];
  // Just in case .style is not defined. This does happen in cases
  // where video players pass in mock DOM objects.
  if (el.style) {
    el.style.width = size[0] + 'px';
    el.style.height = size[1] + 'px';
  }
}

var Linear = function (_TinyEmitter) {
  _inherits(Linear, _TinyEmitter);

  function Linear() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Linear);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Linear).call(this));

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

    _this._options = options;
    _this._options.videos = _this._options.videos || [];
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

      this._slot = environmentVars.slot;
      this._videoSlot = environmentVars.videoSlot;
      if (!this._videoSlot) {
        return this.emit('AdError', 'Video slot is invalid');
      }
      if (!this._slot) {
        return this.emit('AdError', 'Slot is invalid');
      }
      _setSize(this._videoSlot, [this._attributes.width, this._attributes.height]);
      this.setSupportedVideo(this._options.videos).then(function () {
        _this2.emit('AdLoaded');
      }).catch(function (reason) {
        _this2.emit('AdLog', reason);
        _this2.emit('AdLoaded');
      });
      this.videoTracker = new VideoTracker(this._videoSlot, this);
    }
  }, {
    key: 'setVideoSource',
    value: function setVideoSource(src, type) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3._videoSlot.onloadeddata = function () {
          resolve();
        };
        _this3._videoSlot.onerror = function (ev) {
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
          reject(msg + ' Type: ' + type + ', source: ' + src);
        };
        _this3._videoSlot.src = src;
        _this3._videoSlot.type = type;
      });
    }
  }, {
    key: 'getSupportedVideos',
    value: function getSupportedVideos(videos) {
      var el = document.createElement('video');
      return videos.filter(function (video) {
        return el.canPlayType(video.type);
      });
    }
  }, {
    key: 'setSupportedVideo',
    value: function setSupportedVideo(videos) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var supportedVideos = _this4.getSupportedVideos(videos);
        if (supportedVideos[0]) {
          _this4.setVideoSource(supportedVideos[0].url, supportedVideos[0].type).then(function () {
            resolve();
          }).catch(function (reason) {
            reject(reason);
          });
        } else {
          reject('no supported video found');
        }
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

      this._videoSlot.addEventListener('loadeddata', function () {
        _this5.emit('AdStarted');
      }, false);
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
      _toggles.$removeAll.call(this);
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
      _toggles.$removeAll.call(this);
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
     * subscribe
     *
     * @param {function} handler
     * @param {string} event
     * @param {object} context
     */

  }, {
    key: 'subscribe',
    value: function subscribe(handler, event, context) {
      this.on(event, handler, context);
    }

    /**
     * unsubscribe
     *
     * @param {function} handler
     * @param {string} event
     */

  }, {
    key: 'unsubscribe',
    value: function unsubscribe(handler, event) {
      this.off(event, handler);
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
     * getAdWidth
     *
     * @return {number} pixel's size of the ad, is equal to or less than the values passed in resizeAd/initAd
     */

  }, {
    key: 'getAdWidth',
    value: function getAdWidth() {
      return this._attributes.width;
    }

    /**
     * getAdHeight
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
     * getAdadSkippableState - if the ad is in the position to be able to skip
     *
     * @return {boolean}
     */

  }, {
    key: 'getAdadSkippableState',
    value: function getAdadSkippableState() {
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
      if (this.hasEngaged) {
        return -2;
      } else {
        return this._videoSlot.duration - this._videoSlot.currentTime;
      }
    }

    /**
     * getAdDuration
     *
     * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
     */

  }, {
    key: 'getAdDuration',
    value: function getAdDuration() {
      if (this.hasEngaged) {
        return -2;
      } else {
        return this._videoSlot.duration;
      }
    }

    /**
     * in support of skippable ads, this feature enables the video
     * player to identify when the ad is in a state where it can be skipped
     * @return {[type]} [description]
     */

  }, {
    key: 'getAdSkippableState',
    value: function getAdSkippableState() {
      return this._attributes.adSkippableState;
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
     * getAdIcons
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

exports.default = Linear;