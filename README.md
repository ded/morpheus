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