import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Animated, TextInput, Modal } from 'react-native';
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
  const [week, setWeek] = useState(state?.week || 24);
  const [mode, setMode] = useState('fruit'); // 'fruit' | 'sweet' | 'animal' | 'baby'
  const [rotation, setRotation] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showDelta, setShowDelta] = useState(true);

  const info = getWeekInfo(week, lang);
  const prevWeek = Math.max(4, week - 1);
  const prevInfo = getWeekInfo(prevWeek, lang);

  const deltaLength = (info.lengthCm - prevInfo.lengthCm).toFixed(1);
  const deltaWeight = Math.max(0, info.weightG - prevInfo.weightG);

  // Asset selection for 3D baby / fetus
  const fetusAssetKey = 'fetus_w' + String(Math.min(40, Math.max(4, week))).padStart(2, '0');
  const fetusAsset = generatedAssets[fetusAssetKey] || generatedAssets.fetus;

  function rotate3d() {
    setRotation(r => (r + 45) % 360);
  }

  function toggleZoom() {
    setIsZoomed(z => !z);
  }

  function resetView() {
    setRotation(0);
    setIsZoomed(false);
  }

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'SCALE & VISUAL DISCOVERY' : 'BOYUT & GÖRSEL KEŞİF'}
        title={isEn ? "Feel your baby's real scale" : "Bebeğinin gerçek ölçeğini hisset"}
        body={isEn
          ? "Screen-scale fruit, sweets, baby animals, and 3D fetus comparisons week by week."
          : "Haftalık meyve, tatlı/nesne, sevimli hayvan ve 3D fetüs metaforlarıyla bebeğinin büyüme yolculuğu."}
        icon="sparkles"
        asset={fetusAssetKey}
        tint="#7B4C80"
      />

      {/* 4'lü Kategori Seçici Sekmeler: Meyve, Tatlı/Nesne, Hayvan, 3D Fetüs */}
      <View style={ms.segRow}>
        {[
          { id: 'fruit', label: isEn ? 'Fruit' : 'Meyve', icon: 'apple' },
          { id: 'sweet', label: isEn ? 'Sweet / Object' : 'Tatlı / Nesne', icon: 'cupcake' },
          { id: 'animal', label: isEn ? 'Baby Animal' : 'Yavru Hayvan', icon: 'paw' },
          { id: 'baby', label: isEn ? '3D Fetus' : '3D Fetüs', icon: 'heart' },
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

      {/* Büyük Hero Sahne Kartı (~Yarım Ekran Vurgusu) */}
      <Card style={[ms.heroCard, { minHeight: 310, paddingVertical: 16 }]}>
        <LinearGradient
          colors={['#F9F2F7', '#FCF8FB', '#F4ECF5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Hafta & Trimester Başlığı */}
        <View style={ms.heroMeta}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ backgroundColor: colors.purple, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <T bold style={{ fontSize: 13, color: 'white' }}>
                {week}. {isEn ? 'WEEK' : 'HAFTA'}
              </T>
            </View>
            <T style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>
              {trimesterLabel(info.trimester, lang).toLocaleUpperCase(isEn ? 'en' : 'tr')}
            </T>
          </View>
        </View>

        {/* Görsel Sahne */}
        <View style={[ms.stage, { minHeight: 180, justifyContent: 'center' }]}>
          {mode === 'baby' ? (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={fetusAsset}
                style={{
                  width: 210,
                  height: 190,
                  transform: [
                    { rotate: `${rotation}deg` },
                    { scale: isZoomed ? 1.25 : 1.0 },
                  ],
                }}
                resizeMode="contain"
              />
            </View>
          ) : mode === 'fruit' ? (
            <FruitArt type={info.fruit} size={170} />
          ) : (
            <ComparisonArt
              mode={mode}
              type={mode === 'animal' ? info.animal : info.sweet}
              size={155}
              emoji={mode === 'animal' ? (info.animalEmoji || '🐾') : (info.sweetEmoji || '🧁')}
              info={info}
              week={week}
            />
          )}

          <T bold style={[ms.stageTitle, { fontSize: 24, marginTop: 10 }]}>
            {mode === 'baby'
              ? (isEn ? `Week ${week} Fetal Anatomy` : `${week}. Hafta Fetal Anatomi`)
              : mode === 'fruit'
              ? `${info.fruitName}`
              : mode === 'animal'
              ? `${info.animalName}`
              : `${info.sweetName}`}
          </T>
          <T style={ms.stageSub}>
            {mode === 'baby'
              ? (isEn ? '3D Render scale & orientation' : 'Ölçekli 3D fetal modelleme')
              : (isEn ? 'approximate size metaphor' : 'büyüklüğünde')}
          </T>
        </View>

        {/* 3D İnteraksiyon Kontrolleri (Döndür, Yakınlaş, Sıfırla) */}
        {mode === 'baby' && (
          <View style={{ flexDirection: 'row', gap: 10, marginVertical: 6 }}>
            <Tap
              onPress={rotate3d}
              label={isEn ? "Rotate" : "Döndür"}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#E5D6E6' }}
            >
              <T style={{ fontSize: 13 }}>🔄</T>
              <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? `Rotate (${rotation}°)` : `Döndür (${rotation}°)`}</T>
            </Tap>
            <Tap
              onPress={toggleZoom}
              label={isEn ? "Zoom" : "Yakınlaş"}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: isZoomed ? colors.purple : 'rgba(255,255,255,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#E5D6E6' }}
            >
              <T style={{ fontSize: 13 }}>🔍</T>
              <T bold style={{ fontSize: 11, color: isZoomed ? 'white' : colors.purple }}>{isEn ? (isZoomed ? 'Zoom 1.25x' : 'Zoom 1x') : (isZoomed ? '1.25x Yakın' : '1x Normal')}</T>
            </Tap>
            {(rotation !== 0 || isZoomed) && (
              <Tap
                onPress={resetView}
                label={isEn ? "Reset" : "Sıfırla"}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#E5D6E6' }}
              >
                <T style={{ fontSize: 12 }}>↺</T>
                <T bold style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Reset' : 'Sıfırla'}</T>
              </Tap>
            )}
          </View>
        )}

        {/* Boy & Ağırlık Şeridi */}
        <View style={ms.metricsRow}>
          <View style={ms.metricItem}>
            <Icon name="ruler" size={18} color={colors.purple} />
            <View>
              <T style={ms.metricLabel}>{isEn ? 'Approx. Length' : 'Yaklaşık Boy'}</T>
              <T bold style={ms.metricVal}>{formatLength(info.lengthCm)}</T>
            </View>
          </View>
          <View style={ms.metricDivider} />
          <View style={ms.metricItem}>
            <Icon name="scale" size={18} color={colors.purple} />
            <View>
              <T style={ms.metricLabel}>{isEn ? 'Approx. Weight' : 'Yaklaşık Ağırlık'}</T>
              <T bold style={ms.metricVal}>{formatWeight(info.weightG)}</T>
            </View>
          </View>
        </View>
      </Card>

      {/* Karşılaştırma & Delta Kartı (Spec 05: 23 -> 24 week silhouette / delta) */}
      <Card style={{ padding: 14, backgroundColor: '#FAF6FA', borderColor: '#EBDDEB' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="chart" size={18} color={colors.purple} />
            <View>
              <T bold style={{ fontSize: 13.5, color: colors.ink }}>
                {isEn ? `Week-over-Week Delta (${prevWeek}w → ${week}w)` : `Haftalık Büyüme Farkı (${prevWeek}hf → ${week}hf)`}
              </T>
              <T style={{ fontSize: 11, color: colors.muted }}>
                {isEn ? 'Estimated 7-day developmental leap' : 'Tahmini 7 günlük gelişim sıçraması'}
              </T>
            </View>
          </View>
          <Tap
            onPress={() => setShowDelta(s => !s)}
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#EDE0EF' }}
          >
            <T bold style={{ fontSize: 11, color: colors.purple }}>{showDelta ? (isEn ? 'Hide' : 'Gizle') : (isEn ? 'Show' : 'Gör')}</T>
          </Tap>
        </View>

        {showDelta && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#EDE2EE' }}>
            <View style={{ flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 12, alignItems: 'center' }}>
              <T style={{ fontSize: 10.5, color: colors.muted }}>{isEn ? 'Length Delta' : 'Boy Artışı'}</T>
              <T bold style={{ fontSize: 15, color: '#317349', marginTop: 2 }}>+{deltaLength} cm</T>
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 12, alignItems: 'center' }}>
              <T style={{ fontSize: 10.5, color: colors.muted }}>{isEn ? 'Weight Delta' : 'Kilo Artışı'}</T>
              <T bold style={{ fontSize: 15, color: '#8A4A7A', marginTop: 2 }}>+{deltaWeight} g</T>
            </View>
          </View>
        )}
      </Card>

      {/* Hafta Seçici Şerit (4-40 Scrubber) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <T bold style={{ fontSize: 13, color: colors.ink }}>
          {isEn ? 'Week Scrubber (4–40)' : 'Hafta Cetveli (4–40)'}
        </T>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Tap
            onPress={() => setWeek(w => Math.max(4, w - 1))}
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#EFE5F0' }}
          >
            <T bold style={{ fontSize: 11, color: colors.purple }}>← {isEn ? 'Prev' : 'Önceki'}</T>
          </Tap>
          <Tap
            onPress={() => setWeek(w => Math.min(40, w + 1))}
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#EFE5F0' }}
          >
            <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'Next' : 'Sonraki'} →</T>
          </Tap>
        </View>
      </View>

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

      {/* Şık Hafta Adımlayıcı (Week Navigator) */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5EEF8',
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#E8DCEB'
      }}>
        <Tap
          label={isEn ? 'Previous week' : 'Önceki hafta'}
          onPress={() => setWeek(w => Math.max(4, w - 1))}
          style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: week <= 4 ? '#EFE9F2' : '#E5D6EB' }}
          disabled={week <= 4}
        >
          <T bold style={{ fontSize: 13, color: week <= 4 ? colors.muted : colors.purple }}>‹ {isEn ? 'Prev' : 'Önceki'}</T>
        </Tap>

        <View style={{ alignItems: 'center' }}>
          <T bold style={{ fontSize: 14, color: '#3E2552' }}>
            {isEn ? `Week ${week} Fetal Scan` : `${week}. Hafta Taraması`}
          </T>
          <T style={{ fontSize: 10.5, color: colors.muted, marginTop: 1 }}>
            {details.milestone ? (isEn ? details.milestone.titleEn : details.milestone.titleTr) : (isEn ? 'Ultrasound View' : 'Ultrason Görünümü')}
          </T>
        </View>

        <Tap
          label={isEn ? 'Next week' : 'Sonraki hafta'}
          onPress={() => setWeek(w => Math.min(40, w + 1))}
          style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: week >= 40 ? '#EFE9F2' : '#E5D6EB' }}
          disabled={week >= 40}
        >
          <T bold style={{ fontSize: 13, color: week >= 40 ? colors.muted : colors.purple }}>{isEn ? 'Next' : 'Sonraki'} ›</T>
        </Tap>
      </View>

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

export function MedicalTimeline({ state, update, open, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const defaultMilestones = isEn ? [
    { weekRange: 'Weeks 6-8', title: 'First Exam & Heartbeat', desc: 'Confirmation of gestational sac and fetal heartbeat', what: 'Ultrasound scan confirming intrauterine pregnancy and heartbeat viability.', prep: 'Arrive with a moderately full bladder for pelvic clarity.', key: 'm1' },
    { weekRange: 'Weeks 11-14', title: 'First Trimester Screening & NT', desc: 'Chromosomal abnormality screening and nuchal translucency', what: 'Measurement of fetal nuchal translucency combined with maternal blood biochemistry.', prep: 'Bring all past medical and ultrasound records.', key: 'm2' },
    { weekRange: 'Weeks 16-18', title: 'Quad Screen Test', desc: 'Optional biochemical risk screening', what: 'Maternal serum screening measuring 4 specific fetal proteins.', prep: 'Routine blood draw; no fasting required.', key: 'm3' },
    { weekRange: 'Weeks 18-22', title: 'Detailed Anatomy Ultrasound (Level 2)', desc: 'Comprehensive scan of all internal organs, brain, heart, and limbs', what: '45-minute detailed examination of fetal brain, chambers of the heart, kidneys, and spine.', prep: 'Eat a small snack 30 mins before so baby is gently active.', key: 'm4' },
    { weekRange: 'Weeks 24-28', title: 'Glucose Screening & Full Blood Count', desc: 'Gestational diabetes and anemia screening', what: 'Oral glucose tolerance challenge and hemoglobin evaluation.', prep: 'Follow fasting or timing instructions given specifically by your clinic.', key: 'm5' },
    { weekRange: 'Weeks 32-36', title: 'Growth & NST Scans', desc: 'Fetal heart rate monitoring, movement reactivity, and position', what: 'Cardiotocography recording baseline fetal heart rate patterns and uterine contractions.', prep: 'Relax in a semi-reclined position; comfortable loose clothing.', key: 'm6' },
    { weekRange: 'Weeks 37-40', title: 'Birth Preparation & Pelvic Check', desc: 'Birth canal readiness, head engagement, and final preparations', what: 'Assessment of fetal presentation (cephalic/breech) and maternal cervical readiness.', prep: 'Have your hospital bag checklist and birth preferences ready.', key: 'm7' },
  ] : [
    { weekRange: '6-8. Hafta', title: 'İlk Muayene & Kalp Atışı', desc: 'Kese ve fetal kalp atışının ultrasonla teyidi', what: 'Gebelik kesesinin yerleşimi ve embriyonik kalp ritminin ilk tespiti.', prep: 'Muayene öncesi ılık su için, önceki tahlillerinizi yanınızda bulundurun.', key: 'm1' },
    { weekRange: '11-14. Hafta', title: '1. Trimester Taraması & NT', desc: 'Ense kalınlığı ölçümü ve ikili tarama testi', what: 'Fetal ense saydamlığı (NT) ve burun kemiği değerlendirmesiyle biyokimyasal tarama.', prep: 'Açlık gerekmez; ultrason görüntülerini saklamak için dosyanızı getirin.', key: 'm2' },
    { weekRange: '16-18. Hafta', title: 'Dörtlü Tarama Testi', desc: 'İkinci trimester biyokimyasal risk değerlendirmesi', what: 'Anne kanından alınan örnekle protein ve hormon düzeylerinin incelenmesi.', prep: 'Rutin kan alımıdır; özel bir diyet kısıtlaması gerektirmez.', key: 'm3' },
    { weekRange: '18-22. Hafta', title: 'Detaylı Anatomi Ultrasonu (Düzey 2)', desc: 'Beyin, kalp odacıkları, omurga ve tüm organ taraması', what: 'Radyolog veya perinatolog eşliğinde bebeğin tüm organ sistemlerinin incelenmesi.', prep: 'Bebeğin hareketlenmesi için muayeneden 30 dk önce hafif bir meyve/atıştırmalık tüketin.', key: 'm4' },
    { weekRange: '24-28. Hafta', title: 'Şeker Yükleme & Kan Sayımı', desc: 'Gestasyonel diyabet ve anemi taraması', what: 'Gebelik diyabeti riskini saptamak için glukoz tolerans testi ve demir seviyesi kontrolü.', prep: 'Kliniğinizin verdiği açlık veya bekleme talimatına tam uyun.', key: 'm5' },
    { weekRange: '32-36. Hafta', title: 'Büyüme Takibi & NST', desc: 'Fetal kalp ritmi reaktivitesi ve amniyon sıvısı kontrolü', what: 'Non-Stres Test (NST) probu ile bebeğin kalp atışları ve kasılmaların kaydedilmesi.', prep: 'Rahat kıyafetler giyin; seans 20-30 dakika sürer.', key: 'm6' },
    { weekRange: '37-40. Hafta', title: 'Doğum Hazırlığı & Çatı Kontrolü', desc: 'Doğum kanalı, baş inişi ve son hazırlıklar', what: 'Bebeğin geliş pozisyonu, plasenta yerleşimi ve doğum kanalı değerlendirmesi.', prep: 'Hastane çantanızı ve doktorunuza sormak istediğiniz soruları hazır tutun.', key: 'm7' },
  ];

  const currentWeek = state?.week || 24;
  const completedKeys = state?.completedMilestones || ['m1', 'm2', 'm3'];

  // Current milestone determination based on week
  const milestones = defaultMilestones.map(m => {
    const isDone = completedKeys.includes(m.key);
    let isCurrent = false;
    let isUpcoming = false;
    if (m.key === 'm4' && currentWeek >= 18 && currentWeek <= 22) isCurrent = true;
    else if (m.key === 'm5' && currentWeek >= 23 && currentWeek <= 28) isCurrent = true;
    else if (!isDone) isUpcoming = true;

    return {
      ...m,
      done: isDone,
      current: isCurrent,
      upcoming: !isDone && !isCurrent,
    };
  });

  const nextMilestone = milestones.find(m => m.current || m.upcoming) || milestones[0];
  const appointment = state?.appointment;

  function toggleMilestoneDone(key) {
    const nextCompleted = completedKeys.includes(key)
      ? completedKeys.filter(k => k !== key)
      : [...completedKeys, key];

    update && update({ completedMilestones: nextCompleted });
    if (selectedMilestone && selectedMilestone.key === key) {
      setSelectedMilestone(prev => ({ ...prev, done: !prev.done }));
    }
  }

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'CARE TIMELINE' : 'KONTROL ZAMAN ÇİZELGESİ'}
        title={isEn ? 'Personal Care Milestones' : 'Kişisel Kontrol Takvimi'}
        body={isEn ? 'Track prenatal visits, preparation guides, and custom doctor appointments.' : 'Gebelikte rutin testleri, muayene hazırlıklarını ve doktor randevularını tek akışta takip edin.'}
        icon="milestone"
        asset="ui_timeline_sun_moon"
        tint="#915B38"
      />

      {/* 1. SIRADAKİ KONTROL KARTI (SPEC 06_CONTROL_TIMELINE) */}
      <Card style={{ padding: 18, backgroundColor: '#FFFDF9', borderColor: '#EADCCE', borderWidth: 1.5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T bold style={{ fontSize: 11, color: '#8A5232', letterSpacing: 1.5 }}>
            {isEn ? 'NEXT UPCOMING VISIT' : 'SIRADAKİ KONTROL'}
          </T>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#F5EAE0' }}>
            <T bold style={{ fontSize: 11, color: '#8A5232' }}>{nextMilestone?.weekRange}</T>
          </View>
        </View>

        <T bold style={{ fontSize: 17, color: colors.ink, marginTop: 8 }}>
          {nextMilestone?.title}
        </T>
        <T style={{ fontSize: 12.5, color: colors.muted, marginTop: 4, lineHeight: 18 }}>
          {nextMilestone?.desc}
        </T>

        {/* Randevu Durumu */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#F2E8DF' }}>
          <Icon name="calendar" size={16} color="#8A5232" />
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 13, color: colors.ink }}>
              {appointment?.date ? `${appointment.date} · ${appointment.time || '10:00'}` : (isEn ? 'No appointment scheduled yet' : 'Henüz randevu girilmedi')}
            </T>
            {appointment?.title && (
              <T style={{ fontSize: 11, color: colors.muted }}>{appointment.title}</T>
            )}
          </View>
          <Tap
            onPress={() => open && open('appointment')}
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#8A5232' }}
          >
            <T bold style={{ color: 'white', fontSize: 12 }}>
              {appointment?.date ? (isEn ? 'Edit' : 'Değiştir') : (isEn ? '+ Book' : '+ Randevu Ekle')}
            </T>
          </Tap>
        </View>
      </Card>

      {/* Dikey Metro Haritası */}
      <View style={ms.timeline}>
        {milestones.map((m, idx) => (
          <Tap key={m.key} onPress={() => setSelectedMilestone(m)} style={ms.timelineItem}>
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
                  <Icon name="time" size={12} color="#A79AA7" />
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
                {m.current ? (
                  <View style={ms.activeBadge}>
                    <T bold style={{ fontSize: 10, color: 'white' }}>{isEn ? 'CURRENT' : 'BU DÖNEM'}</T>
                  </View>
                ) : m.done ? (
                  <T bold style={{ fontSize: 11, color: '#317349' }}>{isEn ? 'Done ✓' : 'Tamamlandı ✓'}</T>
                ) : null}
              </View>
              <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 4 }}>{m.title}</T>
              <T style={{ fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 }}>{m.desc}</T>
            </View>
          </Tap>
        ))}
      </View>

      {/* Kontrol Detay Modalı (Spec 06: nedir, nasıl hazırlanırım, doktora sorularım) */}
      <Modal visible={!!selectedMilestone} transparent animationType="fade" onRequestClose={() => setSelectedMilestone(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(20,10,25,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: '100%', maxWidth: 360, padding: 22, borderRadius: 24, backgroundColor: 'white', gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <T style={{ fontSize: 11, color: colors.muted }}>{selectedMilestone?.weekRange}</T>
                <T bold style={{ fontSize: 16, color: colors.ink, marginTop: 2 }}>{selectedMilestone?.title}</T>
              </View>
              <Tap onPress={() => setSelectedMilestone(null)} style={{ padding: 6 }}>
                <Icon name="close" size={18} color={colors.muted} />
              </Tap>
            </View>

            <View style={{ backgroundColor: '#F9F5FA', padding: 12, borderRadius: 14 }}>
              <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? 'What is this visit?' : 'Bu kontrol nedir?'}</T>
              <T style={{ fontSize: 12, color: colors.ink, marginTop: 3, lineHeight: 17 }}>{selectedMilestone?.what}</T>
            </View>

            <View style={{ backgroundColor: '#F5FAF6', padding: 12, borderRadius: 14 }}>
              <T bold style={{ fontSize: 12, color: '#317349' }}>{isEn ? 'How to prepare?' : 'Nasıl hazırlanırım?'}</T>
              <T style={{ fontSize: 12, color: colors.ink, marginTop: 3, lineHeight: 17 }}>{selectedMilestone?.prep}</T>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <Tap
                onPress={() => {
                  if (selectedMilestone) toggleMilestoneDone(selectedMilestone.key);
                }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: selectedMilestone?.done ? '#EDE6EE' : '#317349', alignItems: 'center' }}
              >
                <T bold style={{ color: selectedMilestone?.done ? colors.ink : 'white', fontSize: 12 }}>
                  {selectedMilestone?.done ? (isEn ? 'Mark Undone' : 'Tamamlanmadı Yap') : (isEn ? '✓ Mark Completed' : '✓ Tamamlandı İşaretle')}
                </T>
              </Tap>
              <Tap
                onPress={() => {
                  setSelectedMilestone(null);
                  open && open('doctorQuestions');
                }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center' }}
              >
                <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Doctor Questions →' : 'Doktora Sorular →'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

// ─── EKRAN 13: AYRINTILI ORGAN GELİŞİMİ & KALP SESİ ─────────────────────────
export function OrganDevelopment({ state, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [week, setWeek] = useState(state?.week || 24);
  const [activeTab, setActiveTab] = useState('heart'); // 'heart' | 'brain' | 'lungs' | 'senses' | 'bones'
  const [playing, setPlaying] = useState(false);
  const pulse = usePulse(0.9, 1.1, 800);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  function toggleHeartSound() {
    if (playing) {
      stopSound();
      setPlaying(false);
    } else {
      playSound('fetalHeartbeat', { volume: 0.85 });
      setPlaying(true);
    }
  }

  // 5 Organ Tanımı (Spec 07: Kalp, Beyin, Akciğer, Duyular, Kemikler)
  const organs = [
    {
      id: 'heart',
      title: isEn ? 'Heart & Circulation' : 'Kalp & Dolaşım',
      tabLabel: isEn ? 'Heart' : 'Kalp',
      icon: 'heart',
      bpm: '~140-150 BPM',
      hotspotCoord: { top: '48%', left: '46%' },
      current: isEn
        ? "The fetal heart beats about 140-150 times per minute (twice an adult rate). All four chambers and vital valves are fully functioning."
        : "Bebeğin kalbi dakikada yaklaşık 140-150 kez atıyor (yetişkinin iki katı!). Dört odacık ve kalbin ana kapakçıkları kusursuz çalışıyor.",
      developing: isEn
        ? "Cardiovascular network branches out to supply oxygen to the rapid brain growth and budding extremities."
        : "Hızla büyüyen beyin dokusu ve uzuvları beslemek için kılcal damar ağı genişliyor, kan hacmi haftalık artış gösteriyor.",
      next: isEn
        ? "Postnatal circulation bypass (ductus arteriosus) will train to close immediately after the first breath at birth."
        : "Doğum anında ilk nefesle birlikte kapanacak olan fetal dolaşım köprüsü (duktus arteriozus) olgunlaşmaya devam edecek.",
    },
    {
      id: 'brain',
      title: isEn ? 'Brain & Nervous System' : 'Beyin & Sinir Sistemi',
      tabLabel: isEn ? 'Brain' : 'Beyin',
      icon: 'milestone',
      bpm: null,
      hotspotCoord: { top: '24%', left: '50%' },
      current: isEn
        ? "Tens of thousands of new neuronal synaptic connections are established every single second."
        : "Her saniye on binlerce yeni nöron ve sinirsel sinaps bağlantısı kuruluyor; temel beyin korteksi kıvrımları derinleşiyor.",
      developing: isEn
        ? "Cerebral cortex forms its characteristic gyri and sulci for advanced sensory processing and memory retention."
        : "Tat, koku ve sesleri işleme merkezleri elektriksel olarak aktifleşti; bebeğin uyku ve uyanıklık döngüleri belirginleşti.",
      next: isEn
        ? "Rapid myelination of nerve fibers begins, protecting nerve pathways and accelerating impulse transmission."
        : "Sinir iletim hızını artıran miyelin kılıfı oluşumu başlayacak ve refleks yanıtları daha koordineli hale gelecek.",
    },
    {
      id: 'lungs',
      title: isEn ? 'Lungs & Respiratory Tract' : 'Akciğer & Solunum',
      tabLabel: isEn ? 'Lungs' : 'Akciğer',
      icon: 'wind',
      bpm: null,
      hotspotCoord: { top: '44%', left: '54%' },
      current: isEn
        ? "Baby practices breathing movements by rhythmically inhaling and exhaling amniotic fluid through developing bronchi."
        : "Bebek, amniyon sıvısını ritmik olarak soluyup bırakarak diyafram ve göğüs kafesi solunum antrenmanları yapıyor.",
      developing: isEn
        ? "Surfactant-producing type II alveolar cells are actively forming inside primitive air sacs."
        : "Alveol keseciklerinin birbirine yapışmasını önleyen hayati sürfaktan maddesini üreten hücreler aktifleşmeye başladı.",
      next: isEn
        ? "Terminal alveolar capillary beds multiply by millions to ensure effortless atmospheric oxygen transfer at birth."
        : "Doğumdan sonraki ilk atmosferik nefes için milyonlarca yeni mikroskobik hava keseciği damarlanacak.",
    },
    {
      id: 'senses',
      title: isEn ? 'Senses & Reflexes' : 'Duyular & Hareket',
      tabLabel: isEn ? 'Senses' : 'Duyular',
      icon: 'footprint',
      bpm: null,
      hotspotCoord: { top: '30%', left: '42%' },
      current: isEn
        ? "Auditory nerve structures can distinguish maternal voice tone, heartbeat vibrations, and ambient domestic sounds."
        : "İşitme kemikçikleri ses titreşimlerini iletiyor; annenin ses tonu, kalp atımı ve dış dünya sesleri ayırt ediliyor.",
      developing: isEn
        ? "Retinal photoreceptors react to strong light sources directed toward the maternal abdomen; blinking reflex is primed."
        : "Göz kapakları ışığa tepki veriyor, el parmaklarını sıkarak kavrama refleksini ve yüzüne dokunma alışkanlığını çalıştırıyor.",
      next: isEn
        ? "Taste buds on the tongue distinguish sweet flavours from swallowed amniotic fluid after meals."
        : "Amniyon sıvısına geçen aromatik moleküller sayesinde tat alma reseptörleri anne sütüne hazırlık yapacak.",
    },
    {
      id: 'bones',
      title: isEn ? 'Bones, Muscle & Strength' : 'Kemikler & Kaslar',
      tabLabel: isEn ? 'Bones' : 'Kemikler',
      icon: 'scale',
      bpm: null,
      hotspotCoord: { top: '65%', left: '48%' },
      current: isEn
        ? "Cartilage skeleton continues progressive ossification by mineralizing calcium and phosphorus from maternal stores."
        : "Kıkırdak iskelet, anne depolarından çekilen kalsiyum ve fosfor ile sağlam kemik dokusuna dönüşmeye devam ediyor.",
      developing: isEn
        ? "Long bones in legs and arms reinforce, producing strong coordinated kicks, stretches, and somatic somersaults."
        : "Kol ve bacaklardaki uzun kemikler güçlendikçe tekmeler, gerinmeler ve pozisyon değişiklikleri daha belirgin hissediliyor.",
      next: isEn
        ? "Cranial skull plates remain soft and separated by flexible fontanelles to safeguard safe passage through the birth canal."
        : "Kafatası kemikleri doğum kanalından kolay ve güvenli geçişi sağlamak için bıngıldaklarla esnek ve ayrı kalacak.",
    },
  ];

  const currentOrgan = organs.find(o => o.id === activeTab) || organs[0];
  const fetusAssetKey = 'fetus_w' + String(Math.min(40, Math.max(4, week))).padStart(2, '0');
  const fetusAsset = generatedAssets[fetusAssetKey] || generatedAssets.fetus;

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'ORGAN DEVELOPMENT & HEARTBEAT' : 'ORGAN GELİŞİMİ & KALP RİTİMİ'}
        title={isEn ? 'Explore bodily systems in depth' : 'Bebeğinin organ gelişimini adım adım keşfet'}
        body={isEn
          ? 'Track heart, brain, lungs, senses, and bone maturation with layered developmental notes.'
          : 'Kalp, beyin, akciğer, duyu ve iskelet sisteminin gelişimini katmanlı klinik açıklamalarla incele.'}
        icon="heart"
        asset={fetusAssetKey}
        tint="#A84D67"
      />

      {/* 5'li Organ Seçici Sekmeler (Spec 07) */}
      <View style={ms.segRow}>
        {organs.map(o => (
          <Tap
            key={o.id}
            onPress={() => setActiveTab(o.id)}
            label={o.title}
            style={[ms.segBtn, activeTab === o.id && ms.segBtnActive]}
          >
            <T bold={activeTab === o.id} style={[ms.segText, activeTab === o.id && { color: 'white' }]}>
              {o.tabLabel}
            </T>
          </Tap>
        ))}
      </View>

      {/* Fetus Görseli & Hotspot Göstergesi */}
      <Card style={{ padding: 14, alignItems: 'center', backgroundColor: '#FAF3F7', borderColor: '#EBDCE6', overflow: 'hidden' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <T bold style={{ fontSize: 13, color: colors.purple }}>
            {week}. {isEn ? 'WEEK VISUAL FOCUS' : 'HAFTA GELİŞİM ODAĞI'}
          </T>
          <View style={{ backgroundColor: '#EDE0EE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
            <T bold style={{ fontSize: 11, color: colors.purple }}>{currentOrgan.tabLabel}</T>
          </View>
        </View>

        <View style={{ width: 220, height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Image source={fetusAsset} style={{ width: 190, height: 160 }} resizeMode="contain" />

          {/* Dinamik Organ Sıcak Noktası (Hotspot) */}
          <View style={[ms.hotspot, currentOrgan.hotspotCoord]}>
            <Animated.View style={[ms.hotspotRing, { transform: [{ scale: pulse }] }]} />
            <View style={[ms.hotspotDot, ms.hotspotDotActive]}>
              <View style={ms.hotspotInner} />
            </View>
          </View>
        </View>
      </Card>

      {/* 3 Katmanlı İçerik Kartı (Spec 07: Şu anda, Bu hafta gelişen, Sonraki adım) */}
      <Card style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T bold style={{ fontSize: 16, color: colors.ink }}>{currentOrgan.title}</T>
          {currentOrgan.bpm && (
            <View style={ms.bpmBadge}>
              <T bold style={{ fontSize: 11, color: '#C24D68' }}>{currentOrgan.bpm}</T>
            </View>
          )}
        </View>

        {/* 1. Katman: Şu Anda */}
        <View style={{ backgroundColor: '#FAF5FA', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#EDE2EE' }}>
          <T bold style={{ fontSize: 11.5, color: colors.purple, letterSpacing: 0.8 }}>
            {isEn ? '📍 CURRENT STATUS (NOW)' : '📍 ŞU ANDA'}
          </T>
          <T style={{ fontSize: 13, color: '#4E4856', lineHeight: 19, marginTop: 4 }}>
            {currentOrgan.current}
          </T>
        </View>

        {/* 2. Katman: Bu Hafta Gelişen */}
        <View style={{ backgroundColor: '#FFFDF7', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#EFE2CC' }}>
          <T bold style={{ fontSize: 11.5, color: '#8F6122', letterSpacing: 0.8 }}>
            {isEn ? '🌱 DEVELOPING THIS WEEK' : '🌱 BU HAFTA GELİŞEN'}
          </T>
          <T style={{ fontSize: 13, color: '#564634', lineHeight: 19, marginTop: 4 }}>
            {currentOrgan.developing}
          </T>
        </View>

        {/* 3. Katman: Sonraki Adım */}
        <View style={{ backgroundColor: '#F5FAF6', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#D4E8DA' }}>
          <T bold style={{ fontSize: 11.5, color: '#2E7543', letterSpacing: 0.8 }}>
            {isEn ? '⏭️ NEXT STEP' : '⏭️ SONRAKİ ADIM'}
          </T>
          <T style={{ fontSize: 13, color: '#3A5242', lineHeight: 19, marginTop: 4 }}>
            {currentOrgan.next}
          </T>
        </View>
      </Card>

      {/* Kalp Atışı Simülatörü Kartı + ZORUNLU MEDİKAL SORUMLULUK REDDİ */}
      <Card style={ms.heartPlayerCard}>
        <LinearGradient
          colors={['#4A2E44', '#2B1A28']}
          style={StyleSheet.absoluteFill}
        />
        <View style={ms.heartPlayerContent}>
          <Animated.View style={{ transform: [{ scale: playing ? pulse : 1 }] }}>
            <Tap
              onPress={toggleHeartSound}
              label={isEn ? 'Listen to heartbeat' : 'Kalp atışını dinle'}
              style={ms.heartBtn}
            >
              <Icon name="heart" size={34} color="#FF6E8F" fill={playing ? '#FF6E8F' : 'none'} />
            </Tap>
          </Animated.View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <T bold style={{ color: 'white', fontSize: 15 }}>
              {isEn ? 'Representative Fetal Heart Sound' : 'Temsili Fetal Kalp Sesi'}
            </T>
            <T style={{ color: '#FFB8CA', fontSize: 12.5, marginTop: 2 }}>
              ~140-150 BPM · Rhythmic Demo
            </T>
            <T style={{ color: '#D9C1CE', fontSize: 11, marginTop: 4 }}>
              {playing
                ? (isEn ? '🎵 Audio rhythm playing...' : '🎵 Temsili ses çalıyor...')
                : (isEn ? 'Tap to listen' : 'Dinlemek için dokunun')}
            </T>
          </View>
        </View>

        {/* SPEC 07 ZORUNLU UYARI NOTU */}
        <View style={{ marginTop: 12, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <T style={{ fontSize: 11, color: '#E8D4E2', lineHeight: 15, textAlign: 'center' }}>
            ⚠️ <T bold style={{ color: 'white' }}>{isEn ? 'Educational simulation only — not a clinical measurement.' : 'Temsili eğitim sesi — gerçek ölçüm değildir.'}</T> {isEn ? 'Never use as diagnostic fetal heart monitoring.' : 'Gerçek fetal kalp atımı teşhisi amacıyla kullanılamaz.'}
          </T>
        </View>
      </Card>

      {/* Hafta Kaydırıcı Şerit */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <T bold style={{ fontSize: 12.5, color: colors.ink }}>
          {isEn ? 'Organ Timeline (4–40w)' : 'Organ Gelişim Haftası (4–40)'}
        </T>
        <T style={{ fontSize: 11, color: colors.purple }}>{week}. {isEn ? 'Week' : 'Hafta'}</T>
      </View>
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
