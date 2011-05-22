    _  _ ____ ____ ___  _  _ ____ _  _ ____
    |\/| |  | |__/ |__] |__| |___ |  | [__
    |  | |__| |  \ |    |  | |___ |__| ___]
-----
A Brilliant Animator.

Morpheus lets you "tween anything" in parallel on multiple elements, from integers to colors, with easing transitions, in a single high-performant loop.

It looks like this:

``` js
morpheus(elements, {
  left: 50,
  top: 100,
  width: '+=50',
  height: '-50px',
  fontSize: '30px',
  color: '#f00',
  "background-color": '#f00',
  duration: 500,
  easing: easings.easeOut,
  complete: function () {
    console.log('done');
  }
})
```

General Tweening
------

``` js
morpheus.tween(1000,
  function (position) {
    // do stuff with position
  },
  function () {
    console.log('done');
  },
  easings.bounce,
  100, // start
  300 // end
)
```

Browser support
-----------
Grade A & C Browsers according to Yahoo's [Graded Browser Support](http://developer.yahoo.com/yui/articles/gbs/)

Ender integration
--------
Got [Ender](http://ender.no.de)? No? Get it.

    $ npm install ender -g

Add Morpheus to your existing Ender build

    $ ender add morpheus

Write code like a boss:

``` js
$('#content .boosh').animate({
  left: 911,
  complete: function () {
    console.log('boosh');
  }
});
```

Usage Notes
-----------
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

*Morpheus (c) Dustin Diaz 2011 - License MIT*

**Happy Morphing!**