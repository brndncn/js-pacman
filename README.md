# js-pacman
[Namco Pac-Man board](https://en.wikipedia.org/wiki/Namco_Pac-Man) emulator currently using [Z80.js](https://github.com/DrGoldfire/Z80.js).
Work-in-progress, but can currently play Pac-Man when given a ROM zip.
I recommend running it in Firefox, because at the moment, it performs substantially better than Chrome (at least when I tested).

A Heroku instance runs [here](http://js-pac.herokuapp.com/).

## Install/Run
```
npm install
```

```
npm run build && npm run start
```

## Works
- Graphics (with some glitches?)
- Keyboard input
- Pac-Man!
- ROM zip decompression
- Playable now on Chrome!

## To-Dos
- Gamepad support
- Sound
- Other game/ROM format support (specifically Ms Pac-Man)
- Scoreboard?
- Editable DIP switches
- Prettier HTML/CSS
- Read colors from ROM
- Auto-download ROM from other host
