import Linear from '../src/linear'

describe('Linear', function () {
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

    describe('ad size', function () {
      it('should report the correct width', function (done) {
        expect(linear.getAdWidth()).to.equal(320)
        done()
      })

      it('should report the correct height', function (done) {
        expect(linear.getAdHeight()).to.equal(160)
        done()
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
          url: '/base/tests/fixtures/xbox-one.mp4',
          mimetype: 'video/mp4'
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
