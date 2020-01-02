const browser = require('bowser').getParser(window.navigator.userAgent);

let canvas;
let ctx;

interface EmulatorCore {
  vid_read(address: number): number;
}

export function setCanvas(canvasArg: HTMLCanvasElement) {
  canvas = canvasArg;
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
  ctx = canvas.getContext('2d');
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

export function loadPalettes(paletteRom: Uint8Array): void {
  palettes = [];
  for (let i = 0; i + 3 < paletteRom.length; i += 4) {
    let palette = [0, 0, 0, 0];
    for (let j = 0; j < 4; j++) {
      palette[j] = paletteRom[i + j];
    }
    palettes.push(palette);
  }
  console.log('palettes length: ' + palettes.length + ' (we expect 64?)');
  drawPalettesTest();
}

// TILES

let tilesets: HTMLCanvasElement[] = [];

export function loadTiles(tileRom: Uint8Array): void {
  let tiles = [];
  for (let i = 0; i + 15 < tileRom.length; i += 16) {
    tiles.push(tileRom.slice(i, i + 16));
  }
  console.log('tiles length: ' + tiles.length + ' (we expect 256?)');
  // prepare tiles
  console.log('preparing tiles...');
  for (let paletteIndex = 0; paletteIndex < palettes.length; paletteIndex++) {
    // make a new offscreen canvas for the tileset+palette combo
    let tilesetCanvas = document.createElement('canvas');
    tilesetCanvas.width = 128;
    tilesetCanvas.height = 128;
    let ctx = tilesetCanvas.getContext('2d');
    // render each tile
    for (let i = 0; i < tiles.length; i++) {
      let imageData = ctx.createImageData(8, 8);
      let tile = tiles[i];
      let palette = palettes[paletteIndex];
      for (let i = 0; i < 64; i++) {
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
      ctx.putImageData(imageData, (i % 16) * 8, Math.floor(i / 16) * 8);
    }
    tilesets.push(tilesetCanvas);
  }
  console.log('tiles prepared');
  drawTilesTest();
}

/*
 Parameters x and y are canvas positions (unlike drawSprite)
 */
function drawTile(tileIndex: number, paletteByte: number, x: number, y: number): void {
  let palette = paletteByte & 0x3f;
  ctx.drawImage(tilesets[palette], (tileIndex % 16) * 8, Math.floor(tileIndex / 16) * 8, 8, 8, x, y, 8, 8);
}

// SPRITES

let sprites: Uint8Array[] = [];

export function loadSprites(spriteRom: Uint8Array): void {
  sprites = [];
  for (let i = 0; i + 63 < spriteRom.length; i += 64) {
    sprites.push(spriteRom.slice(i, i + 64));
  }
  console.log('sprites length: ' + sprites.length + ' (we expect 64?)');
  drawSpritesTest();
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
  ctx.drawImage(tilesets[1], 0, 0);
  ctx.drawImage(tilesets[3], 0, 128);
  ctx.drawImage(tilesets[18], 128, 0);
  ctx.drawImage(tilesets[19], 128, 128);
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
      core.vid_read(0x4000 + i),
      core.vid_read(0x4400 + i),
      (29 - (i % 0x20)) * 8,
      (i >= 0x20 ? 35 : 34) * 8,
    );
  }

  // middle section
  for (let i = 0x40; i <= 0x3bf; i++) {
    drawTile(
      core.vid_read(0x4000 + i),
      core.vid_read(0x4400 + i),
      (29 - Math.floor(i / 0x20)) * 8,
      (2 + (i % 0x20)) * 8,
    );
  }

  // top two rows
  for (let i = 0x3c0; i <= 0x03ff; i++) {
    drawTile(
      core.vid_read(0x4000 + i),
      core.vid_read(0x4400 + i),
      (29 - (i % 0x20)) * 8,
      (i >= 0x3e0 ? 1 : 0) * 8,
    );
  }
}

function drawSpritesFromRAM(core: EmulatorCore): void {
  for (let i = 0xE; i >= 0x0; i -= 0x2) {
    let sprite = (core.vid_read(0x4ff0 + i) >> 2) & 0x3f;
    let xflip = ((core.vid_read(0x4ff0 + i) >> 1) & 0x1) == 0x1;
    let yflip = ((core.vid_read(0x4ff0 + i) >> 0) & 0x1) == 0x1;
    let palette = core.vid_read(0x4ff1 + i) & 0x3f;
    let memx = core.vid_read( 0x5060 + i );
    let memy = core.vid_read( 0x5061 + i );
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

export function drawFromRAM(core: EmulatorCore): void {
  // tiles
  drawTilesFromRAM(core);

  // sprites
  drawSpritesFromRAM(core);
}

