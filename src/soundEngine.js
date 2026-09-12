// Momora High-Performance Ambient Sound Engine
// Uses Web Audio API procedural synthesis on Web/Mobile
// 0 KB download size, infinite smooth looping, ultra-fast app startup!

let audioCtx = null;
let currentSource = null;
let currentGain = null;
let currentSoundId = null;
let currentVolume = 0.5;
let sleepTimerId = null;
const listeners = new Set();

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function notify() {
  const state = { soundId: currentSoundId, isPlaying: !!currentSource, volume: currentVolume };
  listeners.forEach(fn => { try { fn(state); } catch (e) {} });
}

export function playSound(id, options = {}) {
  const { volume = currentVolume, timerMinutes = null } = options;
  currentVolume = Math.max(0, Math.min(1, volume));

  stopSound();

  const ctx = getAudioContext();
  if (!ctx) {
    currentSoundId = id;
    notify();
    return false;
  }

  try {
    const bufferSize = Math.floor(ctx.sampleRate * 2.5);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (id === 'rain' || id === 'shush') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    } else if (id === 'waves' || id === 'ocean') {
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const swell = (Math.sin(2 * Math.PI * 0.3 * t) + 1) * 0.5;
        const noise = Math.random() * 2 - 1;
        data[i] = noise * swell * 0.6;
      }
    } else if (id === 'womb') {
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const beat1 = Math.exp(-Math.pow((t % 1.0 - 0.15) * 22, 2));
        const beat2 = Math.exp(-Math.pow((t % 1.0 - 0.38) * 22, 2)) * 0.6;
        const rumble = Math.sin(2 * Math.PI * 55 * t) * (beat1 + beat2);
        data[i] = rumble * 0.8;
      }
    } else if (id === 'clock') {
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const tick = Math.exp(-Math.pow((t % 1.0 - 0.05) * 80, 2));
        data[i] = Math.sin(2 * Math.PI * 1200 * t) * tick * 0.7;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    if (id === 'womb') {
      filter.type = 'lowpass';
      filter.frequency.value = 220;
    } else if (id === 'vacuum') {
      filter.type = 'lowpass';
      filter.frequency.value = 450;
    } else if (id === 'rain' || id === 'waves' || id === 'ocean') {
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
    } else if (id === 'shush') {
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 3500;
    }

    const gain = ctx.createGain();
    gain.gain.value = currentVolume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(0);

    currentSource = source;
    currentGain = gain;
    currentSoundId = id;

    if (timerMinutes && timerMinutes > 0) {
      sleepTimerId = setTimeout(() => {
        stopSound();
      }, timerMinutes * 60 * 1000);
    }

    notify();
    return true;
  } catch (err) {
    console.warn('Audio playback error:', err);
    currentSoundId = id;
    notify();
    return false;
  }
}

export function stopSound() {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {}
    currentSource = null;
  }
  currentGain = null;
  currentSoundId = null;
  if (sleepTimerId) {
    clearTimeout(sleepTimerId);
    sleepTimerId = null;
  }
  notify();
}

export function setVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (currentGain && audioCtx) {
    try {
      currentGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    } catch (e) {
      currentGain.gain.value = currentVolume;
    }
  }
  notify();
}

export function getCurrentSound() {
  return {
    soundId: currentSoundId,
    isPlaying: !!currentSource,
    volume: currentVolume,
  };
}

export function addSoundListener(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
