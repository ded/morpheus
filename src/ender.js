!function ($) {
  $.ender({
    animate: function (options) {
      morpheus(this, options);
      return this;
    },
    fadeIn: function (d, fn) {
      morpheus(this, {
        duration: d,
        opacity: 1,
        complete: fn
      });
      return this;
    },
    fadeOut: function (d, fn) {
      morpheus(this, {
        duration: d,
        opacity: 0,
        complete: fn
      });
      return this;
    }
  }, true);
  $.ender({
    tween: morpheus.tween
  })
}(ender);