const zip = require('zip');
const Z80 = require('./Z80')["default"];
const browser = require('bowser').getParser(window.navigator.userAgent);

let core;

zip.workerScriptsPath = "/lib/";
zip.useWebWorkers = false;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const zipUploadField = document.getElementById('zip_upload') as HTMLInputElement;
const loadButton = document.getElementById('load_button');
const startButton = document.getElementById('start_button');
const stopButton = document.getElementById('stop_button');
const resetButton = document.getElementById('reset_button');

canvas.width = 224;
canvas.height = 288;
switch (browser.getBrowser().name) {
  case 'Chrome':
    canvas.style.imageRendering = 'pixelated';
    break;
  case 'Firefox':
    canvas.style.imageRendering = 'crisp-edges';
    break;
  default:
    break;
}

// COLORS

// TODO read colors from ROM and translate to RGB instead of hardcoding
let colors = [
  [  0,   0,   0],
  [255,   0,   0],
  [222, 151,  81],
  [255, 184, 255],
  [  0,   0,   0],
  [  0, 255, 255],
  [ 71, 184, 255],
  [255, 184,  81],
  [  0,   0,   0],
  [255, 255,   0],
  [  0,   0,   0],
  [ 33,  33, 255],
  [  0, 255,   0],
  [ 71, 184, 174],
  [255, 184, 174],
  [222, 222, 255],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
  [  0,   0,   0],
];

// PALETTES

let palettes: number[][] = [];

function loadPalettes(paletteRom: Uint8Array): void {
  palettes = [];
  for (let i = 0; i + 3 < paletteRom.length; i += 4) {
    let palette = [0, 0, 0, 0];
    for (let j = 0; j < 4; j++) {
      palette[j] = paletteRom[i + j];
    }
    palettes.push(palette);
  }
  console.log('palettes length: ' + palettes.length + ' (we expect 64?)');
}

// TILES

let tiles: Uint8Array[] = [];

function loadTiles(tileRom: Uint8Array): void {
  tiles = [];
  for (let i = 0; i + 15 < tileRom.length; i += 16) {
    tiles.push(tileRom.slice(i, i + 16));
  }
  console.log('tiles length: ' + tiles.length + ' (we expect 256?)');
}

/*
 Parameters x and y are canvas positions (unlike drawSprite)
 */
function drawTile(tileIndex: number, paletteByte: number, x: number, y: number): void {
  let imageData = ctx.createImageData(8, 8);
  let tile = tiles[tileIndex];
  let palette = palettes[paletteByte & 0x3f];
  if (palette === undefined) {
    palette = palettes[1];
    //console.log('tile palette error! 0x' + paletteByte.toString(16));
  }
  for (let i = 0; i < 64; i++) {
    // TODO fix this mess
    // possibly have a de-scramble step in load?
    let b = tile[Math.floor(i / 4)];
    let sdx = ((b >> (i % 4)) & 0x11);
    let colorIndex = palette[Math.floor(sdx / 8) + (sdx & 0x1)];
    let color = colors[colorIndex];
    let y = (i >= 32 ? 0 : 4) + (3 - i % 4);
    let x = 7 - (Math.floor(i / 4) % 8);
    let index = (x + y * 8) * 4;
    imageData.data[index + 0] = color[0];
    imageData.data[index + 1] = color[1];
    imageData.data[index + 2] = color[2];
    imageData.data[index + 3] = 255;
  }
  ctx.putImageData(imageData, x, y);
}

// SPRITES

let sprites: Uint8Array[] = [];

function loadSprites(spriteRom: Uint8Array): void {
  sprites = [];
  for (let i = 0; i + 63 < spriteRom.length; i += 64) {
    sprites.push(spriteRom.slice(i, i + 64));
  }
  console.log('sprites length: ' + sprites.length + ' (we expect 64?)');
}

/*
 Parameters x and y are the value directly from mem_read, not adjusted for canvas position
 */
function drawSprite(spriteIndex: number, paletteIndex: number, memx: number, memy: number, xflip: boolean, yflip: boolean): void {
  let x = 239 - memx;
  let y = 272 - memy;
  let imageData = ctx.getImageData(x, y, 16, 16);
  let sprite = sprites[spriteIndex];
  let palette = palettes[paletteIndex];
  if (palette === undefined) {
    palette = palettes[1];
    console.log('sprite palette error! 0x' + paletteIndex.toString(16));
  }
  // approach 2
  for (let k = 0; k < 8; k++) {
    let kx = k >= 4 ? 0 : 8;
    let ky = ((k + 3) % 4) * 4;
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 4; i++) {
        let b = sprite[k * 8 + j];
        let sdx = ((b >> i) & 0x11);
        let colorIndex = palette[Math.floor(sdx / 8) + (sdx & 0x1)];
        if (colorIndex != 0) { // color 0 is transparent
          let color = colors[colorIndex];
          let y = ky + (3 - i);
          let x = kx + (7 - j);
          if (xflip) x = 15 - x;
          if (yflip) y = 15 - y;
          let index = (x + y * 16) * 4;
          imageData.data[index + 0] = color[0];
          imageData.data[index + 1] = color[1];
          imageData.data[index + 2] = color[2];
          imageData.data[index + 3] = 255;
        }
      }
    }
  }
  // TODO wrapping and clipping
  ctx.putImageData(imageData, x, y);
}

// DRAW TESTS

function drawPalettesTest(): void {
  for (let i = 0; i < palettes.length; i++) {
    for (let j = 0; j < 4; j++) {
      let color = palettes[i][j];
      ctx.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
      ctx.fillRect(i * 10, (4 - j) * 10, 10, 10);
    }
  }
}

function drawTilesTest(): void {
  for (let i = 0; i < tiles.length; i++) {
    drawTile(i, 1, (i % 28) * 8, Math.floor(i / 28) * 8);
  }
}

function drawSpritesTest(): void {
  for (let i = 0; i < sprites.length; i++) {
    drawSprite(i, 1, (i % 8) * 16 + 31, Math.floor(i / 8) * 16 + 16, false, false);
  }
}

// DRAW FROM RAM

function drawTilesFromRAM(core: EmulatorCore): void {
  // bottom two rows
  for (let i = 0x00; i <= 0x03f; i++) {
    drawTile(
      core.mem_read(0x4000 + i),
      core.mem_read(0x4400 + i),
      (29 - (i % 0x20)) * 8,
      (i >= 0x20 ? 35 : 34) * 8,
    );
  }

  // middle section
  for (let i = 0x40; i <= 0x3bf; i++) {
    drawTile(
      core.mem_read(0x4000 + i),
      core.mem_read(0x4400 + i),
      (29 - Math.floor(i / 0x20)) * 8,
      (2 + (i % 0x20)) * 8,
    );
  }

  // top two rows
  for (let i = 0x3c0; i <= 0x03ff; i++) {
    drawTile(
      core.mem_read(0x4000 + i),
      core.mem_read(0x4400 + i),
      (29 - (i % 0x20)) * 8,
      (i >= 0x3e0 ? 1 : 0) * 8,
    );
  }
}

function drawSpritesFromRAM(core: EmulatorCore): void {
  for (let i = 0xE; i >= 0x0; i -= 0x2) {
    let sprite = (core.mem_read(0x4ff0 + i) >> 2) & 0x3f;
    let xflip = ((core.mem_read(0x4ff0 + i) >> 1) & 0x1) == 0x1;
    let yflip = ((core.mem_read(0x4ff0 + i) >> 0) & 0x1) == 0x1;
    let palette = core.mem_read(0x4ff1 + i) & 0x3f;
    let memx = core.data[0x5060 + i];
    let memy = core.data[0x5061 + i];
    drawSprite(
      sprite,
      palette,
      memx,
      memy,
      xflip,
      yflip,
    );
  }
}

function drawFromRAM(core: EmulatorCore): void {
  // tiles
  drawTilesFromRAM(core);

  // sprites
  drawSpritesFromRAM(core);
}

// KEYBOARD HANDLER
// TODO let keypresses through that aren't used
let keydown = {};

document.addEventListener('keydown', (e) => {
  e.preventDefault();
  keydown[e.keyCode] = true;
});
document.addEventListener('keyup', (e) => {
  e.preventDefault();
  keydown[e.keyCode] = false;
});
document.addEventListener('keypress', (e) => {
  e.preventDefault();
});

// INPUT

function left(): boolean {
  if (keydown[37]) return true; // left
  if (keydown[65]) return true; // A
  return false;
}

function right(): boolean {
  if (keydown[39]) return true; // right
  if (keydown[68]) return true; // D
  return false;
}

function up(): boolean {
  if (keydown[38]) return true; // up
  if (keydown[87]) return true; // W
  return false;
}

function down(): boolean {
  if (keydown[40]) return true; // down
  if (keydown[83]) return true; // S
  return false;
}

function startButtonDown(): boolean {
  if (keydown[13]) return true; // enter
}

function coinButtonDown(): boolean {
  if (keydown[9]) return true; // tab
}

// SETUP CPU

class EmulatorCore {
  data: Uint8Array;
  interruptVector: number;
  constructor() {
    this.data = new Uint8Array(0xFFFF);
  }
  mem_read(address: number): number {
    // TODO special cases
    if (0x5000 <= address && address <= 0x503f) {
      // IN 0
      let val = 0xFF;
      if (up()) val &= 0xFE;
      if (left()) val &= 0xFD;
      if (right()) val &= 0xFB;
      if (down()) val &= 0xF7;
      if (coinButtonDown()) val &= 0xDF;
      return val;
    }
    if (0x5040 <= address && address <= 0x507f) {
      // IN 1
      let val = 0xFF;
      if (startButtonDown()) {
        console.log('start button pressed');
        val &= 0xDF;
      }
      return val;
    }
    if (0x5080 <= address && address <= 0x50bf) {
      // DIP switches
      return 0xC9;
    }
    return this.data[address];
  }
  mem_write(address: number, data: number): void {
    if (address < 0x4000) {
      console.log('attempted to write to ROM address 0x' + address.toString(16) + ' with data 0x' + data.toString(16));
    } else {
      this.data[address] = data & 0xFF;
    }
  }
  get interruptEnabled(): boolean {
    return (this.data[0x5000] & 0x1) == 0x1;
  }
  io_read(port: number): number {
    return 0;
  }
  io_write(port: number, value: number): void {
    if ((port & 0xFF) == 0) this.interruptVector = value & 0xFF;
    //if (port == 0) this.interruptVector = value & 0xFF;
    //console.log('io write 0x' + port.toString(16) + ' 0x' + value.toString(16));
  }
  copyRom(startAddress: number, codeRom: Uint8Array): void {
    let address = startAddress;
    for (let i = 0; i < codeRom.length;) {
      this.data[address++] = codeRom[i++] & 0xFF;
    }
    console.log('copied 0x' + startAddress.toString(16) + ' through 0x' + (address - 1).toString(16) + ' to mem');
  }
}

core = new EmulatorCore();
let z80 = new Z80(core);

for (let addr = 0x5000; addr <= 0x503f; addr++) {
  core.data[addr] = 0xFF;
}
for (let addr = 0x5040; addr <= 0x507f; addr++) {
  core.data[addr] = 0xFF;
}

let running = false;

function start(): void {
  running = true;
  console.log('starting z80');
  nextStep();
}

function nextStep(): void {
  if (running) {
    let t = 0;
    while (t < 51200) {
      t += z80.run_instruction();
    }
    drawFromRAM(core);
    // TODO sound, input, etc.
    if (core.interruptEnabled) {
      z80.interrupt(false, core.interruptVector);
    }
    window.setTimeout(nextStep, 12);
  }
}

function stop(): void {
  running = false;
  console.log('stopped z80');
}

function reset(): void {
  z80.reset();
}

// LOAD ROMS

function loadRoms(): void {
  zip.createReader(new zip.BlobReader(zipUploadField.files[0]), function(reader) {
    reader.getEntries(function(entries) {
      entries.forEach((entry) => {
        // TODO DEBUG
        console.log(entry.filename, '0x' + entry.crc32.toString(16), entry.uncompressedSize);

        if (entry.filename.endsWith('82s126.4a') && entry.uncompressedSize == 256) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              loadPalettes(new Uint8Array(buffer));
              drawPalettesTest();
            });
          });
        }
      });
      // TODO this ordering doesn't actually work, its still a race
      entries.forEach((entry) => {

        if (entry.filename.endsWith('5e') && entry.uncompressedSize == 4096) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              loadTiles(new Uint8Array(buffer));
              drawTilesTest();
            });
          });
        }

        if (entry.filename.endsWith('5f') && entry.uncompressedSize == 4096) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              loadSprites(new Uint8Array(buffer));
              drawSpritesTest();
            });
          });
        }

        if (entry.filename.endsWith('6e') && entry.uncompressedSize == 4096) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              core.copyRom(0x0000, new Uint8Array(buffer));
            });
          });
        }

        if (entry.filename.endsWith('6f') && entry.uncompressedSize == 4096) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              core.copyRom(0x1000, new Uint8Array(buffer));
            });
          });
        }

        if (entry.filename.endsWith('6h') && entry.uncompressedSize == 4096) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              core.copyRom(0x2000, new Uint8Array(buffer));
            });
          });
        }

        if (entry.filename.endsWith('.6j') && entry.uncompressedSize == 4096) {
          entry.getData(new zip.BlobWriter(), function(blob) {
            blob.arrayBuffer().then( (buffer) => {
              core.copyRom(0x3000, new Uint8Array(buffer));
            });
          });
        }

      });
    });
  });
}

// HANDLE HTML INPUT

zipUploadField.addEventListener('change', (e) => {
  loadRoms();
});

loadButton.addEventListener('click', (e) => {
  loadRoms();
});

startButton.addEventListener('click', (e) => {
  start();
});

stopButton.addEventListener('click', (e) => {
  stop();
});

resetButton.addEventListener('click', (e) => {
  reset();
});
