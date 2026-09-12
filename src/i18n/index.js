import { tr } from './tr.js';
import { en } from './en.js';

export const translations = { tr, en };

/**
 * Resolves a dotted key from a translations dictionary.
 * Example: t('nav.today', 'en') => 'Today'
 * Interpolation: t('pregnancy.babyAge', 'en', { days: 12 }) => 'Baby is 12 days old'
 */
export function t(key, lang = 'tr', params = {}) {
  const currentLang = (lang === 'en' || lang === 'tr') ? lang : 'tr';
  const dict = translations[currentLang] || translations.tr;
  const fallbackDict = translations.tr;

  const getFromDict = (d, path) => {
    const parts = path.split('.');
    let val = d;
    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        return undefined;
      }
    }
    return typeof val === 'string' ? val : undefined;
  };

  let str = getFromDict(dict, key) ?? getFromDict(fallbackDict, key);

  if (!str) {
    return key;
  }

  // Parameter replacement: {name}, {count}, etc.
  if (params && typeof params === 'object') {
    for (const [pKey, pVal] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
  }

  return str;
}

export function createTranslator(lang = 'tr') {
  return (key, params) => t(key, lang, params);
}
