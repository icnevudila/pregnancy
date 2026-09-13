// Momora High-Performance Ambient Sound Engine
// Uses Web Audio API procedural synthesis on Web/Mobile
// 0 KB download size, infinite smooth looping, ultra-fast app startup!

let audioCtx = null;
let currentSource = null;
let currentAudioElement = null;
let currentGain = null;
let currentSoundId = null;
let currentVolume = 0.5;
let sleepTimerId = null;
let currentTimerEndTime = null;
let currentTimerMinutes = null;
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
  const state = {
    soundId: currentSoundId,
    isPlaying: !!currentSource || !!currentAudioElement,
    volume: currentVolume,
    timerMinutes: currentTimerMinutes,
    timerEndTime: currentTimerEndTime,
  };
  listeners.forEach(fn => { try { fn(state); } catch (e) {} });
}

export function playSound(id, options = {}) {
  const { volume = currentVolume, timerMinutes = null } = options;
  currentVolume = Math.max(0, Math.min(1, volume));

  stopSound();

  if (timerMinutes && timerMinutes > 0) {
    currentTimerMinutes = timerMinutes;
    currentTimerEndTime = Date.now() + timerMinutes * 60 * 1000;
    sleepTimerId = setTimeout(() => stopSound(), timerMinutes * 60 * 1000);
  } else {
    currentTimerMinutes = 0;
    currentTimerEndTime = null;
  }

  // 1. First priority: Real high-fidelity studio recordings when available
  const audioFileMap = {
    lofi: '/audio/momora-lofi.mp3',
    rain: '/audio/momora-rain.ogg',
    waves: '/audio/momora-waves.ogg',
    ocean: '/audio/momora-waves.ogg',
    lullaby: '/audio/momora-lullaby.ogg',
  };

  const audioFilePath = audioFileMap[id];
  if (audioFilePath && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio(audioFilePath);
      audio.loop = true;
      audio.volume = currentVolume;
      currentAudioElement = audio;
      currentSoundId = id;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          console.warn('Audio play prevented or failed, falling back to synth:', err);
          if (currentAudioElement === audio) {
            currentAudioElement = null;
          }
          playProceduralSynth(id, timerMinutes);
        });
      }
      notify();
      return true;
    } catch (err) {
      console.warn('Audio element error, falling back to synth:', err);
    }
  }

  return playProceduralSynth(id, timerMinutes);
}

function playProceduralSynth(id, timerMinutes) {
  const ctx = getAudioContext();
  if (!ctx) {
    currentSoundId = id;
    notify();
    return false;
  }

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const bufferDuration = id === 'lullaby' ? 12.0 : id === 'lofi' ? 8.0 : (id === 'shh' || id === 'shush') ? 4.0 : 3.0;
    const bufferSize = Math.floor(ctx.sampleRate * bufferDuration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let synthHandled = true;
    if (id === 'rain') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.2;
      }
    } else if (id === 'shh' || id === 'shush') {
      // Soothing maternal rhythmic "shh... shh..." whisper
      const cycle = 2.0;
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const phase = t % cycle;
        const env = phase < 1.15 ? Math.sin(Math.PI * (phase / 1.15)) : 0;
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.06 * white) / 1.06;
        data[i] = lastOut * env * 2.8;
      }
    } else if (id === 'fan') {
      // Continuous soothing bedroom fan & airflow
      let lastNoise = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const white = Math.random() * 2 - 1;
        lastNoise = (lastNoise + 0.04 * white) / 1.04;
        const hum = Math.sin(2 * Math.PI * 62 * t) * 0.28 + Math.sin(2 * Math.PI * 124 * t) * 0.12;
        data[i] = (lastNoise * 1.8 + hum) * 0.7;
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
    } else if (id === 'fetalHeartbeat') {
      const period = 0.414;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const phase = t % period;
        const s1 = Math.exp(-Math.pow((phase - 0.05) * 46, 2));
        const s2 = Math.exp(-Math.pow((phase - 0.15) * 46, 2)) * 0.68;
        const thump = Math.sin(2 * Math.PI * 72 * t) * (s1 + s2);
        const hiss = (Math.random() * 2 - 1) * (s1 * 0.22 + s2 * 0.14);
        data[i] = (thump + hiss) * 0.92;
      }
    } else if (id === 'clock') {
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const tick = Math.exp(-Math.pow((t % 1.0 - 0.05) * 80, 2));
        data[i] = Math.sin(2 * Math.PI * 1200 * t) * tick * 0.7;
      }
    } else if (id === 'lullaby') {
      // Authentic music box / celesta lullaby (Dandini Dandini Dastana & Brahms melody)
      const melody = [
        392.00, 392.00, 440.00, 392.00,
        329.63, 0, 329.63, 0,
        392.00, 392.00, 440.00, 392.00,
        329.63, 0, 329.63, 0,
        392.00, 440.00, 493.88, 523.25,
        493.88, 440.00, 392.00, 0,
        440.00, 493.88, 523.25, 493.88,
        440.00, 392.00, 329.63, 0,
      ];
      const noteLen = 12.0 / melody.length;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const noteIdx = Math.floor(t / noteLen) % melody.length;
        const noteT = t % noteLen;
        const freq = melody[noteIdx];
        if (freq > 0) {
          const decay = Math.exp(-noteT * 6.0);
          const fundamental = Math.sin(2 * Math.PI * freq * t);
          const octave = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.35;
          const third = Math.sin(2 * Math.PI * (freq * 3) * t) * 0.12;
          data[i] = (fundamental + octave + third) * decay * 0.42;
        } else {
          data[i] = 0;
        }
      }
    } else if (id === 'lofi' || id === 'nightPad') {
      const bpm = 60;
      const beatLen = 60 / bpm;
      const chords = id === 'lofi'
        ? [[196.00, 246.94, 293.66], [174.61, 220.00, 261.63], [207.65, 261.63, 329.63], [185.00, 233.08, 277.18]]
        : [[146.83, 185.00, 220.00], [164.81, 196.00, 246.94], [138.59, 174.61, 220.00], [155.56, 196.00, 233.08]];
      let noiseCarry = 0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const bar = Math.floor(t / (beatLen * 4));
        const chord = chords[bar % chords.length];
        const beatPhase = t % beatLen;
        const eighthPhase = t % (beatLen / 2);
        const chordFade = 0.62 + 0.38 * Math.sin(Math.PI * ((t % (beatLen * 4)) / (beatLen * 4)));
        const pad = chord.reduce((sum, freq, idx) => {
          const slow = Math.sin(2 * Math.PI * (freq * 0.5) * t + idx * 0.35);
          const shimmer = Math.sin(2 * Math.PI * freq * t) * 0.16;
          return sum + slow * 0.16 + shimmer * 0.04;
        }, 0) * chordFade;
        const kick = id === 'lofi' ? Math.exp(-beatPhase * 16) * Math.sin(2 * Math.PI * 58 * t) * 0.22 : 0;
        const hatNoise = Math.random() * 2 - 1;
        noiseCarry = noiseCarry * 0.92 + hatNoise * 0.08;
        const hat = id === 'lofi' ? Math.exp(-eighthPhase * 36) * noiseCarry * 0.035 : noiseCarry * 0.018;
        const vinyl = Math.sin(2 * Math.PI * 0.33 * t) * 0.012 + (Math.random() * 2 - 1) * 0.01;
        data[i] = pad + kick + hat + vinyl;
      }
    } else if (id === 'stream') {
      // Gentle mountain stream / bubbling brook
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.05 * white) / 1.05;
        const bubble = Math.sin(2 * Math.PI * (450 + 250 * Math.sin(2 * Math.PI * 1.8 * t)) * t) * 0.15;
        data[i] = lastOut * 2.2 + bubble;
      }
    } else if (id === 'birds') {
      // Forest morning gentle birds chirping & soft breeze
      let breeze = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        breeze = (breeze + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        const chirpCycle = t % 1.6;
        let chirp = 0;
        if (chirpCycle < 0.18) {
          const chirpFreq = 2600 + Math.sin(chirpCycle * 35) * 800;
          chirp = Math.sin(2 * Math.PI * chirpFreq * t) * Math.sin(Math.PI * (chirpCycle / 0.18)) * 0.32;
        }
        data[i] = breeze * 1.2 + chirp;
      }
    } else if (id === 'fire') {
      // Cozy warm fireplace crackle
      let lowRumble = 0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        lowRumble = (lowRumble + 0.01 * (Math.random() * 2 - 1)) / 1.01;
        const crackle = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.75 : 0;
        data[i] = lowRumble * 2.5 + crackle;
      }
    } else if (id === 'tibetan') {
      // 432 Hz healing Tibetan singing bowl with harmonic shimmer
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const shimmer = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
        const f1 = Math.sin(2 * Math.PI * 432.0 * t);
        const f2 = Math.sin(2 * Math.PI * 864.0 * t) * 0.35;
        const f3 = Math.sin(2 * Math.PI * 1296.0 * t) * 0.14;
        data[i] = (f1 + f2 + f3) * shimmer * 0.36;
      }
    } else {
      synthHandled = false;
    }

    if (synthHandled) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (id === 'womb') {
        filter.type = 'lowpass';
        filter.frequency.value = 220;
      } else if (id === 'fetalHeartbeat') {
        filter.type = 'bandpass';
        filter.frequency.value = 260;
        filter.Q.value = 1.4;
      } else if (id === 'stream') {
        filter.type = 'bandpass';
        filter.frequency.value = 650;
        filter.Q.value = 1.0;
      } else if (id === 'birds') {
        filter.type = 'lowpass';
        filter.frequency.value = 4200;
      } else if (id === 'fire') {
        filter.type = 'lowpass';
        filter.frequency.value = 2800;
      } else if (id === 'tibetan') {
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 0.8;
      } else if (id === 'lofi' || id === 'nightPad') {
        filter.type = 'lowpass';
        filter.frequency.value = id === 'lofi' ? 1800 : 900;
        filter.Q.value = 0.7;
      } else if (id === 'rain' || id === 'waves' || id === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 2200;
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
        sleepTimerId = setTimeout(() => stopSound(), timerMinutes * 60 * 1000);
      }

      notify();
      return true;
    }
  } catch (e) {
    console.warn('Procedural synth error:', e);
  }

  currentSoundId = id;
  notify();
  return false;
}

export function stopSound() {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {}
    currentSource = null;
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch (e) {}
    currentAudioElement = null;
  }
  currentGain = null;
  currentSoundId = null;
  currentTimerEndTime = null;
  currentTimerMinutes = null;
  if (sleepTimerId) {
    clearTimeout(sleepTimerId);
    sleepTimerId = null;
  }
  notify();
}

export function setVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (currentAudioElement) {
    try { currentAudioElement.volume = currentVolume; } catch (e) {}
  }
  if (currentGain && audioCtx) {
    try {
      currentGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    } catch (e) {
      currentGain.gain.value = currentVolume;
    }
  }
  notify();
}

export function extendTimer(extraMinutes = 15) {
  if (!currentSoundId) return null;
  const now = Date.now();
  const base = currentTimerEndTime && currentTimerEndTime > now ? currentTimerEndTime : now;
  const newEnd = base + extraMinutes * 60 * 1000;
  if (sleepTimerId) clearTimeout(sleepTimerId);
  currentTimerEndTime = newEnd;
  currentTimerMinutes = Math.round((newEnd - now) / 60000);
  sleepTimerId = setTimeout(() => stopSound(), Math.max(1000, newEnd - now));
  notify();
  return currentTimerEndTime;
}

export function setSoundTimer(minutes) {
  if (sleepTimerId) clearTimeout(sleepTimerId);
  if (minutes && minutes > 0) {
    currentTimerMinutes = minutes;
    currentTimerEndTime = Date.now() + minutes * 60 * 1000;
    sleepTimerId = setTimeout(() => stopSound(), minutes * 60 * 1000);
  } else {
    currentTimerMinutes = 0;
    currentTimerEndTime = null;
  }
  notify();
}

export function getCurrentSound() {
  return {
    soundId: currentSoundId,
    isPlaying: !!currentSource || !!currentAudioElement,
    volume: currentVolume,
    timerMinutes: currentTimerMinutes,
    timerEndTime: currentTimerEndTime,
  };
}

export function addSoundListener(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Gentle Harmonic Acoustic Breath Cues (Inhale / Hold / Exhale)
export function playBreathCue(phase = 'inhale') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';

    if (phase === 'inhale') {
      // Warm rising restorative tone: 432 Hz -> 528 Hz (Love & Miracles frequency)
      osc.frequency.setValueAtTime(432, now);
      osc.frequency.exponentialRampToValueAtTime(528, now + 0.8);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (phase === 'hold') {
      // Serene steady bell: 440 Hz
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (phase === 'exhale') {
      // Gentle releasing tone: 528 Hz -> 360 Hz (Deep exhale letting go)
      osc.frequency.setValueAtTime(528, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 1.0);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.20, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.4);
    }
  } catch (e) {
    // ignore audio errors
  }
}

// Pleasant Two-Tone Bell Chime for Notifications & Reminders
export function playNotificationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Bell 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.65);

    // Bell 2: B5 (987.77 Hz) shimmering chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, now + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.18);

    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0.32, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.95);
  } catch (e) {
    // ignore
  }
}


// Short premium interaction cues for tool taps, completion and timers.
export function playActionCue(kind = 'soft') {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === 'kick' ? 'triangle' : 'sine';
    const start = kind === 'timer' ? 330 : kind === 'complete' ? 587.33 : kind === 'kick' ? 420 : 360;
    const end = kind === 'kick' ? 520 : kind === 'timer' ? 392 : start * 1.18;
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(end, now + 0.09);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(kind === 'kick' ? 0.16 : 0.11, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
    return true;
  } catch (e) {
    return false;
  }
}
