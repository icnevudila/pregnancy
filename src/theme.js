import { Platform } from 'react-native';

export const colors = {
  canvas: '#FAF7F3', ink: '#252044', muted: '#7C7582', purple: '#9A779A',
  line: '#ECE5E2', white: '#FFFCF9', blush: '#F5E7E8', lavender: '#EEE7F4',
  sage: '#79A58D', pink: '#E887AE', blue: '#919DDC', lilac: '#B3A0DC',
};
export const fonts = {
  regular: Platform.OS === 'web' ? 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Lato',
  bold: Platform.OS === 'web' ? 'LatoBold, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'LatoBold',
  script: Platform.OS === 'web' ? 'Caveat, cursive, sans-serif' : 'Caveat'
};
export const assets = {
  pregnancy: require('../assets/pregnancy.png'),
  mother: require('../assets/mother-baby.png'),
  baby: require('../assets/baby.png'),
  fetus: require('../assets/fetus.png'),
};
export const shadow = { shadowColor: '#6E5364', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 9, elevation: 2 };
