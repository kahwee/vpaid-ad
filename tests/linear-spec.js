import Linear from '../src/linear'

describe('Linear', function () {
  describe('initializing with no videoSlot or slot', function () {
    let linear
    let slot
    let videoSlot

    before(function () {
      slot = document.createElement('div')
      videoSlot = document.createElement('video')
    })

    after(function () {
      slot = videoSlot = null
    })

    it('should emit AdError when videoSlot is not found', function (done) {
      linear = new Linear()
      linear.subscribe((reason) => {
        done()
      }, 'AdError')
      linear.initAd(320, 160, 'normal', null, null, {slot})
    })

    it('should emit AdError when slot is not found', function (done) {
      linear = new Linear()
      linear.subscribe((reason) => {
        done()
      }, 'AdError')
      linear.initAd(320, 160, 'normal', null, null, {videoSlot})
    })
  })

  describe('with no videos', function () {
    let linear
    let videoSlot
    let slot

    before(function () {
      slot = document.createElement('div')
      videoSlot = document.createElement('video')
      document.body.appendChild(slot)
      document.body.appendChild(videoSlot)
      linear = new Linear()
    })

    after(function () {
      slot.remove()
      videoSlot.remove()
      linear = null
    })

    describe('constructor()', function () {
      it('should be initialized with the right options', function () {
        expect(linear._options.videos).to.be.length(0)
      })
    })

    describe('initAd()', function () {
      it('should emit AdLoaded and initialized with the right videoSlot and slot', function (done) {
        linear.subscribe(function (data) {
          expect(linear._slot).to.equal(slot)
          expect(linear._videoSlot).to.equal(videoSlot)
          done()
        }, 'AdLoaded')
        linear.initAd(320, 160, 'normal', null, null, {slot, videoSlot})
      })
    })

    describe('emitVpaidMethodInvocations', function () {
      it('should emit getAdWidth() when it is called', function (done) {
        linear.on('getAdWidth()', function () {
          done()
          linear.off('getAdWidth()')
        })
        linear.getAdWidth()
      })
    })

    describe('ad size', function () {
      it('should report the correct width', function (done) {
        expect(linear.getAdWidth()).to.equal(320)
        done()
      })

      it('should report the correct height', function () {
        expect(linear.getAdHeight()).to.equal(160)
      })

      it('should resizeAd with correct parameters', function (done) {
        linear.subscribe(function (data) {
          expect(linear.getAdWidth()).to.equal(640)
          expect(linear.getAdHeight()).to.equal(320)
          done()
        }, 'AdSizeChange')
        linear.resizeAd(640, 320, 'thumbnail')
      })
    })

    describe('handshakeVersion()', function () {
      it('should return with 2.0', function () {
        expect(linear.handshakeVersion()).to.equal('2.0')
        expect(linear.handshakeVersion('whatever')).to.equal('2.0')
      })
    })

    describe('ad volume', function () {
      it('should get the right initialization', function (done) {
        expect(linear.getAdVolume()).to.equal(1)
        done()
      })

      it('should set the right volume', function (done) {
        linear.setAdVolume(0.5)
        expect(linear._attributes.volume).to.equal(0.5)
        done()
      })

      it('should emit AdError is set with invalid volume', function (done) {
        linear.subscribe(function () {
          done()
        }, 'AdError')
        linear.setAdVolume(1.5)
      })
    })
  })

  describe('with videos', function () {
    let linear1
    let videoSlot1
    let slot

    before(function () {
      slot = document.createElement('div')
      videoSlot1 = document.createElement('video')
      document.body.appendChild(slot)
      document.body.appendChild(videoSlot1)
      linear1 = new Linear({
        videos: [{
          url: '/base/tests/fixtures/apple-watch.mp4',
          type: 'video/mp4'
        }]
      })
    })

    after(function () {
      slot.remove()
      videoSlot1.remove()
      linear1 = null
    })

    describe('initAd()', function () {
      it('should emit AdLoaded and initialized with right video src', function (done) {
        linear1.subscribe(function (data) {
          expect(linear1._videoSlot.src).to.match(/xbox-one.mp4$/)
          done()
        }, 'AdLoaded')
        linear1.initAd(320, 160, 'normal', null, null, {
          slot,
          videoSlot: videoSlot1
        })
      })
    })

    describe('life cycle', function () {
      this.wait = 5000
      it('should startAd()', function (done) {
        linear1.subscribe(function () {
          done()
        }, 'AdStarted')
        linear1.startAd()
      })

      it('should emit AdVideoStart when playing', function (done) {
        linear1.subscribe(function () {
          done()
        }, 'AdVideoStart')
        linear1._videoSlot.play()
      })

      it('should return valid AdDuration', function () {
        linear1.hasEngaged = false
        expect(linear1.getAdDuration()).to.be.above(0)
        linear1.hasEngaged = true
        expect(linear1.getAdDuration()).to.be.equal(-2)
      })

      it('should return valid AdRemainingTime', function () {
        linear1.hasEngaged = false
        expect(linear1.getAdRemainingTime()).to.be.above(0)
        linear1.hasEngaged = true
        expect(linear1.getAdRemainingTime()).to.be.equal(-2)
      })

      it('should pauseAd()', function (done) {
        linear1.subscribe(function () {
          done()
        }, 'AdPaused')
        linear1.pauseAd()
      })

      it('should resumeAd()', function (done) {
        linear1.subscribe(function () {
          done()
        }, 'AdPlaying')
        linear1.resumeAd()
      })

      it('should emit AdStopped when stopped', function (done) {
        linear1.subscribe(function () {
          expect(linear1._slot.textContent.trim()).to.be.empty
          done()
        }, 'AdStopped')
        linear1.stopAd()
      })
    })
  })
})
