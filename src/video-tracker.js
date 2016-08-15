import vpaidLifeCycle from './vpaid-life-cycle'
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
export default class {
  /**
   * [constructor description]
   * @param  {[type]} el      [description]
   * @param  {TinyEmitter} emitter [description]
   * @return {[type]}         [description]
   */
  constructor (el, emitter) {
    this.el = el
    this.emitter = emitter
    this.quartileIndexEmitted = -1
    this.el.addEventListener('timeupdate', this.handleTimeupdate.bind(this))
    this.el.addEventListener('ended', this.handleEnded.bind(this))
  }

  handleTimeupdate () {
    const upcomingQuartileIndex = this.quartileIndexEmitted + 1
    const upcomingQuartile = quartiles[upcomingQuartileIndex]
    if (upcomingQuartile && this.el.currentTime / this.el.duration > upcomingQuartile.value) {
      this.emitter.emit(`AdVideo${upcomingQuartile.name}`)
      this.quartileIndexEmitted = upcomingQuartileIndex
    }
  }

  handleEnded () {
    this.emitter.emit(`AdVideo${vpaidLifeCycle[4]}`)
    // Garbage collect event listeners
    this.el.removeEventListener('timeupdate', this.handleTimeupdate)
    this.el.removeEventListener('ended', this.handleEnded)
  }
}
