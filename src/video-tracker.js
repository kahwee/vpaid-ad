const vpaidLifeCycle = require('./vpaid-life-cycle')
const quartiles = [
  {
    value: 0,
    name: vpaidLifeCycle[0]
  },
  {
    value: 0.25,
    name: vpaidLifeCycle[1]
  },
  {
    value: 0.50,
    name: vpaidLifeCycle[2]
  },
  {
    value: 0.75,
    name: vpaidLifeCycle[3]
  }
]
function handleTimeupdate () {
  const upcomingQuartileIndex = this.quartileIndexEmitted + 1
  const upcomingQuartile = quartiles[upcomingQuartileIndex]
  if (upcomingQuartile && this.el.currentTime / this.el.duration > upcomingQuartile.value) {
    this.emit(upcomingQuartile.name)
    this.quartileIndexEmitted = upcomingQuartileIndex
  }
}

function handleEnded () {
  this.emit(vpaidLifeCycle[4])
  // Garbage collect event listeners
  this.removeEventListeners()
}

class VideoTracker {
  /**
   * [constructor description]
   * @param  {[type]} el      [description]
   * @param  {TinyEmitter} emitter [description]
   * @return {[type]}         [description]
   */
  constructor (el, emitter, prefix = 'AdVideo') {
    this.el = el
    this.emitter = emitter
    this.prefix = prefix
    this.quartileIndexEmitted = -1
    this.addEventListeners()
  }

  emit (...rest) {
    const eventName = this.prefix + rest[0]
    return this.emitter.emit.apply(this.emitter, [eventName].concat(rest.splice(1)))
  }

  addEventListeners () {
    this.events = {
      handleTimeupdate: handleTimeupdate.bind(this),
      handleEnded: handleEnded.bind(this)
    }
    this.el.addEventListener('timeupdate', this.events.handleTimeupdate)
    this.el.addEventListener('ended', this.events.handleEnded)
  }

  removeEventListeners () {
    this.el.removeEventListener('timeupdate', this.events.handleTimeupdate)
    this.el.removeEventListener('ended', this.events.handleEnded)
  }

}

module.exports = VideoTracker
