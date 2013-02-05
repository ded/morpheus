!function (name, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else this[name] = definition()
}('morpheus', function () {

  var doc = document
    , win = window
    , perf = win.performance
    , perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow)
    , now = perfNow ? function () { return perfNow.call(perf) } : function () { return +new Date() }
    , html = doc.documentElement
    , thousand = 1000
      // these elements do not require 'px'
    , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, transform: 1}

  // which property name does this browser use for transform
  var transform = function () {
    var styles = doc.createElement('a').style
      , props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform']
      , i
    for (i = 0; i < props.length; i++) {
      if (props[i] in styles) return props[i]
    }
  }()

  // does this browser support the opacity property?
  var opasity = function () {
    return typeof doc.createElement('a').style.opacity !== 'undefined'
  }()

  // initial style is determined by the elements themselves
  // TODO: redundant camelize, but getStyle is exposed to the outside world, so removing this might break compatibility
  var getStyle = doc.defaultView && doc.defaultView.getComputedStyle ?
    function (el, property) {
      property = property == 'transform' ? transform : property
      var value = null
        , computed = doc.defaultView.getComputedStyle(el, '')
      computed && (value = computed[camelize(property)])
      return el.style[property] || value
    } : html.currentStyle ?

    function (el, property) {
      property = camelize(property)

      if (property == 'opacity') {
        var val = 100
        try {
          val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
        } catch (e1) {
          try {
            val = el.filters('alpha').opacity
          } catch (e2) {}
        }
        return val / 100
      }
      var value = el.currentStyle ? el.currentStyle[property] : null
      return el.style[property] || value
    } :
    function (el, property) {
      return el.style[camelize(property)]
    }

  var frame = function () {
    // native animation frames
    // http://webstuff.nfshost.com/anim-timing/Overview.html
    // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
    return win.requestAnimationFrame  ||
      win.webkitRequestAnimationFrame ||
      win.mozRequestAnimationFrame    ||
      win.msRequestAnimationFrame     ||
      win.oRequestAnimationFrame      ||
      function (callback) {
        win.setTimeout(function () {
          callback(+new Date())
        }, 17) // when I was 17..
      }
  }()

  var children = []

  function has(array, elem, i) {
    if (Array.prototype.indexOf) return array.indexOf(elem)
    for (i = 0; i < array.length; ++i) {
      if (array[i] === elem) return i
    }
  }

  function render(timestamp) {
    var i, count = children.length
    // if we're using a high res timer, make sure timestamp is not the old epoch-based value.
    // http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
    if (perfNow && timestamp > 1e12) timestamp = now()
    for (i = count; i--;) {
      children[i](timestamp)
    }
    children.length && frame(render)
  }

  function live(f) {
    if (children.push(f) === 1) frame(render)
  }

  function die(f) {
    var rest, index = has(children, f)
    if (index >= 0) {
      rest = children.slice(index + 1)
      children.length = index
      children = children.concat(rest)
    }
  }

  // change font-size => fontSize etc.
  function camelize(s) {
    return s.replace(/-(.)/g, function (m, m1) {
      return m1.toUpperCase()
    })
  }

  // aren't we having it?
  function fun(f) {
    return typeof f == 'function'
  }

  function nativeTween(t) {
    // default to a pleasant-to-the-eye easeOut (like native animations)
    return Math.sin(t * Math.PI / 2)
  }

  /**
    * Core tween method that requests each frame
    * @param duration: time in milliseconds. defaults to 1000
    * @param fn: tween frame callback function receiving 'position'
    * @param done {optional}: complete callback function
    * @param ease {optional}: easing method. defaults to easeOut
    * @param from {optional}: integer to start from
    * @param to {optional}: integer to end at
    * @returns method to stop the animation
    */
  function tween(duration, fn, done, ease, from, to) {
    ease = fun(ease) ? ease : morpheus.easings[ease] || nativeTween
    var time = duration || thousand
      , self = this
      , diff = to - from
      , start = now()
      , stop = 0
      , end = 0

    function run(t) {
      var delta = t - start
      if (delta > time || stop) {
        to = isFinite(to) ? to : 1
        stop ? end && fn(to) : fn(to)
        die(run)
        return done && done.apply(self)
      }
      // if you don't specify a 'to' you can use tween as a generic delta tweener
      // cool, eh?
      isFinite(to) ?
        fn((diff * ease(delta / time)) + from) :
        fn(ease(delta / time))
    }

    live(run)

    return {
      stop: function (jump) {
        stop = 1
        end = jump // jump to end of animation?
        if (!jump) done = null // remove callback if not jumping to end
      }
    }
  }

  /**
    * generic bezier method for animating x|y coordinates
    * minimum of 2 points required (start and end).
    * first point start, last point end
    * additional control points are optional (but why else would you use this anyway ;)
    * @param points: array containing control points
       [[0, 0], [100, 200], [200, 100]]
    * @param pos: current be(tween) position represented as float  0 - 1
    * @return [x, y]
    */
  function bezier(points, pos) {
    var n = points.length, r = [], i, j
    for (i = 0; i < n; ++i) {
      r[i] = [points[i][0], points[i][1]]
    }
    for (j = 1; j < n; ++j) {
      for (i = 0; i < n - j; ++i) {
        r[i][0] = (1 - pos) * r[i][0] + pos * r[parseInt(i + 1, 10)][0]
        r[i][1] = (1 - pos) * r[i][1] + pos * r[parseInt(i + 1, 10)][1]
      }
    }
    return [r[0][0], r[0][1]]
  }


  // Takes a CSS "used value" and returns a parsed object
  function parseCSS1(k, s, i) {
    var x, y, a = [], old = i
    // It's a number
    if (/[+\-0-9]/.test(s[i])) {
      x = { type: 'number' }
      if (/[+\-]/.test(s[i])) {
        if (s[i + 1] === '=') {
          x.relative = s[i]
          i += 2
        } else {
          a.push(s[i])
          i += 1
        }
      }
      while (s[i] && /[0-9\.]/.test(s[i])) {
        a.push(s[i])
        i += 1
      }
      x.value = +a.join('')

      // This is for the optional unit
      a = []
      while (s[i] && /[a-zA-Z%]/.test(s[i])) {
        a.push(s[i])
        i += 1
      }
      x.unit = a.join('')

      // TODO: pretty hacky
      // some css properties don't require a unit (like zIndex, lineHeight, opacity)
      if (x.unit === '' && !(k in unitless)) {
        x.unit = 'px'
      }
    } else {
      while (s[i] && /[^\( ]/.test(s[i])) {
        a.push(s[i])
        i += 1
      }
      // It's a function
      // TODO: doesn't currently handle stuff like `foo(bar qux, corge)`
      if (s[i] === '(') {
        x = { type: 'function', value: a.join(''), args: [] }
        i += 1
        while (s[i]) {
          while (s[i] === ' ') {
            i += 1
          }
          y = parseCSS1('opacity', s, i)
          x.args.push(y.value)
          i = y.index
          if (s[i] === ')') {
            i += 1
            break
          } else if (s[i] === ',') {
            i += 1
          }
        }
      // It's a normal value
      } else {
        x = { type: 'normal', value: a.join('') }
      }
    }
    if (i === old) {
      throw new Error('invalid CSS value ' + s)
    }
    return { value: x, index: i }
  }

  function parseCSS(k, s) {
    s = '' + s // convert to string
    var i = 0
      , a = []
      , x
    while (s[i]) {
      x = parseCSS1(k, s, 0)
      a.push(x.value)
      i = x.index
    }
    if (a.length === 1) {
      return a[0]
    } else {
      return { type: 'multi', args: a }
    }
  }

  /**
    * makeTweener:
    * @param x: parsed CSS object which represents the start of the animation
    * @param y: parsed CSS object which represents the end of the animation
    * @returns a function which when given a position returns the interpolated style
    */
  function makeTweener(x, y) {
    switch (x.type) {
    case 'number':
      var diff = y.value - x.value
      return function (pos) {
        // round so we don't get crazy long floats
        return Math.round((x.value + (diff * pos)) * thousand) / thousand + x.unit
      }
    case 'multi':
      x.args = x.args.map(function (x, i) {
        return makeTweener(x, y.args[i])
      })
      return function (pos) {
        return x.args.map(function (f) { return f(pos) }).join(' ')
      }
    case 'function':
      // Normalize to rgba
      if (x.value === 'rgb') {
        x.args.push({ type: 'number', value: 1, unit: '' })
        x.value = 'rgba'
      }
      if (y.value === 'rgb') {
        y.args.push({ type: 'number', value: 1, unit: '' })
        x.value = 'rgba'
      }
      x.args = x.args.map(function (x, i) {
        return makeTweener(x, y.args[i])
      })
      if (x.value === 'rgba') {
        return function (pos) {
          return x.value + '(' + Math.round(x.args[0](pos)) + ', ' +
                                 Math.round(x.args[1](pos)) + ', ' +
                                 Math.round(x.args[2](pos)) + ', ' +
                                 x.args[3](pos) + ')'
        }
      } else {
        return function (pos) {
          return x.value + '(' + x.args.map(function (f) { return f(pos) }).join(', ') + ')'
        }
      }
      break // TODO: useless break but JSHint complained about it
    case 'normal':
      return function (pos) {
        return pos > 0.5 ? y.value : x.value
      }
    }
  }

  function getRelative(x, y) {
    switch (y.type) {
    case 'number':
      // Relative values with += and -=
      if (y.relative === '+') {
        y.value = x.value + y.value
      } else if (y.relative === '-') {
        y.value = x.value - y.value
      }
      return y.value + y.unit
    case 'multi':
      y.args = y.args.map(function (y, i) {
        return getRelative(x.args[i], y)
      })
      return y.args.join(' ')
    // TODO Should this normalize to rgba?
    case 'function':
      y.args = y.args.map(function (y, i) {
        return getRelative(x.args[i], y)
      })
      return y.value + '(' + y.args.join(', ') + ')'
    case 'normal':
      return y.value
    }
  }

  function opacity(f) {
    return function (pos) {
                                       // TODO: this coerces from a string to a number
      return 'alpha(opacity=' + f(pos) * 100 + ')'
    }
  }

  function getOption(v, el) {
    return fun(v) ? v(el) : v
  }

  /**
    * morpheus:
    * @param element(s): HTMLElement(s)
    * @param options: mixed bag between CSS Style properties & animation options
    *  - {n} CSS properties|values
    *     - value can be strings, integers,
    *     - or callback function that receives element to be animated. method must return value to be tweened
    *     - relative animations start with += or -= followed by integer
    *  - duration: time in ms - defaults to 1000(ms)
    *  - easing: a transition method - defaults to an 'easeOut' algorithm
    *  - complete: a callback method for when all elements have finished
    *  - bezier: array of arrays containing x|y coordinates that define the bezier points. defaults to none
    *     - this may also be a function that receives element to be animated. it must return a value
    */
  function morpheus(elements, options) {
    var complete = options.complete
      , duration = options.duration
      , ease     = options.easing
      , points   = options.bezier
      , a        = []
      , els      = (elements
                     ? (els = isFinite(elements.length)
                         ? elements
                         : [elements])
                     : [])
      , old
      , begin
      , end
      , camel
      , bez
      , i
      , k

    for (i = els.length; i--;) {
      if (points) {
        var left = getStyle(els[i], 'left')
          , top  = getStyle(els[i], 'top')
          , xy   = []

        // TODO: pretty ridiculous; split it into multiple statements, or simplify it?
        xy.push(parseFloat(getRelative(parseCSS('left', left),
                                       parseCSS('left', options.left
                                                         ? getOption(options.left, els[i])
                                                         : 0))))
        xy.push(parseFloat(getRelative(parseCSS('top', top),
                                       parseCSS('top', options.top
                                                         ? getOption(options.top, els[i])
                                                         : 0))))

        bez = fun(points) ? points(els[i], xy) : points
        bez.push(xy)
        bez.unshift([
          parseInt(left, 10),
          parseInt(top, 10)
        ])
        a.push({ element: els[i], bezier: bez })
      }

      for (k in options) {
        switch (k) {
        case 'complete':
        case 'duration':
        case 'easing':
        case 'bezier':
          continue
        }

        if (points) {
          switch (k) {
          case 'left':
          case 'top':
          case 'bottom':
          case 'right':
            continue
          }
        }

        if (k === 'transform') {
          camel = transform
        } else {
          camel = camelize(k)
        }

        old   = els[i].style[camel]
        begin = parseCSS(camel, getStyle(els[i], camel))
        // TODO: inefficient and very hacky, but I don't see a better way to make relative units work
        els[i].style[camel] = getRelative(begin, parseCSS(camel, getOption(options[k], els[i])))
        end   = parseCSS(camel, getStyle(els[i], camel))
        els[i].style[camel] = old

        if (camel === 'opacity' && !opasity) {
          a.push({ element: els[i]
                 , style:   'filter'
                 , value:   opacity(makeTweener(begin, end)) })
        } else {
          a.push({ element: els[i]
                 , style:   camel
                 , value:   makeTweener(begin, end) })
        }
      }
    }
    // ONE TWEEN TO RULE THEM ALL
    return tween.call(els, duration, function (pos) {
      for (i = a.length; i--;) {
        if (a[i].bezier) {
          var xy = bezier(a[i].bezier, pos)
          a[i].element.style.left = xy[0] + 'px'
          a[i].element.style.top  = xy[1] + 'px'
        } else {
          a[i].element.style[a[i].style] = a[i].value(pos)
        }
      }
    }, complete, ease)
  }

  // expose useful methods
  morpheus.tween = tween
  morpheus.getStyle = getStyle
  morpheus.bezier = bezier
  morpheus.transform = transform
  morpheus.easings = {}

  return morpheus

});
