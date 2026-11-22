
import { GUARD_CONF } from './config.js';

function angleStep(current, target, maxStep) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > maxStep) diff = maxStep;
  if (diff < -maxStep) diff = -maxStep;
  return current + diff;
}

export function createGuards(def) {
  return def.guards.map((spec, index) => {
    const points = spec.waypoints;
    const fraction = (spec.phase || 0) * points.length;
    const fromIndex = Math.floor(fraction) % points.length;
    const blend = fraction - Math.floor(fraction);
    const from = points[fromIndex];
    const to = points[(fromIndex + 1) % points.length];
    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
    return {
      id: index,
      x: from[0] + (to[0] - from[0]) * blend,
      y: from[1] + (to[1] - from[1]) * blend,
      angle,
      travel: angle,
      next: (fromIndex + 1) % points.length,
      waypoints: points,
      speed: spec.speed || GUARD_CONF.speed,
      pause: 0,
      lookPhase: index * 1.7,
      ko: 0,
      sees: false,
      investigate: 0,
      target: null,
      stepPhase: index * 0.8,
    };
  });
}

export function knockOut(guard) {
  guard.ko = GUARD_CONF.koTime;
  guard.sees = false;
  guard.investigate = 0;
  guard.target = null;
  guard.pause = 0;
}

export function hearNoise(guards, x, y, radius) {
  for (let i = 0; i < guards.length; i += 1) {
    const guard = guards[i];
    if (guard.ko > 0) continue;
    const dx = x - guard.x;
    const dy = y - guard.y;
    if (dx * dx + dy * dy <= radius * radius) {
      guard.investigate = 2.6;
      guard.target = { x, y };
      guard.travel = Math.atan2(dy, dx);
    }
  }
}

function walkToward(guard, tx, ty, speed, dt, world) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 7) return true;
  const step = Math.min(dist, speed * dt);
  world.move(guard, (dx / dist) * step, (dy / dist) * step, GUARD_CONF.radius);
  guard.travel = Math.atan2(dy, dx);
  return Math.hypot(tx - guard.x, ty - guard.y) < 12;
}

export function updateGuards(game, dt) {
  const guards = game.guards;
  const world = game.world;
  const player = game.player;
  let seenBy = null;

  for (let i = 0; i < guards.length; i += 1) {
    const guard = guards[i];
    if (guard.ko > 0) {
      guard.ko = Math.max(0, guard.ko - dt);
      guard.sees = false;
      continue;
    }

    let targetAngle = guard.travel;
    if (guard.pause > 0) {
      guard.pause = Math.max(0, guard.pause - dt);
      guard.lookPhase += dt * GUARD_CONF.lookRate;
      targetAngle = guard.travel + Math.sin(guard.lookPhase) * 1.05;
    } else {
      const hunting = game.alarm.alerted && game.alarm.lastSeen !== null;
      if (hunting && guard.investigate <= 0) {
        guard.target = game.alarm.lastSeen;
        guard.investigate = 2.2;
      }
      if (guard.investigate > 0 && guard.target) {
        guard.investigate -= dt;
        const arrived = walkToward(guard, guard.target.x, guard.target.y, GUARD_CONF.alertSpeed, dt, world);
        targetAngle = guard.travel;
        if (arrived || guard.investigate <= 0) {
          guard.investigate = 0;
          guard.target = null;
          guard.pause = GUARD_CONF.lookTime;
        }
      } else {
        const waypoint = guard.waypoints[guard.next];
        if (walkToward(guard, waypoint[0], waypoint[1], guard.speed, dt, world)) {
          guard.next = (guard.next + 1) % guard.waypoints.length;
          guard.pause = GUARD_CONF.lookTime;
          guard.lookPhase = 0;
        }
        targetAngle = guard.travel;
      }
    }
    guard.angle = angleStep(guard.angle, targetAngle, GUARD_CONF.turnRate * dt);
    guard.stepPhase += dt * (guard.pause > 0 ? 2 : 8);

    guard.sees = !player.hidden && world.seesPoint(guard, player, GUARD_CONF.halfAngle, GUARD_CONF.range, game.smokes);
    if (guard.sees) {
      game.alarm.add(GUARD_CONF.suspectRate * dt, player);
      if (seenBy === null) seenBy = guard;
    }
  }
  return seenBy;
}
