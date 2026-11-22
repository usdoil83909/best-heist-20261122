
import { SCREEN } from './config.js';

export function stageShot(name, game) {
  game.clock = 3.5;

  if (name === 'play') {
    game.camera.x = 160;
    game.camera.y = 20;
    game.player.x = 500;
    game.player.y = 470;
    game.player.sneaking = true;
    game.player.hidden = true;
    game.player.moving = false;
    game.player.aimAngle = -0.22;
    game.player.inventory.smoke = 3;
    game.player.inventory.dart = 2;

    const first = game.guards[0];
    first.x = 700;
    first.y = 470;
    first.angle = 2.68;
    first.travel = 2.68;
    first.pause = 0.6;
    first.sees = true;
    first.ko = 0;

    const second = game.guards[1];
    second.x = 1340;
    second.y = 600;
    second.angle = 3.05;
    second.travel = 3.05;
    second.pause = 0.3;
    second.sees = false;
    second.ko = 0;

    const third = game.guards[2];
    third.x = 420;
    third.y = 200;
    third.angle = 0.6;
    third.travel = 0.6;
    third.sees = false;
    third.ko = 0;

    const fourth = game.guards[3];
    fourth.x = 930;
    fourth.y = 700;
    fourth.ko = 7;
    fourth.sees = false;

    game.cameras[0].angle = 1.92;
    game.cameras[0].sees = false;
    game.cameras[1].angle = 0.9;
    game.cameras[1].sees = false;

    game.loot[1].taken = true;
    game.loot[2].taken = true;
    game.collected = 1;
    game.elapsed = 41.7;
    game.alarm.value = 0.62;
    game.alarm.fulls = 1;
    game.alarm.armed = true;
    game.alarm.alerted = false;
    game.alarm.flash = 0.22;
    game.session.alarms = 1;
    game.session.lootValue = game.loot[1].value + game.loot[2].value;
    game.session.items = 2;
    return SCREEN.PLAY;
  }

  game.camera.x = 0;
  game.camera.y = 0;
  game.clock = 2.2;
  game.guards[0].x = 780;
  game.guards[0].y = 230;
  game.guards[0].angle = 2.75;
  game.guards[0].travel = 2.75;
  game.guards[0].sees = false;
  game.cameras[0].angle = 1.5;
  game.cameras[0].sees = false;
  game.alarm.value = 0;

  if (name === 'getaway') {
    game.camera.x = Math.max(0, game.world.width - 1280);
    game.camera.y = Math.max(0, game.world.height - 720);
    game.session.alarms = 0;
    game.session.lootValue = 5100;
    game.session.items = 13;
    game.session.time = 287.4;
    return SCREEN.GETAWAY;
  }

  game.session.alarms = 0;
  game.session.lootValue = 0;
  game.session.items = 0;
  game.session.time = 0;
  return SCREEN.TITLE;
}
