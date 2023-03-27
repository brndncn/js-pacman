const Z80 = require('./Z80')["default"];
const Graphics = require('./graphics');
const Sound = require('./sound');
const Input = require('./input');
const TARGET_FRAME_TIME = 16.5; // 60.61 FPS

let logFPS = false;

export function setLogFPS(logFPSArg: boolean): void {
  logFPS = logFPSArg;
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
      if (Input.up()) val &= 0xFE;
      if (Input.left()) val &= 0xFD;
      if (Input.right()) val &= 0xFB;
      if (Input.down()) val &= 0xF7;
      if (Input.coin()) val &= 0xDF;
      return val;
    }
    if (0x5040 <= address && address <= 0x507f) {
      // IN 1
      let val = 0xFF;
      if (Input.start()) {
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
  vid_read(address: number): number {
    return this.data[address];
  }
  sound_read(address: number): number {
    return this.data[address];
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

let core = new EmulatorCore();
let z80 = new Z80(core);

for (let addr = 0x5000; addr <= 0x503f; addr++) {
  core.data[addr] = 0xFF;
}
for (let addr = 0x5040; addr <= 0x507f; addr++) {
  core.data[addr] = 0xFF;
}

let running = false;

let lastFrameTimestamp = Date.now();
function nextStep(): void {
  let now = Date.now();
  let delta = now - lastFrameTimestamp;
  lastFrameTimestamp = now;
  if (logFPS) console.log('FPS: ' + 1000 / delta);
  if (running) {
    let t = 0;
    while (t < 51200) {
      t += z80.run_instruction();
    }
    Graphics.drawFromRAM(core);
    Sound.updateSound(core);
    if (core.interruptEnabled) {
      z80.interrupt(false, core.interruptVector);
    }
    window.setTimeout(nextStep, Math.max(TARGET_FRAME_TIME - (Date.now() - now), 1));
  }
}

export function start(): void {
  if (!running) {
    running = true;
    console.log('starting z80');
    nextStep();
  }
}

export function stop(): void {
  if (running) {
    running = false;
    console.log('stopped z80');
  }
}

export function isRunning(): boolean {
  return running;
}

export function reset(): void {
  z80.reset();
}

export function copyRom(startAddress: number, codeRom: Uint8Array): void {
  core.copyRom(startAddress, codeRom);
}

export function getPlayer1Score(): number {
  let temp = 0;
  for (let addr = 0x4e83; addr >= 0x4e80; addr--) {
    let b = core.mem_read(addr);
    temp *= 100;
    temp += b & 0xF;
    temp += ((b >> 4) & 0xF) * 10;
  }
  return temp;
}

export function getPlayer2Score(): number {
  let temp = 0;
  for (let addr = 0x4e87; addr >= 0x4e84; addr--) {
    let b = core.mem_read(addr);
    temp *= 100;
    temp += b & 0xF;
    temp += ((b >> 4) & 0xF) * 10;
  }
  return temp;
}
