// Momora Editorial Text-to-Speech Engine
// Supports Web Speech API (Chrome, Safari, iOS, Android Web) & expo-speech on native

let ExpoSpeech = null;
try {
  ExpoSpeech = require('expo-speech');
} catch (e) {
  ExpoSpeech = null;
}

let isSpeakingActive = false;
let currentUtteranceIndex = 0;
let utteranceQueue = [];
let onDoneCallback = null;
let onStartCallback = null;

function getCleanSentences(text) {
  if (!text) return [];
  // Split long texts into natural breathing sentences so browser speech synthesis doesn't cut out
  return text
    .replace(/[•💡⚠️🌱✨✓]/g, '')
    .split(/(?<=[.?!;:])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function compileArticleSpeechText(article, lang = 'tr') {
  if (!article) return '';
  const isEn = lang === 'en';
  const parts = [];

  const title = isEn ? (article.titleEn || article.title) : article.title;
  if (title) parts.push(title + '.');

  const subtitle = isEn ? (article.subtitleEn || article.subtitle) : article.subtitle;
  if (subtitle) parts.push(subtitle + '.');

  const keyPoints = isEn ? (article.keyPointsEn || article.keyPoints) : article.keyPoints;
  if (keyPoints && keyPoints.length > 0) {
    parts.push(isEn ? 'Key takeaways:' : 'Öne çıkan noktalar:');
    keyPoints.forEach(kp => parts.push(kp + '.'));
  }

  if (article.sections && article.sections.length > 0) {
    article.sections.forEach(sec => {
      const secTitle = isEn ? (sec.titleEn || sec.title) : sec.title;
      const secText = isEn ? (sec.textEn || sec.text) : sec.text;
      const secTip = isEn ? (sec.tipEn || sec.tip) : sec.tip;
      if (secTitle) parts.push(secTitle + '.');
      if (secText) parts.push(secText);
      if (secTip) parts.push(secTip);
    });
  } else if (article.paragraphs && article.paragraphs.length > 0) {
    article.paragraphs.forEach(p => parts.push(p));
  }

  return parts.join(' ');
}

export function stopSpeech() {
  isSpeakingActive = false;
  utteranceQueue = [];
  currentUtteranceIndex = 0;

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  if (ExpoSpeech && typeof ExpoSpeech.stop === 'function') {
    try {
      ExpoSpeech.stop();
    } catch (e) {}
  }

  if (onDoneCallback) {
    const cb = onDoneCallback;
    onDoneCallback = null;
    cb();
  }
}

export function isSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking || isSpeakingActive;
  }
  return isSpeakingActive;
}

export function speakText(text, options = {}) {
  const {
    lang = 'tr',
    rate = 0.95,
    pitch = 1.0,
    onStart,
    onDone,
    onError,
  } = options;

  stopSpeech();

  if (!text || !text.trim()) {
    onDone && onDone();
    return;
  }

  isSpeakingActive = true;
  onDoneCallback = onDone;
  onStartCallback = onStart;

  const targetLang = lang === 'en' ? 'en-US' : 'tr-TR';

  // 1. Browser Web Speech API (Highest fidelity, zero dependency on web)
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();

      const sentences = getCleanSentences(text);
      if (sentences.length === 0) {
        isSpeakingActive = false;
        onDone && onDone();
        return;
      }

      utteranceQueue = sentences;
      currentUtteranceIndex = 0;

      const voices = window.speechSynthesis.getVoices() || [];
      const matchingVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang === 'en' ? 'en' : 'tr'))
        || voices.find(v => v.default);

      function speakNextSentence() {
        if (!isSpeakingActive) return;
        if (currentUtteranceIndex >= utteranceQueue.length) {
          isSpeakingActive = false;
          if (onDoneCallback) {
            const cb = onDoneCallback;
            onDoneCallback = null;
            cb();
          }
          return;
        }

        const currentText = utteranceQueue[currentUtteranceIndex];
        const utterance = new window.SpeechSynthesisUtterance(currentText);
        utterance.lang = targetLang;
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (matchingVoice) utterance.voice = matchingVoice;

        utterance.onstart = () => {
          if (currentUtteranceIndex === 0 && onStartCallback) {
            onStartCallback();
          }
        };

        utterance.onend = () => {
          currentUtteranceIndex++;
          speakNextSentence();
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis error:', e);
          currentUtteranceIndex++;
          if (currentUtteranceIndex >= utteranceQueue.length) {
            isSpeakingActive = false;
            if (onDoneCallback) {
              const cb = onDoneCallback;
              onDoneCallback = null;
              cb();
            }
          } else {
            speakNextSentence();
          }
        };

        window.speechSynthesis.speak(utterance);
      }

      speakNextSentence();
      return;
    } catch (err) {
      console.warn('Web Speech API initialization failed:', err);
    }
  }

  // 2. Native Expo Speech fallback
  if (ExpoSpeech && typeof ExpoSpeech.speak === 'function') {
    try {
      if (onStart) onStart();
      ExpoSpeech.speak(text, {
        language: targetLang,
        rate,
        pitch,
        onDone: () => {
          isSpeakingActive = false;
          onDone && onDone();
        },
        onError: (err) => {
          console.warn('ExpoSpeech error:', err);
          isSpeakingActive = false;
          onError && onError(err);
          onDone && onDone();
        },
      });
      return;
    } catch (err) {
      console.warn('ExpoSpeech execution error:', err);
      isSpeakingActive = false;
      onDone && onDone();
    }
  }

  // If neither speech engine is supported, gracefully invoke onDone after short delay
  isSpeakingActive = false;
  setTimeout(() => {
    onDone && onDone();
  }, 1000);
}
