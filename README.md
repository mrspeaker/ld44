# LD44: Your life is currency

[Test it out](https://mrspeaker.github.io/ld44/)

[![ld44](https://user-images.githubusercontent.com/129330/56872847-67c23780-69fb-11e9-86d9-f36b6196b291.png)](https://mrspeaker.github.io/ld44/)

## POST MORTEM

Nope, didn't make it! Started something, but didn't go all in. To "play"... click on a tree, it will chop down and you get a coin. Click on another tree that is close to the other coin... it will start a cellular automata that takes over, and you have nothing else to do.

[Cellular Automata thingo](https://mrspeaker.github.io/ld44/)

The code is a crazy bunch of crazy... but will be fun to refactor!

![Sprite sheet](https://raw.githubusercontent.com/mrspeaker/ld44/master/res/sprites.png)

## Jam notes

hmm, could get something in for the jam!

TODO:

- Comment dialog
-- add/tweak text comments
-- show "building" comment after first building (don't worry about concrete)

- make sure "get" CA at start
-- if first spread doesn't come after $4, add two coins!
-- focus screen on first spread (in case moved)
-- if last tree kill was > X seconds, add two coins somewhere (so not stuck)

- Audio
-- sfx for... building? $1000? (while you still think it's good).a million bucks?

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

## Pre LD notes
OOOh, it's happening again. Not sure where this will go, but probably I'll be using:

* Pixi.js for rendering
* Emacs

The rest up to the gods.

## Pixi notes

- https://pixijs.io/examples/
- http://www.html5gamedevs.com/forum/15-pixijs/
