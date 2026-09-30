// Web Audio API Sound Synthesizer for Maximum Auditory Annoyance

let audioCtx = null;
let isAudioMuted = false;
let annoyanceMultiplier = 1.0;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Ensure audio context initializes on first click anywhere
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    getAudioContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
}

/**
 * High-pitch piercing square-wave screech (for button clicks or hover violations)
 */
export function playScreechBeep(freq = 2200, duration = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.18 * annoyanceMultiplier, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio blocked by browser policy:", e);
  }
}

/**
 * Loud dual-tone dissonant error buzzer
 */
export function playErrorBuzzer(duration = 0.4) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    [140, 147].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.2 * annoyanceMultiplier, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    });
  } catch (e) {}
}

/**
 * Boing spring sound for evasive buttons running away
 */
export function playBoingSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);

    gain.gain.setValueAtTime(0.15 * annoyanceMultiplier, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {}
}

/**
 * Alarm siren for popups and critical soil alerts
 */
export function playSirenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.15);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.45);

    gain.gain.setValueAtTime(0.18 * annoyanceMultiplier, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {}
}

/**
 * Dial-up modem screech for data transmissions
 */
export function playModemScreech() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(1200 + i * 350, now + i * 0.08);
      gain.gain.setValueAtTime(0.1 * annoyanceMultiplier, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + (i + 1) * 0.08);
    }
  } catch (e) {}
}

export function boostAnnoyanceAudio() {
  annoyanceMultiplier += 0.5;
  playScreechBeep(3200, 0.4);
  return annoyanceMultiplier;
}
