import React from 'react';
import { Text, View, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
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
  const art = asset ? (generatedAssets[asset] || getAsset(asset)) : null;
  const isPhoto = typeof asset === 'string' && (asset.startsWith('blog_') || asset === 'pregnancy' || asset === 'baby' || asset === 'mother');
  return (
    <Card style={[s.screenHero, style]}>
      <View style={{ flex: 1 }}>
        <T style={[s.heroKicker, { color: tint }]}>{kicker}</T>
        <T bold style={s.heroTitle}>{title}</T>
        <T style={s.heroBody}>{body}</T>
        {stat ? <View style={[s.heroStat, { backgroundColor: tint + '18' }]}><T bold style={{ fontSize: 12, color: tint }}>{stat}</T></View> : null}
      </View>
      <View style={[s.heroArt, { backgroundColor: tint + '14', overflow: 'hidden' }]}>
        {art ? (
          <Image
            source={art}
            style={isPhoto ? { width: '100%', height: '100%', borderRadius: 24 } : { width: 72, height: 72 }}
            resizeMode={isPhoto ? 'cover' : 'contain'}
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
export function RoundButton({ icon = 'chevron', onPress, label, style }) {
  return <Tap label={label} onPress={onPress} style={[s.round, style]}><Icon name={icon} size={17}/></Tap>;
}
export function Section({ title, action, onPress }) {
  return <View style={s.section}><T bold style={{ fontSize: 17 }}>{title}</T>{action && <Tap onPress={onPress} style={s.inline}><T style={s.meta}>{action}</T><Icon name="chevron" size={14} color={colors.muted}/></Tap>}</View>;
}
export function Tabs({ items, active, onChange }) {
  return <View style={s.tabs}>{items.map(item => <Tap key={item} onPress={() => onChange(item)} accessibilityState={{ selected: active === item }} style={[s.tab, active === item && { backgroundColor: colors.purple }]}><T style={[s.tabText, active === item && { color: 'white' }]}>{item}</T></Tap>)}</View>;
}
export function MoodPicker({ postpartum, value, onChange }) {
  const labels = postpartum ? ['Çok iyi', 'İyi', 'Normal', 'Halsiz', 'Zor'] : ['Harika', 'İyi', 'Normal', 'Yorgun', 'Zor'];
  return <View><T bold style={{ fontSize: 15, marginBottom: 8 }}>{postpartum ? 'Bugünkü ruh halin nasıl?' : 'Bugün nasıl hissediyorsun?'}</T><View style={s.moods}>{labels.map((label, index) => <Tap label={'Ruh hali: '+label} key={label} onPress={() => onChange(index)} accessibilityState={{ selected: value === index }} style={[s.mood, value === index && s.moodSelected]}><MoodFace index={index}/><T style={s.moodLabel}>{label}</T></Tap>)}</View></View>;
}
export function Progress({ value, color = colors.sage, style }) { return <View style={[s.track, style]}><View style={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, borderRadius: 10, backgroundColor: color }}/></View>; }
export function SmallStat({ title, value, icon, tint, onPress }) {
  return <Tap onPress={onPress} label={title+' kaydı'} style={{ flex: 1 }}><LinearGradient colors={[tint, '#F8F7F3']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.stat}><View style={{ flex: 1 }}><T style={{ fontSize: 13 }}>{title}</T><T bold style={{ fontSize: 14, marginTop: 5 }}>{value}</T></View><Icon name={icon} size={30} color={icon === 'moon' ? '#8C92D4' : '#7DBED8'}/></LinearGradient></Tap>;
}
export function Page({ children, style, contentStyle, ...props }) {
  return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={[{ flex: 1 }, style]} contentContainerStyle={[s.page, contentStyle]} {...props}>{children}</ScrollView>;
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
  infoIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFDFA', alignItems: 'center', justifyContent: 'center' },
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
});
