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
	color: '#f00',
	duration: 500,
	complete: function () {
	  console.log('done');
	}
})
```

Tweening
------

<h3>integers</h3>

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

<h3>colors</h3>

``` js
morpheus.color(1000,
	function (color) {
		// do stuff with position
	},
	null,
	null,
	'#ff0', // start
	'#cc33ee' // end
)
```
