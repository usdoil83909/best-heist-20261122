
import { TOOL_CONF } from './config.js';
import { knockOut } from './guards.js';

export function createTools() {
  return { smokes: [], darts: [], puffs: [] };
}

export function dropSmoke(game) {
  if (game.player.inventory.smoke <= 0) return false;
  game.player.inventory.smoke -= 1;
  game.tools.smokes.push({
    x: game.player.x,
    y: game.player.y,
    radius: TOOL_CONF.smokeRadius,
    life: TOOL_CONF.smokeTime,
    max: TOOL_CONF.smokeTime,
  });
  game.audio.smoke();
  return true;
}

export function fireDart(game, aim) {
  if (game.player.inventory.dart <= 0) return false;
  const player = game.player;
  let dx = aim.x - player.x;
  let dy = aim.y - player.y;
  if (Math.hypot(dx, dy) < 8) {
    dx = Math.cos(player.aimAngle);
    dy = Math.sin(player.aimAngle);
  }
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  game.player.inventory.dart -= 1;
  game.tools.darts.push({
    x: player.x + (dx / length) * 10,
    y: player.y + (dy / length) * 10,
    angle,
    vx: Math.cos(angle) * TOOL_CONF.dartSpeed,
    vy: Math.sin(angle) * TOOL_CONF.dartSpeed,
    travelled: 0,
  });
  game.audio.dart();
  return true;
}

export function updateTools(game, dt) {
  const tools = game.tools;
  const world = game.world;
  for (let i = tools.smokes.length - 1; i >= 0; i -= 1) {
    tools.smokes[i].life -= dt;
    if (tools.smokes[i].life <= 0) tools.smokes.splice(i, 1);
  }
  for (let i = tools.puffs.length - 1; i >= 0; i -= 1) {
    tools.puffs[i].life -= dt;
    if (tools.puffs[i].life <= 0) tools.puffs.splice(i, 1);
  }
  for (let i = tools.darts.length - 1; i >= 0; i -= 1) {
    const dart = tools.darts[i];
    const stepX = dart.vx * dt;
    const stepY = dart.vy * dt;
    dart.x += stepX;
    dart.y += stepY;
    dart.travelled += Math.hypot(stepX, stepY);
    let hit = null;
    let hitDistance = Infinity;
    for (let j = 0; j < game.guards.length; j += 1) {
      const guard = game.guards[j];
      if (guard.ko > 0) continue;
      const d = Math.hypot(guard.x - dart.x, guard.y - dart.y);
      if (d < TOOL_CONF.dartHit && d < hitDistance) {
        hit = guard;
        hitDistance = d;
      }
    }
    if (hit) {
      knockOut(hit);
      tools.puffs.push({ x: hit.x, y: hit.y, life: 0.5, max: 0.5, color: '#f2c14e' });
      game.audio.ko();
    }
    if (hit || dart.travelled > TOOL_CONF.dartRange || world.solidPoint(dart.x, dart.y)) {
      if (!hit) tools.puffs.push({ x: dart.x, y: dart.y, life: 0.24, max: 0.24, color: '#8b93a3' });
      tools.darts.splice(i, 1);
    }
  }
}
