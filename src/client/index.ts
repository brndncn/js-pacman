const Emulator = require('./emulator');
const Graphics = require('./graphics');
const RomLoader = require('./romloader');
const logFPS = false;
const TARGET_FRAME_TIME = 16.5; // 60.61 FPS

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
Graphics.setCanvas(canvas);

const zipUploadField = document.getElementById('zip_upload') as HTMLInputElement;
const loadButton = document.getElementById('load_button');
const startButton = document.getElementById('start_button');
const stopButton = document.getElementById('stop_button');
const resetButton = document.getElementById('reset_button');
const pullScoreButton = document.getElementById('score_button');
const logFPSCheckbox = document.getElementById('log_fps_checkbox') as HTMLInputElement;

zipUploadField.addEventListener('change', (e) => {
  RomLoader.loadRoms(zipUploadField.files[0]);
});

loadButton.addEventListener('click', (e) => {
  RomLoader.loadRoms(zipUploadField.files[0]);
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

logFPSCheckbox.addEventListener('change', (e) => {
  Emulator.setLogFPS(logFPSCheckbox.checked);
});

window.addEventListener('blur', (e) => {
  Emulator.stop();
});

pullScoreButton.addEventListener('click', (e) => {
  console.log('Player 1: ' + Emulator.getPlayer1Score());
  console.log('Player 2: ' + Emulator.getPlayer2Score());
});

