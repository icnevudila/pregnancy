// ─── MOMORA · Animasyon Yardımcıları ─────────────────────────────────────────
// Saf React Native Animated API — yeni paket gerekmez, Expo Go'da çalışır

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Meyve SVG'si için "nefes alır" gibi hafif scale döngüsü
 * @param {number} min  — minimum scale (varsayılan 0.95)
 * @param {number} max  — maximum scale (varsayılan 1.05)
 * @param {number} duration — yarım salınım süresi ms
 * @returns {Animated.Value} scale değeri
 */
export function usePulse(min = 0.95, max = 1.05, duration = 1600) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: max,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: min,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []); // eslint-disable-line
  return scale;
}

/**
 * Ekrana ilk girişte fade-in efekti
 * @param {number} duration — ms
 * @param {number} delay    — ms gecikme
 */
export function useFadeIn(duration = 320, delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, []); // eslint-disable-line
  return opacity;
}

/**
 * Değer değişince içeriği cross-fade ile yeniler
 * key değeri değiştiğinde yeni bir fade başlar
 */
export function useCrossFade(key, duration = 260) {
  const opacity = useRef(new Animated.Value(1)).current;
  const prevKey = useRef(key);
  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [key]); // eslint-disable-line
  return opacity;
}

/**
 * Aşağıdan yukarı slide-in — modal ve kartlar için
 */
export function useSlideUp(duration = 380) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.8,
        useNativeDriver: false,
      }),
    ]).start();
  }, []); // eslint-disable-line
  return { translateY, opacity };
}
