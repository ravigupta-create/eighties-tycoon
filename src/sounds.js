/**
 * 80s-flavored sound effects using Web Audio API.
 * Zero external files — all procedurally generated.
 */

let ctx = null;
let masterGain = null;
let muted = false;
let volume = 0.3;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(val) { muted = val; }
export function isMuted() { return muted; }
export function setVolume(val) {
  volume = val;
  if (masterGain) masterGain.gain.value = val;
}
export function getVolume() { return volume; }

function playTone(freq, duration, type = 'square', rampDown = true) {
  if (muted) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.15;
  if (rampDown) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playNoise(duration, vol = 0.08) {
  if (muted) return;
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  source.connect(gain);
  gain.connect(masterGain);
  source.start(c.currentTime);
}

// ── Sound Effects ──

// Click / button press — short blip
export function sfxClick() {
  playTone(800, 0.06, 'square');
}

// Next Month — ascending arpeggio
export function sfxNextMonth() {
  if (muted) return;
  const notes = [262, 330, 392, 523];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.12, 'square'), i * 60);
  });
}

// Money earned — cash register "cha-ching"
export function sfxCashIn() {
  if (muted) return;
  playTone(1200, 0.08, 'square');
  setTimeout(() => playTone(1500, 0.1, 'square'), 80);
  setTimeout(() => playTone(2000, 0.15, 'sine'), 160);
}

// Money spent — descending tone
export function sfxCashOut() {
  if (muted) return;
  playTone(600, 0.08, 'sawtooth');
  setTimeout(() => playTone(400, 0.1, 'sawtooth'), 80);
  setTimeout(() => playTone(250, 0.15, 'sawtooth'), 160);
}

// Stock buy
export function sfxBuy() {
  playTone(440, 0.06, 'triangle');
  setTimeout(() => playTone(660, 0.08, 'triangle'), 70);
}

// Stock sell
export function sfxSell() {
  playTone(660, 0.06, 'triangle');
  setTimeout(() => playTone(440, 0.08, 'triangle'), 70);
}

// Random event popup — alarm
export function sfxEvent() {
  if (muted) return;
  playTone(440, 0.15, 'square');
  setTimeout(() => playTone(550, 0.15, 'square'), 150);
  setTimeout(() => playTone(440, 0.15, 'square'), 300);
  setTimeout(() => playTone(550, 0.2, 'square'), 450);
}

// Event choice made
export function sfxChoice() {
  playTone(523, 0.08, 'square');
  setTimeout(() => playTone(659, 0.12, 'square'), 80);
}

// Health warning — low buzz
export function sfxWarning() {
  if (muted) return;
  playTone(150, 0.3, 'sawtooth');
  setTimeout(() => playTone(140, 0.3, 'sawtooth'), 300);
}

// Game over — dramatic descending
export function sfxGameOver() {
  if (muted) return;
  const notes = [523, 440, 349, 262, 196, 131];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, 'sawtooth'), i * 200);
  });
  setTimeout(() => playNoise(0.8, 0.12), 1200);
}

// Game start — power-up jingle
export function sfxStart() {
  if (muted) return;
  const notes = [262, 330, 392, 523, 659, 784];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.1, 'square'), i * 70);
  });
}

// Save — quick confirmation beep
export function sfxSave() {
  playTone(880, 0.05, 'sine');
  setTimeout(() => playTone(1100, 0.08, 'sine'), 60);
}

// Reset / new life — reboot sound
export function sfxReset() {
  if (muted) return;
  playNoise(0.15, 0.1);
  setTimeout(() => playTone(200, 0.2, 'square'), 150);
  setTimeout(() => playTone(400, 0.15, 'square'), 350);
  setTimeout(() => playTone(800, 0.1, 'square'), 500);
}

// Tab switch — soft tick
export function sfxTab() {
  playTone(1000, 0.03, 'sine');
}

// Hustle / work — effort sound
export function sfxWork() {
  playTone(300, 0.06, 'triangle');
  setTimeout(() => playTone(350, 0.06, 'triangle'), 60);
  setTimeout(() => playTone(400, 0.08, 'triangle'), 120);
}

// Market crash
export function sfxCrash() {
  if (muted) return;
  playTone(200, 0.3, 'sawtooth');
  setTimeout(() => playNoise(0.2, 0.1), 200);
  setTimeout(() => playTone(100, 0.4, 'sawtooth'), 400);
}

// Market boom
export function sfxBoom() {
  if (muted) return;
  const notes = [440, 554, 659, 880];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.1, 'sine'), i * 80);
  });
}

// Birthday jingle
export function sfxBirthday() {
  if (muted) return;
  const notes = [262, 262, 294, 262, 349, 330];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'triangle'), i * 150);
  });
}

// Achievement unlocked — triumphant fanfare
export function sfxAchievement() {
  if (muted) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'triangle'), i * 100);
  });
  setTimeout(() => playTone(1047, 0.4, 'sine'), 400);
}

// Ambient city hum (for 3D world)
export function sfxAmbientHum() {
  if (muted) return;
  playTone(80, 2.0, 'sine', true);
  setTimeout(() => playTone(120, 1.5, 'sine', true), 500);
}

// Footstep
export function sfxFootstep() {
  if (muted) return;
  playNoise(0.04, 0.03);
}

// News ticker — teletype clatter
export function sfxNewsTicker(sentiment) {
  if (muted) return;
  // Quick staccato "clack clack clack" like a teletype
  for (let i = 0; i < 4; i++) {
    setTimeout(() => playNoise(0.03, 0.06), i * 50);
  }
  // Then a tone based on sentiment
  setTimeout(() => {
    if (sentiment === 'positive') playTone(880, 0.12, 'sine');
    else if (sentiment === 'negative') playTone(220, 0.15, 'sawtooth');
    else playTone(440, 0.1, 'triangle');
  }, 220);
}
