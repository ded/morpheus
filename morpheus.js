/*!
  * Morpheus - A Brilliant Animator
  * https://github.com/ded/morpheus - (c) Dustin Diaz 2011
  * License MIT
  */
!function (context, doc, win) {

  var ie = /msie/i.test(navigator.userAgent),
      hex = "0123456789abcdef",
      px = 'px',
      html = doc.documentElement,
      unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1 },
      getStyle = doc.defaultView && doc.defaultView.getComputedStyle ?
        function (el, property) {
          var value = null;
          var computed = doc.defaultView.getComputedStyle(el, '');
          computed && (value = computed[camelize(property)]);
          return el.style[property] || value;
        } : (ie && html.currentStyle) ?

        function (el, property) {
          property = camelize(property);

          if (property == 'opacity') {
            var val = 100;
            try {
              val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
            } catch (e1) {
              try {
                val = el.filters('alpha').opacity;
              } catch (e2) {}
            }
            return val / 100;
          }
          var value = el.currentStyle ? el.currentStyle[property] : null;
          return el.style[property] || value;
        } :

        function (el, property) {
          return el.style[camelize(property)];
        },
      rgb = function (r, g, b) {
        return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
      },
      toHex = function (c) {
        var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
        return (m ? rgb(m[1], m[2], m[3]) : c)
        .replace(/#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3'); // short to long
      },
      camelize = function (s) {
        return s.replace(/-(.)/g, function (m, m1) {
          return m1.toUpperCase();
        });
      },
      frame = function () {
        return win.requestAnimationFrame  ||
          win.webkitRequestAnimationFrame ||
          win.mozRequestAnimationFrame    ||
          win.oRequestAnimationFrame      ||
          win.msRequestAnimationFrame     ||
          function (callback) {
            win.setTimeout(callback, 10);
          };
      }();

  function tween(duration, fn, done, ease, from, to) {
    ease = ease || function (t) {
      return Math.sin(t * Math.PI / 2)
    };
    var self = this,
    time = duration || 1000,
    diff = to - from,
    start = new Date(),
    timer = frame(run);

    function run() {
      var delta = new Date() - start;
      if (delta > time) {
        fn(to || 1);
        done && done();
        timer = null;
        return;
      }
      to ?
        fn((diff * ease(delta / time)) + from) :
        fn(ease(delta / time));
      frame(run, 5);
    }
  }

  function nextColor(pos, start, finish) {
    var r = [], i, e;
    for (i = 0; i < 6; i++) {
      from = hex.indexOf(start[i] > 15 ? 15 : start[i]);
      to = hex.indexOf(finish[i] > 15 ? 15 : finish[i]);
      e = Math.floor((to - from) * pos + from);
      e = e > 15 ? 15 : e < 0 ? 0 : e;
      r[i] = hex[e];
    }
    return '#' + r.join('');
  }

  function getVal(pos, options, begin, end, k, i, v) {
    if (typeof begin[i][k] == 'string') {
      return nextColor(pos, begin[i][k], end[i][k]);
    } else {
      v = Math.round(((end[i][k] - begin[i][k]) * pos + begin[i][k]) * 1000) / 1000;
      !(k in unitless) && (v += px);
      return v;
    }
  }

  function by(val, start, m, r, i) {
    return (m = /^([+\-])=([\d\.]+)/.exec(val)) ?
      (i = parseInt(m[2], 10)) && (r = (start + i)) && m[1] == '+' ?
      r : start - i :
      parseInt(val, 10);
  }

  function morpheus(elements, options) {
    var els = elements ? (els = isFinite(elements.length) ? elements : [elements]) : [], i,
        complete = options.complete,
        duration = options.duration,
        ease = options.easing,
        begin = [],
        end = [];
    delete options.complete;
    delete options.duration;
    delete options.easing;

    // record beginning "from" state
    for (i = els.length; i--;) {
      begin[i] = {};
      end[i] = {};
      for (var k in options) {
        var v = getStyle(els[i], k);
        begin[i][k] = typeof options[k] == 'string' && options[k][0] == '#' ?
          v == 'transparent' ?
            'ffffff' :
            toHex(v).slice(1) : parseFloat(v, 10);
        end[i][k] = typeof options[k] == 'string' && options[k][0] == '#' ? toHex(options[k]).slice(1) : by(options[k], parseFloat(v, 10));
      }
    }

    // one tween to rule them all
    tween(duration, function (pos, v) {
      for (i = els.length; i--;) {
        for (var k in options) {
          v = getVal(pos, options, begin, end, k, i);
          ie && k == 'opacity' ?
            (els[i].style.filter = 'alpha(opacity=' + (v * 100) + ')') :
            (els[i].style[camelize(k)] = v);
        }
      }
    }, complete, ease);
  }

  typeof module !== 'undefined' && module.exports &&
    (module.exports = morpheus);
  context['morpheus'] = morpheus;

}(this, document, window);