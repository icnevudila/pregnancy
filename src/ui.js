import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Pressable, StyleSheet, ScrollView, Image, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line, Rect } from 'react-native-svg';
import { colors, fonts, shadow } from './theme';
import { addInAppNotificationListener } from './notifications';
import { Icon, MoodFace } from './Icons';
import { generatedAssets, getAsset } from './generatedAssets';

export function T({ children, style, bold, ...props }) {
  return <Text {...props} style={[s.text, bold && { fontFamily: fonts.bold }, style]}>{children}</Text>;
}
export function Tap({ children, style, label, onPress, ...props }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.7, transform: [{ scale: 0.985 }] }]} {...props}>{children}</Pressable>;
}
export function Card({ children, style, ...props }) { return <View style={[s.card, style]} {...props}>{children}</View>; }
export function ScreenHero({ kicker, title, body, stat, icon = 'heart', asset, tint = colors.purple, style }) {
  const [imgError, setImgError] = useState(false);
  const art = typeof asset === 'string' ? (generatedAssets[asset] || getAsset(asset)) : asset;
  const isPhoto = (typeof asset === 'string' && (asset.startsWith('blog_') || asset.startsWith('infographic_') || asset === 'pregnancy' || asset === 'baby' || asset === 'mother' || asset.includes('hero'))) || (typeof asset !== 'string' && Boolean(asset));
  return (
    <Card style={[s.screenHero, style]}>
      <View style={{ flex: 1 }}>
        {kicker ? <T style={[s.heroKicker, { color: tint }]}>{kicker}</T> : null}
        <T bold style={s.heroTitle}>{title}</T>
        <T style={s.heroBody}>{body}</T>
        {stat ? <View style={[s.heroStat, { backgroundColor: tint + '18' }]}><T bold style={{ fontSize: 12, color: tint }}>{stat}</T></View> : null}
      </View>
      <View style={[s.heroArt, { backgroundColor: isPhoto ? tint + '14' : 'transparent', overflow: 'hidden' }]}>
        {art && !imgError ? (
          <Image
            source={art}
            style={isPhoto ? { width: '100%', height: '100%', borderRadius: 24 } : { width: 78, height: 78 }}
            resizeMode={isPhoto ? 'cover' : 'contain'}
            onError={() => setImgError(true)}
          />
        ) : (
          <Icon name={icon} size={36} color={tint} />
        )}
      </View>
    </Card>
  );
}
export function InfoNote({ icon = 'heart', title, body, tint = colors.purple, style }) {
  return (
    <View style={[s.infoNote, { borderColor: tint + '38', backgroundColor: tint + '10' }, style]}>
      <View style={s.infoIcon}><Icon name={icon} size={17} color={tint} /></View>
      <View style={{ flex: 1 }}>
        <T bold style={{ fontSize: 13, color: tint }}>{title}</T>
        <T style={{ fontSize: 12, color: '#5F5263', lineHeight: 18, marginTop: 3 }}>{body}</T>
      </View>
    </View>
  );
}

export function CleanIcon({ asset, icon = 'leaf', size = 36, imgSize = 32, tint = colors.purple, style }) {
  const art = typeof asset === 'string' ? (generatedAssets[asset] || getAsset(asset)) : asset;
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }, style]}>
      {art ? (
        <Image source={art} style={{ width: imgSize, height: imgSize }} resizeMode="contain" />
      ) : (
        <Icon name={icon} size={Math.round(imgSize * 0.65)} color={tint} />
      )}
    </View>
  );
}

export function ToolExperienceCard({ title, steps = [], outcome, asset, tint = colors.purple, lang = 'tr', defaultExpanded = false, style }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const art = typeof asset === 'string' ? (generatedAssets[asset] || getAsset(asset)) : asset;
  const isEn = lang === 'en';
  return (
    <Card style={[s.toolExperience, { borderColor: tint + '2A', paddingVertical: expanded ? 15 : 10, paddingHorizontal: 14 }, style]}>
      <Tap
        onPress={() => setExpanded(e => !e)}
        label={expanded ? (isEn ? 'Collapse guide' : 'Rehberi daralt') : (isEn ? 'Expand guide' : 'Rehberi göster')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}
      >
        <View style={[s.toolExperienceArtCompact, { backgroundColor: 'transparent' }]}>
          {art ? <Image source={art} style={{ width: 26, height: 26 }} resizeMode="contain" /> : <Icon name="leaf" size={17} color={tint} />}
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ fontSize: 9.5, color: tint, letterSpacing: 0.8, fontFamily: fonts.bold }}>{isEn ? 'CLINICAL RITUAL' : 'KLİNİK RİTÜEL & REHBER'}</T>
          <T bold numberOfLines={expanded ? undefined : 1} style={{ fontSize: 13.5, color: colors.ink, marginTop: 1 }}>{title}</T>
        </View>
        <View style={[s.expandPill, { backgroundColor: tint + '14' }]}>
          <T bold style={{ fontSize: 11, color: tint }}>{expanded ? (isEn ? 'Close ▴' : 'Kapat ▴') : (isEn ? 'Rehber ▾' : 'Rehber ▾')}</T>
        </View>
      </Tap>
      {expanded && (
        <View style={{ marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderColor: tint + '16', gap: 8 }}>
          {steps.map((step, i) => (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}>
              <View style={[s.toolStepDot, { backgroundColor: tint + '18' }]}><T bold style={{ fontSize: 10, color: tint }}>{i + 1}</T></View>
              <T style={{ flex: 1, fontSize: 12.5, color: '#514858', lineHeight: 18 }}>{step}</T>
            </View>
          ))}
          {outcome ? <View style={[s.toolOutcome, { backgroundColor: tint + '10' }]}><T style={{ fontSize: 12, color: '#554B5A', lineHeight: 18 }}>{outcome}</T></View> : null}
        </View>
      )}
    </Card>
  );
}

export function RoundButton({ icon = 'chevron', onPress, label, style }) {
  return <Tap label={label} onPress={onPress} style={[s.round, style]}><Icon name={icon} size={17}/></Tap>;
}
export function Section({ title, action, onPress }) {
  return <View style={s.section}><T bold style={{ fontSize: 17 }}>{title}</T>{action && <Tap onPress={onPress} style={s.inline}><T style={s.meta}>{action}</T><Icon name="chevron" size={14} color={colors.muted}/></Tap>}</View>;
}

export const HorizontalScroll = React.forwardRef(({ children, style, contentContainerStyle, ...props }, ref) => {
  const internalRef = useRef(null);
  const scrollRef = ref || internalRef;
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = scrollRef.current?.getScrollableNode ? scrollRef.current.getScrollableNode() : scrollRef.current;
    if (!node) return;

    const getTarget = () => {
      if (node.scrollWidth > node.clientWidth) return node;
      if (node.firstElementChild && node.firstElementChild.scrollWidth > node.firstElementChild.clientWidth) {
        return node.firstElementChild;
      }
      return node;
    };

    const target = getTarget();

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      isDown.current = true;
      startX.current = e.pageX;
      scrollLeft.current = target.scrollLeft;
      target.style.cursor = 'grabbing';
      target.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isDown.current) return;
      e.preventDefault();
      const walk = (e.pageX - startX.current) * 1.4;
      target.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDown.current) return;
      isDown.current = false;
      target.style.cursor = 'grab';
      target.style.removeProperty('user-select');
    };

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        target.scrollLeft += e.deltaY * 0.9;
      }
    };

    target.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    target.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      target.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      target.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      style={[{ cursor: Platform.OS === 'web' ? 'grab' : undefined }, style]}
      {...props}
    >
      {children}
    </ScrollView>
  );
});
export function Tabs({ items, active, onChange }) {
  return <View style={s.tabs}>{items.map(item => <Tap key={item} onPress={() => onChange(item)} accessibilityState={{ selected: active === item }} style={[s.tab, active === item && { backgroundColor: colors.purple }]}><T style={[s.tabText, active === item && { color: 'white' }]}>{item}</T></Tap>)}</View>;
}
export function MoodPicker({ postpartum, value, onChange, lang = 'tr' }) {
  const isEn = lang === 'en';
  const labels = postpartum
    ? (isEn ? ['Very good', 'Good', 'Normal', 'Sluggish', 'Hard'] : ['Çok iyi', 'İyi', 'Normal', 'Halsiz', 'Zor'])
    : (isEn ? ['Great', 'Good', 'Normal', 'Tired', 'Hard'] : ['Harika', 'İyi', 'Normal', 'Yorgun', 'Zor']);
  const title = postpartum
    ? (isEn ? 'How is your postpartum mood today?' : 'Bugünkü ruh halin nasıl?')
    : (isEn ? 'How are you feeling today?' : 'Bugün nasıl hissediyorsun?');
  return (
    <View>
      <T bold style={{ fontSize: 15, marginBottom: 8 }}>{title}</T>
      <View style={s.moods}>
        {labels.map((label, index) => (
          <Tap label={(isEn ? 'Mood: ' : 'Ruh hali: ') + label} key={label} onPress={() => onChange(index)} accessibilityState={{ selected: value === index }} style={[s.mood, value === index && s.moodSelected]}>
            <MoodFace index={index}/>
            <T style={s.moodLabel}>{label}</T>
          </Tap>
        ))}
      </View>
    </View>
  );
}
export function LanguageToggle({ lang = 'tr', onChange, style, compact = false }) {
  const isEn = lang === 'en';
  return (
    <View style={[s.langPill, compact && { padding: 2, borderRadius: 11 }, style]}>
      <Tap
        onPress={() => onChange && onChange('tr')}
        label="Türkçe"
        style={[s.langBtn, compact && { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9 }, !isEn && s.langBtnActive]}
      >
        <T bold={!isEn} style={[s.langText, compact && { fontSize: 11 }, !isEn && s.langTextActive]}>TR</T>
      </Tap>
      <Tap
        onPress={() => onChange && onChange('en')}
        label="English"
        style={[s.langBtn, compact && { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9 }, isEn && s.langBtnActive]}
      >
        <T bold={isEn} style={[s.langText, compact && { fontSize: 11 }, isEn && s.langTextActive]}>EN</T>
      </Tap>
    </View>
  );
}
export function Progress({ value, color = colors.sage, style }) { return <View style={[s.track, style]}><View style={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, borderRadius: 10, backgroundColor: color }}/></View>; }
export function SmallStat({ title, value, icon, tint, onPress }) {
  return <Tap onPress={onPress} label={title+' kaydı'} style={{ flex: 1 }}><LinearGradient colors={[tint, '#F8F7F3']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.stat}><View style={{ flex: 1 }}><T style={{ fontSize: 13 }}>{title}</T><T bold style={{ fontSize: 14, marginTop: 5 }}>{value}</T></View><Icon name={icon} size={30} color={icon === 'moon' ? '#8C92D4' : '#7DBED8'}/></LinearGradient></Tap>;
}
export function Page({ children, style, contentStyle, ...props }) {
  return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={[{ flex: 1 }, style]} contentContainerStyle={[s.page, contentStyle]} {...props}>{children}</ScrollView>;
}
export function ProgressRing({ size = 70, strokeWidth = 6, progress = 0, color = colors.purple, bgColor = '#EDE6EF', children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
export function MetricCard({ title, value, unit, subtext, icon, tint = colors.purple, style }) {
  return (
    <View style={[s.metricCard, { borderColor: tint + '22', backgroundColor: tint + '08' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <T style={[s.metricTitle, { color: tint }]}>{title}</T>
        {icon && <Icon name={icon} size={15} color={tint} />}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
        <T bold style={s.metricValue}>{value}</T>
        {unit ? <T style={s.metricUnit}>{unit}</T> : null}
      </View>
      {subtext ? <T style={s.metricSubtext}>{subtext}</T> : null}
    </View>
  );
}
export function StatusCard({ level = 'info', title, body, description, icon, action, onAction, style }) {
  const configs = {
    safe: { bg: '#EDF7F1', border: '#BEE7CD', color: '#2B754B', icon: 'check' },
    warning: { bg: '#FEF8EB', border: '#F6E0B4', color: '#996C26', icon: 'clock' },
    alert: { bg: '#FDEEEF', border: '#F8C7CB', color: '#B53443', icon: 'heart' },
    info: { bg: '#F5EFF9', border: '#E4D5EC', color: '#6A4482', icon: 'heart' },
  };
  const c = configs[level] || configs.info;
  return (
    <View style={[s.statusCard, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <View style={[s.statusIconCircle, { backgroundColor: c.color + '22' }]}>
          <Icon name={icon || c.icon} size={15} color={c.color} />
        </View>
        <View style={{ flex: 1 }}>
          <T bold style={{ fontSize: 13.5, color: c.color }}>{title}</T>
          <T style={{ fontSize: 12, color: '#4B4252', lineHeight: 18, marginTop: 2 }}>{body || description}</T>
          {action ? (
            <Tap onPress={onAction} style={{ marginTop: 6, alignSelf: 'flex-start' }}>
              <T bold style={{ fontSize: 12, color: c.color }}>{action} →</T>
            </Tap>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── CANLI BİLDİRİM BANNERI (IN-APP HEADS-UP NOTIFICATION BANNER) ───────────
export function InAppNotificationBanner({ onOpen, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [currentNotif, setCurrentNotif] = useState(null);
  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef(null);

  useEffect(() => {
    const unsubscribe = addInAppNotificationListener(notif => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);

      setCurrentNotif(notif);

      // Slide down and fade in with spring bounce
      translateY.setValue(-160);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 65,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start();

      // Auto dismiss after 6 seconds
      dismissTimer.current = setTimeout(() => {
        hideBanner();
      }, 6000);
    });

    return () => {
      unsubscribe();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  function hideBanner() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -160,
        duration: 240,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentNotif(null);
    });
  }

  function handleBannerTap() {
    if (!currentNotif) return;
    const data = currentNotif.data || {};
    hideBanner();
    if (onOpen) {
      onOpen(data);
    }
  }

  if (!currentNotif) return null;

  const iconEmoji = currentNotif.icon === 'water' ? '💧'
    : currentNotif.icon === 'pill' ? '💊'
    : currentNotif.icon === 'footprint' ? '🦶'
    : currentNotif.icon === 'book' ? '🥑'
    : currentNotif.icon === 'heart' ? '💕'
    : '🔔';

  return (
    <Animated.View
      style={[
        s.notifWrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Tap
        onPress={handleBannerTap}
        style={s.notifBannerCard}
        label={currentNotif.title}
      >
        <View style={s.notifTopRow}>
          <View style={s.notifBrandGroup}>
            <View style={s.notifIconBubble}>
              <T style={{ fontSize: 13 }}>{iconEmoji}</T>
            </View>
            <T bold style={s.notifBrandTitle}>MOMORA</T>
            <T style={s.notifTimeBadge}>· {isEn ? 'NOW' : 'ŞİMDİ'}</T>
          </View>

          <Tap onPress={hideBanner} style={s.notifCloseBtn} label={isEn ? 'Dismiss' : 'Kapat'}>
            <T style={{ fontSize: 13, color: '#BAACBF' }}>✕</T>
          </Tap>
        </View>

        <View style={s.notifBodyRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <T bold style={s.notifTitleText}>{currentNotif.title}</T>
            <T numberOfLines={2} style={s.notifMessageText}>{currentNotif.body}</T>
          </View>

          <View style={s.notifActionPill}>
            <T bold style={s.notifActionText}>{isEn ? 'View' : 'Aç'}</T>
          </View>
        </View>
      </Tap>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  text: { fontFamily: fonts.regular, color: colors.ink, fontSize: 15 },
  card: { backgroundColor: '#FFFDFA', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#F0EAE6', ...shadow },
  screenHero: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#EDE3EA' },
  heroKicker: { fontSize: 10, letterSpacing: 1.4, fontFamily: fonts.bold },
  heroTitle: { fontSize: 20, color: colors.ink, marginTop: 4, letterSpacing: -0.3 },
  heroBody: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 5 },
  heroStat: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginTop: 10 },
  heroArt: { width: 88, height: 88, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  infoNote: { flexDirection: 'row', gap: 11, padding: 13, borderRadius: 18, borderWidth: 1 },
  infoIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  toolExperience: { padding: 12, backgroundColor: '#FFFDFA', borderWidth: 1, borderRadius: 20 },
  toolExperienceArt: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  toolExperienceArtCompact: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  expandPill: { paddingHorizontal: 9, paddingVertical: 4.5, borderRadius: 12 },
  toolStepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: -1 },
  toolOutcome: { marginTop: 12, padding: 11, borderRadius: 15 },
  round: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFCFA', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, ...shadow },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11, marginTop: 18 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 3, minHeight: 30 },
  meta: { fontSize: 12, color: colors.muted },
  tabs: { flexDirection: 'row', padding: 3, gap: 4, backgroundColor: '#F1ECE8', borderRadius: 22, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 20, alignItems: 'center', backgroundColor: '#FFFCF9' },
  tabText: { fontSize: 12 },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: { alignItems: 'center', paddingBottom: 3, borderRadius: 15, borderWidth: 1.5, borderColor: 'transparent' },
  moodSelected: { borderColor: '#BAA2BB', backgroundColor: '#F7EEF6' },
  moodLabel: { fontSize: 11, marginTop: 2 },
  track: { height: 11, backgroundColor: '#EDE9E6', borderRadius: 10, overflow: 'hidden' },
  stat: { padding: 12, minHeight: 66, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  page: { paddingHorizontal: 17, paddingTop: 15, paddingBottom: 20, gap: 12 },
  metricCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1 },
  metricTitle: { fontSize: 10.5, fontFamily: fonts.bold, letterSpacing: 0.6 },
  metricValue: { fontSize: 20, color: colors.ink },
  metricUnit: { fontSize: 12, color: colors.muted, marginLeft: 2 },
  metricSubtext: { fontSize: 10.5, color: colors.muted, marginTop: 2 },
  statusCard: { padding: 13, borderRadius: 16, borderWidth: 1 },
  statusIconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  langPill: { flexDirection: 'row', backgroundColor: '#EDE5EF', borderRadius: 14, padding: 3, gap: 2, alignItems: 'center' },
  langBtn: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 11 },
  langBtnActive: { backgroundColor: colors.purple, ...shadow },
  langText: { fontSize: 11, color: '#7E6B83' },
  langTextActive: { color: 'white' },

  // Live In-App Notification Banner Styles
  notifWrapper: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 14 : 36,
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 999999,
  },
  notifBannerCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1E1824',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderWidth: 1.5,
    borderColor: '#3D3146',
    ...shadow.card,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notifBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  notifIconBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#35253F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBrandTitle: {
    fontSize: 10.5,
    letterSpacing: 1.5,
    color: '#D8B8E8',
    fontFamily: fonts.bold,
  },
  notifTimeBadge: {
    fontSize: 10,
    color: '#8D7F94',
    fontWeight: '600',
  },
  notifCloseBtn: {
    padding: 4,
    borderRadius: 10,
  },
  notifBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitleText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: fonts.bold,
  },
  notifMessageText: {
    fontSize: 11.5,
    color: '#D7CCD9',
    lineHeight: 16,
  },
  notifActionPill: {
    backgroundColor: colors.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  notifActionText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
});
