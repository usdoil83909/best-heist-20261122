
import { STEP, VIEW, SCREEN, LOOT_CONF } from './config.js';
import { LEVELS } from './levels.js';
import { createWorld } from './world.js';
import { createGuards, hearNoise, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { createPlayer, updatePlayer } from './player.js';
import { createAlarm } from './alarm.js';
import { createTools, dropSmoke, fireDart, updateTools } from './tools.js';
import { createAudio } from './audio.js';
import { createInput, A_CONFIRM, A_RESTART, A_MUSIC, A_SMOKE, A_DART, A_PAUSE } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shotParam = params.get('shot');
const shotName = shotParam === 'start' ? 'title' : shotParam === 'end' ? 'getaway' : shotParam;
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 7;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();

function announce(message) {
  if (status) status.textContent = message;
}

function createGame() {
  const game = {
    seed,
    levelIndex: 0,
    level: null,
    world: null,
    player: null,
    guards: [],
    cameras: [],
    loot: [],
    lootTotal: 0,
    collected: 0,
    tools: createTools(),
    smokes: [],
    alarm: createAlarm(),
    audio,
    camera: { x: 0, y: 0 },
    clock: 0,
    elapsed: 0,
    seen: false,
    session: { alarms: 0, lootValue: 0, items: 0, time: 0 },
    checkpoint: null,
  };
  game.smokes = game.tools.smokes;
  game.emitNoise = (x, y, radius) => hearNoise(game.guards, x, y, radius);
  return game;
}

const game = createGame();
window.__nightlift = game;

function followPlayer(dt) {
  const tx = Math.max(0, Math.min(game.world.width - VIEW.width, game.player.x - VIEW.width / 2));
  const ty = Math.max(0, Math.min(game.world.height - VIEW.height, game.player.y - VIEW.height / 2));
  const blend = dt >= 1 ? 1 : Math.min(1, dt * 6);
  game.camera.x += (tx - game.camera.x) * blend;
  game.camera.y += (ty - game.camera.y) * blend;
}

function loadLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  game.world = createWorld(game.level);
  game.player = createPlayer(game.level);
  game.guards = createGuards(game.level);
  game.cameras = createCameras(game.level);
  game.loot = game.level.loot.map((item) => ({ ...item, taken: false }));
  game.lootTotal = game.loot.length;
  game.collected = 0;
  game.elapsed = 0;
  game.seen = false;
  game.tools = createTools();
  game.smokes = game.tools.smokes;
  game.alarm.reset();
  game.checkpoint = { ...game.session };
  followPlayer(1);
}

function stepGame(input, dt) {
  game.clock += dt;
  game.elapsed += dt;
  game.seen = false;

  updatePlayer(game, input, dt);
  if (updateGuardsStep(dt)) game.seen = true;
  if (updateCamerasStep(dt)) game.seen = true;
  updateTools(game, dt);
  if (game.seen) audio.suspicion();
  game.alarm.update(game.seen, dt);
  if (game.alarm.justFull) {
    game.alarm.justFull = false;
    game.session.alarms += 1;
    audio.alarm();
    announce('Alarm! Guards are converging on your position.');
  }
  if (game.alarm.justCleared) {
    game.alarm.justCleared = false;
    audio.clear();
    announce('You lost them. Back to the shadows.');
  }
  audio.tick(dt);
  audio.update(dt);
  followPlayer(dt);

  for (let i = 0; i < game.loot.length; i += 1) {
    const item = game.loot[i];
    if (item.taken) continue;
    if (Math.hypot(game.player.x - item.x, game.player.y - item.y) <= LOOT_CONF.pickupRadius) {
      item.taken = true;
      game.collected += 1;
      game.session.lootValue += item.value;
      game.session.items += 1;
      audio.loot();
      announce(game.collected === game.lootTotal ? 'All loot secured. Get to the van!' : `Loot secured. ${game.lootTotal - game.collected} left.`);
      if (game.collected === game.lootTotal) audio.clear();
    }
  }

  if (game.alarm.over) return 'caught';
  const van = game.level.van;
  if (game.collected === game.lootTotal && Math.hypot(game.player.x - (van.x + van.w / 2), game.player.y - (van.y + van.h / 2)) < 46) return 'complete';
  return null;
}

function updateGuardsStep(dt) {
  return updateGuards(game, dt) !== null;
}
function updateCamerasStep(dt) {
  const spotter = updateCameras(game, dt);
  return spotter !== null;
}

function runShot(name) {
  loadLevel(name === 'play' ? 2 : name === 'getaway' ? 4 : 0);
  const screen = stageShot(name, game);
  let painted = 0;
  function paint() {
    renderer.draw(game, screen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  input.setAimConverter((pointer) => renderer.toWorld(pointer.x, pointer.y));
  let screen = SCREEN.TITLE;
  let accumulator = 0;
  let last = performance.now();

  function newRun() {
    game.session = { alarms: 0, lootValue: 0, items: 0, time: 0 };
    loadLevel(0);
    screen = SCREEN.PLAY;
    announce('Nightlift. Steal every item, then reach the van.');
  }

  function retryLevel() {
    game.session = { ...game.checkpoint };
    loadLevel(game.levelIndex);
    screen = SCREEN.PLAY;
    announce(`Retrying level ${game.levelIndex + 1}.`);
  }

  function nextLevel() {
    game.session.time += game.elapsed;
    if (game.levelIndex === LEVELS.length - 1) {
      screen = SCREEN.GETAWAY;
      audio.getaway();
      announce('Clean getaway. All five rooms cleared.');
    } else {
      loadLevel(game.levelIndex + 1);
      screen = SCREEN.PLAY;
      announce(`Level ${game.levelIndex + 1}: ${game.level.name}.`);
    }
  }

  loadLevel(0);
  announce('Nightlift. Press Enter or click to start.');

  function handleActions() {
    const actions = input.takeActions();
    if (actions === 0) return;
    audio.unlock();
    if (actions & A_MUSIC) announce(audio.toggleMusic() ? 'Music on.' : 'Music off.');

    if (screen === SCREEN.TITLE) {
      if (actions & (A_CONFIRM | A_DART | A_RESTART)) newRun();
      return;
    }
    if (screen === SCREEN.COMPLETE) {
      if (actions & (A_CONFIRM | A_DART)) nextLevel();
      else if (actions & A_RESTART) newRun();
      return;
    }
    if (screen === SCREEN.CAUGHT) {
      if (actions & (A_CONFIRM | A_DART | A_RESTART)) retryLevel();
      return;
    }
    if (screen === SCREEN.GETAWAY) {
      if (actions & (A_CONFIRM | A_DART | A_RESTART)) newRun();
      return;
    }
    if (screen === SCREEN.PAUSED) {
      if (actions & (A_PAUSE | A_CONFIRM | A_DART)) screen = SCREEN.PLAY;
      return;
    }
    if (actions & A_PAUSE) {
      screen = SCREEN.PAUSED;
      announce('Paused.');
      return;
    }
    if (actions & A_RESTART) {
      retryLevel();
      return;
    }
    if (actions & A_SMOKE) dropSmoke(game);
    if (actions & A_DART) fireDart(game, input.aim());
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN.PLAY) {
      while (accumulator >= STEP) {
        const event = stepGame(input, STEP);
        accumulator -= STEP;
        if (event === 'caught') {
          screen = SCREEN.CAUGHT;
          audio.fail();
          announce('Caught. Two full alarms. Press R to retry.');
          break;
        }
        if (event === 'complete') {
          screen = SCREEN.COMPLETE;
          announce(`Level ${game.levelIndex + 1} clear. Press Enter to continue.`);
          break;
        }
      }
    } else {
      accumulator = 0;
      game.clock += 1 / 60;
    }
    renderer.draw(game, screen);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN.PLAY) {
      screen = SCREEN.PAUSED;
      announce('Paused.');
    }
  });

  requestAnimationFrame(frame);
}

if (shotName) runShot(shotName);
else runGame();
