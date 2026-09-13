import { Platform } from 'react-native';

// ─── 1. COLOR SEMANTICS ───────────────────────────────────────────────────────
export const colors = {
  // Brand foundation
  canvas: '#FAF7F3',        // Warm ivory background
  white: '#FFFCF9',         // Warm white surface
  ink: '#252044',           // Deep plum / text
  muted: '#7C7582',         // Muted neutral / secondary text
  line: '#ECE5E2',          // Subtle divider / border

  // Accent & functional palette
  purple: '#9A779A',        // Primary mauve / plum
  primarySoft: '#EEE7F4',   // Lavender / soft primary background
  blush: '#F5E7E8',         // Soft rose secondary
  pink: '#E887AE',          // Active rose accent
  sage: '#79A58D',          // Muted mint success / reassurance
  blue: '#919DDC',          // Subdued info blue
  lilac: '#B3A0DC',         // Gentle lilac
  danger: '#C84D58',        // Real destructive risk / warning only
};

// ─── 2. TYPOGRAPHY & FONT ROLES ──────────────────────────────────────────────
export const fonts = {
  regular: Platform.OS === 'web' ? 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Lato',
  bold: Platform.OS === 'web' ? 'LatoBold, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'LatoBold',
  script: Platform.OS === 'web' ? 'Caveat, cursive, sans-serif' : 'Caveat',
};

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontFamily: fonts.bold },
  h1: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold },
  h2: { fontSize: 20, lineHeight: 26, fontFamily: fonts.bold },
  h3: { fontSize: 17, lineHeight: 22, fontFamily: fonts.bold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular },
  bodySmall: { fontSize: 13, lineHeight: 18, fontFamily: fonts.regular },
  caption: { fontSize: 11, lineHeight: 15, fontFamily: fonts.regular },
  overline: { fontSize: 10, lineHeight: 14, letterSpacing: 1.5, fontFamily: fonts.bold },
  timer: { fontSize: 48, lineHeight: 56, fontFamily: fonts.bold },
};

// ─── 3. 4pt SPACING SCALE ────────────────────────────────────────────────────
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
  hero: 48,
};

// ─── 4. RADIUS SCALE ─────────────────────────────────────────────────────────
export const radius = {
  sm: 10,     // small controls, pills
  md: 14,     // text inputs, action buttons
  card: 18,   // standard cards
  hero: 24,   // hero cards
  sheet: 30,  // bottom sheets, modal tops
  full: 9999, // circles
};

// ─── 5. SHADOW & ELEVATION ───────────────────────────────────────────────────
export const shadow = {
  shadowColor: '#6E5364',
  shadowOpacity: 0.07,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 9,
  elevation: 2,
};

// ─── 6. MOTION TIMINGS ───────────────────────────────────────────────────────
export const motion = {
  short: 180,
  standard: 260,
  deliberate: 400,
};

export const assets = {
  pregnancy: require('../assets/pregnancy.png'),
  mother: require('../assets/mother-baby.png'),
  baby: require('../assets/baby.png'),
  fetus: require('../assets/fetus.png'),
};

