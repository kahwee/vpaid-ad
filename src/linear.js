const TinyEmitter = require('tiny-emitter')
const vpaidMethods = require('./vpaid-methods')
const VideoTracker = require('./video-tracker')
const isSupported = require('./util/is-supported')

function $removeAll () {
  this._destroyed = true
  this._videoSlot.src = ''
  this._slot.innerHTML = ''
  this._ui = null
}

class Linear extends TinyEmitter {

  constructor (opts = {}) {
    super()
    this.baseUrl = ''
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

    this.opts = opts
    this.opts.videos = this.opts.videos || []
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

  appendStylesheet (path) {
    const head = document.getElementsByTagName('head')[0]
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = this.baseUrl + path
    link.media = 'all'
    head.appendChild(link)
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

    this._slot = environmentVars.slot || this.emit('AdError', 'Video slot is invalid')
    this._videoSlot = environmentVars.videoSlot || this.emit('AdError', 'Slot is invalid')
    this.useBestVideo().then(() => {
      this.emit('AdLoaded')
    }).catch((reason) => {
      this.emit('AdLog', reason)
      this.emit('AdLoaded')
    })
    this.videoTracker = new VideoTracker(this._videoSlot, this)
  }

  useBestVideo () {
    return new Promise((resolve, reject) => {
      const bestVideo = this.opts.videos.filter(video => isSupported(video.type))
      if (bestVideo[0]) {
        this.setVideoSource(bestVideo[0].url, bestVideo[0].type)
          .then(resolve).catch(reject)
      } else {
        reject('no supported video found')
      }
    })
  }

  setVideoSource (src, type) {
    return new Promise((resolve, reject) => {
      // As Google is not using an actual DOM video, it doesn't implement
      // `onloadeddata`. In normal cases, `onloadeddata` is `null` when no
      // handler function is assigned to it. However in Google's case, it
      // returns as undefined.
      if (typeof this._videoSlot.onloadeddata === 'undefined') {
        resolve()
      } else {
        this._videoSlot.onloadeddata = resolve
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
      this._videoSlot.src = src
      this._videoSlot.type = type
    })
  }

  /**
   * startAd() is called by the video player when the video player is ready for the ad to
   * display. The ad unit responds by sending an AdStarted event that notifies the video player
   * when the ad unit has started playing. Once started, the video player cannot restart the ad unit
   * by calling startAd() and stopAd() multiple times.
   */
  startAd () {
    // As Google is not using an actual DOM video, it doesn't implement
    // `onloadeddata`. In normal cases, `onloadeddata` is `null` when no
    // handler function is assigned to it. However in Google's case, it
    // returns as undefined.
    if (typeof this._videoSlot.onloadeddata === 'undefined') {
      this.emit('AdStarted')
    } else {
      // Ideally we want to wait till the first frame is present
      this._videoSlot.onloadeddata = () => {
        this.emit('AdStarted')
      }
    }
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
   * The video player calls this method to register a listener to a particular event
   *
   * @param  {Function} fn            fn is a reference to the function that needs to be called when the specified event occurs
   * @param  {string}   event         event is the name of the event that the video player is subscribing to
   * @param  {[type]}   listenerScope [optional] listenerScope is a reference to the object in which the function is
defined
   */
  subscribe (fn, event, listenerScope) {
    this.on(event, fn, listenerScope)
  }

  /**
   * The video player calls this method to remove a listener for a particular event
   *
   * @param  {Function} fn    the event listener that is being removed
   * @param  {string}   event event is the name of the event that the video player is unsubscribing from
   */
  unsubscribe (fn, event) {
    this.off(event, fn)
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
   * added to provide current width of ad unit after ad has resized
   *
   * @return {number} pixel's size of the ad, is equal to or less than the values passed in resizeAd/initAd
   */
  getAdWidth () {
    return this._attributes.width
  }

  /**
   * added to provide current height of ad unit after ad has resized
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
   * in support of skippable ads, this feature enables the video
   * player to identify when the ad is in a state where it can be skipped
   *
   * @return {boolean}
   */
  getAdSkippableState () {
    return this._attributes.adSkippableState
  }

  /**
   * getAdRemainingTime
   *
   * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
   */
  getAdRemainingTime () {
    return this.hasEngaged ? -2 : this._videoSlot.duration - this._videoSlot.currentTime
  }

  /**
   * reports total duration to more clearly report on the changing
   * duration, which is confusing when both remaining time and duration can
   * change
   *
   * @return {number} seconds, if not implemented will return -1, or -2 if the time is unknown (user is engaged with the ad)
   */
  getAdDuration () {
    return this.hasEngaged ? -2 : this._videoSlot.duration
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
   * included to support various industry programs which require the
   * overlay of icons on the ad.
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
module.exports = Linear
