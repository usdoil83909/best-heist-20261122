
export const A_CONFIRM = 1;
export const A_RESTART = 2;
export const A_MUSIC = 4;
export const A_SMOKE = 8;
export const A_DART = 16;
export const A_PAUSE = 32;

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
const TAP_LIMIT = 170;

export function createInput(target) {
  const keys = new Set();
  const taps = new Map();
  const pointer = { x: 640, y: 360 };
  let actions = 0;
  let aimConverter = (p) => ({ x: p.x, y: p.y });

  window.addEventListener('keydown', (event) => {
    if (keys.has(event.code)) return;
    keys.add(event.code);
    taps.set(event.code, performance.now());
    switch (event.code) {
      case 'Space':
      case 'Enter':
        actions |= A_CONFIRM;
        break;
      case 'KeyR':
        actions |= A_RESTART;
        break;
      case 'KeyM':
        actions |= A_MUSIC;
        break;
      case 'KeyP':
      case 'Escape':
        actions |= A_PAUSE;
        break;
      default:
        break;
    }
    if (MOVE_KEYS.includes(event.code) || event.code === 'ShiftLeft' || event.code === 'ShiftRight') event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
    const started = taps.get(event.code);
    taps.delete(event.code);
    if (started === undefined) return;
    if (performance.now() - started > TAP_LIMIT) return;
    if (event.code === 'KeyS') actions |= A_SMOKE;
    if (event.code === 'KeyD') actions |= A_DART;
  });

  window.addEventListener('blur', () => {
    keys.clear();
    taps.clear();
  });

  target.addEventListener('pointermove', (event) => {
    const rect = target.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });

  target.addEventListener('pointerdown', (event) => {
    const rect = target.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    if (event.button === 2) actions |= A_SMOKE;
    else if (event.button === 0) {
      actions |= A_DART;
      actions |= A_CONFIRM;
    }
  });

  target.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    move() {
      const x = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      const y = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
      return { x, y };
    },
    sneak() {
      return keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('ControlLeft');
    },
    pointer() {
      return pointer;
    },
    setAimConverter(fn) {
      aimConverter = fn;
    },
    aim() {
      return aimConverter(pointer);
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
