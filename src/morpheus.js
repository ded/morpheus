!function (context, doc) {

  var ie = /msie/i.test(navigator.userAgent),
      hex = "0123456789abcdef",
      digit = /^-?[\d\.]+$/,
      px = 'px',
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
        };

  function toHex(c) {
		var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
		return (m ? '#' + (m[1] << 16 | m[2] << 8 | m[3]).toString(16) : c)
		.replace(/#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3'); // from short to long
	}

	function camelize(s) {
    return s.replace(/-(.)/g, function (m, m1) {
      return m1.toUpperCase();
    });
  }


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

	tween.color = function (duration, from, to, fn, done, ease) {
		var start = toHex(from).slice(1),
				finish = toHex(to).slice(1);
		tween(duration, function (pos) {
			var r = [], i;
			for (i = 0; i < 6; i++) {
				from = hex.indexOf(start[i]);
				to = hex.indexOf(finish[i]);
				r[i] = hex[Math.floor((to - from) * pos + from)];
			}
			fn('#' + r.join(''));
		}, done, ease);
	}

  function morpheus(elements, options) {
    var els = elements ? (els = isFinite(elements.length) ? elements : [elements]) : [], i,
        complete = options.complete,
        duration = options.duration,
        ease = options.easing,
        begin = [];
    delete options.complete;
    delete options.duration;
    delete options.easing;

    // record beginning "from" state
    for (i = els.length; i--;) {
      begin[i] = {};
      for (var k in options) {
        var v = options[k];
        digit.test(v) && !(k in unitless) && (v += px);
        begin[i][k] = parseInt(getStyle(els[i], k), 10);
      }
    }
    // (p = camelize(k)) && digit.test(v) && !(p in unitless) && (v += px);

    // one tween to rule them all
    tween(duration, function (pos) {
      for (i = els.length; i--;) {
        for (var k in options) {
          var val = (options[k] - begin[i][k]) * pos + begin[i][k];
          els[i].style[k] = val + 'px';
        }
      }
    }, complete, ease);

  }

  typeof module !== 'undefined' && module.exports &&
    (module.exports = morpheus);
  context['morpheus'] = morpheus;

}(this, document);