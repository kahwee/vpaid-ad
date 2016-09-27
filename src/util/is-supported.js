let el
module.exports = function (type) {
  if (!el) {
    el = document.createElement('video')
  }
  return !!el.canPlayType(type).replace(/no/, '')
}
