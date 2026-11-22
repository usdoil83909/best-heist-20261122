
import { TILE } from './config.js';

function insideSmoke(x, y, smokes) {
  for (let i = 0; i < smokes.length; i += 1) {
    const s = smokes[i];
    if (s.life > 0) {
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy < s.radius * s.radius) return true;
    }
  }
  return false;
}

export function createWorld(def) {
  const tiles = def.tiles;
  const rows = tiles.length;
  const cols = tiles[0].length;
  const width = cols * TILE;
  const height = rows * TILE;

  function charAt(col, row) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return '#';
    return tiles[row][col];
  }

  function solidChar(ch) {
    return ch === '#' || ch === 'c' || ch === 'p';
  }

  function solidAt(col, row) {
    return solidChar(charAt(col, row));
  }

  function solidPoint(x, y) {
    return solidAt(Math.floor(x / TILE), Math.floor(y / TILE));
  }

  function collides(x, y, radius) {
    const minCol = Math.floor((x - radius) / TILE);
    const maxCol = Math.floor((x + radius) / TILE);
    const minRow = Math.floor((y - radius) / TILE);
    const maxRow = Math.floor((y + radius) / TILE);
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        if (!solidAt(col, row)) continue;
        const left = col * TILE;
        const top = row * TILE;
        const nx = Math.max(left, Math.min(x, left + TILE));
        const ny = Math.max(top, Math.min(y, top + TILE));
        const dx = x - nx;
        const dy = y - ny;
        if (dx * dx + dy * dy < radius * radius) return true;
      }
    }
    return false;
  }

  function move(body, dx, dy, radius) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 7));
    const sx = dx / steps;
    const sy = dy / steps;
    for (let i = 0; i < steps; i += 1) {
      if (!collides(body.x + sx, body.y, radius)) body.x += sx;
      if (!collides(body.x, body.y + sy, radius)) body.y += sy;
    }
  }

  function isShadow(x, y) {
    return charAt(Math.floor(x / TILE), Math.floor(y / TILE)) === 's';
  }

  function lightAt(x, y) {
    let best = 0;
    for (let i = 0; i < def.lights.length; i += 1) {
      const light = def.lights[i];
      const dx = x - light.x;
      const dy = y - light.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < light.r) best = Math.max(best, 1 - d / light.r);
    }
    return best;
  }

  function rayDistance(x, y, angle, maxDist, smokes = []) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const step = 6;
    for (let d = step; d <= maxDist; d += step) {
      const px = x + dx * d;
      const py = y + dy * d;
      if (solidPoint(px, py) || insideSmoke(px, py, smokes)) return Math.max(0, d - 4);
    }
    return maxDist;
  }

  function lineOfSight(x1, y1, x2, y2, smokes = []) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return true;
    const steps = Math.ceil(dist / 7);
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      if (solidPoint(px, py) || insideSmoke(px, py, smokes)) return false;
    }
    return true;
  }

  function seesPoint(observer, target, halfAngle, range, smokes = []) {
    const dx = target.x - observer.x;
    const dy = target.y - observer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > range) return false;
    if (dist > 1) {
      let diff = Math.atan2(dy, dx) - observer.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > halfAngle) return false;
    }
    return lineOfSight(observer.x, observer.y, target.x, target.y, smokes);
  }

  return {
    def,
    tiles,
    cols,
    rows,
    width,
    height,
    charAt,
    solidAt,
    solidPoint,
    collides,
    move,
    isShadow,
    lightAt,
    rayDistance,
    lineOfSight,
    seesPoint,
    insideSmoke: (x, y, smokes) => insideSmoke(x, y, smokes),
  };
}
