!function ($) {
  $.ender({
    animate: function (options) {
      morpheus(this, options);
      return this;
    },
    fadeIn: function (d) {
      morpheus(this, {
        duration: d,
        opacity: 1
      });
      return this;
    },
    fadeOut: function (d) {
      morpheus(this, {
        duration: d,
        opacity: 0
      });
      return this;
    }
  }, true);
  $.ender({
    tween: morpheus.tween
  })
}(ender);