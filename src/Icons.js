import React from 'react';
import { View, Image, Text } from 'react-native';
import Svg, {
  Path, Circle, Ellipse, Rect, Defs, LinearGradient, RadialGradient,
  Stop, G, Line,
} from 'react-native-svg';
import { colors } from './theme';
import { generatedAssets } from './generatedAssets';

// ─── Genel ikon yolları ───────────────────────────────────────────────────────
const paths = {
  home: 'M3 10 12 3 21 10V21H15V14H9V21H3Z',
  track: 'M5 4H19V20L16 22 12 19 8 22 5 20ZM8 8H16M8 12H11M14 11V15M12 13H16',
  search: 'M16 16 21 21M18 10A8 8 0 1 1 2 10 8 8 0 0 1 18 10',
  community: 'M9 9A3 3 0 1 0 9 3 3 3 0 0 0 9 9M15 8A3 3 0 1 0 18 3M2 21V17A7 7 0 0 1 14 13M6 21V17A6 6 0 0 1 12 11 6 6 0 0 1 18 17V21ZM20 12Q23 14 23 18V21',
  profile: 'M16 6A4 4 0 1 1 8 6 4 4 0 0 1 16 6M4 22V19A8 8 0 0 1 20 19V22Z',
  bell: 'M5 16V10A7 7 0 0 1 19 10V16L21 19H3ZM10 22H14M12 1V3',
  chevron: 'M9 5 16 12 9 19', down: 'M6 9 12 15 18 9', close: 'M6 6 18 18M6 18 18 6',
  arrow: 'M4 12H20M14 6 20 12 14 18', plus: 'M12 5V19M5 12H19',
  calendar: 'M4 5H20V22H4ZM8 2V8M16 2V8M4 10H20M8 14H10M14 14H16M8 18H10',
  drop: 'M12 2C10 6 5 11 5 16A7 7 0 0 0 19 16C19 11 14 6 12 2ZM8 15Q7 19 12 20',
  cup: 'M6 4H18L16 22H8ZM6 8Q12 6 18 8M10 1V4M14 2V4',
  pill: 'M5 11 12 4A5 5 0 0 1 20 11L13 18A5 5 0 0 1 5 11ZM9 7 17 15',
  moon: 'M20 15A9 9 0 0 1 9 3 9 9 0 1 0 20 15ZM18 2V6M16 4H20',
  bottle: 'M10 1H14V5L16 7V10L18 13V22H6V13L8 10V7L10 5ZM8 10H16M8 16H11M8 19H11',
  nursing: 'M13 6A3 3 0 1 0 7 6 3 3 0 0 0 13 6M8 10Q3 12 3 18Q3 23 10 21L20 17Q23 15 20 13L12 16M8 12 12 16M13 10Q17 8 19 11M12 19 17 22',
  diaper: 'M3 5H21L20 15 15 21H9L4 15ZM3 8H8L9 12H15L16 8H21M5 13Q9 13 9 21M19 13Q15 13 15 21',
  heart: 'M12 21S2 15 2 8A5 5 0 0 1 12 6 5 5 0 0 1 22 8C22 15 12 21 12 21Z',
  send: 'M3 3 22 2 15 22 11 13ZM11 13 22 2M3 3 11 13',
  check: 'M5 12 10 17 20 6',
  chat: 'M21 11A9 9 0 0 1 12 20H7L2 23 4 16A9 9 0 1 1 21 11ZM7 9H17M7 13H13',
  leaf: 'M12 22Q12 7 21 2Q23 15 14 19M12 17Q2 17 3 7Q9 8 12 17',
  bag: 'M4 7H20L22 22H2ZM8 8V5A4 4 0 0 1 16 5V8',
  book: 'M12 5Q6 1 2 4V21Q6 18 12 22Q18 18 22 21V4Q18 1 12 5V22',
  bowl: 'M2 10H22Q21 21 12 21Q3 21 2 10ZM15 10 20 2M2 10Q12 6 22 10',
  soap: 'M8 8H17Q19 8 19 11V22H5V11Q5 8 8 8ZM10 8V4H15M9 2H19V5M8 12H16V18H8Z',
  wipes: 'M3 7H21V21H3ZM3 11H21M8 7Q5 1 11 3Q15 0 17 3L14 7M8 15H16V18H8',
  melon: 'M12 2V5M12 4C2 4 1 12 3 17Q5 23 12 23Q20 23 22 16Q23 6 12 4ZM12 4Q5 15 12 23M12 4Q19 15 12 23M12 4V23',
  ruler: 'M2 5H22V19H2ZM6 5V10M10 5V8M14 5V10M18 5V8',
  scale: 'M12 3C8 3 5 6 5 10H19C19 6 16 3 12 3ZM5 10H19V13H5ZM8 13V20M16 13V20M5 20H19',
  milestone: 'M3 3H21V17H13L12 21L11 17H3ZM7 8H11M7 12H15M13 8H17',
  timer: 'M12 2V5M9 2H15M19 8L20 7M12 7A8 8 0 1 0 20 15A8 8 0 0 0 12 7ZM12 11V15L15 17',
  contraction: 'M2 12H6L9 4L13 20L16 10L18 14H22',
  footprint: 'M11 9C9 9 7 11 7 14C7 17 9 21 12 21C15 21 17 17 17 14C17 11 15 9 13 9M9 5A1.5 1.5 0 1 0 9 2A1.5 1.5 0 0 0 9 5M12 4.5A1.3 1.3 0 1 0 12 2A1.3 1.3 0 0 0 12 4.5M15 5A1.2 1.2 0 1 0 15 2.5A1.2 1.2 0 0 0 15 5M17.5 6.5A1 1 0 1 0 17.5 4.5A1 1 0 0 0 17.5 6.5',
  refresh: 'M20 11A8.1 8.1 0 0 0 4.5 9M4 5V9H8M4 13A8.1 8.1 0 0 0 19.5 15M20 19V15H16',
  clock: 'M12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2ZM12 6V12L16 14',
  sparkle: 'M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z',
  folder: 'M22 19A2 2 0 0 1 20 21H4A2 2 0 0 1 2 19V5A2 2 0 0 1 4 3H9L11 6H20A2 2 0 0 1 22 8Z',
};

export function Icon({ name, size = 24, color = colors.ink, fill = 'none', strokeWidth = 1.55, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <Path d={paths[name] || paths.heart} fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BrandMark({ size = 45, outline = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 64">
      <Defs>
        <LinearGradient id="petal" x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#CDB7D1" /><Stop offset="1" stopColor="#846087" />
        </LinearGradient>
        <LinearGradient id="peach" x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#F0D3CC" /><Stop offset="1" stopColor="#D5A894" />
        </LinearGradient>
      </Defs>
      <Path d="M29 57C8 44 1 31 5 19C9 7 20 10 25 17C23 1 44 0 48 17C51 29 42 46 29 57Z" fill={outline ? 'none' : 'url(#petal)'} stroke={outline ? '#AA79B2' : colors.canvas} strokeWidth="2" />
      <Path d="M29 58C19 44 20 30 30 23C39 17 51 17 55 25C61 41 41 56 29 58Z" fill={outline ? 'none' : 'url(#peach)'} stroke={outline ? '#AA79B2' : colors.canvas} strokeWidth="2.3" />
    </Svg>
  );
}

export function MoodFace({ index, size = 43 }) {

  const tone = ['#D9E6B5', '#FFE3A0', '#DCE0FB', '#FFD3B6', '#FAC9CA'][index];
  const mouth = ['M13 25Q22 38 31 25Z', 'M15 27Q22 33 29 27', 'M16 29H28', 'M16 31Q22 25 28 31', 'M15 32Q22 23 29 32'][index];
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      <Defs>
        <RadialGradient id={'face' + index} cx="40%" cy="30%" r="70%">
          <Stop stopColor="#FFF9DE" /><Stop offset="1" stopColor={tone} />
        </RadialGradient>
      </Defs>
      <Circle cx="22" cy="22" r="21" fill={tone} opacity="0.4" />
      <Circle cx="22" cy="22" r="16" fill={'url(#face' + index + ')'} stroke={tone} />
      <Ellipse cx="16" cy="21" rx="1.9" ry="2.6" fill="#625541" />
      <Ellipse cx="28" cy="21" rx="1.9" ry="2.6" fill="#625541" />
      <Path d={mouth} fill={index === 0 ? '#68574B' : 'none'} stroke="#68574B" strokeWidth="1.8" strokeLinecap="round" />
      {index > 2 && <Path d="M13 15 18 17M26 17 31 15" stroke="#967C69" strokeWidth="1.5" strokeLinecap="round" />}
      {index === 0 && <Path d="M16 27H28" stroke="white" strokeWidth="2" />}
    </Svg>
  );
}

export function ProductArt({ type, size = 56 }) {
  const img = generatedAssets['cat_' + type] || generatedAssets['prod_' + type] || (type === 'jar' ? generatedAssets['prod_baby_food'] : null);
  if (img) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={img} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
    );
  }

  const tone = { diaper: '#92CBE1', wipes: '#8BAB79', bowl: '#DC956F', soap: '#86BDB3', jar: '#B29A65' }[type];
  return (
    <Svg width={size} height={size} viewBox="0 0 70 70">
      <Defs>
        <LinearGradient id={'product' + type} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#FFFEF8" /><Stop offset="1" stopColor={tone} />
        </LinearGradient>
      </Defs>
      <Ellipse cx="35" cy="61" rx="23" ry="3" fill={tone} opacity="0.16" />
      {type === 'jar' ? (
        <G>
          <Rect x="20" y="17" width="30" height="41" rx="7" fill="#E4C69A" />
          <Rect x="19" y="13" width="32" height="9" rx="3" fill="#758356" />
          <Rect x="22" y="29" width="26" height="20" rx="2" fill="#FFFADE" />
          <Path d="M29 44Q25 32 34 34Q44 30 42 42Z" fill="#DA9855" />
          <Path d="M34 34 37 29" stroke="#718851" strokeWidth="3" />
        </G>
      ) : (
        <G transform="translate(9 9) scale(2.15)">
          <Path d={paths[type] || paths.bag} fill={'url(#product' + type + ')'} stroke={tone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      )}
    </Svg>
  );
}

// ─── FruitArt — Haftalık Meyve İllüstrasyonları ──────────────────────────────
// Her meyve 120×120 viewBox üzerinde, gradient + gölge ile

const fruitDefs = {
  // Küçük tohumlar (hf 4-5)
  seed: {
    bg: ['#F5EDD8', '#E8D5B0'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="75" rx="28" ry="5" fill="#C8A96E" opacity="0.2" />
        <Ellipse cx="60" cy="60" rx="18" ry="22" fill="url(#fg)" />
        <Ellipse cx="53" cy="52" rx="5" ry="7" fill="white" opacity="0.3" />
        <Ellipse cx="60" cy="60" rx="18" ry="22" fill="none" stroke="#C8A96E" strokeWidth="1.5" opacity="0.4" />
        {/* küçük çizgiler */}
        <Path d="M60 42 Q65 50 62 60 Q58 70 60 78" stroke="#C8A96E" strokeWidth="1" opacity="0.4" fill="none" />
      </G>
    ),
  },

  // Bezelye (hf 6)
  pea: {
    bg: ['#E8F5E0', '#A8D888'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="78" rx="32" ry="5" fill="#6BA84F" opacity="0.18" />
        {/* bakla */}
        <Path d="M25 60 Q25 30 60 28 Q95 30 95 60 Q95 85 60 87 Q25 85 25 60Z" fill="url(#fg)" />
        <Path d="M25 60 Q25 30 60 28 Q95 30 95 60 Q95 85 60 87 Q25 85 25 60Z" fill="none" stroke="#6BA84F" strokeWidth="2" />
        {/* 3 bezelye içinde */}
        <Circle cx="38" cy="58" r="9" fill="#9DD67A" opacity="0.7" />
        <Circle cx="60" cy="55" r="9" fill="#9DD67A" opacity="0.7" />
        <Circle cx="82" cy="58" r="9" fill="#9DD67A" opacity="0.7" />
        {/* highlight */}
        <Path d="M30 45 Q40 35 55 33" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />
      </G>
    ),
  },

  // Yaban mersini (hf 7)
  blueberry: {
    bg: ['#EAE0F5', '#8A6EBF'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="80" rx="26" ry="4" fill="#5A4580" opacity="0.2" />
        <Circle cx="60" cy="60" r="30" fill="url(#fg)" />
        {/* yıldız tepesi */}
        <Path d="M60 30 L62 35 L58 35Z M55 32 L57 37 L53 36Z M65 32 L67 36 L63 37Z" fill="#5A4580" opacity="0.8" />
        {/* highlight */}
        <Ellipse cx="50" cy="48" rx="8" ry="5" fill="white" opacity="0.25" />
        {/* desen */}
        <Circle cx="60" cy="60" r="30" fill="none" stroke="#6B4FA0" strokeWidth="1.5" opacity="0.3" />
      </G>
    ),
  },

  // Ahududu (hf 8)
  raspberry: {
    bg: ['#FFE0E8', '#E8607A'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="82" rx="26" ry="4" fill="#C04060" opacity="0.2" />
        {/* drupecik kümesi */}
        {[
          [60, 45], [48, 52], [72, 52],
          [42, 62], [60, 60], [78, 62],
          [48, 72], [72, 72], [60, 76],
        ].map(([cx, cy], i) => (
          <G key={i}>
            <Circle cx={cx} cy={cy} r="10" fill="url(#fg)" />
            <Circle cx={cx - 3} cy={cy - 3} r="3" fill="white" opacity="0.3" />
          </G>
        ))}
        {/* sap */}
        <Path d="M60 35 Q62 25 58 18" stroke="#4A7A30" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M56 28 Q52 22 48 24" stroke="#4A7A30" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Üzüm (hf 9)
  grape: {
    bg: ['#EEE0F5', '#8B5CF6'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="90" rx="18" ry="3" fill="#6D3FB5" opacity="0.2" />
        {/* sap ve yaprak */}
        <Path d="M60 22 Q60 15 60 12" stroke="#5C7A30" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M60 18 Q52 10 44 14 Q50 22 60 18Z" fill="#6A8A40" opacity="0.8" />
        {/* üzüm taneleri — piramit düzeni */}
        {[
          [60, 32],
          [48, 44], [72, 44],
          [37, 56], [60, 56], [83, 56],
          [44, 68], [71, 68],
          [57, 80],
        ].map(([cx, cy], i) => (
          <G key={i}>
            <Circle cx={cx} cy={cy} r="12" fill="url(#fg)" />
            <Ellipse cx={cx - 3} cy={cy - 3} rx="4" ry="3" fill="white" opacity="0.25" />
          </G>
        ))}
      </G>
    ),
  },

  // Kümkuat (hf 10)
  kumquat: {
    bg: ['#FFF0D0', '#F5A623'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="85" rx="22" ry="4" fill="#C87820" opacity="0.2" />
        <Ellipse cx="60" cy="62" rx="24" ry="30" fill="url(#fg)" />
        {/* dikey çizgiler */}
        <Path d="M60 32 Q58 47 60 92" stroke="#C87820" strokeWidth="1" opacity="0.3" fill="none" />
        <Path d="M49 35 Q44 55 46 85" stroke="#C87820" strokeWidth="1" opacity="0.25" fill="none" />
        <Path d="M71 35 Q76 55 74 85" stroke="#C87820" strokeWidth="1" opacity="0.25" fill="none" />
        {/* highlight */}
        <Ellipse cx="50" cy="48" rx="8" ry="10" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 32 Q61 22 59 16" stroke="#5A8030" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M59 20 Q53 14 50 17" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // İncir (hf 11)
  fig: {
    bg: ['#F0E0F0', '#8B4F8B'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="88" rx="25" ry="4" fill="#6B3068" opacity="0.2" />
        {/* incir gövdesi — armut şekli */}
        <Path d="M60 28 C45 28 32 42 32 60 C32 78 44 92 60 92 C76 92 88 78 88 60 C88 42 75 28 60 28Z" fill="url(#fg)" />
        {/* üst dar kısım */}
        <Path d="M55 28 C55 22 65 22 65 28" fill="#7A3878" opacity="0.5" />
        {/* sap */}
        <Path d="M60 28 Q60 20 58 14" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* highlight */}
        <Ellipse cx="48" cy="50" rx="8" ry="12" fill="white" opacity="0.2" />
        {/* iç desen */}
        <Ellipse cx="60" cy="65" rx="12" ry="10" fill="#C080B0" opacity="0.3" />
      </G>
    ),
  },

  // Erik (hf 12)
  plum: {
    bg: ['#F0D8F0', '#9B3B7A'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="86" rx="27" ry="4" fill="#7A2860" opacity="0.2" />
        <Circle cx="60" cy="62" r="30" fill="url(#fg)" />
        {/* orta çizgi */}
        <Path d="M60 32 Q57 47 58 92" stroke="#7A2860" strokeWidth="1.5" opacity="0.3" fill="none" />
        {/* highlight */}
        <Ellipse cx="48" cy="48" rx="10" ry="12" fill="white" opacity="0.2" />
        {/* sap */}
        <Path d="M60 32 Q62 22 60 15" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M60 20 Q55 13 52 16" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Limon (hf 13)
  lemon: {
    bg: ['#FFFBD0', '#F5D020'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="85" rx="30" ry="5" fill="#C8A800" opacity="0.2" />
        {/* gövde */}
        <Ellipse cx="60" cy="60" rx="33" ry="26" fill="url(#fg)" />
        {/* uç tümsekler */}
        <Ellipse cx="27" cy="60" rx="5" ry="4" fill="#F5D020" opacity="0.7" />
        <Ellipse cx="93" cy="60" rx="5" ry="4" fill="#F5D020" opacity="0.7" />
        {/* iç doku çizgileri */}
        <Path d="M27 60 Q60 45 93 60" stroke="white" strokeWidth="1" opacity="0.3" fill="none" />
        <Path d="M27 60 Q60 75 93 60" stroke="white" strokeWidth="1" opacity="0.3" fill="none" />
        {/* highlight */}
        <Ellipse cx="45" cy="48" rx="10" ry="7" fill="white" opacity="0.3" />
        {/* sap */}
        <Path d="M60 34 Q61 24 59 18" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M62 22 Q68 16 66 12" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Şeftali (hf 14)
  peach: {
    bg: ['#FFE8D8', '#F5956A'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="28" ry="4" fill="#C86840" opacity="0.2" />
        <Circle cx="60" cy="61" r="29" fill="url(#fg)" />
        {/* orta yarık */}
        <Path d="M60 32 Q57 47 58 90" stroke="#C86840" strokeWidth="2" opacity="0.3" fill="none" />
        {/* alt tümsek */}
        <Ellipse cx="60" cy="88" rx="10" ry="5" fill="#F5956A" opacity="0.4" />
        {/* highlight */}
        <Ellipse cx="47" cy="47" rx="10" ry="12" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 32 Q61 22 59 15" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M63 18 Q68 11 65 8" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Elma (hf 15)
  apple: {
    bg: ['#FFE0E0', '#E84040'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="29" ry="4" fill="#B83030" opacity="0.2" />
        <Circle cx="60" cy="62" r="29" fill="url(#fg)" />
        {/* üst çentik */}
        <Path d="M60 33 Q57 36 60 40 Q63 36 60 33Z" fill="#B83030" opacity="0.4" />
        {/* orta çizgi */}
        <Path d="M60 33 Q57 52 58 91" stroke="#B83030" strokeWidth="1.5" opacity="0.25" fill="none" />
        {/* highlight */}
        <Ellipse cx="46" cy="48" rx="10" ry="12" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 33 Q62 23 60 17" stroke="#5A3010" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* yaprak */}
        <Path d="M61 22 Q70 14 74 18 Q68 26 61 22Z" fill="#5A8030" />
        <Path d="M61 22 Q67 16 67 18" stroke="#7AA840" strokeWidth="1" fill="none" />
      </G>
    ),
  },

  // Avokado (hf 16)
  avocado: {
    bg: ['#E0F0D0', '#5A8A30'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="90" rx="26" ry="4" fill="#3A6820" opacity="0.2" />
        {/* dış kabuk — armut şekli */}
        <Path d="M60 20 C48 20 34 36 34 58 C34 78 44 94 60 94 C76 94 86 78 86 58 C86 36 72 20 60 20Z" fill="url(#fg)" />
        {/* iç açık yeşil */}
        <Path d="M60 30 C50 30 40 44 40 60 C40 76 48 88 60 88 C72 88 80 76 80 60 C80 44 70 30 60 30Z" fill="#B8D898" opacity="0.7" />
        {/* çekirdek */}
        <Ellipse cx="60" cy="62" rx="14" ry="16" fill="#C8884A" />
        <Ellipse cx="56" cy="57" rx="5" ry="6" fill="#E0A86A" opacity="0.5" />
        {/* sap */}
        <Path d="M60 20 Q61 12 59 7" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* highlight dış */}
        <Ellipse cx="46" cy="40" rx="6" ry="10" fill="white" opacity="0.2" />
      </G>
    ),
  },

  // Armut (hf 17)
  pear: {
    bg: ['#F0F8D0', '#A8C840'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="89" rx="28" ry="4" fill="#78A820" opacity="0.2" />
        {/* gövde */}
        <Path d="M60 38 C44 38 32 54 32 68 C32 82 44 92 60 92 C76 92 88 82 88 68 C88 54 76 38 60 38Z" fill="url(#fg)" />
        {/* üst dar kısım */}
        <Ellipse cx="60" cy="38" rx="12" ry="16" fill="url(#fg)" />
        {/* orta çizgi */}
        <Path d="M60 22 Q57 55 59 90" stroke="#78A820" strokeWidth="1" opacity="0.3" fill="none" />
        {/* highlight */}
        <Ellipse cx="46" cy="50" rx="9" ry="13" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 22 Q61 13 59 7" stroke="#5A3010" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* yaprak */}
        <Path d="M60 15 Q69 7 73 11 Q67 19 60 15Z" fill="#5A8030" />
      </G>
    ),
  },

  // Tatlı patates (hf 18)
  sweetpotato: {
    bg: ['#FFE8C0', '#D4882A'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="80" rx="35" ry="5" fill="#A86820" opacity="0.2" />
        {/* gövde — yatay oval */}
        <Ellipse cx="60" cy="62" rx="38" ry="22" fill="url(#fg)" />
        {/* dikey çizgiler */}
        <Path d="M60 40 Q56 52 58 84" stroke="#A86820" strokeWidth="1.5" opacity="0.3" fill="none" />
        <Path d="M40 44 Q36 58 38 80" stroke="#A86820" strokeWidth="1" opacity="0.25" fill="none" />
        <Path d="M80 44 Q84 58 82 80" stroke="#A86820" strokeWidth="1" opacity="0.25" fill="none" />
        {/* highlight */}
        <Ellipse cx="40" cy="52" rx="10" ry="7" fill="white" opacity="0.25" />
        {/* küçük çıkıntılar */}
        <Ellipse cx="22" cy="62" rx="5" ry="4" fill="#D4882A" opacity="0.6" />
        <Ellipse cx="98" cy="62" rx="5" ry="4" fill="#D4882A" opacity="0.6" />
      </G>
    ),
  },

  // Mango (hf 19)
  mango: {
    bg: ['#FFE8A0', '#F5A020'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="88" rx="28" ry="4" fill="#C07810" opacity="0.2" />
        {/* gövde — yumurta şekli */}
        <Path d="M60 22 C44 22 34 38 34 60 C34 78 44 92 60 92 C74 92 86 78 86 60 C86 42 74 22 60 22Z" fill="url(#fg)" />
        {/* kırmızı yanak */}
        <Ellipse cx="74" cy="55" rx="14" ry="18" fill="#F56020" opacity="0.35" />
        {/* iç doku */}
        <Path d="M60 22 Q58 40 60 92" stroke="#C07810" strokeWidth="1" opacity="0.2" fill="none" />
        {/* highlight */}
        <Ellipse cx="45" cy="42" rx="10" ry="12" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 22 Q61 12 59 6" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M62 10 Q67 4 65 1" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Muz (hf 20)
  banana: {
    bg: ['#FFFAC0', '#F5D820'],
    render: () => (
      <G>
        <Ellipse cx="55" cy="85" rx="30" ry="4" fill="#C8A800" opacity="0.2" />
        {/* muz şekli — eğri */}
        <Path d="M28 28 C22 38 20 55 25 68 C30 80 42 88 60 87 C76 86 88 78 90 65 C92 54 86 42 80 36 C76 32 70 32 66 38 C62 44 62 56 60 64 C58 72 52 78 44 75 C36 72 32 62 32 52 C32 42 34 34 28 28Z" fill="url(#fg)" />
        {/* highlight */}
        <Path d="M32 36 C28 46 28 58 33 68" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.3" fill="none" />
        {/* uç */}
        <Ellipse cx="28" cy="28" rx="5" ry="4" fill="#C8A800" />
        <Ellipse cx="90" cy="65" rx="5" ry="4" fill="#C8A800" />
        {/* dikey çizgiler */}
        <Path d="M45 30 C40 48 40 65 46 80" stroke="#C8A800" strokeWidth="1" opacity="0.3" fill="none" />
        <Path d="M60 28 C56 44 56 62 60 78" stroke="#C8A800" strokeWidth="1" opacity="0.3" fill="none" />
      </G>
    ),
  },

  // Havuç (hf 21)
  carrot: {
    bg: ['#FFE8C0', '#F57520'],
    render: () => (
      <G>
        {/* yapraklar */}
        <Path d="M50 18 Q48 8 44 6 Q46 14 42 20" stroke="#4A8A20" strokeWidth="2" fill="#6AAA30" strokeLinecap="round" />
        <Path d="M60 14 Q60 4 56 2 Q58 10 54 16" stroke="#4A8A20" strokeWidth="2" fill="#6AAA30" strokeLinecap="round" />
        <Path d="M70 18 Q72 8 76 6 Q74 14 78 20" stroke="#4A8A20" strokeWidth="2" fill="#6AAA30" strokeLinecap="round" />
        {/* havuç gövdesi */}
        <Path d="M44 22 L76 22 L65 90 L55 90 Z" fill="url(#fg)" />
        <Path d="M44 22 L76 22 L65 90 L55 90 Z" fill="none" stroke="#C85510" strokeWidth="1.5" opacity="0.3" />
        {/* yatay çizgiler */}
        <Path d="M43 35 L77 35" stroke="#C85510" strokeWidth="1" opacity="0.3" />
        <Path d="M47 50 L73 50" stroke="#C85510" strokeWidth="1" opacity="0.3" />
        <Path d="M51 65 L69 65" stroke="#C85510" strokeWidth="1" opacity="0.3" />
        {/* highlight */}
        <Path d="M49 25 L52 85" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
      </G>
    ),
  },

  // Hindistan cevizi (hf 22)
  coconut: {
    bg: ['#F0E0C8', '#8B6040'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="85" rx="30" ry="5" fill="#5A3820" opacity="0.2" />
        <Circle cx="60" cy="60" r="30" fill="url(#fg)" />
        {/* doku çizgileri */}
        <Path d="M35 50 Q50 38 85 50" stroke="#5A3820" strokeWidth="1.5" opacity="0.3" fill="none" />
        <Path d="M32 62 Q52 50 88 62" stroke="#5A3820" strokeWidth="1.5" opacity="0.3" fill="none" />
        <Path d="M35 74 Q50 65 85 74" stroke="#5A3820" strokeWidth="1.5" opacity="0.3" fill="none" />
        {/* 3 göz */}
        <Circle cx="50" cy="45" r="4" fill="#3A2010" opacity="0.5" />
        <Circle cx="63" cy="42" r="4" fill="#3A2010" opacity="0.5" />
        <Circle cx="57" cy="52" r="4" fill="#3A2010" opacity="0.5" />
        {/* highlight */}
        <Ellipse cx="46" cy="48" rx="9" ry="6" fill="white" opacity="0.2" />
      </G>
    ),
  },

  // Greyfurt (hf 23)
  grapefruit: {
    bg: ['#FFE8E0', '#F5905A'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="86" rx="30" ry="4" fill="#C05020" opacity="0.2" />
        <Circle cx="60" cy="60" r="30" fill="url(#fg)" />
        {/* iç dilimler */}
        {[0, 30, 60, 90, 120, 150].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 60 + 29 * Math.cos(rad);
          const y2 = 60 + 29 * Math.sin(rad);
          return <Line key={i} x1="60" y1="60" x2={x2} y2={y2} stroke="white" strokeWidth="1.5" opacity="0.3" />;
        })}
        <Circle cx="60" cy="60" r="5" fill="white" opacity="0.3" />
        {/* highlight */}
        <Ellipse cx="46" cy="46" rx="10" ry="12" fill="white" opacity="0.2" />
        {/* sap */}
        <Path d="M60 30 Q61 20 59 14" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M62 18 Q68 12 66 8" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Kavun (hf 24 & 34)
  melon: {
    bg: ['#F0FFD8', '#A8C840'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="33" ry="5" fill="#6A9820" opacity="0.2" />
        <Ellipse cx="60" cy="62" rx="34" ry="28" fill="url(#fg)" />
        {/* dikey çizgiler */}
        {[-20, -10, 0, 10, 20].map((offset, i) => (
          <Path key={i} d={`M${60 + offset} 34 Q${58 + offset} 62 ${60 + offset} 90`} stroke="#6A9820" strokeWidth="1" opacity="0.25" fill="none" />
        ))}
        {/* highlight */}
        <Ellipse cx="43" cy="48" rx="10" ry="8" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 34 Q62 24 59 17" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M62 20 Q68 14 66 10" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Karnabahar (hf 25)
  cauliflower: {
    bg: ['#F8F8F0', '#E0DFCC'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="32" ry="5" fill="#A0A080" opacity="0.2" />
        {/* yapraklar */}
        <Path d="M28 70 Q20 60 24 48 Q34 58 30 72Z" fill="#78A840" />
        <Path d="M92 70 Q100 60 96 48 Q86 58 90 72Z" fill="#78A840" />
        <Path d="M38 80 Q28 78 26 65 Q40 68 42 82Z" fill="#6A9830" />
        <Path d="M82 80 Q92 78 94 65 Q80 68 78 82Z" fill="#6A9830" />
        {/* beyaz başlık kümesi */}
        {[
          [60, 42, 14], [44, 50, 12], [76, 50, 12],
          [52, 60, 11], [68, 60, 11], [60, 62, 10],
          [42, 65, 10], [78, 65, 10],
        ].map(([cx, cy, r], i) => (
          <G key={i}>
            <Circle cx={cx} cy={cy} r={r} fill="#F4F4EE" />
            <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#C8C8B0" strokeWidth="1" opacity="0.4" />
            <Ellipse cx={cx - 2} cy={cy - 2} rx={r * 0.4} ry={r * 0.3} fill="white" opacity="0.5" />
          </G>
        ))}
      </G>
    ),
  },

  // Salatalık (hf 26)
  cucumber: {
    bg: ['#D8F0D0', '#50A840'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="90" rx="18" ry="4" fill="#308830" opacity="0.2" />
        {/* gövde */}
        <Rect x="38" y="18" width="44" height="72" rx="22" fill="url(#fg)" />
        {/* dikey çizgiler */}
        {[-10, 0, 10].map((offset, i) => (
          <Path key={i} d={`M${60 + offset} 20 Q${58 + offset} 54 ${60 + offset} 88`} stroke="#308830" strokeWidth="1.5" opacity="0.3" fill="none" />
        ))}
        {/* yatay çizgiler */}
        {[35, 50, 65].map((y, i) => (
          <Path key={i} d={`M40 ${y} Q60 ${y - 3} 80 ${y}`} stroke="#308830" strokeWidth="1" opacity="0.2" fill="none" />
        ))}
        {/* highlight */}
        <Ellipse cx="48" cy="36" rx="7" ry="14" fill="white" opacity="0.25" />
        {/* sap */}
        <Rect x="53" y="12" width="14" height="10" rx="4" fill="#6AAA30" />
        <Path d="M55 14 Q50 8 48 10" stroke="#5A9020" strokeWidth="1.5" fill="none" />
        <Path d="M65 14 Q70 8 72 10" stroke="#5A9020" strokeWidth="1.5" fill="none" />
      </G>
    ),
  },

  // Lahana (hf 27 & 30)
  cabbage: {
    bg: ['#D8EED0', '#68A848'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="86" rx="34" ry="5" fill="#3A7828" opacity="0.2" />
        {/* dış yapraklar */}
        <Ellipse cx="60" cy="62" rx="38" ry="30" fill="#78B848" />
        <Ellipse cx="60" cy="62" rx="32" ry="25" fill="#88C858" />
        <Ellipse cx="60" cy="62" rx="26" ry="20" fill="url(#fg)" />
        {/* damar çizgileri */}
        <Path d="M60 42 Q55 52 57 82" stroke="#58A838" strokeWidth="1.5" opacity="0.4" fill="none" />
        <Path d="M48 46 Q44 58 46 80" stroke="#58A838" strokeWidth="1" opacity="0.3" fill="none" />
        <Path d="M72 46 Q76 58 74 80" stroke="#58A838" strokeWidth="1" opacity="0.3" fill="none" />
        {/* highlight */}
        <Ellipse cx="47" cy="50" rx="9" ry="6" fill="white" opacity="0.25" />
      </G>
    ),
  },

  // Patlıcan (hf 28)
  eggplant: {
    bg: ['#E8D0F0', '#7030A0'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="91" rx="24" ry="4" fill="#4A1A70" opacity="0.2" />
        {/* gövde */}
        <Path d="M60 28 C44 28 34 44 34 62 C34 80 44 94 60 94 C76 94 86 80 86 62 C86 44 76 28 60 28Z" fill="url(#fg)" />
        {/* highlight */}
        <Ellipse cx="46" cy="46" rx="9" ry="15" fill="white" opacity="0.2" />
        {/* iç doku */}
        <Path d="M60 28 Q57 55 59 94" stroke="#4A1A70" strokeWidth="1" opacity="0.2" fill="none" />
        {/* sap + yeşil kap */}
        <Path d="M52 28 Q50 16 54 12" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M60 28 Q60 16 62 12" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M68 28 Q70 16 66 12" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Ellipse cx="60" cy="28" rx="16" ry="6" fill="#5A8030" />
        <Ellipse cx="60" cy="28" rx="10" ry="4" fill="#78A848" />
      </G>
    ),
  },

  // Balkabağı / Squash (hf 29, 40)
  squash: {
    bg: ['#FFE8C0', '#E87A20'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="34" ry="5" fill="#B05010" opacity="0.2" />
        {/* 5 dilim */}
        {[-2, -1, 0, 1, 2].map((i) => (
          <Ellipse key={i} cx={60 + i * 14} cy={60} rx={12} ry={28} fill="url(#fg)" opacity={i === 0 ? 1 : 0.85} />
        ))}
        {/* dikey çizgiler */}
        {[-2, -1, 0, 1, 2].map((i) => (
          <Path key={i} d={`M${60 + i * 14} 32 Q${58 + i * 14} 60 ${60 + i * 14} 88`} stroke="#B05010" strokeWidth="1" opacity="0.25" fill="none" />
        ))}
        {/* highlight */}
        <Ellipse cx="42" cy="44" rx="8" ry="14" fill="white" opacity="0.2" />
        {/* sap */}
        <Path d="M60 32 Q62 20 59 13" stroke="#5A8030" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M58 18 Q52 12 50 15" stroke="#5A8030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Ananas (hf 31 & 33)
  pineapple: {
    bg: ['#FFF0A0', '#F0C020'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="90" rx="25" ry="4" fill="#C09010" opacity="0.2" />
        {/* yapraklar */}
        <Path d="M60 12 Q58 2 54 -2 Q60 8 56 14" fill="#4A8A20" stroke="#4A8A20" strokeWidth="1" />
        <Path d="M60 10 Q60 0 62 -4 Q62 6 66 12" fill="#5A9A28" stroke="#5A9A28" strokeWidth="1" />
        <Path d="M52 16 Q46 6 42 6 Q48 14 50 20" fill="#4A8A20" stroke="#4A8A20" strokeWidth="1" />
        <Path d="M68 16 Q74 6 78 6 Q72 14 70 20" fill="#4A8A20" stroke="#4A8A20" strokeWidth="1" />
        <Path d="M44 22 Q38 14 36 16 Q42 22 44 28" fill="#3A7A18" stroke="#3A7A18" strokeWidth="1" />
        <Path d="M76 22 Q82 14 84 16 Q78 22 76 28" fill="#3A7A18" stroke="#3A7A18" strokeWidth="1" />
        {/* gövde */}
        <Path d="M38 30 L82 30 L80 90 L40 90 Z" rx="8" fill="url(#fg)" />
        {/* elmas desen */}
        {[35, 48, 61, 74].map((y) =>
          [40, 52, 64, 76].map((x, i) => (
            <Path key={`${x}-${y}`} d={`M${x} ${y} L${x + 6} ${y - 6} L${x + 12} ${y} L${x + 6} ${y + 6}Z`} fill="none" stroke="#C09010" strokeWidth="1" opacity="0.4" />
          ))
        )}
        {/* highlight */}
        <Path d="M42 35 L46 85" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.2" />
      </G>
    ),
  },

  // Kabak (hf 32)
  zucchini: {
    bg: ['#C8E8C0', '#388A28'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="90" rx="18" ry="4" fill="#1A6010" opacity="0.2" />
        {/* gövde */}
        <Rect x="38" y="18" width="44" height="72" rx="22" fill="url(#fg)" />
        {/* açık şeritler */}
        {[-8, 0, 8].map((offset, i) => (
          <Path key={i} d={`M${60 + offset} 20 Q${58 + offset} 54 ${60 + offset} 88`} stroke="#A0D888" strokeWidth="5" opacity="0.3" fill="none" />
        ))}
        {/* yatay çizgiler */}
        {[35, 50, 65].map((y, i) => (
          <Path key={i} d={`M40 ${y} Q60 ${y - 2} 80 ${y}`} stroke="#1A6010" strokeWidth="1" opacity="0.15" fill="none" />
        ))}
        {/* highlight */}
        <Ellipse cx="47" cy="36" rx="7" ry="14" fill="white" opacity="0.2" />
        {/* sap */}
        <Path d="M60 18 Q58 8 56 4" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Ellipse cx="60" cy="16" rx="10" ry="5" fill="#5A8030" />
      </G>
    ),
  },

  // Bal kabağı / Honeydew (hf 35)
  honeydew: {
    bg: ['#E8FFD8', '#88C858'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="32" ry="5" fill="#48A830" opacity="0.2" />
        <Ellipse cx="60" cy="62" rx="32" ry="28" fill="url(#fg)" />
        {/* ağ deseni */}
        {[-3, -1, 1, 3].map((i) => (
          <Path key={'v' + i} d={`M${60 + i * 10} 34 Q${58 + i * 10} 62 ${60 + i * 10} 90`} stroke="#48A830" strokeWidth="1" opacity="0.2" fill="none" />
        ))}
        {[-3, -1, 1, 3].map((i) => (
          <Path key={'h' + i} d={`M28 ${62 + i * 10} Q60 ${60 + i * 8} 92 ${62 + i * 10}`} stroke="#48A830" strokeWidth="1" opacity="0.2" fill="none" />
        ))}
        {/* highlight */}
        <Ellipse cx="42" cy="46" rx="12" ry="9" fill="white" opacity="0.25" />
        {/* sap */}
        <Path d="M60 34 Q62 22 59 15" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </G>
    ),
  },

  // Karpuz (hf 36-39)
  watermelon: {
    bg: ['#D8F0D0', '#50A840'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="87" rx="34" ry="5" fill="#308030" opacity="0.2" />
        {/* dış kabuk */}
        <Ellipse cx="60" cy="62" rx="34" ry="30" fill="url(#fg)" />
        {/* açık yeşil şeritler */}
        {[-3, -1, 1, 3].map((i, idx) => (
          <Path key={i} d={`M${60 + i * 10} 32 Q${58 + i * 10} 62 ${60 + i * 10} 92`} stroke="#A8D888" strokeWidth="4" opacity="0.4" fill="none" />
        ))}
        {/* iç kırmızı kısım — yarım daire */}
        <Ellipse cx="60" cy="67" rx="28" ry="24" fill="#F05858" />
        <Ellipse cx="60" cy="67" rx="24" ry="20" fill="#F87878" />
        {/* çekirdekler */}
        {[[48, 60], [60, 56], [72, 60], [52, 72], [68, 72]].map(([cx, cy], i) => (
          <Ellipse key={i} cx={cx} cy={cy} rx="3" ry="4.5" fill="#1A3010" opacity="0.7" transform={`rotate(-15, ${cx}, ${cy})`} />
        ))}
        {/* sap */}
        <Path d="M60 32 Q62 22 59 16" stroke="#5A8030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* highlight kabuk */}
        <Ellipse cx="42" cy="46" rx="8" ry="6" fill="white" opacity="0.2" />
      </G>
    ),
  },

  // Balkabağı — pumpkin (hf 40)
  pumpkin: {
    bg: ['#FFE8C0', '#E85A10'],
    render: () => (
      <G>
        <Ellipse cx="60" cy="88" rx="36" ry="5" fill="#A83808" opacity="0.2" />
        {/* 5 dilim */}
        {[-2, -1, 0, 1, 2].map((i) => (
          <Ellipse key={i} cx={60 + i * 15} cy={63} rx="14" ry="26" fill="url(#fg)" opacity={Math.abs(i) === 2 ? 0.75 : Math.abs(i) === 1 ? 0.9 : 1} />
        ))}
        {/* dikey çizgiler dilimler arası */}
        {[-1, 0, 1].map((i) => (
          <Path key={i} d={`M${60 + i * 15} 37 Q${58 + i * 15} 63 ${60 + i * 15} 89`} stroke="#A83808" strokeWidth="2" opacity="0.25" fill="none" />
        ))}
        {/* highlight */}
        <Ellipse cx="44" cy="48" rx="7" ry="14" fill="white" opacity="0.2" />
        {/* sap */}
        <Rect x="56" y="22" width="8" height="18" rx="4" fill="#5A3010" />
        <Path d="M60 28 Q54 18 50 20" stroke="#5A8030" strokeWidth="2" fill="none" />
        <Path d="M60 28 Q66 18 70 20" stroke="#5A8030" strokeWidth="2" fill="none" />
      </G>
    ),
  },
};

/**
 * FruitArt — Haftalık meyve SVG illüstrasyonu
 * @param {string} type — weekData'daki fruit anahtarı
 * @param {number} size — piksel cinsinden kare boyut
 */
export function FruitArt({ type, size = 80, useReal = false }) {
  const assetKey = useReal ? `real_fruit_${type}` : `fruit_${type}`;
  const img = generatedAssets[assetKey] || generatedAssets[`fruit_${type}`] || (useReal ? generatedAssets[`real_fruit_${type}`] : null);

  if (img) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={img} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
    );
  }

  const def = fruitDefs[type] || fruitDefs.melon;
  const id = `fg_${type}_${size}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0.6" y2="1">
          <Stop stopColor={def.bg[0]} />
          <Stop offset="1" stopColor={def.bg[1]} />
        </LinearGradient>
        {/* aynı id'yi render içinde kullanmak için alias */}
        <LinearGradient id="fg" x1="0" y1="0" x2="0.6" y2="1">
          <Stop stopColor={def.bg[0]} />
          <Stop offset="1" stopColor={def.bg[1]} />
        </LinearGradient>
      </Defs>
      {def.render()}
    </Svg>
  );
}

/**
 * ComparisonArt — 3'lü Kıyaslama (Meyve, Sevimli Hayvan, Tatlı/Nesne ve Ultrason)
 */
export function ComparisonArt({ mode = 'fruit', type, size = 80, emoji, info, useReal = false, week }) {
  if (mode === 'fruit') {
    return <FruitArt type={type} size={size} useReal={useReal} />;
  }

  if (mode === 'animal') {
    const animalImg = generatedAssets[`animal_${type}`];
    if (animalImg) {
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={animalImg} style={{ width: size, height: size }} resizeMode="contain" />
        </View>
      );
    }
    return (
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: '#F3EBF4', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#7F5282', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        borderWidth: 2, borderColor: '#E8D5EB'
      }}>
        <Text style={{ fontSize: size * 0.52 }}>{emoji || '🐾'}</Text>
      </View>
    );
  }

  if (mode === 'sweet') {
    const sweetImg = generatedAssets[`sweet_${type}`];
    if (sweetImg) {
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={sweetImg} style={{ width: size, height: size }} resizeMode="contain" />
        </View>
      );
    }
    return (
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: '#FFF2E8', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#D97736', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        borderWidth: 2, borderColor: '#FCE0CE'
      }}>
        <Text style={{ fontSize: size * 0.52 }}>{emoji || '🧁'}</Text>
      </View>
    );
  }

  if (mode === 'ultrasound') {
    const weekNum = week || info?.week;
    const weekKey = weekNum ? `fetus_w${String(weekNum).padStart(2, '0')}` : null;
    const usImg = (weekKey && generatedAssets[weekKey]) || 
                  generatedAssets['ui_ultrasound_hdlive_20w'] || 
                  generatedAssets['fetus'] || 
                  generatedAssets['card_ultrasound_frame'] || 
                  generatedAssets['blog_ultrasound_memory'];
    return (
      <View style={{
        width: size, height: size, borderRadius: 16,
        backgroundColor: '#1C1A24', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#695773', overflow: 'hidden'
      }}>
        {usImg ? (
          <Image source={usImg} style={{ width: size, height: size }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: size * 0.45 }}>🩺</Text>
        )}
      </View>
    );
  }

  return <FruitArt type={type} size={size} />;
}
