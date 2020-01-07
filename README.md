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
- Graphics (with some glitches?)
- Keyboard input
- Pac-Man!
- ROM zip decompression
- Playable now on Chrome!
- Rudimentary gamepad support (tested with Logitech F310 on Firefox)

## To-Dos
- Sound
- Other game/ROM format support (specifically Ms Pac-Man)
- Scoreboard?
- Editable DIP switches
- Prettier HTML/CSS
- Read colors from ROM (currently hardcoded)
- Remappable input
