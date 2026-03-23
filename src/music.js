/**
 * Procedural 80s synthwave background music.
 * Pure Web Audio API — zero external files.
 */

let ctx = null;
let masterGain = null;
let playing = false;
let nodes = [];
let intervalId = null;

const BPM = 120;
const BEAT = 60 / BPM;

// A minor pentatonic for that 80s feel
const BASS_NOTES = [110, 130.81, 146.83, 164.81, 196, 164.81, 146.83, 130.81]; // Am bass line
const PAD_NOTES = [220, 261.63, 329.63]; // Am chord
const ARP_NOTES = [440, 523.25, 659.25, 783.99, 659.25, 523.25]; // Am arpeggio high

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function startMusic(volume = 0.12) {
  if (playing) return;
  playing = true;

  const c = getCtx();
  masterGain = c.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(c.destination);

  // ── Bass (sawtooth, low-pass filtered) ──
  const bassOsc = c.createOscillator();
  const bassGain = c.createGain();
  const bassFilter = c.createBiquadFilter();
  bassOsc.type = 'sawtooth';
  bassOsc.frequency.value = BASS_NOTES[0];
  bassFilter.type = 'lowpass';
  bassFilter.frequency.value = 300;
  bassFilter.Q.value = 5;
  bassGain.gain.value = 0.3;
  bassOsc.connect(bassFilter);
  bassFilter.connect(bassGain);
  bassGain.connect(masterGain);
  bassOsc.start();
  nodes.push(bassOsc, bassGain, bassFilter);

  // ── Pad (detuned saws, filtered) ──
  const padGain = c.createGain();
  padGain.gain.value = 0.08;
  const padFilter = c.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 800;
  padGain.connect(masterGain);
  padFilter.connect(padGain);
  nodes.push(padGain, padFilter);

  const padOscs = PAD_NOTES.map((freq) => {
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.005; // slight detune
    osc1.connect(padFilter);
    osc2.connect(padFilter);
    osc1.start();
    osc2.start();
    nodes.push(osc1, osc2);
    return [osc1, osc2];
  });

  // ── Drum pattern (noise-based) ──
  let beatCount = 0;

  intervalId = setInterval(() => {
    if (!playing) return;
    const now = c.currentTime;

    // Bass note change every beat
    const bassNote = BASS_NOTES[beatCount % BASS_NOTES.length];
    bassOsc.frequency.setValueAtTime(bassNote, now);

    // Kick on beats 0, 2 (low sine burst)
    if (beatCount % 4 === 0 || beatCount % 4 === 2) {
      const kick = c.createOscillator();
      const kickGain = c.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, now);
      kick.frequency.exponentialRampToValueAtTime(30, now + 0.1);
      kickGain.gain.setValueAtTime(0.4, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      kick.connect(kickGain);
      kickGain.connect(masterGain);
      kick.start(now);
      kick.stop(now + 0.15);
    }

    // Hi-hat on every beat (noise burst)
    const hatLen = (beatCount % 2 === 0) ? 0.05 : 0.03;
    const hatVol = (beatCount % 2 === 0) ? 0.08 : 0.04;
    const bufSize = Math.floor(c.sampleRate * hatLen);
    if (bufSize > 0) {
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const hat = c.createBufferSource();
      hat.buffer = buf;
      const hatGain = c.createGain();
      hatGain.gain.setValueAtTime(hatVol, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + hatLen);
      const hatFilter = c.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.value = 8000;
      hat.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(masterGain);
      hat.start(now);
    }

    // Arp note (triangle, staccato)
    if (beatCount % 2 === 0) {
      const arpNote = ARP_NOTES[(beatCount / 2) % ARP_NOTES.length];
      const arp = c.createOscillator();
      const arpGain = c.createGain();
      arp.type = 'triangle';
      arp.frequency.value = arpNote;
      arpGain.gain.setValueAtTime(0.06, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + BEAT * 0.4);
      arp.connect(arpGain);
      arpGain.connect(masterGain);
      arp.start(now);
      arp.stop(now + BEAT * 0.5);
    }

    beatCount++;
  }, BEAT * 500); // half-beat intervals
}

export function stopMusic() {
  playing = false;
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  for (const node of nodes) {
    try { node.stop?.(); } catch {}
    try { node.disconnect(); } catch {}
  }
  nodes = [];
  if (masterGain) { masterGain.disconnect(); masterGain = null; }
}

export function setMusicVolume(vol) {
  if (masterGain) masterGain.gain.value = vol;
}

export function isMusicPlaying() { return playing; }
