
import { FONT, PALETTE, VIEW, ALARM_CONF } from './config.js';

function panel(ctx, x, y, w, h, alpha = 0.86) {
  ctx.fillStyle = `rgba(9,12,19,${alpha})`;
  ctx.beginPath();
  ctx.moveTo(x + 8, y);
  ctx.arcTo(x + w, y, x + w, y + h, 8);
  ctx.arcTo(x + w, y + h, x, y + h, 8);
  ctx.arcTo(x, y + h, x, y, 8);
  ctx.arcTo(x, y, x + w, y, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(148,166,196,0.16)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function label(ctx, text, x, y, size, color, weight = '600') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function smokeIcon(ctx, x, y) {
  ctx.fillStyle = '#8ea3b8';
  for (const [dx, dy, r] of [[-8, 2, 7], [0, -4, 9], [9, 2, 7], [1, 5, 8]]) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(x - 13, y + 9, 26, 3);
}

function dartIcon(ctx, x, y) {
  ctx.strokeStyle = PALETTE.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 9);
  ctx.lineTo(x + 9, y - 9);
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x + 4, y - 10);
  ctx.lineTo(x + 10, y - 4);
  ctx.closePath();
  ctx.fill();
}

export function drawHUD(ctx, game) {
  const leftPanel = panel(ctx, 12, 12, 292, 66);
  void leftPanel;
  label(ctx, `LEVEL ${game.levelIndex + 1} / 5`, 26, 34, 11, PALETTE.muted);
  label(ctx, game.level.name, 26, 58, 19, PALETTE.text, '700');
  label(ctx, `LOOT ${game.collected}/${game.lootTotal}`, 26, 74, 11, PALETTE.amber);
  label(ctx, formatTime(game.elapsed), 216, 34, 13, PALETTE.muted, '500');
  label(ctx, `ALARMS ${game.session.alarms}`, 216, 74, 11, game.session.alarms > 0 ? PALETTE.danger : PALETTE.muted);

  const ax = VIEW.width - 312;
  panel(ctx, ax, 12, 300, 72, 0.92);
  label(ctx, 'ALARM', ax + 14, 34, 13, game.alarm.alerted ? PALETTE.danger : PALETTE.text, '800');
  label(ctx, game.alarm.alerted ? 'GUARDS HUNTING' : 'STAY IN THE SHADOWS', ax + 92, 34, 10, game.alarm.alerted ? PALETTE.danger : PALETTE.muted);
  const barX = ax + 14;
  const barY = 44;
  const barW = 212;
  const barH = 13;
  ctx.fillStyle = '#05070c';
  ctx.fillRect(barX, barY, barW, barH);
  const segments = 16;
  const filled = Math.round(game.alarm.value * segments);
  for (let i = 0; i < segments; i += 1) {
    const t = i / (segments - 1);
    ctx.fillStyle = i < filled ? (t > 0.64 ? PALETTE.danger : t > 0.3 ? '#e8a13c' : PALETTE.amber) : 'rgba(255,255,255,0.055)';
    ctx.fillRect(barX + 2 + i * ((barW - 4) / segments), barY + 2, (barW - 4) / segments - 2, barH - 4);
  }
  for (let i = 0; i < ALARM_CONF.maxFull; i += 1) {
    ctx.beginPath();
    ctx.arc(ax + 244 + i * 19, barY + 6, 6, 0, Math.PI * 2);
    ctx.fillStyle = i < game.alarm.fulls ? PALETTE.danger : 'rgba(255,255,255,0.12)';
    ctx.fill();
  }

  const by = VIEW.height - 80;
  panel(ctx, 12, by, 356, 68);
  smokeIcon(ctx, 43, by + 28);
  label(ctx, `x${game.player.inventory.smoke}`, 68, by + 33, 16, PALETTE.text, '700');
  label(ctx, 'SMOKE  [S / RMB]', 68, by + 51, 9, PALETTE.muted);
  dartIcon(ctx, 180, by + 28);
  label(ctx, `x${game.player.inventory.dart}`, 205, by + 33, 16, PALETTE.text, '700');
  label(ctx, 'DART  [D / LMB]', 205, by + 51, 9, PALETTE.muted);

  if (game.player.hidden) {
    panel(ctx, VIEW.width / 2 - 104, VIEW.height - 52, 208, 38, 0.9);
    label(ctx, '● HIDDEN IN SHADOW', VIEW.width / 2 - 87, VIEW.height - 27, 12, PALETTE.teal, '700');
  } else if (game.player.sneaking) {
    panel(ctx, VIEW.width / 2 - 80, VIEW.height - 52, 160, 38, 0.9);
    label(ctx, 'SNEAKING', VIEW.width / 2 - 57, VIEW.height - 27, 12, PALETTE.muted, '700');
  }

  panel(ctx, VIEW.width - 252, VIEW.height - 52, 240, 38, 0.82);
  label(ctx, `WASD MOVE  SHIFT SNEAK  M ${game.audio.musicOn ? 'ON' : 'OFF'}`, VIEW.width - 238, VIEW.height - 27, 10, PALETTE.muted, '500');
}
