# js-pacman
Winter break 2019/20 project.
[Namco Pac-Man board](https://en.wikipedia.org/wiki/Namco_Pac-Man) emulator currently using [Z80.js](https://github.com/DrGoldfire/Z80.js).
Can play Pac-Man when given a ROM zip, but support for other games (on the same board) is a work-in-progress.
I develop with Firefox but try to test with Chrome every so often to make sure it's not abysmal.

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
- Rudimentary gamepad support (tested with Logitech F310 on Firefox)
- Sound (experimental; low-qual)

## To-Dos
- Other game/ROM format support (specifically Ms Pac-Man)
- Global scoreboard?
- Editable DIP switches
- Prettier HTML/CSS
- Remappable input
- Read colors from ROM instead of hardcoding (low priority)
- Better sound quality (low priority)
