
import { PLAYER_CONF, TOOL_CONF, TILE } from './config.js';

function nearCover(world, x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  for (let r = row - 1; r <= row + 1; r += 1) {
    for (let c = col - 1; c <= col + 1; c += 1) {
      const ch = world.charAt(c, r);
      if (ch === 'c' || ch === 'p' || ch === '#') return true;
    }
  }
  return false;
}

export function createPlayer(def) {
  return {
    x: def.start.x,
    y: def.start.y,
    radius: PLAYER_CONF.radius,
    aim: { x: def.start.x, y: def.start.y - 100 },
    aimAngle: -Math.PI / 2,
    sneaking: false,
    hidden: false,
    moving: false,
    stepPhase: 0,
    noiseClock: 0,
    inventory: { smoke: TOOL_CONF.smokes, dart: TOOL_CONF.darts },
  };
}

export function updatePlayer(game, input, dt) {
  const player = game.player;
  const world = game.world;
  const move = input.move();
  const length = Math.hypot(move.x, move.y);
  player.sneaking = input.sneak();
  player.moving = length > 0.01;

  if (player.moving) {
    const speed = player.sneaking ? PLAYER_CONF.sneakSpeed : PLAYER_CONF.speed;
    const nx = move.x / length;
    const ny = move.y / length;
    world.move(player, nx * speed * dt, ny * speed * dt, player.radius);
    player.stepPhase += dt * (player.sneaking ? 5 : 10);
    if (player.noiseClock > 0) player.noiseClock -= dt;
    if (!player.sneaking && player.noiseClock <= 0) {
      player.noiseClock = PLAYER_CONF.noiseStep;
      game.emitNoise(player.x, player.y, PLAYER_CONF.noiseRadius);
      game.audio.footstep();
    }
  } else {
    player.noiseClock = 0;
  }

  const aim = input.aim();
  player.aim.x = aim.x;
  player.aim.y = aim.y;
  player.aimAngle = Math.atan2(aim.y - player.y, aim.x - player.x);
  player.hidden = player.sneaking && (world.isShadow(player.x, player.y) || (world.lightAt(player.x, player.y) < 0.08 && nearCover(world, player.x, player.y)));
}
