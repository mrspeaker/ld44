# LD44

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

- make it take almost exactly 3 minutes.
- use tree% + time to dictate speed / $$$
- add/tweak text comments
- move comments to center, disappear after x seconds.
- show "building" comment after first building (don't worry about concrete)
- if first spread doesn't come after $4, add two coins!
- if last tree kill was > X seconds, add two coins somewhere
- focus screen on first spread (in case moved)

- would be cool to force you to cut down last tree.
- music starts jolly/ditty... goes darker and horrible
- $ font gets bigger over time, pulses?


Low Priority:
- More dead states for trees (turn brown/black)
- Building anim - take a tick to build the building
- SPin up $ in UPdate instead of updating instatly in Tick
- make roads when concrete in a line
- make the world repeateable - no edge.

## Pre LD notes
OOOh, it's happening again. Not sure where this will go, but probably I'll be using:

* Pixi.js for rendering
* Emacs

The rest up to the gods.

## Pixi notes

- https://pixijs.io/examples/
- http://www.html5gamedevs.com/forum/15-pixijs/
