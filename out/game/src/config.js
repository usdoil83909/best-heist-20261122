
export const VIEW = { width: 1280, height: 720 };
export const TILE = 40;
export const STEP = 1 / 60;

export const PALETTE = {
  void: '#080a10',
  floor: '#14161d',
  floorAlt: '#181b24',
  shadow: '#0b1424',
  shadowEdge: '#162440',
  wall: '#252b39',
  wallTop: '#394358',
  wallLine: '#4d5a72',
  crate: '#2d2a28',
  crateEdge: '#6b5a41',
  pillar: '#2f3544',
  rug: '#242032',
  rugLine: '#44384f',
  amber: '#f2c14e',
  amberDim: '#9a7530',
  amberGlow: 'rgba(242,193,78,0.14)',
  teal: '#49d5d0',
  tealDim: 'rgba(73,213,208,0.12)',
  loot: '#f2c14e',
  player: '#c8d4e4',
  playerDark: '#556175',
  guard: '#d98666',
  guardDark: '#7a4538',
  danger: '#e5564e',
  text: '#eef1f5',
  muted: '#8b93a3',
  panel: '#10131c',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PLAYER_CONF = {
  radius: 12,
  speed: 205,
  sneakSpeed: 102,
  noiseRadius: 170,
  noiseStep: 0.42,
  hiddenAlpha: 0.35,
};

export const GUARD_CONF = {
  radius: 12,
  speed: 76,
  halfAngle: Math.PI / 6,
  range: 288,
  turnRate: 2.9,
  lookRate: 1.35,
  lookTime: 1.5,
  suspectRate: 0.62,
  koTime: 12,
  alertSpeed: 116,
  hitRadius: 17,
};

export const CAMERA_CONF = {
  halfAngle: 0.40,
  range: 262,
  suspectRate: 0.30,
  lookRate: 0.55,
};

export const ALARM_CONF = {
  drain: 0.17,
  alertDrain: 0.105,
  resetLevel: 0.30,
  escapeTime: 3.2,
  maxFull: 2,
};

export const TOOL_CONF = {
  smokes: 3,
  darts: 2,
  smokeTime: 6,
  smokeRadius: 108,
  dartSpeed: 670,
  dartRange: 470,
  dartHit: 17,
};

export const LOOT_CONF = { radius: 15, pickupRadius: 26 };

export const SCREEN = {
  TITLE: 'title',
  PLAY: 'play',
  COMPLETE: 'complete',
  CAUGHT: 'caught',
  GETAWAY: 'getaway',
  PAUSED: 'paused',
};
