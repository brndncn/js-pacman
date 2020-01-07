// TODO let keypresses through that aren't used
const AXIS_THRESHOLD = 0.6;
let keydown = {};

document.addEventListener('keydown', (e) => {
  if (e.keyCode === 8) e.preventDefault();
  keydown[e.keyCode] = true;
});
document.addEventListener('keyup', (e) => {
  if (e.keyCode === 8) e.preventDefault();
  keydown[e.keyCode] = false;
});
document.addEventListener('keypress', (e) => {
  if (e.keyCode === 8) e.preventDefault();
});

// INPUT

window.addEventListener('gamepadconnected', (e) => {
  console.log(navigator.getGamepads());
});

export function left(): boolean {
  if (keydown[37]) return true; // left
  if (keydown[65]) return true; // A
  for (let gp of navigator.getGamepads()) {
    if (gp.axes.length >= 2 && gp.axes[0] < (-AXIS_THRESHOLD)) return true;
  }
  return false;
}

export function right(): boolean {
  if (keydown[39]) return true; // right
  if (keydown[68]) return true; // D
  for (let gp of navigator.getGamepads()) {
    if (gp.axes.length >= 2 && gp.axes[0] > (AXIS_THRESHOLD)) return true;
  }
  return false;
}

export function up(): boolean {
  if (keydown[38]) return true; // up
  if (keydown[87]) return true; // W
  for (let gp of navigator.getGamepads()) {
    if (gp.axes.length >= 2 && gp.axes[1] < (-AXIS_THRESHOLD)) return true;
  }
  return false;
}

export function down(): boolean {
  if (keydown[40]) return true; // down
  if (keydown[83]) return true; // S
  for (let gp of navigator.getGamepads()) {
    if (gp.axes.length >= 2 && gp.axes[1] > (AXIS_THRESHOLD)) return true;
  }
  return false;
}

export function start(): boolean {
  if (keydown[13]) return true; // enter
  for (let gp of navigator.getGamepads()) {
    if (gp.buttons.length >= 10 && gp.buttons[9].pressed) return true;
  }
  return false;
}

export function coin(): boolean {
  if (keydown[9]) return true; // tab
  for (let gp of navigator.getGamepads()) {
    if (gp.buttons.length >= 10 && gp.buttons[8].pressed) return true;
  }
  return false;
}

