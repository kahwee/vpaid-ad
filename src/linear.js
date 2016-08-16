const TinyEmitter = require('tiny-emitter')
const vpaidMethods = require('./vpaid-methods.json')
import { $removeAll } from './toggles'
const VideoTracker = require('./video-tracker').default

function _setSize (el, size) {
  el.setAttribute('width', size[0])
  el.setAttribute('height', size[1])
  el.style.width = size[0] + 'px'
  el.style.height = size[1] + 'px'
}

export default class Linear extends TinyEmitter {

  constructor (options = {}) {
    super()
    this.emitVpaidMethodInvocations()
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
      adSkippableState: false,
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
    if (!this._videoSlot) {
      return this.emit('AdError', 'Video slot is invalid')
    }
    if (!this._slot) {
      return this.emit('AdError', 'Slot is invalid')
    }
    _setSize(this._videoSlot, [this._attributes.width, this._attributes.height])
    this.setSupportedVideo(this._options.videos).then(() => {
      this.emit('AdLoaded')
    }).catch((reason) => {
      this.emit('AdLog', reason)
      this.emit('AdLoaded')
    })
    this.videoTracker = new VideoTracker(this._videoSlot, this)
  }

  setVideoSource (src, type) {
    return new Promise((resolve, reject) => {
      this._videoSlot.onloadeddata = function () {
        resolve()
      }
      this._videoSlot.onerror = function (ev) {
        let msg
        /* istanbul ignore next */
        switch (ev.target.error.code) {
          case ev.target.error.MEDIA_ERR_ABORTED:
            msg = 'You aborted the video playback.'
            break
          case ev.target.error.MEDIA_ERR_NETWORK:
            msg = 'A network error caused the video download to fail part-way.'
            break
          case ev.target.error.MEDIA_ERR_DECODE:
            msg = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.'
            break
          case ev.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            msg = 'The video could not be loaded, either because the server or network failed or because the format is not supported.'
            break
          default:
            msg = 'An unknown error occurred.'
            break
        }
        reject(`${msg} Type: ${type}, source: ${src}`)
      }
      this._videoSlot.setAttribute('src', src)
      this._videoSlot.setAttribute('type', type)
    })
  }

  getSupportedVideos (videos) {
    const el = document.createElement('video')
    return videos.filter(video => el.canPlayType(video.type))
  }

  setSupportedVideo (videos) {
    return new Promise((resolve, reject) => {
      const supportedVideos = this.getSupportedVideos(videos)
      if (supportedVideos[0]) {
        this.setVideoSource(supportedVideos[0].url, supportedVideos[0].type).then(() => {
          resolve()
        }).catch((reason) => {
          reject(reason)
        })
      } else {
        reject('no supported video found')
      }
    })
  }

  /**
   * startAd() is called by the video player when the video player is ready for the ad to
   * display. The ad unit responds by sending an AdStarted event that notifies the video player
   * when the ad unit has started playing. Once started, the video player cannot restart the ad unit
   * by calling startAd() and stopAd() multiple times.
   */
  startAd () {
    this._videoSlot.addEventListener('loadeddata', () => {
      this.emit('AdStarted')
    }, false)
    this._videoSlot.load()
  }

  /**
   * The video player calls stopAd() when it will no longer display the ad or needs to cancel
   * the ad unit. The ad unit responds by closing the ad, cleaning up its resources and then sending
   * the AdStopped event. The process for stopping an ad may take time.
   */
  stopAd () {
    /* istanbul ignore if */
    if (this._destroyed) return
    $removeAll.call(this)
    this.emit('AdStopped')
  }

  /**
   * skipAd
   *
   */
  skipAd () {
    /* istanbul ignore if */
    if (this._destroyed) return
    if (!this._attributes.adSkippableState) {
      return false
    }
    $removeAll.call(this)
    this.emit('AdSkipped')
    this.emit('AdStopped')
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
    this.hasEngaged = true
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
   * getAdadSkippableState - if the ad is in the position to be able to skip
   *
   * @return {boolean}
   */
  getAdadSkippableState () {
    return this._attributes.adSkippableState
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

  emitVpaidMethodInvocations () {
    vpaidMethods.forEach((name) => {
      const originalReference = this[name]
      this[name] = (...rest) => {
        this.emit(`${name}()`, ...rest)
        return originalReference.apply(this, rest)
      }
    }, this)
  }
}
