import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Animated, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon, FruitArt, ComparisonArt } from './Icons';
import { T, Tap, Card, Section, ScreenHero, ToolExperienceCard } from './ui';
import { getWeekInfo, formatLength, formatWeight, trimesterLabel } from './weekData';
import { generatedAssets } from './generatedAssets';
import { usePulse } from './anim';
import { playSound, stopSound } from './soundEngine';
import { getUltrasoundDetails, decodeBiometryReport, ULTRASOUND_MILESTONES, HADLOCK_BIOMETRY_NORMS } from './ultrasoundData';

// ─── EKRAN 10: 3'LÜ BOYUT KIYASLAMA REHBERİ (SIZE GUIDE HUB) ─────────────────
export function SizeComparisonHub({ state, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [week, setWeek] = useState(state.week || 24);
  const [mode, setMode] = useState('fruit'); // 'fruit' | 'animal' | 'sweet'
  const info = getWeekInfo(week, lang);

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'WEEK-BY-WEEK SIZE' : 'HAFTA HAFTA BOYUT'}
        title={isEn ? "Feel your baby's scale" : "Bebeğinin ölçeğini hisset"}
        body={isEn ? "See the same week warmly and memorably through fruit, animal, or sweet metaphors." : "Meyve, hayvan veya tatlı metaforuyla aynı haftayı daha sıcak ve akılda kalıcı gör."}
        icon="melon"
        asset="sweet_macaron"
        tint="#7B4C80"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Make growth tangible' : 'Boyutu üç farklı dille anlat'} steps={isEn ? ['Switch between fruit, animal, and sweet comparisons.', 'Move week by week.', 'Open the weekly detail when curious.'] : ['Meyve, hayvan ve tatlı kıyasını değiştir.', 'Hafta hafta ilerle.', 'Merak ettiğinde hafta detayını aç.']} outcome={isEn ? 'Growth feels visual and memorable.' : 'Gelişim görsel ve akılda kalıcı hale gelir.'} asset="fruit_apple" tint="#7B4C80" />

      {/* 4'lü Segment Seçici (Lüks İkonlu Tasarım) */}
      <View style={ms.segRow}>
        {[
          { id: 'fruit', label: isEn ? 'Fruit' : 'Meyve', icon: 'apple' },
          { id: 'ultrasound', label: isEn ? 'Ultrasound' : 'Ultrason', icon: 'ultrasound' },
          { id: 'animal', label: isEn ? 'Animal' : 'Hayvan', icon: 'paw' },
          { id: 'sweet', label: isEn ? 'Sweet' : 'Tatlı', icon: 'cupcake' },
        ].map(s => (
          <Tap
            key={s.id}
            label={s.label}
            onPress={() => setMode(s.id)}
            style={[ms.segBtn, mode === s.id && ms.segBtnActive]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name={s.icon} size={14} color={mode === s.id ? 'white' : colors.purple} />
              <T bold={mode === s.id} style={[ms.segText, mode === s.id && { color: 'white' }]}>
                {s.label}
              </T>
            </View>
          </Tap>
        ))}
      </View>

      {/* Ana Boyut Kartı */}
      <Card style={ms.heroCard}>
        <LinearGradient
          colors={['#F7EFF5', '#FDF8F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={ms.heroMeta}>
          <T bold style={{ fontSize: 13, color: colors.purple }}>
            {week}. {isEn ? 'WEEK' : 'HAFTA'} · {trimesterLabel(info.trimester, lang).toLocaleUpperCase(isEn ? 'en' : 'tr')}
          </T>
          <T style={{ fontSize: 11, color: colors.muted }}>
            {isEn ? "Baby's Size Comparison" : "Bebeğin Boyut Eşleşmesi"}
          </T>
        </View>

        {/* Görsel Sahne */}
        <View style={ms.stage}>
          {mode === 'fruit' ? (
            <FruitArt type={info.fruit} size={150} />
          ) : mode === 'ultrasound' ? (
            <ComparisonArt mode="ultrasound" size={150} week={week} info={info} />
          ) : (
            <ComparisonArt
              mode={mode}
              type={mode === 'animal' ? info.animal : info.sweet}
              size={130}
              emoji={mode === 'animal' ? (info.animalEmoji || '🐾') : (info.sweetEmoji || '🧁')}
              info={info}
              week={week}
            />
          )}

          <T bold style={ms.stageTitle}>
            {mode === 'fruit'
              ? `${info.fruitName}`
              : mode === 'animal'
              ? `${info.animalName}`
              : mode === 'ultrasound'
              ? (info.ultrasound?.scan || (isEn ? 'Ultrasound Anatomy' : 'Ultrason Anatomisi'))
              : `${info.sweetName}`}
          </T>
          <T style={ms.stageSub}>{mode === 'ultrasound' ? (info.ultrasound?.badge || (isEn ? 'Growth scan' : 'Gelişim taraması')) : (isEn ? 'in size' : 'büyüklüğünde')}</T>
        </View>

        {/* Boy & Ağırlık Şeridi */}
        <View style={ms.metricsRow}>
          <View style={ms.metricItem}>
            <Icon name="ruler" size={16} color={colors.purple} />
            <View>
              <T style={ms.metricLabel}>{isEn ? 'Approx. Length' : 'Yaklaşık Boy'}</T>
              <T bold style={ms.metricVal}>{formatLength(info.lengthCm)}</T>
            </View>
          </View>
          <View style={ms.metricDivider} />
          <View style={ms.metricItem}>
            <Icon name="scale" size={16} color={colors.purple} />
            <View>
              <T style={ms.metricLabel}>{isEn ? 'Approx. Weight' : 'Yaklaşık Ağırlık'}</T>
              <T bold style={ms.metricVal}>{formatWeight(info.weightG)}</T>
            </View>
          </View>
        </View>
      </Card>

      {/* Hafta Seçici Şerit */}
      <Section title={isEn ? 'Change Week' : 'Haftayı Değiştir'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {Array.from({ length: 37 }, (_, i) => i + 4).map(w => (
          <Tap
            key={w}
            label={isEn ? `Week ${w}` : `${w}. Hafta`}
            onPress={() => setWeek(w)}
            style={[ms.weekPill, week === w && ms.weekPillActive]}
          >
            <T bold={week === w} style={{ fontSize: 13, color: week === w ? 'white' : colors.ink }}>
              {w}
            </T>
            <T style={{ fontSize: 9, color: week === w ? '#EDE0EF' : colors.muted }}>{isEn ? 'wk' : 'hf'}</T>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── EKRAN 11: 2D & 3D ULTRASON ATLASI & KLİNİK KONSOL (ULTRASOUND ATLAS) ──
export function UltrasoundAtlas({ state, lang = 'tr', initialWeek }) {
  const isEn = lang === 'en';
  const [week, setWeek] = useState(initialWeek || state?.week || 20);
  const [tab, setTab] = useState('3d'); // '3d' | '2d' | 'doppler' | 'biometry'
  const [activeMarker, setActiveMarker] = useState(null);
  const [isPlayingHeartbeat, setIsPlayingHeartbeat] = useState(false);
  const [biometryInputs, setBiometryInputs] = useState({ bpd: '', hc: '', ac: '', fl: '' });
  const pulse = usePulse(0.92, 1.08, 1500);

  const details = getUltrasoundDetails(week, lang);
  const info = getWeekInfo(week, lang);

  useEffect(() => {
    // Reset or set initial marker when week or tab changes
    setActiveMarker(details.markers?.[0]?.id || null);
  }, [week, tab]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  function toggleHeartbeat() {
    if (isPlayingHeartbeat) {
      stopSound();
      setIsPlayingHeartbeat(false);
    } else {
      playSound('fetalHeartbeat', { volume: 0.85 });
      setIsPlayingHeartbeat(true);
    }
  }

  const biometryReport = decodeBiometryReport(biometryInputs, week, lang);

  // Active visual asset resolution
  let activeAsset = null;
  if (tab === '3d') {
    activeAsset = generatedAssets[details.fetusKey] || generatedAssets.ui_ultrasound_hdlive_20w;
  } else if (tab === '2d') {
    activeAsset = generatedAssets[details.asset2d] || generatedAssets[details.fetusKey];
  } else if (tab === 'doppler') {
    activeAsset = generatedAssets[details.assetDoppler] || generatedAssets[details.asset2d] || generatedAssets[details.fetusKey];
  }

  const currentMarkerObj = details.markers?.find(m => m.id === activeMarker) || details.markers?.[0];

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'CLINICAL ULTRASOUND ATLAS' : 'KLİNİK ULTRASON ATLASI'}
        title={isEn ? `Week ${week} Fetal Anatomy & Scans` : `${week}. Hafta Fetal Anatomi & Taramalar`}
        body={isEn
          ? 'Explore high-resolution 3D HDLive renders, authentic 2D sonograms, Doppler blood flow, and decode your doctor reports.'
          : 'Yüksek çözünürlüklü 3D HDLive renderları, 2D sonogramları, Doppler kan akımını keşfedin ve doktor raporunuzu sakince okuyun.'}
        icon="ultrasound"
        asset={details.fetusKey || "ui_ultrasound_hdlive_20w"}
        tint="#4F3B78"
      />

      {/* 4 Kilit Ultrason Taraması Hızlı Geçiş Rozetleri */}
      <View style={{ gap: 6 }}>
        <T bold style={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {isEn ? 'Clinical Milestones' : 'Kilit Muayene Taramaları'}
        </T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {ULTRASOUND_MILESTONES.map(m => {
            const isSelected = details.milestone.id === m.id;
            return (
              <Tap
                key={m.id}
                label={isEn ? m.titleEn : m.titleTr}
                onPress={() => setWeek(m.targetWeek)}
                style={[
                  ms.milestoneChip,
                  isSelected && ms.milestoneChipActive
                ]}
              >
                <T bold={isSelected} style={{ fontSize: 11, color: isSelected ? 'white' : colors.ink }}>
                  {m.weekRange}. {isEn ? 'Wk' : 'Hf'}
                </T>
                <T numberOfLines={1} style={{ fontSize: 10, color: isSelected ? '#EBD8F5' : colors.muted, marginTop: 1 }}>
                  {isEn ? m.badgeEn : m.badgeTr}
                </T>
              </Tap>
            );
          })}
        </ScrollView>
      </View>

      {/* 40 Hafta Kaydırıcı Şerit */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
        {Array.from({ length: 37 }, (_, i) => i + 4).map(w => (
          <Tap
            key={w}
            label={isEn ? `Week ${w}` : `${w}. Hafta`}
            onPress={() => setWeek(w)}
            style={[ms.weekPill, week === w && ms.weekPillActive]}
          >
            <T bold={week === w} style={{ fontSize: 12, color: week === w ? 'white' : colors.ink }}>
              {w}
            </T>
            <T style={{ fontSize: 9, color: week === w ? '#EDE0EF' : colors.muted }}>{isEn ? 'wk' : 'hf'}</T>
          </Tap>
        ))}
      </ScrollView>

      {/* 4'lü Görünüm Sekmesi (3D HDLive | 2D B-Mod | Doppler | Rapor Tercümanı) */}
      <View style={ms.segRow}>
        {[
          { id: '3d', label: isEn ? '3D HDLive' : '3D HDLive', icon: 'heart' },
          { id: '2d', label: isEn ? '2D B-Mode' : '2D B-Mod', icon: 'ultrasound' },
          { id: 'doppler', label: isEn ? 'Doppler Flow' : 'Doppler', icon: 'doppler' },
          { id: 'biometry', label: isEn ? 'Report Decoder' : 'Rapor Oku', icon: 'caliper' },
        ].map(s => (
          <Tap
            key={s.id}
            label={s.label}
            onPress={() => setTab(s.id)}
            style={[ms.segBtn, tab === s.id && ms.segBtnActive]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name={s.icon} size={13} color={tab === s.id ? 'white' : colors.purple} />
              <T bold={tab === s.id} style={[ms.segText, tab === s.id && { color: 'white' }]}>
                {s.label}
              </T>
            </View>
          </Tap>
        ))}
      </View>

      {/* ─── MOD 1-3: TIBBİ SONOGRAFİ KONSOLU (3D / 2D / DOPPLER) ─── */}
      {tab !== 'biometry' ? (
        <Card style={ms.consoleChassis}>
          {/* Konsol Tepe Telemetri Şeridi */}
          <View style={ms.consoleTelemetry}>
            <View>
              <T style={ms.telemetryText}>
                {details.telemetry.probe} · {details.telemetry.freq}
              </T>
              <T style={[ms.telemetryText, { color: '#C8B0D6' }]}>
                D: {details.telemetry.depth} · {details.telemetry.fps}
              </T>
            </View>
            <View style={ms.consoleGaBadge}>
              <T bold style={{ color: '#F7D488', fontSize: 11, letterSpacing: 0.5 }}>
                {details.telemetry.ga}
              </T>
              <T style={{ color: '#E8DCF0', fontSize: 9, textAlign: 'center' }}>
                {tab === '3d' ? (isEn ? '3D / 4D HDLive' : '3D HDLive Kehribar') : tab === '2d' ? (isEn ? '2D B-Mode Gray' : '2D Klinik B-Mod') : (isEn ? 'Color Doppler Map' : 'Renkli Doppler')}
              </T>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <T style={ms.telemetryText}>MI: {details.telemetry.mi}</T>
              <T style={ms.telemetryText}>TIB: {details.telemetry.tib}</T>
            </View>
          </View>

          {/* Konsol Ekran Sahnesi */}
          <View style={ms.consoleScreen}>
            <LinearGradient
              colors={tab === '3d' ? ['#21151F', '#0E0911'] : tab === '2d' ? ['#131417', '#0A0B0E'] : ['#1C1021', '#0E0915']}
              style={StyleSheet.absoluteFill}
            />

            {activeAsset ? (
              <Image source={activeAsset} style={ms.consoleImage} resizeMode="contain" />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="ultrasound" size={64} color="#5C4569" />
                <T style={{ color: '#887596', fontSize: 12, marginTop: 8 }}>
                  {isEn ? `Loading Week ${week} scan...` : `${week}. Hafta taraması yükleniyor...`}
                </T>
              </View>
            )}

            {/* İnteraktif Anatomik Sıcak Noktalar (Hotspots) */}
            {details.markers?.map(m => {
              const isSelected = activeMarker === m.id;
              return (
                <Tap
                  key={m.id}
                  label={m.label}
                  onPress={() => setActiveMarker(isSelected ? null : m.id)}
                  style={[ms.hotspot, { left: m.x, top: m.y }]}
                >
                  <Animated.View style={[
                    ms.hotspotRing,
                    isSelected && { borderColor: '#FFFFFF', transform: [{ scale: pulse }] }
                  ]} />
                  <View style={[ms.hotspotDot, isSelected && ms.hotspotDotActive]}>
                    <View style={ms.hotspotInner} />
                  </View>
                </Tap>
              );
            })}

            {/* Doppler Modunda Canlı Kalp Atışı Çalma Butonu */}
            {tab === 'doppler' && (
              <Tap
                onPress={toggleHeartbeat}
                label={isPlayingHeartbeat ? (isEn ? 'Stop Heartbeat' : 'Kalp Sesini Durdur') : (isEn ? 'Listen to Fetal Heartbeat' : 'Fetal Kalp Sesini Dinle')}
                style={ms.dopplerAudioBtn}
              >
                <Icon name={isPlayingHeartbeat ? "volume" : "soundwave"} size={16} color="#FCE79D" />
                <T bold style={{ fontSize: 11, color: '#FCE79D' }}>
                  {isPlayingHeartbeat
                    ? (isEn ? '145 BPM Playing 🎵' : '145 BPM Çalıyor 🎵')
                    : (isEn ? 'Listen to Fetal Heartbeat (145 BPM)' : 'Fetal Kalp Atımını Dinle (145 BPM)')}
                </T>
              </Tap>
            )}
          </View>

          {/* Konsol Altı: Hızlı Nokta Seçim Şeridi */}
          <View style={{ marginTop: 8 }}>
            <T style={{ fontSize: 10, color: '#A092A6', marginBottom: 6 }}>
              {isEn ? 'SELECT ANATOMICAL LANDMARK:' : 'ANATOMİK BÖLGEYİ İNCELE:'}
            </T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {details.markers?.map(m => {
                const isSelected = activeMarker === m.id;
                return (
                  <Tap
                    key={m.id}
                    label={m.label}
                    onPress={() => setActiveMarker(m.id)}
                    style={[ms.landmarkChip, isSelected && ms.landmarkChipActive]}
                  >
                    <T bold={isSelected} style={{ fontSize: 11, color: isSelected ? 'white' : '#C7B9CE' }}>
                      📍 {m.label}
                    </T>
                  </Tap>
                );
              })}
            </ScrollView>
          </View>

          {/* Seçilen Noktanın Klinik Detay Kartı */}
          {currentMarkerObj && (
            <View style={ms.markerCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <T bold style={{ color: '#F7D488', fontSize: 13.5 }}>
                  📍 {currentMarkerObj.label}
                </T>
                <View style={ms.markerBadge}>
                  <T style={{ fontSize: 9, color: 'white', fontWeight: '700' }}>
                    {details.milestone.badgeTr}
                  </T>
                </View>
              </View>
              <T style={{ color: '#EDE3F2', fontSize: 12.5, marginTop: 4, lineHeight: 18 }}>
                {currentMarkerObj.desc}
              </T>
              <View style={ms.reassuranceBox}>
                <T style={{ fontSize: 11, color: '#F2DDF7', lineHeight: 16 }}>
                  🌿 <T bold style={{ color: 'white' }}>{isEn ? 'Clinical Reassurance: ' : 'Klinik Güven Notu: '}</T>
                  {isEn
                    ? 'Individual measurements vary normally; scans provide reassurance through overall proportional growth.'
                    : 'Milimetrik oynamalar tamamen doğaldır; hekiminiz tekil sayılara değil orantılı bütünsel gelişime bakar.'}
                </T>
              </View>
            </View>
          )}
        </Card>
      ) : (
        /* ─── MOD 4: ULTRASON RAPORU TERCÜMANI (HADLOCK BİYOMETRİ HESAPLAYICI) ─── */
        <View style={{ gap: 12 }}>
          <Card style={{ padding: 16, backgroundColor: '#FAF5FB', borderColor: '#EBE0EE' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Icon name="caliper" size={24} color={colors.purple} />
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 16, color: colors.ink }}>
                  {isEn ? 'Sonogram Biometry Decoder' : 'Ultrason Raporu Tercümanı'}
                </T>
                <T style={{ fontSize: 11.5, color: colors.muted }}>
                  {isEn ? `Week ${week} Hadlock Reference Standards` : `${week}. Hafta Hadlock Referans Değerleri`}
                </T>
              </View>
            </View>
            <T style={{ fontSize: 13, color: '#4D4352', lineHeight: 19 }}>
              {isEn
                ? 'Your doctor’s ultrasound slip contains abbreviations like BPD, HC, AC, and FL. Enter your numbers below to understand what they mean calmly.'
                : 'Doktorunuzun muayene çıktısındaki BPD, HC, AC ve FL kısaltmalarını aşağıya girerek persentil eğrisindeki yerini sakince görün.'}
            </T>
          </Card>

          {/* Biyometri Parametre Giriş Kartları */}
          {biometryReport.results.map(item => {
            return (
              <Card key={item.key} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 14, color: colors.ink }}>{item.label}</T>
                    <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>{item.desc}</T>
                  </View>
                  <View style={ms.normBadge}>
                    <T bold style={{ fontSize: 10, color: colors.purple }}>
                      {item.p10} - {item.p90} {item.unit}
                    </T>
                  </View>
                </View>

                {/* Giriş Kutusu */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <TextInput
                    style={ms.biometryInput}
                    placeholder={`${item.p50}`}
                    placeholderTextColor="#BFA9C4"
                    keyboardType="numeric"
                    value={biometryInputs[item.key]}
                    onChangeText={txt => setBiometryInputs(prev => ({ ...prev, [item.key]: txt }))}
                  />
                  <T style={{ fontSize: 13, color: colors.muted }}>{item.unit}</T>
                  <View style={{ flex: 1 }} />
                  {item.entered ? (
                    <View style={[
                      ms.percentilePill,
                      item.status === 'normal' && { backgroundColor: '#EBF7EE', borderColor: '#A3D9AE' }
                    ]}>
                      <T bold style={{ fontSize: 11, color: item.status === 'normal' ? '#276E3A' : '#7D4C8A' }}>
                        ~%{item.percentile} Persentil ({item.statusText})
                      </T>
                    </View>
                  ) : (
                    <T style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
                      {isEn ? 'Normal: ~' + item.p50 + item.unit : 'Ortalama: ~' + item.p50 + item.unit}
                    </T>
                  )}
                </View>

                {/* Görsel Persentil Çubuğu */}
                {item.entered && (
                  <View style={{ marginTop: 10 }}>
                    <View style={ms.percentileTrack}>
                      <View style={[ms.percentileFill, { width: `${item.percentile}%` }]} />
                      <View style={[ms.percentileMarker, { left: `${item.percentile}%` }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <T style={{ fontSize: 9, color: colors.muted }}>10p ({item.p10}{item.unit})</T>
                      <T style={{ fontSize: 9, color: colors.purple, fontWeight: '700' }}>50p ({item.p50}{item.unit})</T>
                      <T style={{ fontSize: 9, color: colors.muted }}>90p ({item.p90}{item.unit})</T>
                    </View>
                  </View>
                )}
              </Card>
            );
          })}

          {/* Klinik Özet ve Güven Mesajı */}
          <Card style={{ padding: 16, backgroundColor: '#FAF6EE', borderColor: '#EADBBD' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <T style={{ fontSize: 18 }}>🩺</T>
              <T bold style={{ fontSize: 14, color: '#664F22' }}>
                {isEn ? 'Clinical Interpretation Note' : 'Klinik Değerlendirme Notu'}
              </T>
            </View>
            <T style={{ fontSize: 13, color: '#54421E', lineHeight: 20 }}>
              {biometryReport.summaryMessage}
            </T>
          </Card>
        </View>
      )}

      {/* Bu Hafta Neye Bakılır & Doktor Randevusu Tavsiyeleri */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="calendar" size={18} color={colors.purple} />
          <T bold style={{ fontSize: 15, color: colors.ink }}>
            {isEn ? `What to discuss at Week ${week}?` : `${week}. Hafta Kontrolünde Neler Konuşulur?`}
          </T>
        </View>
        <T style={{ fontSize: 13, color: '#4E4654', lineHeight: 21 }}>
          {details.summary}
        </T>
        <View style={{ marginTop: 12, backgroundColor: '#FAF4FA', padding: 10, borderRadius: 12 }}>
          <T bold style={{ fontSize: 11, color: colors.purple, marginBottom: 4 }}>
            {isEn ? 'Suggested Questions for Your Doctor:' : 'Hekiminize Yöneltebileceğiniz Güzel Sorular:'}
          </T>
          <T style={{ fontSize: 12, color: '#56445B', lineHeight: 18 }}>
            {week <= 14
              ? (isEn ? '• How do the NT and nasal bone measurements compare to normal screening standards?\n• When should we schedule the second trimester anatomy scan?' : '• Ense kalınlığı ve burun kemiği tarama standartlarıyla tam uyumlu mu?\n• 2. Düzey detaylı ultrason randevumuzu hangi haftaya planlayalım?')
              : week <= 24
              ? (isEn ? '• Did we clearly visualize all four chambers of the heart and kidneys?\n• Where is the placenta located (anterior or posterior)?' : '• Kalbin 4 odacığı ve böbrekler net olarak görüntülendi mi?\n• Plasentanın yerleşimi doğum yolu açısından güvenli mesafede mi?')
              : (isEn ? '• What is the baby’s current presentation (head-down or breech)?\n• How is the amniotic fluid index and umbilical Doppler resistance?' : '• Bebeğin duruş pozisyonu baş gelişi mi, makat mı?\n• Amniyon sıvısı miktarı ve kordon Doppler kan akımı nasıl?')}
          </T>
        </View>
      </Card>
    </View>
  );
}

// ─── EKRAN 12: TIBBİ ZAMAN ÇİZELGESİ & TEST TAKVİMİ (MEDICAL TIMELINE) ────────
export const medicalMilestones = [
  { weekRange: '6-8. Hafta', title: 'İlk Muayene & Kalp Atışı', desc: 'Kese ve fetal kalp atımının teyidi', done: true, key: 'm1' },
  { weekRange: '11-14. Hafta', title: 'İkili Tarama & Ense Kalınlığı', desc: 'Kromozom anomalisi taraması ve burun kemiği', done: true, key: 'm2' },
  { weekRange: '16-18. Hafta', title: 'Dörtlü Tarama Testi', desc: 'Opsiyonel biyokimyasal risk taraması', done: true, key: 'm3' },
  { weekRange: '18-22. Hafta', title: 'Detaylı Anatomi Taraması · 2. Düzey USG', desc: 'Tüm iç organlar, beyin, kalp ve uzuvların tek tek incelenmesi', current: true, key: 'm4' },
  { weekRange: '24-28. Hafta', title: 'Şeker Yükleme & Tam Kan', desc: 'Gestasyonel diyabet ve kansızlık kontrolü', upcoming: true, key: 'm5' },
  { weekRange: '32-36. Hafta', title: 'Gelişim & NST Taramaları', desc: 'Bebek kalp atışı, hareket reaktivitesi ve pozisyonu', upcoming: true, key: 'm6' },
  { weekRange: '37-40. Hafta', title: 'Doğuma Hazırlık & Çatı Muayenesi', desc: 'Doğum kanalı, baş inişi ve son hazırlıklar', upcoming: true, key: 'm7' },
];

export function MedicalTimeline({ lang = 'tr' }) {
  const isEn = lang === 'en';
  const milestones = isEn ? [
    { weekRange: 'Weeks 6-8', title: 'First Exam & Heartbeat', desc: 'Confirmation of gestational sac and fetal heartbeat', done: true, key: 'm1' },
    { weekRange: 'Weeks 11-14', title: 'First Trimester Screening & NT', desc: 'Chromosomal abnormality screening and nuchal translucency', done: true, key: 'm2' },
    { weekRange: 'Weeks 16-18', title: 'Quad Screen Test', desc: 'Optional biochemical risk screening', done: true, key: 'm3' },
    { weekRange: 'Weeks 18-22', title: 'Detailed Anatomy Ultrasound · Level 2 USG', desc: 'Comprehensive scan of all internal organs, brain, heart, and limbs', current: true, key: 'm4' },
    { weekRange: 'Weeks 24-28', title: 'Glucose Screening & Full Blood Count', desc: 'Gestational diabetes and anemia screening', upcoming: true, key: 'm5' },
    { weekRange: 'Weeks 32-36', title: 'Growth & NST Scans', desc: 'Fetal heart rate monitoring, movement reactivity, and position', upcoming: true, key: 'm6' },
    { weekRange: 'Weeks 37-40', title: 'Birth Preparation & Pelvic Check', desc: 'Birth canal readiness, head engagement, and final preparations', upcoming: true, key: 'm7' },
  ] : medicalMilestones;

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'CHECKUP TIMELINE' : 'KONTROL TAKVİMİ'}
        title={isEn ? '40-week roadmap' : '40 haftalık yol haritası'}
        body={isEn ? 'Follow routine checkups and upcoming milestones week by week in a single stream.' : 'Rutin kontrolleri ve yaklaşan başlıkları hafta hafta tek akışta gör.'}
        icon="milestone"
        asset="ui_timeline_sun_moon"
        tint="#915B38"
      />

      <ToolExperienceCard
        title={isEn ? 'Know what comes next' : 'Sıradaki kontrolü bil'}
        steps={isEn
          ? ['See completed, current, and upcoming visits.', 'Open each milestone as a preparation checklist.', 'Save questions before the appointment.']
          : ['Tamamlanan, mevcut ve yaklaşan kontrolleri ayır.', 'Her başlığı hazırlık listesi gibi oku.', 'Randevu öncesi sorularını kaybetme.']}
        outcome={isEn ? 'A calmer medical calendar.' : 'Daha sakin ve planlı bir kontrol takvimi.'}
        asset="ui_timeline_sun_moon"
        tint="#915B38"
        lang={lang}
      />

      {/* Dikey Metro Haritası */}
      <View style={ms.timeline}>
        {milestones.map((m, idx) => (
          <View key={m.key} style={ms.timelineItem}>
            {/* Sol Hat & Rozet */}
            <View style={ms.timelineCol}>
              <View
                style={[
                  ms.node,
                  m.done && ms.nodeDone,
                  m.current && ms.nodeCurrent,
                  m.upcoming && ms.nodeUpcoming,
                ]}
              >
                {m.done ? (
                  <Icon name="check" size={13} color="white" />
                ) : m.current ? (
                  <View style={ms.pulsingCore} />
                ) : (
                  <T style={ms.nodeLock}>🔒</T>
                )}
              </View>
              {idx < milestones.length - 1 && <View style={ms.lineTrack} />}
            </View>

            {/* Sağ İçerik Kartı */}
            <View style={[ms.milestoneContent, m.current && ms.milestoneContentCurrent]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T bold style={{ fontSize: 11, color: m.current ? colors.purple : colors.muted }}>
                  {m.weekRange}
                </T>
                {m.current && (
                  <View style={ms.activeBadge}>
                    <T bold style={{ fontSize: 10, color: 'white' }}>{isEn ? 'CURRENT' : 'BU DÖNEM'}</T>
                  </View>
                )}
              </View>
              <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 4 }}>{m.title}</T>
              <T style={{ fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 }}>{m.desc}</T>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── EKRAN 13: AYRINTILI ORGAN GELİŞİMİ & KALP SESİ ─────────────────────────
export function OrganDevelopment({ state, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('heart');
  const [playing, setPlaying] = useState(false);
  const pulse = usePulse(0.9, 1.1, 800);

  const organs = isEn ? [
    {
      id: 'heart',
      title: 'Heart & Circulation',
      tabLabel: 'Heart',
      bpm: '145 BPM',
      icon: 'heart',
      desc: "Your baby's heart beats about 140-150 times per minute (twice an adult's!). Heart valves and 4 chambers are working perfectly.",
    },
    {
      id: 'brain',
      title: 'Brain & Nerves',
      tabLabel: 'Brain',
      bpm: null,
      icon: 'milestone',
      desc: 'Tens of thousands of new nerve cells connect every second. Centers for processing taste, smell, and sounds have activated.',
    },
    {
      id: 'senses',
      title: 'Senses & Movement',
      tabLabel: 'Senses',
      bpm: null,
      icon: 'footprint',
      desc: 'Eyelids react to light, recognizing your voice. Grasping reflex is practiced by clenching fingers.',
    },
    {
      id: 'bones',
      title: 'Bones & Fat',
      tabLabel: 'Bones',
      bpm: null,
      icon: 'scale',
      desc: 'Cartilage transforms into strong bone by storing calcium. Protective brown fat tissue accumulates under the skin.',
    },
  ] : [
    {
      id: 'heart',
      title: 'Kalp & Dolaşım',
      tabLabel: 'Kalp',
      bpm: '145 BPM',
      icon: 'heart',
      desc: 'Bebeğin kalbi dakikada yaklaşık 140-150 kez atar (yetişkinin iki katı!). Kalp kapakçıkları ve 4 odacık kusursuz çalışıyor.',
    },
    {
      id: 'brain',
      title: 'Beyin & Sinirler',
      tabLabel: 'Beyin',
      bpm: null,
      icon: 'milestone',
      desc: 'Her saniye on binlerce yeni sinir hücresi bağlantı kuruyor. Tat, koku ve sesleri işleme merkezleri aktifleşti.',
    },
    {
      id: 'senses',
      title: 'Duyular & Hareket',
      tabLabel: 'Duyular',
      bpm: null,
      icon: 'footprint',
      desc: 'Göz kapakları ışığa tepki veriyor, sesinizi tanıyor. El parmaklarını sıkarak kavrama refleksini çalıştırıyor.',
    },
    {
      id: 'bones',
      title: 'Kemikler & Yağ',
      tabLabel: 'Kemikler',
      bpm: null,
      icon: 'scale',
      desc: 'Kıkırdaklar kalsiyum depolayarak güçlü kemiklere dönüşüyor. Cilt altında koruyucu kahverengi yağ dokusu birikiyor.',
    },
  ];

  const currentOrgan = organs.find(o => o.id === activeTab) || organs[0];

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'DEVELOPMENT FOCUS' : 'GELİŞİM ODAKLARI'}
        title={isEn ? 'Explore organ development' : 'Organ gelişimini bölümlere ayır'}
        body={isEn ? 'Follow heart, brain, senses, and bone development on a single screen with clear headings.' : 'Kalp, beyin, duyular ve kemik gelişimini tek ekranda sade başlıklarla takip et.'}
        icon="heart"
        asset="ui_fetal_heart_3d"
        tint="#A84D67"
      />

      <ToolExperienceCard
        title={isEn ? 'Follow one system at a time' : 'Her sistemi tek tek izle'}
        steps={isEn
          ? ['Choose heart, brain, senses, or bones.', 'Read the current development note.', 'Return weekly to see what changed.']
          : ['Kalp, beyin, duyular veya kemikleri seç.', 'O haftanın gelişim notunu oku.', 'Haftalık değişimi görmek için geri dön.']}
        outcome={isEn ? 'Development feels visible, not abstract.' : 'Gelişim soyut değil, görünür hissedilir.'}
        asset="ui_fetal_heart_3d"
        tint="#A84D67"
        lang={lang}
      />

      {/* Kalp Atış Simülatörü Kartı */}
      <Card style={ms.heartPlayerCard}>
        <LinearGradient
          colors={['#4A2E44', '#2B1A28']}
          style={StyleSheet.absoluteFill}
        />
        <View style={ms.heartPlayerContent}>
          <Animated.View style={{ transform: [{ scale: playing ? pulse : 1 }] }}>
            <Tap
              onPress={() => setPlaying(!playing)}
              label={isEn ? 'Listen to heartbeat' : 'Kalp atışını dinle'}
              style={ms.heartBtn}
            >
              {generatedAssets['ui_fetal_heart_3d'] ? (
                <Image source={generatedAssets['ui_fetal_heart_3d']} style={{ width: 44, height: 44 }} resizeMode="contain" />
              ) : (
                <Icon name="heart" size={38} color="#FF6E8F" fill={playing ? '#FF6E8F' : 'none'} />
              )}
            </Tap>
          </Animated.View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <T bold style={{ color: 'white', fontSize: 16 }}>
              {isEn ? 'Average Fetal Heart Rate' : 'Ortalama Fetal Kalp Atımı'}
            </T>
            <T style={{ color: '#FFB8CA', fontSize: 13, marginTop: 2 }}>
              {isEn ? '~145 BPM · Dynamic Rhythm' : '~145 BPM · Dinamik Ritim'}
            </T>
            <T style={{ color: '#D9C1CE', fontSize: 11, marginTop: 4 }}>
              {playing
                ? (isEn ? '🎵 Heart rhythm playing...' : '🎵 Kalp ritmi çalıyor...')
                : (isEn ? 'Tap to listen' : 'Dinlemek için dokunun')}
            </T>
          </View>
        </View>
      </Card>

      {/* Organ Seçici Butonlar */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {organs.map(o => (
          <Tap
            key={o.id}
            onPress={() => setActiveTab(o.id)}
            label={o.title}
            style={[ms.organPill, activeTab === o.id && ms.organPillActive]}
          >
            <T bold={activeTab === o.id} style={{ fontSize: 12, color: activeTab === o.id ? 'white' : colors.ink }}>
              {o.tabLabel}
            </T>
          </Tap>
        ))}
      </View>

      {/* Detay Açıklama Kartı */}
      <Card style={{ padding: 16 }}>
        <T bold style={{ fontSize: 16, color: colors.purple }}>{currentOrgan.title}</T>
        {currentOrgan.bpm && (
          <View style={ms.bpmBadge}>
            <T bold style={{ fontSize: 12, color: '#C24D68' }}>{currentOrgan.bpm}</T>
          </View>
        )}
        <T style={{ fontSize: 14, color: '#4E4856', lineHeight: 22, marginTop: 10 }}>
          {currentOrgan.desc}
        </T>
      </Card>
    </View>
  );
}

const ms = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
  segRow: { flexDirection: 'row', gap: 8, backgroundColor: '#EFE7EE', padding: 4, borderRadius: 20 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: { backgroundColor: colors.purple },
  segText: { fontSize: 12 },
  heroCard: { padding: 20, alignItems: 'center', overflow: 'hidden' },
  heroMeta: { alignItems: 'center', marginBottom: 12 },
  stage: { alignItems: 'center', marginVertical: 10 },
  emojiStage: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  stageTitle: { fontSize: 22, color: colors.ink, marginTop: 8 },
  stageSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  metricsRow: { flexDirection: 'row', width: '100%', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: colors.line, justifyContent: 'space-around' },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { fontSize: 10, color: colors.muted },
  metricVal: { fontSize: 15, color: colors.ink },
  metricDivider: { width: 1, height: 28, backgroundColor: colors.line },
  weekPill: { minWidth: 44, paddingVertical: 8, borderRadius: 16, alignItems: 'center', backgroundColor: '#EDE4ED' },
  weekPillActive: { backgroundColor: colors.purple },
  // USG Clinical Console & Biometry styles
  milestoneChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: '#EFE6F0', alignItems: 'center', minWidth: 90 },
  milestoneChipActive: { backgroundColor: colors.purple },
  consoleChassis: { backgroundColor: '#0F0D15', borderRadius: 24, padding: 12, borderWidth: 1.5, borderColor: '#3E2F47', overflow: 'hidden' },
  consoleTelemetry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderColor: '#261F2E' },
  consoleGaBadge: { alignItems: 'center', backgroundColor: '#261B2E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#4F355E' },
  telemetryText: { fontSize: 10, color: '#A89CAD', letterSpacing: 0.4 },
  consoleScreen: { height: 230, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09080C', marginVertical: 8 },
  consoleImage: { width: '100%', height: '100%' },
  hotspot: { position: 'absolute', width: 36, height: 36, marginLeft: -18, marginTop: -18, alignItems: 'center', justifyContent: 'center' },
  hotspotRing: { position: 'absolute', width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#F5D38288' },
  hotspotDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#F5D382', alignItems: 'center', justifyContent: 'center' },
  hotspotDotActive: { backgroundColor: '#FFFFFF', transform: [{ scale: 1.25 }] },
  hotspotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1A1121' },
  dopplerAudioBtn: { position: 'absolute', bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3A1E4AEE', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#A86BB0' },
  landmarkChip: { backgroundColor: '#282030', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#42334F' },
  landmarkChipActive: { backgroundColor: colors.purple, borderColor: '#B575CE' },
  markerBadge: { backgroundColor: '#573866', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  reassuranceBox: { marginTop: 8, backgroundColor: '#3D2547', padding: 8, borderRadius: 10 },
  markerCard: { marginTop: 10, padding: 12, borderRadius: 14, backgroundColor: '#251C2C', borderWidth: 1, borderColor: '#473554' },
  normBadge: { backgroundColor: '#F0E5F5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  biometryInput: { width: 84, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#D9C7DC', paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, color: colors.ink },
  percentilePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E3D2E8', backgroundColor: '#FAF4FA' },
  percentileTrack: { height: 6, backgroundColor: '#EDE3F0', borderRadius: 3, overflow: 'visible', position: 'relative' },
  percentileFill: { height: '100%', backgroundColor: colors.purple, borderRadius: 3 },
  percentileMarker: { position: 'absolute', top: -3, width: 12, height: 12, borderRadius: 6, backgroundColor: '#3A8253', borderWidth: 2, borderColor: 'white', marginLeft: -6 },
  // Timeline styles
  timeline: { gap: 0, paddingLeft: 6 },
  timelineItem: { flexDirection: 'row', gap: 14 },
  timelineCol: { alignItems: 'center', width: 30 },
  node: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: colors.sage },
  nodeCurrent: { backgroundColor: colors.purple, borderWidth: 3, borderColor: '#DFC2E3' },
  nodeUpcoming: { backgroundColor: '#EDE5EE' },
  nodeLock: { fontSize: 11 },
  pulsingCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  lineTrack: { width: 2, flex: 1, backgroundColor: '#E8DFE9', marginVertical: 4 },
  milestoneContent: { flex: 1, padding: 12, borderRadius: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#F0EAE6', marginBottom: 12, ...shadow },
  milestoneContentCurrent: { borderColor: colors.purple, backgroundColor: '#FAF6FB' },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.purple },
  // Heart styles
  heartPlayerCard: { padding: 18, borderRadius: 20, overflow: 'hidden' },
  heartPlayerContent: { flexDirection: 'row', alignItems: 'center' },
  heartBtn: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#573750', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF9EBA' },
  organPill: { flex: 1, paddingVertical: 10, borderRadius: 16, backgroundColor: '#EFE7EE', alignItems: 'center' },
  organPillActive: { backgroundColor: colors.purple },
  bpmBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#FBE8ED', marginTop: 4 },
});
