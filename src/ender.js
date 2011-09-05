var morpheus = require('morpheus')
!function ($) {
  $.ender({
    animate: function (options) {
      return morpheus(this, options)
    }
  , fadeIn: function (d, fn) {
      return morpheus(this, {
          duration: d
        , opacity: 1
        , complete: fn
      })
    }
  , fadeOut: function (d, fn) {
      return morpheus(this, {
          duration: d
        , opacity: 0
        , complete: fn
      })
    }
  }, true)
  $.ender({
    tween: morpheus.tween
  })
}(ender)