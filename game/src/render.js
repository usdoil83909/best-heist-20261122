
import { TILE, VIEW, PALETTE, FONT, SCREEN } from './config.js';
import { drawHUD } from './hud.js';

function spaced(ctx, text, x, y, tracking, size, color, weight = '700', align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  const widths = [];
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    const w = ctx.measureText(text[i]).width;
    widths.push(w);
    total += w + (i < text.length - 1 ? tracking : 0);
  }
  if (align === 'center') x -= total / 2;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < text.length; i += 1) {
    ctx.fillText(text[i], x, y);
    x += widths[i] + tracking;
  }
}

function box(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.arcTo(x + w, y, x + w, y + h, 10);
  ctx.arcTo(x + w, y + h, x, y + h, 10);
  ctx.arcTo(x, y + h, x, y, 10);
  ctx.arcTo(x, y, x + w, y, 10);
  ctx.closePath();
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function button(ctx, label, y) {
  box(ctx, VIEW.width / 2 - 178, y, 356, 44, 'rgba(242,193,78,0.10)', 'rgba(242,193,78,0.55)');
  text(ctx, label, VIEW.width / 2, y + 28, 14, PALETTE.amber, 'center', '700');
}

function text(ctx, value, x, y, size, color, align = 'left', weight = '500') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offX = 0;
  let offY = 0;
  let dpr = 1;
  let cssW = VIEW.width;
  let cssH = VIEW.height;
  let viewX = 0;
  let viewY = 0;

  function resize() {
    cssW = canvas.clientWidth || window.innerWidth || VIEW.width;
    cssH = canvas.clientHeight || window.innerHeight || VIEW.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const pixelW = Math.max(1, Math.round(cssW * dpr));
    const pixelH = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    scale = Math.min(cssW / VIEW.width, cssH / VIEW.height) || 1;
    offX = (cssW - VIEW.width * scale) / 2;
    offY = (cssH - VIEW.height * scale) / 2;
  }

  function toWorld(clientX, clientY) {
    return { x: (clientX - offX) / scale + viewX, y: (clientY - offY) / scale + viewY };
  }

  function drawFloor(game) {
    const world = game.world;
    const c0 = Math.max(0, Math.floor(viewX / TILE) - 1);
    const r0 = Math.max(0, Math.floor(viewY / TILE) - 1);
    const c1 = Math.min(world.cols - 1, Math.ceil((viewX + VIEW.width) / TILE));
    const r1 = Math.min(world.rows - 1, Math.ceil((viewY + VIEW.height) / TILE));
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 0, world.width, world.height);
    for (let row = r0; row <= r1; row += 1) {
      for (let col = c0; col <= c1; col += 1) {
        const ch = world.charAt(col, row);
        const x = col * TILE;
        const y = row * TILE;
        ctx.fillStyle = (col + row) % 2 === 0 ? PALETTE.floor : PALETTE.floorAlt;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(150,170,200,0.032)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
        if (ch === 'r') {
          ctx.fillStyle = PALETTE.rug;
          ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
          ctx.strokeStyle = PALETTE.rugLine;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 6.5, y + 6.5, TILE - 13, TILE - 13);
          ctx.beginPath();
          ctx.moveTo(x + 6, y + TILE / 2);
          ctx.lineTo(x + TILE - 6, y + TILE / 2);
          ctx.stroke();
        } else if (ch === 's') {
          ctx.fillStyle = PALETTE.shadow;
          ctx.fillRect(x, y, TILE, TILE);
          ctx.strokeStyle = 'rgba(22,36,64,0.85)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
        }
      }
    }
  }

  function drawLights(game) {
    for (let i = 0; i < game.level.lights.length; i += 1) {
      const light = game.level.lights[i];
      const g = ctx.createRadialGradient(light.x, light.y, 4, light.x, light.y, light.r);
      g.addColorStop(0, 'rgba(242,193,78,0.30)');
      g.addColorStop(0.45, 'rgba(242,193,78,0.11)');
      g.addColorStop(1, 'rgba(242,193,78,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(242,193,78,0.16)';
      ctx.beginPath();
      ctx.arc(light.x, light.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function conePath(world, observer, halfAngle, range, smokes, steps) {
    ctx.beginPath();
    ctx.moveTo(observer.x, observer.y);
    for (let i = 0; i <= steps; i += 1) {
      const angle = observer.angle - halfAngle + (halfAngle * 2 * i) / steps;
      const d = world.rayDistance(observer.x, observer.y, angle, range, smokes);
      ctx.lineTo(observer.x + Math.cos(angle) * d, observer.y + Math.sin(angle) * d);
    }
    ctx.closePath();
  }

  function drawCone(world, observer, halfAngle, range, smokes, hue) {
    conePath(world, observer, halfAngle, range, smokes, 34);
    const gradient = ctx.createRadialGradient(observer.x, observer.y, 4, observer.x, observer.y, range);
    if (hue === 'teal') {
      gradient.addColorStop(0, 'rgba(73,213,208,0.38)');
      gradient.addColorStop(0.55, 'rgba(73,213,208,0.14)');
      gradient.addColorStop(1, 'rgba(73,213,208,0.01)');
    } else {
      gradient.addColorStop(0, observer.sees ? 'rgba(229,86,78,0.45)' : 'rgba(242,193,78,0.40)');
      gradient.addColorStop(0.55, observer.sees ? 'rgba(229,86,78,0.16)' : 'rgba(242,193,78,0.14)');
      gradient.addColorStop(1, 'rgba(242,193,78,0.01)');
    }
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = hue === 'teal' ? 'rgba(73,213,208,0.18)' : 'rgba(242,193,78,0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawGeometry(game) {
    const world = game.world;
    const c0 = Math.max(0, Math.floor(viewX / TILE) - 1);
    const r0 = Math.max(0, Math.floor(viewY / TILE) - 1);
    const c1 = Math.min(world.cols - 1, Math.ceil((viewX + VIEW.width) / TILE));
    const r1 = Math.min(world.rows - 1, Math.ceil((viewY + VIEW.height) / TILE));
    for (let row = r0; row <= r1; row += 1) {
      for (let col = c0; col <= c1; col += 1) {
        const ch = world.charAt(col, row);
        const x = col * TILE;
        const y = row * TILE;
        if (ch === '#') {
          ctx.fillStyle = PALETTE.wall;
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = PALETTE.wallTop;
          ctx.fillRect(x, y, TILE, 6);
          ctx.strokeStyle = PALETTE.wallLine;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
          ctx.fillStyle = 'rgba(0,0,0,0.24)';
          ctx.fillRect(x + 4, y + 10, TILE - 8, TILE - 14);
        } else if (ch === 'c') {
          ctx.fillStyle = 'rgba(0,0,0,0.34)';
          ctx.fillRect(x + 4, y + 6, TILE - 4, TILE - 4);
          ctx.fillStyle = PALETTE.crate;
          ctx.fillRect(x + 3, y + 2, TILE - 7, TILE - 7);
          ctx.strokeStyle = PALETTE.crateEdge;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 3.5, y + 2.5, TILE - 8, TILE - 8);
          ctx.beginPath();
          ctx.moveTo(x + 5, y + 4);
          ctx.lineTo(x + TILE - 6, y + TILE - 7);
          ctx.moveTo(x + TILE - 6, y + 4);
          ctx.lineTo(x + 5, y + TILE - 7);
          ctx.stroke();
        } else if (ch === 'p') {
          ctx.fillStyle = PALETTE.pillar;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 3);
          ctx.lineTo(x + 32, y + 3);
          ctx.lineTo(x + 37, y + 8);
          ctx.lineTo(x + 37, y + 32);
          ctx.lineTo(x + 32, y + 37);
          ctx.lineTo(x + 8, y + 37);
          ctx.lineTo(x + 3, y + 32);
          ctx.lineTo(x + 3, y + 8);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = PALETTE.wallLine;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawVan(game) {
    const van = game.level.van;
    const open = game.collected >= game.lootTotal;
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.fillRect(van.x + 4, van.y + 6, van.w, van.h);
    ctx.fillStyle = '#26303d';
    ctx.fillRect(van.x, van.y, van.w, van.h);
    ctx.fillStyle = '#38465a';
    ctx.fillRect(van.x + 16, van.y + 7, van.w - 22, van.h - 14);
    ctx.strokeStyle = open ? PALETTE.amber : '#59677d';
    ctx.lineWidth = 2;
    ctx.strokeRect(van.x + 1, van.y + 1, van.w - 2, van.h - 2);
    ctx.fillStyle = open ? PALETTE.amber : '#81433c';
    ctx.fillRect(van.x + 3, van.y + 6, 5, 10);
    ctx.fillRect(van.x + 3, van.y + van.h - 16, 5, 10);
    if (open) {
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(game.clock * 5);
      text(ctx, 'GETAWAY →', van.x + van.w + 10, van.y + van.h / 2 + 4, 12, PALETTE.amber, 'left', '700');
      ctx.globalAlpha = 1;
    }
  }

  function drawLoot(game) {
    for (let i = 0; i < game.loot.length; i += 1) {
      const item = game.loot[i];
      if (item.taken) continue;
      const bob = Math.sin(game.clock * 2.4 + i) * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(item.x, item.y + 15, 20, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      const glow = ctx.createRadialGradient(item.x, item.y + bob, 2, item.x, item.y + bob, 42);
      glow.addColorStop(0, 'rgba(242,193,78,0.28)');
      glow.addColorStop(1, 'rgba(242,193,78,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(item.x, item.y + bob, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.loot;
      ctx.strokeStyle = '#8a6420';
      ctx.lineWidth = 1.5;
      if (item.kind === 'gem') {
        ctx.beginPath();
        ctx.moveTo(item.x, item.y - 14 + bob);
        ctx.lineTo(item.x + 12, item.y - 3 + bob);
        ctx.lineTo(item.x, item.y + 14 + bob);
        ctx.lineTo(item.x - 12, item.y - 3 + bob);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#fff0b8';
        ctx.beginPath();
        ctx.moveTo(item.x - 12, item.y - 3 + bob);
        ctx.lineTo(item.x, item.y + 14 + bob);
        ctx.stroke();
      } else if (item.kind === 'safe') {
        ctx.fillRect(item.x - 15, item.y - 13 + bob, 30, 28);
        ctx.strokeRect(item.x - 15, item.y - 13 + bob, 30, 28);
        ctx.fillStyle = '#8a6420';
        ctx.beginPath();
        ctx.arc(item.x, item.y + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PALETTE.loot;
        ctx.beginPath();
        ctx.moveTo(item.x, item.y + bob);
        ctx.lineTo(item.x + 6, item.y - 5 + bob);
        ctx.stroke();
      } else {
        for (let row = 0; row < 3; row += 1) {
          const count = 3 - row;
          for (let i2 = 0; i2 < count; i2 += 1) {
            const bx = item.x - (count * 11) / 2 + i2 * 11;
            const by = item.y + 8 - row * 8 + bob;
            ctx.fillRect(bx, by - 6, 9, 6);
            ctx.fillStyle = row === 2 ? '#ffdd7a' : PALETTE.loot;
            ctx.fillRect(bx + 2, by - 5, 3, 3);
            ctx.fillStyle = PALETTE.loot;
          }
        }
      }
    }
  }

  function drawTools(game) {
    for (let i = 0; i < game.tools.smokes.length; i += 1) {
      const s = game.tools.smokes[i];
      const t = 1 - s.life / s.max;
      const grow = 0.35 + Math.min(1, t * 4) * 0.65;
      const alpha = Math.min(0.68, s.life * 0.55);
      for (let k = 0; k < 4; k += 1) {
        const a = game.clock * 0.4 + k * 1.57;
        ctx.fillStyle = `rgba(158,174,193,${alpha * 0.38})`;
        ctx.beginPath();
        ctx.arc(s.x + Math.cos(a) * 22 * grow, s.y + Math.sin(a) * 18 * grow, s.radius * 0.55 * grow, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(198,210,224,${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 0.72 * grow, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < game.tools.darts.length; i += 1) {
      const dart = game.tools.darts[i];
      ctx.strokeStyle = PALETTE.teal;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dart.x, dart.y);
      ctx.lineTo(dart.x - Math.cos(dart.angle) * 15, dart.y - Math.sin(dart.angle) * 15);
      ctx.stroke();
    }
    for (let i = 0; i < game.tools.puffs.length; i += 1) {
      const puff = game.tools.puffs[i];
      ctx.globalAlpha = Math.max(0, puff.life / puff.max);
      ctx.strokeStyle = puff.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, 20 * (1 - puff.life / puff.max) + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawGuards(game) {
    for (let i = 0; i < game.guards.length; i += 1) {
      const guard = game.guards[i];
      const ko = guard.ko > 0;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(guard.x, guard.y + 11, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ko ? '#414854' : PALETTE.guardDark;
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ko ? '#616b79' : PALETTE.guard;
      ctx.beginPath();
      ctx.arc(guard.x, guard.y - 2, 9, 0, Math.PI * 2);
      ctx.fill();
      const fx = guard.x + Math.cos(guard.angle) * 10;
      const fy = guard.y - 2 + Math.sin(guard.angle) * 10;
      ctx.fillStyle = guard.sees ? PALETTE.danger : '#f5d7b0';
      ctx.beginPath();
      ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      if (ko) {
        text(ctx, 'z', guard.x + 8, guard.y - 16, 12, PALETTE.muted, 'left', '700');
        text(ctx, 'z', guard.x + 14, guard.y - 26, 9, PALETTE.muted, 'left', '700');
      }
    }
  }

  function drawCameras(game) {
    for (let i = 0; i < game.cameras.length; i += 1) {
      const camera = game.cameras[i];
      ctx.fillStyle = '#3a4658';
      ctx.fillRect(camera.x - 9, camera.y - 6, 18, 12);
      ctx.fillStyle = camera.sees ? PALETTE.danger : PALETTE.teal;
      ctx.beginPath();
      ctx.arc(camera.x, camera.y + 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6f7d92';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(camera.x, camera.y + 6);
      ctx.lineTo(camera.x + Math.cos(camera.angle) * 15, camera.y + 6 + Math.sin(camera.angle) * 15);
      ctx.stroke();
    }
  }

  function drawPlayer(game) {
    const player = game.player;
    ctx.globalAlpha = player.hidden ? 0.38 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.aimAngle);
    ctx.fillStyle = PALETTE.playerDark;
    ctx.beginPath();
    ctx.moveTo(-9, -7);
    ctx.lineTo(11, 0);
    ctx.lineTo(-9, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#161c28';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.player;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = player.hidden ? PALETTE.teal : PALETTE.amber;
    ctx.fillRect(4, -3, 4, 2);
    ctx.restore();
    if (player.sneaking) {
      ctx.strokeStyle = player.hidden ? PALETTE.teal : 'rgba(200,212,228,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 16 + Math.sin(game.clock * 3) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawWorld(game) {
    const world = game.world;
    viewX = game.camera.x;
    viewY = game.camera.y;
    ctx.save();
    ctx.translate(-viewX, -viewY);
    drawFloor(game);
    drawLights(game);
    for (let i = 0; i < game.guards.length; i += 1) {
      const guard = game.guards[i];
      if (guard.ko <= 0) drawCone(world, guard, Math.PI / 6, 288, game.smokes, 'amber');
    }
    for (let i = 0; i < game.cameras.length; i += 1) {
      const camera = game.cameras[i];
      drawCone(world, camera, camera.halfAngle, camera.range, game.smokes, 'teal');
    }
    drawGeometry(game);
    drawVan(game);
    drawLoot(game);
    drawTools(game);
    drawCameras(game);
    drawGuards(game);
    drawPlayer(game);
    ctx.restore();
  }

  function drawEdgePulse(game) {
    if (!game.alarm.alerted && game.alarm.flash <= 0) return;
    const pulse = game.alarm.alerted ? 0.28 + 0.22 * Math.sin(game.clock * 7) : game.alarm.flash * 0.5;
    const thickness = 54;
    const edges = [
      [0, 0, VIEW.width, thickness, 'top'],
      [0, VIEW.height - thickness, VIEW.width, thickness, 'bottom'],
      [0, 0, thickness, VIEW.height, 'left'],
      [VIEW.width - thickness, 0, thickness, VIEW.height, 'right'],
    ];
    for (const [x, y, w, h, side] of edges) {
      let gradient;
      if (side === 'top') gradient = ctx.createLinearGradient(0, 0, 0, thickness);
      else if (side === 'bottom') gradient = ctx.createLinearGradient(0, VIEW.height, 0, VIEW.height - thickness);
      else if (side === 'left') gradient = ctx.createLinearGradient(0, 0, thickness, 0);
      else gradient = ctx.createLinearGradient(VIEW.width, 0, VIEW.width - thickness, 0);
      gradient.addColorStop(0, `rgba(229,86,78,${pulse})`);
      gradient.addColorStop(1, 'rgba(229,86,78,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, h);
    }
  }

  function scrim(alpha) {
    ctx.fillStyle = `rgba(5,7,12,${alpha})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  function drawOverlay(game, screen) {
    if (screen === SCREEN.TITLE) {
      scrim(0.48);
      spaced(ctx, 'NIGHTLIFT', VIEW.width / 2, 270, 9, 76, PALETTE.text, '800', 'center');
      ctx.fillStyle = PALETTE.amber;
      ctx.fillRect(VIEW.width / 2 - 220, 292, 440, 2);
      spaced(ctx, 'A TOP-DOWN STEALTH HEIST', VIEW.width / 2, 324, 4, 15, PALETTE.amber, '600', 'center');
      text(ctx, 'Five rooms. Every loot item. One clean getaway.', VIEW.width / 2, 375, 17, PALETTE.muted, 'center');
      const blink = 0.6 + 0.4 * Math.sin(game.clock * 3);
      ctx.globalAlpha = blink;
      button(ctx, 'PRESS ENTER OR CLICK TO START', 418);
      ctx.globalAlpha = 1;
      text(ctx, 'WASD / ARROWS MOVE   ·   SHIFT SNEAK   ·   S SMOKE   ·   D DART   ·   M MUSIC', VIEW.width / 2, 498, 13, PALETTE.muted, 'center');
      text(ctx, 'Stay out of amber and teal cones. Hide in blue shadow. Two alarms and you are caught.', VIEW.width / 2, 528, 12, '#6f7890', 'center');
      return;
    }
    if (screen === SCREEN.COMPLETE) {
      scrim(0.72);
      box(ctx, 380, 168, 520, 384, '#0d111b', 'rgba(242,193,78,0.45)');
      spaced(ctx, 'LEVEL CLEAR', VIEW.width / 2, 236, 6, 38, PALETTE.amber, '800', 'center');
      text(ctx, game.level.name, VIEW.width / 2, 274, 15, PALETTE.muted, 'center');
      text(ctx, 'TIME', 440, 330, 13, PALETTE.muted);
      text(ctx, `${game.elapsed.toFixed(1)}s`, 840, 330, 20, PALETTE.text, 'right', '700');
      text(ctx, 'FULL ALARMS', 440, 374, 13, PALETTE.muted);
      text(ctx, `${game.session.alarms}`, 840, 374, 20, game.session.alarms ? PALETTE.danger : PALETTE.text, 'right', '700');
      text(ctx, 'LOOT THIS JOB', 440, 418, 13, PALETTE.muted);
      text(ctx, `$${game.session.lootValue.toLocaleString('en-US')}`, 840, 418, 20, PALETTE.amber, 'right', '700');
      ctx.fillStyle = 'rgba(242,193,78,0.2)';
      ctx.fillRect(440, 446, 400, 1);
      button(ctx, 'ENTER / CLICK FOR THE NEXT ROOM', 478);
      return;
    }
    if (screen === SCREEN.CAUGHT) {
      scrim(0.78);
      box(ctx, 400, 210, 480, 300, '#120d12', 'rgba(229,86,78,0.6)');
      spaced(ctx, 'JOB BLOWN', VIEW.width / 2, 288, 7, 46, PALETTE.danger, '800', 'center');
      text(ctx, 'Two full alarms. The guards made the ID.', VIEW.width / 2, 330, 15, PALETTE.muted, 'center');
      text(ctx, `LEVEL ${game.levelIndex + 1}  ·  ${game.level.name}`, VIEW.width / 2, 376, 14, PALETTE.text, 'center');
      button(ctx, 'R / CLICK TO RETRY THIS LEVEL', 418);
      return;
    }
    if (screen === SCREEN.GETAWAY) {
      scrim(0.80);
      spaced(ctx, 'NIGHTLIFT — CLEAN GETAWAY', VIEW.width / 2, 210, 3, 40, PALETTE.amber, '800', 'center');
      ctx.fillStyle = 'rgba(242,193,78,0.35)';
      ctx.fillRect(300, 234, 680, 2);
      text(ctx, 'The van melts into the night. No witnesses, no plate, no trace.', VIEW.width / 2, 276, 16, PALETTE.text, 'center');
      const rows = [
        ['ROOMS CLEARED', '5 / 5'],
        ['LOOT STOLEN', `${game.session.items} ITEMS`],
        ['TOTAL HAUL', `$${game.session.lootValue.toLocaleString('en-US')}`],
        ['FULL ALARMS', `${game.session.alarms}`],
        ['TOTAL TIME', `${game.session.time.toFixed(1)}s`],
      ];
      box(ctx, 420, 306, 440, 250, '#0c1019', 'rgba(73,213,208,0.32)');
      for (let i = 0; i < rows.length; i += 1) {
        text(ctx, rows[i][0], 452, 350 + i * 40, 13, PALETTE.muted);
        text(ctx, rows[i][1], 828, 350 + i * 40, 17, i === 2 ? PALETTE.amber : PALETTE.text, 'right', '700');
      }
      button(ctx, 'PRESS R / CLICK TO RUN IT AGAIN', 594);
      return;
    }
    if (screen === SCREEN.PAUSED) {
      scrim(0.62);
      spaced(ctx, 'PAUSED', VIEW.width / 2, 330, 8, 44, PALETTE.text, '800', 'center');
      text(ctx, 'P / ESC TO RESUME', VIEW.width / 2, 380, 15, PALETTE.muted, 'center');
    }
  }

  function draw(game, screen) {
    resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, VIEW.width, VIEW.height);
    ctx.clip();
    drawWorld(game);
    drawEdgePulse(game);
    if (screen === SCREEN.PLAY || screen === SCREEN.PAUSED || screen === SCREEN.COMPLETE || screen === SCREEN.CAUGHT) drawHUD(ctx, game);
    drawOverlay(game, screen);
    ctx.restore();
  }

  return { draw, toWorld };
}
