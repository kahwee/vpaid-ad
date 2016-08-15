const TinyEmitter = require('tiny-emitter')
import { $removeAll } from './toggles'
const VideoTracker = require('./video-tracker').default

function $enableSkippable () {
  this._attributes.skippableState = true
}

function $setVideoAd () {
  var videoSlot = this._videoSlot

  if (!videoSlot) {
    return this.emit('AdError', 'no video')
  }
  _setSize(videoSlot, [this._attributes.width, this._attributes.height])

  if (!_setSupportedVideo(videoSlot, this._options.videos)) {
    return this.emit('AdError', 'no supported video found')
  }
}

function _setSize (el, size) {
  el.setAttribute('width', size[0])
  el.setAttribute('height', size[1])
  el.style.width = size[0] + 'px'
  el.style.height = size[1] + 'px'
}

function _setSupportedVideo (videoEl, videos) {
  var supportedVideos = videos.filter(video => videoEl.canPlayType(video.mimetype))

  if (supportedVideos.length === 0) return false

  videoEl.setAttribute('src', supportedVideos[0].url)

  return true
}

// function _createAndAppend (parent, tagName, className) {
//   var el = document.createElement(tagName || 'div')
//   el.className = className || ''
//   parent.appendChild(el)
//   return el
// }

export default class Linear extends TinyEmitter {

  constructor (options = {}) {
    super()
    this._ui = {}
    this.quartileIndexEmitted = -1
    this.hasEngaged = false

    this._attributes = {
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
    }

    this.previousAttributes = Object.assign({}, this._attributes)

    // open interactive panel -> AdExpandedChange, AdInteraction
    // when close panel -> AdExpandedChange, AdInteraction

    this._options = options
    this._options.videos = this._options.videos || []
  }

  set (attribute, newValue) {
    this.previousAttributes[attribute] = this._attributes[attribute]
    this._attributes[attribute] = newValue
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
  handshakeVersion (playerVPAIDVersion) {
    return '2.0'
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
  initAd (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this._attributes.width = width
    this._attributes.height = height
    this._attributes.viewMode = viewMode
    this._attributes.desiredBitrate = desiredBitrate

    this._slot = environmentVars.slot
    this._videoSlot = environmentVars.videoSlot
    $setVideoAd.call(this)
    if (this._videoSlot) {
      this.videoTracker = new VideoTracker(this._videoSlot, this)
    }
    this.emit('AdLoaded')
  }

  /**
   * startAd
   *
   */
  startAd () {
    this._videoSlot.addEventListener('loadeddata', () => {
      this.emit('AdStarted')
    }, false)
    this._videoSlot.load()
  }

  /**
   * stopAd
   *
   */
  stopAd () {
    if (this._destroyed) return
    $removeAll.call(this)
    this.emit('AdStopped')
  }

  /**
   * skipAd
   *
   */
  skipAd () {
    if (this._destroyed) return
    if (!this._attributes.skippableState) return
    $removeAll.call(this)
    this.emit('AdSkipped')
    this.emit('AdStopped')
  }

  /**
   * [resizeAd description]
   * @param  {number} width    The maximum display area allotted for the ad. The ad unit must resize itself to a width and height that is within the values provided. The video player must always provide width and height unless it is in fullscreen mode. In fullscreen mode, the ad unit can ignore width/height parameters and resize to any dimension.
   * @param  {number} height   The maximum display area allotted for the ad. The ad unit must resize itself to a width and height that is within the values provided. The video player must always provide width and height unless it is in fullscreen mode. In fullscreen mode, the ad unit can ignore width/height parameters and resize to any dimension.
   * @param  {string} viewMode Can be one of “normal” “thumbnail” or “fullscreen” to indicate the mode to which the video player is resizing. Width and height are not required when viewmode is fullscreen.
   * @return {[type]}          [description]
   */
  resizeAd (width, height, viewMode) {
    this._attributes.width = width
    this._attributes.height = height
    this._attributes.viewMode = viewMode
    this.emit('AdSizeChange')
  }

  /**
   * pauseAd
   *
   */
  pauseAd () {
    this._videoSlot.pause()
    this.emit('AdPaused')
  }

  /**
   * resumeAd
   *
   */
  resumeAd () {
    this._videoSlot.play()
    this.emit('AdPlaying')
  }

  /**
   * expandAd
   *
   */
  expandAd () {
    this.set('expanded', true)
    this.emit('AdExpandedChange')
  }

  /**
   * collapseAd
   *
   */
  collapseAd () {
    this.set('expanded', false)
    this.emit('AdExpandedChange')
  }

  /**
   * subscribe
   *
   * @param {function} handler
   * @param {string} event
   * @param {object} context
   */
  subscribe (handler, event, context) {
    this.on(event, handler, context)
  }

  /**
   * unsubscribe
   *
   * @param {function} handler
   * @param {string} event
   */
  unsubscribe (handler, event) {
    this.off(event, handler)
  }

  /**
   * getAdLinear
   *
   * @return {boolean}
   */
  getAdLinear () {
    return this._attributes.linear
  }

  /**
   * getAdWidth
   *
   * @return {number} pixel's size of the ad, is equal to or less than the values passed in resizeAd/initAd
   */
  getAdWidth () {
    return this._attributes.width
  }

  /**
   * getAdHeight
   *
   * @return {number} pixel's size of the ad, is equal to or less than the values passed in resizeAd/initAd
   */
  getAdHeight () {
    return this._attributes.height
  }

  /**
   * getAdExpanded
   *
   * @return {boolean}
   */
  getAdExpanded () {
    return this._attributes.expanded
  }

  /**
   * getAdSkippableState - if the ad is in the position to be able to skip
   *
   * @return {boolean}
   */
  getAdSkippableState () {
    return this._attributes.skippableState
  }

  /**
   * getAdRemainingTime
   *
   * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
   */
  getAdRemainingTime () {
    if (this.hasEngaged) {
      return -2
    } else {
      return this._videoSlot.duration - this._videoSlot.currentTime
    }
  }

  /**
   * getAdDuration
   *
   * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
   */
  getAdDuration () {
    if (this.hasEngaged) {
      return -2
    } else {
      return this._videoSlot.duration
    }
  }

  /**
   * getAdVolume
   *
   * @return {number} between 0 and 1, if is not implemented will return -1
   */
  getAdVolume () {
    return this._attributes.volume
  }

  /**
   * getAdCompanions - companions are banners outside the video player to reinforce the ad
   *
   * @return {string} VAST 3.0 formart string for <CompanionAds>
   */
  getAdCompanions () {
    return this._attributes.companions
  }

  /**
   * getAdIcons
   *
   * @return {boolean} if true videoplayer may hide is own icons to not duplicate
   */
  getAdIcons () {
    return this._attributes.icons
  }

  /**
   * setAdVolume
   *
   * @param {number} volume  between 0 and 1
   */
  setAdVolume (volume) {
    if (this.previousAttributes.volume === volume) {
      // no change, no fire
      return
    }
    if (volume < 0 || volume > 1) {
      return this.emit('AdError', 'volume is not valid')
    }
    this.set('volume', volume)
    this._videoSlot.volume = volume
    this.emit('AdVolumeChange')
  }
}
