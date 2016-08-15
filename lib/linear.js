'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _toggles = require('./toggles');

var _vastEnded = require('./handler/vast-ended');

var _vastEnded2 = _interopRequireDefault(_vastEnded);

var _vastTimeupdate = require('./handler/vast-timeupdate');

var _vastTimeupdate2 = _interopRequireDefault(_vastTimeupdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TinyEmitter = require('tiny-emitter');


function $enableSkippable() {
  this._attributes.skippableState = true;
}

function $throwError(msg) {
  this.emit('AdError', msg);
}

function $setVideoAd() {
  var videoSlot = this._videoSlot;

  if (!videoSlot) {
    return $throwError.call(this, 'no video');
  }
  _setSize(videoSlot, [this._attributes.width, this._attributes.height]);

  if (!_setSupportedVideo(videoSlot, this._parameters.videos || [])) {
    return $throwError.call(this, 'no supported video found');
  }
}

function _setSize(el, size) {
  el.setAttribute('width', size[0]);
  el.setAttribute('height', size[1]);
  el.style.width = size[0] + 'px';
  el.style.height = size[1] + 'px';
}

function _setSupportedVideo(videoEl, videos) {
  var supportedVideos = videos.filter(function (video) {
    return videoEl.canPlayType(video.mimetype);
  });

  if (supportedVideos.length === 0) return false;

  videoEl.setAttribute('src', supportedVideos[0].url);

  return true;
}

// function _createAndAppend (parent, tagName, className) {
//   var el = document.createElement(tagName || 'div')
//   el.className = className || ''
//   parent.appendChild(el)
//   return el
// }

var Linear = function (_TinyEmitter) {
  _inherits(Linear, _TinyEmitter);

  function Linear() {
    _classCallCheck(this, Linear);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Linear).call(this));

    _this._slot = null;
    _this._videoSlot = null;

    _this._attributes = {
      companions: '',
      desiredBitrate: 256,
      duration: 30,
      remainingTime: -1,
      expanded: false,
      icons: false,
      linear: true,
      skippableState: false,
      viewMode: 'normal',
      width: 0,
      height: 0,
      volume: 1.0
    };

    _this.previousAttributes = Object.assign({}, _this._attributes);

    // open interactive panel -> AdExpandedChange, AdInteraction
    // when close panel -> AdExpandedChange, AdInteraction

    _this._quartileEvents = [{ event: 'AdVideoStart', position: 0 }, { event: 'AdVideoFirstQuartile', position: 25 }, { event: 'AdVideoMidpoint', position: 50 }, { event: 'AdSkippableStateChange', position: 65, hook: $enableSkippable.bind(_this) }, { event: 'AdVideoThirdQuartile', position: 75 }, { event: 'AdVideoComplete', position: 100 }];

    _this._lastQuartilePosition = _this._quartileEvents[0];

    _this._parameters = {};
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
      this._attributes.width = width;
      this._attributes.height = height;
      this._attributes.viewMode = viewMode;
      this._attributes.desiredBitrate = desiredBitrate;

      this._slot = environmentVars.slot;
      this._videoSlot = environmentVars.videoSlot;
      // this._style = loadCss('ad.css')
      $setVideoAd.call(this);
      this._videoSlot.addEventListener('timeupdate', _vastTimeupdate2.default.bind(this), false);
      this._videoSlot.addEventListener('ended', _vastEnded2.default.bind(this), false);

      this.emit('AdLoaded');
    }

    /**
     * startAd
     *
     */

  }, {
    key: 'startAd',
    value: function startAd() {
      this._videoSlot.play();
      this._ui = {};
      // this._ui.buy = _createAndAppend(this._slot, 'div', 'vpaidAdLinear')
      // this._ui.banner = _createAndAppend(this._slot, 'div', 'banner')
      // this._ui.xBtn = _createAndAppend(this._slot, 'button', 'close')
      // this._ui.interact = _createAndAppend(this._slot, 'div', 'interact')

      // this._ui.buy.addEventListener('click', $onClickThru.bind(this), false)
      // this._ui.banner.addEventListener('click', $toggleExpand.bind(this, true), false)
      // this._ui.xBtn.addEventListener('click', $toggleExpand.bind(this, false), false)
      this.emit('AdStarted');
    }

    /**
     * stopAd
     *
     */

  }, {
    key: 'stopAd',
    value: function stopAd() {
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
      if (this._destroyed) return;
      if (!this._attributes.skippableState) return;
      _toggles.$removeAll.call(this);
      this.emit('AdSkipped');
      this.emit('AdStopped');
    }

    /**
     * [resizeAd description]
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
     * getAdSkippableState - if the ad is in the position to be able to skip
     *
     * @return {boolean}
     */

  }, {
    key: 'getAdSkippableState',
    value: function getAdSkippableState() {
      return this._attributes.skippableState;
    }

    /**
     * getAdRemainingTime
     *
     * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
     */

  }, {
    key: 'getAdRemainingTime',
    value: function getAdRemainingTime() {
      return this._attributes.remainingTime;
    }

    /**
     * getAdDuration
     *
     * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
     */

  }, {
    key: 'getAdDuration',
    value: function getAdDuration() {
      return this._attributes.duration;
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
        return $throwError('volume is not valid');
      }
      this.set('volume', volume);
      this._videoSlot.volume = volume;
      this.emit('AdVolumeChange');
    }
  }]);

  return Linear;
}(TinyEmitter);

exports.default = Linear;