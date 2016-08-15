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

  describe.only('with videos', function () {
    let linear
    let videoSlot
    let slot

    before(function () {
      slot = document.createElement('div')
      videoSlot = document.createElement('video')
      document.body.appendChild(slot)
      document.body.appendChild(videoSlot)
      linear = new Linear({
        videos: [{
          url: '/base/tests/fixtures/xbox-one.mp4',
          mimetype: 'video/mp4'
        }]
      })
    })

    describe('initAd()', function () {
      it('should emit AdLoaded and initialized with right video src', function (done) {
        linear.subscribe(function (data) {
          expect(linear._videoSlot.src).to.match(/xbox-one.mp4$/)
          done()
        }, 'AdLoaded')
        linear.initAd(320, 160, 'normal', null, null, {slot, videoSlot})
      })
    })

    describe('startAd()', function () {
      it('should startAd()', function (done) {
        linear.subscribe(function () {
          done()
        }, 'AdStarted')
        linear.startAd()
      })

      it('should pauseAd()', function (done) {
        linear.subscribe(function () {
          done()
        }, 'AdPaused')
//        linear.pauseAd()
      })
    })
  })
})
