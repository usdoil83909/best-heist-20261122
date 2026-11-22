
import { CAMERA_CONF } from './config.js';

export function createCameras(def, world) {
  return def.cameras.map((spec, index) => ({
    id: index,
    x: spec.x,
    y: spec.y,
    angle: spec.base,
    base: spec.base,
    min: spec.min,
    max: spec.max,
    speed: spec.speed,
    phase: index * 1.9,
    clock: index * 1.4,
    sees: false,
    halfAngle: CAMERA_CONF.halfAngle,
    range: CAMERA_CONF.range,
  }));
}

export function updateCameras(game, dt) {
  const player = game.player;
  let seenBy = null;
  for (let i = 0; i < game.cameras.length; i += 1) {
    const camera = game.cameras[i];
    camera.clock += dt * camera.speed * CAMERA_CONF.lookRate;
    const wave = (Math.sin(camera.clock + camera.phase) + 1) / 2;
    camera.angle = camera.min + (camera.max - camera.min) * wave;
    camera.sees = !player.hidden && game.world.seesPoint(camera, player, camera.halfAngle, camera.range, game.smokes);
    if (camera.sees) {
      game.alarm.add(CAMERA_CONF.suspectRate * dt, player);
      if (seenBy === null) seenBy = camera;
    }
  }
  return seenBy;
}
