
import { TILE } from './config.js';

const WALL = '#';
const CRATE = 'c';
const PILLAR = 'p';
const SHADOW = 's';
const RUG = 'r';
const FLOOR = '.';

function makeTiles(def) {
  const grid = [];
  for (let row = 0; row < def.rows; row += 1) grid.push(new Array(def.cols).fill(FLOOR));
  for (let col = 0; col < def.cols; col += 1) {
    grid[0][col] = WALL;
    grid[def.rows - 1][col] = WALL;
  }
  for (let row = 0; row < def.rows; row += 1) {
    grid[row][0] = WALL;
    grid[row][def.cols - 1] = WALL;
  }
  for (const [ch, x, y, w, h] of def.build) {
    for (let row = y; row < y + h; row += 1) {
      for (let col = x; col < x + w; col += 1) {
        if (row > 0 && row < def.rows - 1 && col > 0 && col < def.cols - 1) grid[row][col] = ch;
      }
    }
  }
  return grid.map((row) => row.join(''));
}

function define(def) {
  return { ...def, tiles: makeTiles(def), width: def.cols * TILE, height: def.rows * TILE };
}

const RAW = [
  {
    name: 'DOCK SIDE',
    cols: 32,
    rows: 18,
    build: [
      [WALL, 10, 3, 1, 5], [WALL, 20, 9, 1, 5],
      [CRATE, 6, 6, 2, 2], [CRATE, 24, 4, 2, 2], [CRATE, 14, 13, 2, 1], [PILLAR, 26, 8, 1, 1],
      [SHADOW, 4, 12, 4, 3], [SHADOW, 22, 4, 4, 3], [SHADOW, 16, 8, 3, 2],
      [RUG, 12, 8, 4, 2],
    ],
    lights: [{ x: 600, y: 230, r: 210 }, { x: 1090, y: 610, r: 225 }, { x: 280, y: 370, r: 180 }],
    start: { x: 1140, y: 660 },
    van: { x: 46, y: 600, w: 62, h: 46 },
    loot: [
      { x: 690, y: 250, kind: 'vault', value: 900 },
      { x: 990, y: 540, kind: 'safe', value: 600 },
    ],
    guards: [
      { waypoints: [[500, 180], [980, 180], [980, 620], [500, 620]], phase: 0 },
      { waypoints: [[300, 480], [700, 480], [700, 360], [300, 360]], phase: 0.4 },
      { waypoints: [[1180, 240], [1180, 650], [900, 650]], phase: 0.7 },
    ],
    cameras: [
      { x: 660, y: 44, base: 1.57, min: 1.0, max: 2.1, speed: 0.35 },
      { x: 1236, y: 420, base: 3.14, min: 2.5, max: 3.7, speed: 0.30 },
    ],
  },
  {
    name: 'GLASS ARCHIVE',
    cols: 36,
    rows: 20,
    build: [
      [WALL, 11, 3, 1, 6], [WALL, 25, 4, 1, 6], [WALL, 7, 13, 5, 1], [WALL, 35, 14, 1, 4],
      [CRATE, 5, 5, 2, 2], [CRATE, 17, 6, 2, 2], [CRATE, 21, 12, 2, 2], [CRATE, 31, 6, 2, 2],
      [SHADOW, 13, 11, 4, 3], [SHADOW, 27, 10, 4, 3], [SHADOW, 4, 15, 4, 2],
      [RUG, 16, 3, 4, 2],
    ],
    lights: [{ x: 600, y: 220, r: 205 }, { x: 980, y: 560, r: 235 }, { x: 1320, y: 640, r: 215 }, { x: 320, y: 680, r: 175 }],
    start: { x: 1330, y: 740 },
    van: { x: 46, y: 700, w: 62, h: 46 },
    loot: [
      { x: 730, y: 170, kind: 'gem', value: 750 },
      { x: 1110, y: 470, kind: 'vault', value: 1100 },
      { x: 1240, y: 680, kind: 'safe', value: 700 },
    ],
    guards: [
      { waypoints: [[600, 400], [940, 400], [940, 620], [600, 620]], phase: 0 },
      { waypoints: [[200, 640], [760, 640], [760, 400], [200, 400]], phase: 0.3 },
      { waypoints: [[1080, 400], [1340, 400], [1340, 620], [1080, 620]], phase: 0.6 },
      { waypoints: [[840, 740], [1360, 740]], phase: 0.15 },
    ],
    cameras: [
      { x: 700, y: 44, base: 1.57, min: 1.05, max: 2.1, speed: 0.34 },
      { x: 1392, y: 470, base: 3.14, min: 2.5, max: 3.75, speed: 0.29 },
      { x: 640, y: 756, base: -1.57, min: -2.1, max: -1.0, speed: 0.31 },
    ],
  },
  {
    name: 'MIDNIGHT EXCHANGE',
    cols: 40,
    rows: 22,
    build: [
      [WALL, 6, 4, 1, 4], [WALL, 30, 6, 1, 5], [WALL, 18, 16, 3, 1],
      [CRATE, 8, 7, 2, 2], [CRATE, 18, 5, 2, 2], [CRATE, 25, 10, 3, 2], [PILLAR, 16, 9, 1, 1],
      [SHADOW, 10, 10, 5, 4], [SHADOW, 22, 7, 4, 3], [SHADOW, 33, 16, 3, 2],
      [RUG, 14, 11, 4, 2],
    ],
    lights: [{ x: 520, y: 300, r: 205 }, { x: 900, y: 520, r: 235 }, { x: 1230, y: 700, r: 210 }, { x: 760, y: 175, r: 180 }],
    start: { x: 1460, y: 820 },
    van: { x: 46, y: 780, w: 62, h: 46 },
    loot: [
      { x: 740, y: 390, kind: 'vault', value: 1200 },
      { x: 1070, y: 690, kind: 'safe', value: 780 },
      { x: 380, y: 640, kind: 'gem', value: 900 },
    ],
    guards: [
      { waypoints: [[620, 520], [900, 520], [900, 340], [620, 340]], phase: 0 },
      { waypoints: [[1040, 520], [1260, 520], [1260, 700], [1040, 700]], phase: 0.5 },
      { waypoints: [[320, 180], [620, 180], [620, 120], [320, 120]], phase: 0.25 },
      { waypoints: [[520, 700], [900, 700], [900, 600], [520, 600]], phase: 0.75 },
    ],
    cameras: [
      { x: 920, y: 44, base: 1.57, min: 0.95, max: 2.2, speed: 0.33 },
      { x: 1256, y: 360, base: 3.14, min: 2.5, max: 3.8, speed: 0.27 },
    ],
  },
  {
    name: 'IRON VAULT',
    cols: 44,
    rows: 24,
    build: [
      [WALL, 12, 3, 1, 7], [WALL, 30, 5, 1, 8], [WALL, 20, 14, 5, 1], [WALL, 8, 17, 5, 1],
      [CRATE, 6, 6, 2, 2], [CRATE, 17, 9, 2, 2], [CRATE, 25, 9, 2, 2], [CRATE, 34, 15, 2, 2], [CRATE, 14, 19, 2, 2],
      [SHADOW, 5, 12, 4, 3], [SHADOW, 22, 8, 4, 3], [SHADOW, 32, 10, 4, 3], [SHADOW, 10, 19, 4, 2],
      [RUG, 26, 4, 4, 2], [RUG, 15, 16, 4, 2],
    ],
    lights: [{ x: 620, y: 220, r: 210 }, { x: 960, y: 500, r: 235 }, { x: 1340, y: 680, r: 235 }, { x: 420, y: 820, r: 200 }, { x: 1500, y: 300, r: 200 }],
    start: { x: 1650, y: 900 },
    van: { x: 46, y: 860, w: 62, h: 46 },
    loot: [
      { x: 700, y: 230, kind: 'gem', value: 1000 },
      { x: 1060, y: 650, kind: 'vault', value: 1300 },
      { x: 1340, y: 450, kind: 'safe', value: 850 },
      { x: 450, y: 800, kind: 'gem', value: 1050 },
    ],
    guards: [
      { waypoints: [[600, 460], [1100, 460], [1100, 650], [600, 650]], phase: 0 },
      { waypoints: [[560, 300], [1000, 300], [1000, 180], [560, 180]], phase: 0.4 },
      { waypoints: [[1300, 300], [1620, 300], [1620, 720], [1300, 720]], phase: 0.2 },
      { waypoints: [[680, 640], [920, 640], [920, 840], [680, 840]], phase: 0.6 },
      { waypoints: [[1200, 850], [1680, 850]], phase: 0.8 },
    ],
    cameras: [
      { x: 640, y: 44, base: 1.57, min: 1.0, max: 2.15, speed: 0.32 },
      { x: 1150, y: 44, base: 1.57, min: 0.95, max: 2.2, speed: 0.28 },
      { x: 1712, y: 480, base: 3.14, min: 2.45, max: 3.8, speed: 0.30 },
      { x: 900, y: 900, base: -1.57, min: -2.15, max: -1.0, speed: 0.26 },
    ],
  },
  {
    name: 'THE LAST PAYROLL',
    cols: 48,
    rows: 26,
    build: [
      [WALL, 14, 3, 1, 8], [WALL, 34, 4, 1, 8], [WALL, 22, 15, 5, 1], [WALL, 10, 18, 5, 1], [WALL, 40, 17, 1, 6],
      [CRATE, 7, 6, 2, 2], [CRATE, 19, 8, 2, 2], [CRATE, 29, 11, 2, 2], [CRATE, 38, 9, 2, 2], [CRATE, 16, 21, 2, 2], [CRATE, 30, 20, 2, 2],
      [SHADOW, 5, 13, 4, 3], [SHADOW, 25, 7, 4, 3], [SHADOW, 36, 13, 4, 3], [SHADOW, 12, 21, 4, 3], [SHADOW, 28, 22, 4, 2],
      [RUG, 20, 4, 4, 2], [RUG, 30, 17, 4, 2],
    ],
    lights: [{ x: 700, y: 220, r: 210 }, { x: 1060, y: 480, r: 235 }, { x: 1500, y: 720, r: 235 }, { x: 500, y: 900, r: 210 }, { x: 1760, y: 400, r: 220 }, { x: 1240, y: 880, r: 200 }],
    start: { x: 1840, y: 980 },
    van: { x: 46, y: 940, w: 62, h: 46 },
    loot: [
      { x: 850, y: 200, kind: 'gem', value: 1150 },
      { x: 1100, y: 350, kind: 'vault', value: 1400 },
      { x: 1500, y: 590, kind: 'safe', value: 950 },
      { x: 560, y: 900, kind: 'vault', value: 1600 },
    ],
    guards: [
      { waypoints: [[660, 500], [1080, 500], [1080, 690], [660, 690]], phase: 0 },
      { waypoints: [[680, 280], [1100, 280], [1100, 160], [680, 160]], phase: 0.35 },
      { waypoints: [[1440, 300], [1800, 300], [1800, 640], [1440, 640]], phase: 0.15 },
      { waypoints: [[760, 760], [1120, 760], [1120, 920], [760, 920]], phase: 0.55 },
      { waypoints: [[1320, 660], [1560, 660], [1560, 880], [1320, 880]], phase: 0.8 },
      { waypoints: [[1680, 840], [1860, 840], [1860, 960], [1680, 960]], phase: 0.65 },
    ],
    cameras: [
      { x: 720, y: 44, base: 1.57, min: 1.0, max: 2.15, speed: 0.31 },
      { x: 1400, y: 44, base: 1.57, min: 0.95, max: 2.2, speed: 0.27 },
      { x: 1872, y: 520, base: 3.14, min: 2.45, max: 3.8, speed: 0.29 },
      { x: 980, y: 980, base: -1.57, min: -2.1, max: -1.0, speed: 0.25 },
      { x: 1640, y: 700, base: 1.57, min: 1.0, max: 2.2, speed: 0.26 },
    ],
  },
];

export const LEVELS = RAW.map(define);
