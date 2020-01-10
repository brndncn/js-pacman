const Emulator = require('./emulator');
const Graphics = require('./graphics');
const Sound = require('./sound');
const RomLoader = require('./romloader');
const TARGET_FRAME_TIME = 16.5; // 60.61 FPS

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
Graphics.setCanvas(canvas);

const zipUploadField = document.getElementById('zip_upload') as HTMLInputElement;
const emulatorControls = document.getElementById('emulator_controls');
const loadButton = document.getElementById('load_button');
const startButton = document.getElementById('start_button');
const stopButton = document.getElementById('stop_button');
const resetButton = document.getElementById('reset_button');
const pullScoreButton = document.getElementById('score_button');
const soundCheckbox = document.getElementById('sound_checkbox') as HTMLInputElement;

zipUploadField.addEventListener('change', (e) => {
  RomLoader.loadRoms(zipUploadField.files[0]);
  emulatorControls.style.display = 'inline';
});

loadButton.addEventListener('click', (e) => {
  RomLoader.loadRoms(zipUploadField.files[0]);
  emulatorControls.style.display = 'inline';
});

startButton.addEventListener('click', (e) => {
  Emulator.start();
});

stopButton.addEventListener('click', (e) => {
  Emulator.stop();
});

resetButton.addEventListener('click', (e) => {
  Emulator.reset();
});

window.addEventListener('blur', (e) => {
  Emulator.stop();
});

soundCheckbox.addEventListener('change', (e) => {
  Sound.setMuted(!soundCheckbox.checked);
});
