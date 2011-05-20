!function (context, doc) {

  var hex = "0123456789abcdef",
      px = "px",
      html = doc.documentElement,
      defaultView = doc.defaultView,

      // Based on work by Juriy Zaytsev.
      SUPPORTS_GCS = defaultView && 'getComputedStyle' in defaultView,
      SUPPORTS_CS = !SUPPORTS_GCS && 'currentStyle' in html,
      SUPPORTS_FILTERS = !('opacity' in html.style) && 'filter' in html.style,
      opacityFilter = /alpha\s*\(\s*opacity\s*=\s*([^\)]+)\)/,
      unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1 },

      getStyle = SUPPORTS_GCS ?
        function (el, property) {
          var value = null, computed = defaultView.getComputedStyle(el, null);
          computed && (value = computed[camelize(property)]);
          return el.style[property] || value;
        } : SUPPORTS_CS ?

        function (el, property) {
          var value, style = el.style, currentStyle = el.currentStyle, result;
          property = camelize(property);
          if (property == 'opacity') {
            result = '1';
            if (SUPPORTS_FILTERS && (value = (style.filter || currentStyle.filter).match(opacityFilter))) {
              result = String(value[1] / 100);
            }
            return result;
          }
          return el.style[property] || (el.currentStyle ? el.currentStyle[property] : null);
        } :

        function (el, property) {
          return el.style[camelize(property)];
        },
      RGBtoHex = function () {
        function hx(n) {
          n = parseInt(n, 10);
          if (n === 0 || isNaN(n)) {
            return '00';
          }
          n = Math.max(0, n);
          n = Math.min(n, 255);
          n = Math.round(n);
          return hex.charAt((n - n % 16) / 16) + hex.charAt(n % 16);
        }
        return function (r, g, b) {
          return hx(r) + hx(g) + hx(b);
        };
      }(),
      toHex = function (c) {
        var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
        return (m ? '#' + RGBtoHex(m[1], m[2], m[3]) : c)
        .replace(/#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3'); // short to long
      },
      camelize = function (s) {
        return s.replace(/-(.)/g, function (m, m1) {
          return m1.toUpperCase();
        });
      };

  function tween(duration, fn, done, ease, from, to) {
    ease = ease || function (t) {
      return Math.sin(t * Math.PI / 2)
    };
    var self = this,
    time = duration || 1000,
    diff = to - from,
    start = new Date(),
    timer = setTimeout(run, 5);

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
      setTimeout(run, 5);
    }
  }

  function nextColor(pos, start, finish) {
    var r = [], i;
    for (i = 0; i < 6; i++) {
      from = hex.indexOf(start[i]);
      to = hex.indexOf(finish[i]);
      r[i] = hex[Math.floor((to - from) * pos + from)];
    }
    return '#' + r.join('');
  }

  function getVal(pos, options, begin, end, k, i, v) {
    if (typeof begin[i][k] == 'string') {
      return nextColor(pos, begin[i][k], end[i][k]);
    } else {
      v = (end[i][k] - begin[i][k]) * pos + begin[i][k];
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
        begin[i][k] = typeof options[k] == 'string' && options[k][0] == '#' ? toHex(v).slice(1) : parseFloat(v, 10);
        end[i][k] = typeof options[k] == 'string' && options[k][0] == '#' ? toHex(options[k]).slice(1) : by(options[k], parseFloat(v, 10));
      }
    }

    // one tween to rule them all
    tween(duration, function (pos, v) {
      var style, k, el;
      for (i = els.length; i--;) {
        for (k in options) {
          v = getVal(pos, options, begin, end, k, i);
          el = els[i];
          // Based on work by Juriy Zaytsev.
          if (k == 'opacity' && SUPPORTS_FILTERS) {
            style = el.style;
            if (SUPPORTS_CS && !el.currentStyle.hasLayout) {
              style.zoom = 1;
            }
            v = v >= 0.9999 ? '' : ('alpha(opacity=' + (v * 100) + ')');
            if (opacityFilter.test(style.filter)) {
              style.filter = style.filter.replace(opacityFilter, v);
            } else {
              style.filter += v;
            }
          } else {
            el.style[camelize(k)] = v;
          }
        }
      }
    }, complete, ease);
  }

  typeof module !== 'undefined' && module.exports &&
    (module.exports = morpheus);
  context['morpheus'] = morpheus;

}(this, document);