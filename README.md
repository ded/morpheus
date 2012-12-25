    _  _ ____ ____ ___  _  _ ____ _  _ ____
    |\/| |  | |__/ |__] |__| |___ |  | [__
    |  | |__| |  \ |    |  | |___ |__| ___]
-----
A Brilliant Animator.

Morpheus lets you "tween anything" in parallel on multiple elements; from colors to integers of any unit (px, em, %, etc), with easing transitions and bezier curves, including CSS3 [transforms](http://www.w3.org/TR/css3-2d-transforms/) (roate, scale, skew, & translate) -- all in a single high-performant loop utilizing the CPU-friendly [requestAnimationFrame](http://webstuff.nfshost.com/anim-timing/Overview.html) standard.

It looks like this:

``` js
var anim = morpheus(elements, {
  // CSS
    left: -50
  , top: 100
  , width: '+=50'
  , height: '-=50px'
  , fontSize: '30px'
  , color: '#f00'
  , transform: 'rotate(30deg) scale(+=3)'
  , "background-color": '#f00'

    // API
  , duration: 500
  , easing: easings.easeOut
  , bezier: [[100, 200], [200, 100]]
  , complete: function () {
      console.log('done')
    }
})

// stop an animation
anim.stop()

// jump to the end of an animation and run 'complete' callback
anim.stop(true)
```

General Tweening
------

``` js
morpheus.tween(1000,
  function (position) {
    // do stuff with position...
    // like for example, use bezier curve points :)
    var xy = morpheus.bezier([[startX, startY], <[n control points]>, [endX, endY]], position)
  },
  function () {
    console.log('done')
  },
  easings.bounce,
  100, // start
  300 // end
)
```

API
---

``` js
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
  * @return animation instance
  */
```

See the <a href="http://ded.github.com/morpheus/">live examples</a>

Language LTR - RTL support
---------------
For those who run web services that support languages spanning from LTR to RTL, you can use the drop-in plugin filed called <code>rtltr.js</code> found in the <code>src</code> directory which will automatically mirror all animations without having to change your implementation. It's pretty rad.

Browser support
-----------
Grade A & C Browsers according to Yahoo's [Graded Browser Support](http://developer.yahoo.com/yui/articles/gbs/). CSS3 transforms are only supported in browsers that support the transform specification.

Ender integration
--------
Got [Ender](http://ender.jit.su)? No? Get it.

    $ npm install ender -g

Add Morpheus to your existing Ender build

    $ ender add morpheus

Write code like a boss:

``` js
$('#content .boosh').animate({
  left: 911,
  complete: function () {
    console.log('boosh')
  }
})
```

Usage Notes
-----------

<h3>Color</h3>
If you're serious about *color animation*, there's a few precautions you'll need to take ahead of time. In order to morph *from* one color to another, you need to make sure the elements you're animating *have an inherited color style* to start with. Furthermore, those styles need to be represented in <code>rgb</code>, or <code>hex</code>, and not a named color (like <code>red</code>, or <code>orange</code>) -- that is unless you want to write code to map the [color conversion](http://www.w3schools.com/css/css_colornames.asp) yourself.

Therefore, at minimum, you need to set a color before animating.

``` js
element.style.color = '#ff0';
morpheus(element, {
  color: '#000'
})
```

With [Bonzo](https://github.com/ded/bonzo) installed in [Ender](http://ender.no.de).

``` js
$('div.things').css('color', '#ff0').animate({
  color: '#000'
})
```

<h3>Units</h3>
If you're considering animating by a CSS unit of measurement like <code>em</code>, <code>pt</code>, or <code>%</code>, like-wise to color animation, you must set the size ahead of time before animating:

``` js
$('div.intro')
  .css({
      fontSize: '2em'
    , width: '50%'
  })
  .animate({
      fontSize: '+=1.5em'
    , width: '100%'
  })
```

You also get two other fancy fading hooks

``` js
$('p').fadeIn(250, function () {
  console.log('complete')
})

$('p').fadeOut(500, function () {
  console.log('complete')
})
```

<h3>Transforms</h3>
Transforms can be animated in browsers that support them (IE9, FF, Chrome, Safari, Opera). <code>morpheus.transform</code> provides a shortcut to the correct style property for the browser (webkitTransform, MozTransform, etc). Like animating on units or color, you must set the property ahead of time before animating:

``` js
element.style[morpheus.transform] = 'rotate(30deg) scale(1)'
morpheus(element, {
  transform: 'rotate(0deg) scale(+=3)'
})
```

AMD Support
----------

``` js
require('morpheus.js', function (morpheus) {
  morpheus(elements, config)
})

or as usual with ender

var morpheus = require('morpheus')

```

## Developers

If you're looking to contribute. Add your changes to `src/morpheus.js` Then run the following

``` sh
npm install .
make
open tests/tests.html
```

Morpheus (c) Dustin Diaz 2011 - License MIT

**Happy Morphing!**
