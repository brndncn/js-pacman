# js-pacman
[Namco Pac-Man board](https://en.wikipedia.org/wiki/Namco_Pac-Man) emulator currently using [Z80.js](https://github.com/DrGoldfire/Z80.js).
Work-in-progress, but can currently play Pac-Man when given a ROM zip.

A Heroku instance runs [here](http://js-pac.herokuapp.com/).

## Install/Run
```
npm install
```

```
npm run build && npm run start
```

## Works
- Graphics (I think)
- Keyboard input
- Pac-Man!
- ROM zip decompression

## To-Dos
- Better modularization/code quality
- Gamepad support
- Performance: why is it so abysmal in Chrome?
- Sound
- Other game/ROM format support (specifically Ms Pac-Man)
- Scoreboard?
- Editable DIP switches
- Prettier HTML/CSS
- Read colors from ROM
