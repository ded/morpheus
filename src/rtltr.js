!function (context) {
  var m = context.morpheus,
      map = {
        'padding-left': 1
        , 'paddingLeft': 1
        , 'padding-right': 1
        , 'paddingRight': 1
        , 'margin-left': 1
        , 'marginLeft': 1
        , 'margin-right': 1
        , 'marginRight': 1
        , 'border-left-width': 1
        , 'borderLeftWidth': 1
        , 'border-right-width': 1
        , 'borderRightWidth': 1
        , 'left': 1
        , 'right': 1
      }
  context.morpheus = function (elements, options, k, i, v) {
    if (context.morpheus.normal) {
      return m(elements, options)
    }
    for (k in options) {
      if (options.hasOwnProperty(k) && map[k]) {
        v = options[k]
        delete options[k]
        options[k.replace(/left|right/ig, function (m) {
          return /left/i.exec(m) ? 'Right' : 'Left'
        })] = v
      }
    }
    return m(elements, options)
  }
}(this);