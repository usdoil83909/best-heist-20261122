
import { ALARM_CONF } from './config.js';

export function createAlarm() {
  const alarm = {
    value: 0,
    fulls: 0,
    alerted: false,
    lastSeen: null,
    unseen: 0,
    armed: true,
    flash: 0,
    over: false,
    justFull: false,
    justCleared: false,
  };

  alarm.add = function add(amount, position) {
    if (alarm.over) return;
    alarm.value = Math.min(1, alarm.value + Math.max(0, amount));
    if (position) alarm.lastSeen = { x: position.x, y: position.y };
    alarm.flash = Math.min(1, alarm.flash + amount * 3.5);
    if (alarm.value >= 1 && alarm.armed) {
      alarm.armed = false;
      alarm.alerted = true;
      alarm.unseen = 0;
      alarm.justFull = true;
      alarm.fulls += 1;
      if (alarm.fulls >= ALARM_CONF.maxFull) alarm.over = true;
    }
  };

  alarm.update = function update(seen, dt) {
    if (!seen) alarm.unseen += dt;
    else alarm.unseen = 0;
    const drain = alarm.alerted ? ALARM_CONF.alertDrain : ALARM_CONF.drain;
    if (!seen) alarm.value = Math.max(0, alarm.value - drain * dt);
    alarm.flash = Math.max(0, alarm.flash - dt * 2.1);
    if (alarm.value <= ALARM_CONF.resetLevel) {
      alarm.armed = true;
      if (alarm.alerted && alarm.unseen >= ALARM_CONF.escapeTime) {
        alarm.alerted = false;
        alarm.lastSeen = null;
        alarm.unseen = 0;
        alarm.justCleared = true;
      }
    }
  };

  alarm.reset = function reset() {
    alarm.value = 0;
    alarm.fulls = 0;
    alarm.alerted = false;
    alarm.lastSeen = null;
    alarm.unseen = 0;
    alarm.armed = true;
    alarm.flash = 0;
    alarm.over = false;
    alarm.justFull = false;
    alarm.justCleared = false;
  };

  return alarm;
}
