# LD44: Takes money

My entry for the Ludum Dare #44 game jame on the theme "Your life is currency". Not really a game, but you can [PLAY NOW](https://mrspeaker.github.io/ld44/)!

[![ld44](https://user-images.githubusercontent.com/129330/56872847-67c23780-69fb-11e9-86d9-f36b6196b291.png)](https://mrspeaker.github.io/ld44/)

## POST MORTEM

Nope, didn't make it! Started something, but didn't go all in. To "play"... click on a tree, it will chop down and you get a coin. Click on another tree that is close to the other coin... it will start a cellular automata that takes over, and you have nothing else to do.

[Cellular Automata thingo](https://mrspeaker.github.io/ld44/)

The code is a crazy bunch of crazy... but will be fun to refactor!

![Sprite sheet](https://raw.githubusercontent.com/mrspeaker/ld44/master/res/sprites.png)

## Jam notes

hmm, could get something in for the jam! [Edit: yep, got something in - [Ludum Dare jam entry](https://ldjam.com/events/ludum-dare/44/takes-money)

TODO:

[DONE]

Low Priority:
- pacing: use tree% + time to dictate speed / $$$
- pacing:  make it take almost exactly 3 minutes. (maybe not so important -seem to be about that)
- would be cool to force you to cut down last tree.
- audio sad trombone (or happy do do da dooo! trumpet?!)  death screen sfx
- More dead states for trees (turn brown/black)
- Building anim - take a tick to build the building
- SPin up $ in UPdate instead of updating instatly in Tick
- make roads when concrete in a line
- make the world repeateable - no edge.
-- $ font gets bigger over time, pulses?
-- music starts jolly/ditty... goes darker and horrible

- move tick logic out of Game and into WorldScene. Move tilemap out of WorldScene and into it's own class.

## Pre LD notes
OOOh, it's happening again. Not sure where this will go, but probably I'll be using:

* Pixi.js for rendering
* Emacs

The rest up to the gods.

## Pixi notes

- https://pixijs.io/examples/
- http://www.html5gamedevs.com/forum/15-pixijs/
