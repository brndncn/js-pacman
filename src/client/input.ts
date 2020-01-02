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

export function left(): boolean {
  if (keydown[37]) return true; // left
  if (keydown[65]) return true; // A
  return false;
}

export function right(): boolean {
  if (keydown[39]) return true; // right
  if (keydown[68]) return true; // D
  return false;
}

export function up(): boolean {
  if (keydown[38]) return true; // up
  if (keydown[87]) return true; // W
  return false;
}

export function down(): boolean {
  if (keydown[40]) return true; // down
  if (keydown[83]) return true; // S
  return false;
}

export function start(): boolean {
  if (keydown[13]) return true; // enter
}

export function coin(): boolean {
  if (keydown[9]) return true; // tab
}

