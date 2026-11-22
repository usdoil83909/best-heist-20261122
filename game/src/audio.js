
const NOTES = [55, 55, 65.41, 49, 55, 55, 73.42, 65.41];

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicBus = null;
  let musicOn = true;
  let beat = 0;
  let beatClock = 0;
  let suspectClock = 0;

  function ensure() {
    if (ctx) return ctx;
    const Constructor = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!Constructor) return null;
    try {
      ctx = new Constructor();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0.16;
      musicBus.connect(master);
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function voice(freq, duration, type, volume, endFreq, delay = 0, bus = null) {
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq && endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.02, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(bus || master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  return {
    unlock() {
      const c = ensure();
      if (c && c.state === 'suspended') c.resume();
    },
    toggleMusic() {
      musicOn = !musicOn;
      return musicOn;
    },
    get musicOn() {
      return musicOn;
    },
    update(dt) {
      if (!ctx || !musicOn) return;
      beatClock -= dt;
      if (beatClock <= 0) {
        beatClock += 0.5;
        const note = NOTES[beat % NOTES.length];
        beat += 1;
        voice(note, 0.28, 'triangle', 0.22, note, 0, musicBus);
        if (beat % 4 === 1) voice(note * 2, 0.09, 'sine', 0.05, note * 2, 0.24, musicBus);
      }
    },
    footstep() {
      voice(95, 0.055, 'square', 0.035, 55);
    },
    suspicion() {
      if (!ctx || suspectClock > 0) return;
      suspectClock = 0.4;
      voice(320, 0.2, 'sine', 0.045, 520);
    },
    alarm() {
      voice(440, 0.34, 'square', 0.12, 300);
      voice(360, 0.32, 'square', 0.10, 260, 0.28);
      voice(440, 0.34, 'square', 0.10, 300, 0.56);
    },
    dart() {
      voice(660, 0.09, 'triangle', 0.06, 120);
    },
    ko() {
      voice(150, 0.16, 'sine', 0.08, 58);
    },
    smoke() {
      voice(220, 0.32, 'sine', 0.05, 80);
    },
    loot() {
      voice(880, 0.14, 'sine', 0.09, 880);
      voice(1320, 0.26, 'sine', 0.08, 1320, 0.09);
    },
    clear() {
      voice(392, 0.16, 'triangle', 0.08, 392);
      voice(523, 0.16, 'triangle', 0.08, 523, 0.14);
      voice(659, 0.34, 'triangle', 0.08, 659, 0.28);
    },
    getaway() {
      const notes = [392, 523, 659, 784, 1046];
      for (let i = 0; i < notes.length; i += 1) voice(notes[i], 0.34, 'triangle', 0.11, notes[i], i * 0.13);
    },
    fail() {
      voice(220, 0.5, 'sawtooth', 0.08, 70);
    },
    tick(dt) {
      if (suspectClock > 0) suspectClock -= dt;
    },
  };
}
