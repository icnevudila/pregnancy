import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress } from './ui';
import { usePulse } from './anim';
import { secondsLabel, uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';

// ─── 1. TEKME SAYACI (KICK COUNTER) ──────────────────────────────────────────
export function KickCounter({ state, update, toast }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const pulse = usePulse(0.96, 1.04, 1400);
  const timerRef = useRef(null);

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionActive]);

  function handleKick() {
    if (!sessionActive) {
      setSessionActive(true);
    }
    const nextKicks = kicks + 1;
    setKicks(nextKicks);

    if (nextKicks >= 10) {
      finishSession(nextKicks, seconds);
    }
  }

  function finishSession(finalKicks = kicks, finalSecs = seconds) {
    setSessionActive(false);
    if (finalKicks === 0) return;
    const newSession = {
      id: uid(),
      date: localDay(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      kicks: finalKicks,
      durationSecs: finalSecs,
      week: state.week || 28,
    };
    update(old => ({
      kickSessions: [newSession, ...(old.kickSessions || [])],
    }));
    toast && toast(`🎉 10 tekme ${secondsLabel(finalSecs)} içinde kaydedildi!`);
    setKicks(0);
    setSeconds(0);
  }

  function resetSession() {
    setSessionActive(false);
    setKicks(0);
    setSeconds(0);
  }

  const pastSessions = state.kickSessions || [];

  return (
    <View style={ts.container}>
      {/* Üst Bilgi Kartı */}
      <View style={ts.metaRow}>
        <View style={ts.badge}>
          <Icon name="footprint" size={14} color={colors.purple} />
          <T style={ts.badgeText}>Hafta {state.week || 28} · Seans</T>
        </View>
        <T bold style={ts.timerDisplay}>{secondsLabel(seconds)}</T>
      </View>

      {/* Büyük İnteraktif 3D Tekme Butonu */}
      <View style={ts.kickCenter}>
        <Animated.View style={{ transform: [{ scale: sessionActive ? pulse : 1 }] }}>
          <Tap
            onPress={handleKick}
            label="Bebeğin tekmesini kaydet"
            style={ts.kickButton}
          >
            <LinearGradient
              colors={['#F7E5EC', '#EFE0F0', '#DFCEE8']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={ts.kickButtonGradient}
            >
              {generatedAssets['ui_kick_foot_button'] || generatedAssets['card_kick_counter'] ? (
                <Image source={generatedAssets['ui_kick_foot_button'] || generatedAssets['card_kick_counter']} style={{ width: 100, height: 100 }} resizeMode="contain" />
              ) : (
                <Icon name="footprint" size={68} color="#8A5A88" />
              )}
              <T bold style={ts.kickButtonLabel}>
                {sessionActive ? 'TEKME HİSSETTİM' : 'BAŞLAMAK İÇİN DOKUN'}
              </T>
              <T style={ts.kickButtonSub}>Her vuruşta dokunun</T>
            </LinearGradient>
          </Tap>
        </Animated.View>
      </View>

      {/* 10 Tekmelik İlerleme Segmentleri */}
      <View style={ts.progressCard}>
        <View style={ts.progressHeader}>
          <T bold style={{ fontSize: 16 }}>10 Tekme Hedefi</T>
          <T bold style={{ color: colors.purple, fontSize: 18 }}>{kicks} / 10</T>
        </View>
        <View style={ts.dotGrid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={i}
              style={[
                ts.kickDot,
                i < kicks && ts.kickDotFilled,
                i === kicks - 1 && ts.kickDotActive,
              ]}
            >
              {i < kicks ? (
                <Icon name="check" size={13} color="white" />
              ) : (
                <T style={ts.kickDotNum}>{i + 1}</T>
              )}
            </View>
          ))}
        </View>

        {sessionActive && (
          <View style={ts.sessionActions}>
            <Tap onPress={() => setKicks(k => Math.max(0, k - 1))} label="Geri al" style={ts.miniAction}>
              <T style={ts.miniActionText}>1 Geri Al</T>
            </Tap>
            <Tap onPress={() => finishSession()} label="Seansı bitir" style={[ts.miniAction, { backgroundColor: '#F0E5F3' }]}>
              <T bold style={[ts.miniActionText, { color: colors.purple }]}>Kaydet ve Bitir</T>
            </Tap>
            <Tap onPress={resetSession} label="Sıfırla" style={ts.miniAction}>
              <T style={[ts.miniActionText, { color: '#B35E6D' }]}>İptal</T>
            </Tap>
          </View>
        )}
      </View>

      {/* Tıbbi Bilgi ve Acil Uyarı Notu */}
      <View style={ts.warningBox}>
        <Icon name="bell" size={20} color="#9D6574" />
        <T style={ts.warningText}>
          <T bold>Klinik İpucu:</T> 28. haftadan sonra bebeğin 2 saat içinde en az 10 belirgin hareket yapması beklenir. Belirgin bir azalma hissederseniz doktorunuza danışın.
        </T>
      </View>

      {/* Geçmiş Seanslar */}
      <Section title="Son Tekme Seansları" />
      {pastSessions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 18 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>Henüz kayıtlı tekme seansı yok.</T>
        </Card>
      ) : (
        pastSessions.slice(0, 5).map(s => (
          <View key={s.id} style={ts.historyRow}>
            <View style={ts.historyIcon}>
              <Icon name="footprint" size={18} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 14 }}>{s.kicks} Tekme · {secondsLabel(s.durationSecs)}</T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{s.date} · {s.time} ({s.week}. Hafta)</T>
            </View>
            <View style={ts.historyBadge}>
              <T bold style={{ fontSize: 11, color: colors.sage }}>Sağlıklı ✓</T>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

// ─── 2. KASILMA & SANCI SAYACI (CONTRACTION TIMER) ───────────────────────────
export function ContractionTimer({ state, update, toast }) {
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [intensity, setIntensity] = useState('Orta');
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  const contractions = state.contractionSessions || [];
  const lastContraction = contractions[0];

  function toggleContraction() {
    if (!active) {
      // Sancı başladı
      setActive(true);
      setDuration(0);
    } else {
      // Sancı bitti
      setActive(false);
      const now = new Date();
      let intervalSecs = null;
      if (lastContraction && lastContraction.timestamp) {
        intervalSecs = Math.round((now.getTime() - lastContraction.timestamp) / 1000);
      }

      const entry = {
        id: uid(),
        durationSecs: duration,
        intervalSecs: intervalSecs,
        intensity: intensity,
        timestamp: now.getTime(),
        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: localDay(now),
      };

      update(old => ({
        contractionSessions: [entry, ...(old.contractionSessions || [])],
      }));
      toast && toast('Kasılma kaydedildi.');
      setDuration(0);
    }
  }

  // 5-1-1 Kuralı Değerlendirmesi:
  let medicalStatus = {
    color: colors.sage,
    badge: '🟢 Erken Evre',
    text: 'Sancılar henüz düzensiz. Evinizde ılık bir duş alıp dinlenin.',
  };

  if (contractions.length >= 3) {
    const recent = contractions.slice(0, 3);
    const avgDuration = recent.reduce((a, b) => a + b.durationSecs, 0) / 3;
    const avgInterval = recent.filter(r => r.intervalSecs).reduce((a, b) => a + b.intervalSecs, 0) / (recent.filter(r => r.intervalSecs).length || 1);

    if (avgInterval <= 360 && avgDuration >= 45) {
      medicalStatus = {
        color: '#D1586E',
        badge: '🔴 Hastaneye Gitme Zamanı · 5-1-1 Kuralı',
        text: 'Kasılmalarınız her 5 dakikada bir geliyor ve yaklaşık 1 dakika sürüyor. Doktorunuzu arayın ve hastaneye geçin!',
      };
    } else if (avgInterval <= 600) {
      medicalStatus = {
        color: '#DFA354',
        badge: '🟡 Aktif Evre Yaklaşıyor',
        text: 'Kasılmalar sıklaşıyor. Doğum çantanızı hazır edin ve refakatçinizi bilgilendirin.',
      };
    }
  }

  return (
    <View style={ts.container}>
      {/* Tıbbi 5-1-1 Durum Göstergesi */}
      <View style={[ts.statusBanner, { borderColor: medicalStatus.color + '55', backgroundColor: medicalStatus.color + '15' }]}>
        <T bold style={{ color: medicalStatus.color, fontSize: 14 }}>{medicalStatus.badge}</T>
        <T style={{ fontSize: 12, color: colors.ink, marginTop: 4, lineHeight: 18 }}>{medicalStatus.text}</T>
      </View>

      {/* Canlı Sayaç Ekranı */}
      <View style={ts.counterBox}>
        <T style={ts.counterLabel}>{active ? 'KASILMA SÜRÜYOR' : 'SANCI DURUMU'}</T>
        <T bold style={ts.counterNumber}>{secondsLabel(duration)}</T>
        {lastContraction?.intervalSecs && !active && (
          <T style={ts.counterSub}>
            Son sancıdan bu yana: <T bold>{Math.round(lastContraction.intervalSecs / 60)} dk {lastContraction.intervalSecs % 60} sn</T>
          </T>
        )}
      </View>

      {/* Başlat / Durdur Butonu */}
      <Tap
        onPress={toggleContraction}
        label={active ? 'Sancıyı durdur' : 'Sancı başladı'}
        style={[ts.contractionBtn, active && ts.contractionBtnActive]}
      >
        <LinearGradient
          colors={active ? ['#E8879E', '#CF5573'] : ['#8FABC8', '#7395BC']}
          style={ts.contractionBtnGrad}
        >
          <Icon name="contraction" size={32} color="white" />
          <T bold style={ts.contractionBtnText}>
            {active ? 'SANCIYI DURDUR' : 'SANCI BAŞLADI'}
          </T>
        </LinearGradient>
      </Tap>

      {/* Şiddet Seçici */}
      <View style={ts.intensityRow}>
        <T style={{ fontSize: 13, color: colors.muted }}>Şiddet:</T>
        {['Hafif', 'Orta', 'Şiddetli'].map(level => (
          <Tap
            key={level}
            label={'Şiddet ' + level}
            onPress={() => setIntensity(level)}
            style={[
              ts.intensityPill,
              intensity === level && ts.intensityPillActive,
            ]}
          >
            <T bold={intensity === level} style={{ fontSize: 12, color: intensity === level ? 'white' : colors.ink }}>
              {level}
            </T>
          </Tap>
        ))}
      </View>

      {/* Kasılma Geçmişi Tablosu */}
      <Section
        title="Son Kasılmalar"
        action={contractions.length ? 'Temizle' : undefined}
        onPress={() => update({ contractionSessions: [] })}
      />

      {contractions.length === 0 ? (
        <Card style={{ padding: 18, alignItems: 'center' }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>Henüz kaydedilmiş kasılma yok.</T>
        </Card>
      ) : (
        <Card style={{ padding: 12 }}>
          <View style={ts.tableHeader}>
            <T bold style={ts.thCol}>Saat</T>
            <T bold style={ts.thCol}>Süre</T>
            <T bold style={ts.thCol}>Aralık</T>
            <T bold style={ts.thCol}>Şiddet</T>
          </View>
          {contractions.slice(0, 7).map((c, i) => (
            <View key={c.id || i} style={ts.tableRow}>
              <T style={ts.tdCol}>{c.time}</T>
              <T bold style={[ts.tdCol, { color: colors.purple }]}>{c.durationSecs} sn</T>
              <T style={ts.tdCol}>{c.intervalSecs ? `${Math.round(c.intervalSecs / 60)} dk` : '—'}</T>
              <T style={[ts.tdCol, { color: c.intensity === 'Şiddetli' ? '#C25265' : colors.muted }]}>
                {c.intensity || 'Orta'}
              </T>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

// ─── 3. DOĞUM & HASTANE ÇANTASI (HOSPITAL BAG CHECKLIST) ──────────────────────
export function HospitalBag({ state, update, toast }) {
  const [tab, setTab] = useState('Anne');
  const [newItemText, setNewItemText] = useState('');

  const bagItems = state.lists?.bag || [];
  const currentItems = bagItems.filter(item => item.group === tab);
  const totalCount = bagItems.length;
  const doneCount = bagItems.filter(item => item.done).length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  function toggleItem(id) {
    const updated = bagItems.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    update(old => ({
      lists: { ...old.lists, bag: updated },
    }));
  }

  function addItem() {
    if (!newItemText.trim()) return;
    const newItem = {
      id: `custom-${uid()}`,
      group: tab,
      text: newItemText.trim(),
      done: false,
    };
    update(old => ({
      lists: { ...old.lists, bag: [...(old.lists?.bag || []), newItem] },
    }));
    setNewItemText('');
    toast && toast('Eşya çantaya eklendi 🧳');
  }

  function deleteItem(id) {
    const updated = bagItems.filter(item => item.id !== id);
    update(old => ({
      lists: { ...old.lists, bag: updated },
    }));
  }

  return (
    <View style={ts.container}>
      {/* İlerleme ve Tamamlanma Özeti */}
      <Card style={ts.bagSummaryCard}>
        <View style={ts.bagSummaryHeader}>
          {generatedAssets['ui_hospital_bag_3d'] || generatedAssets['card_hospital_bag'] ? (
            <Image source={generatedAssets['ui_hospital_bag_3d'] || generatedAssets['card_hospital_bag']} style={{ width: 64, height: 64 }} resizeMode="contain" />
          ) : (
            <Icon name="bag" size={42} color={colors.purple} />
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T bold style={{ fontSize: 17 }}>Doğum Çantası</T>
            <T style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
              %{percent} Hazır ({doneCount}/{totalCount} eşya çantada)
            </T>
          </View>
        </View>
        <Progress value={percent} color={colors.purple} style={{ height: 9, marginTop: 14 }} />
      </Card>

      {/* 3 Sekmeli Gezinme (Anne / Bebek / Refakatçi) */}
      <View style={ts.tabsRow}>
        {['Anne', 'Bebek', 'Yolculuk'].map(category => {
          const catLabel = category === 'Yolculuk' ? 'Refakatçi' : `${category} İçin`;
          const count = bagItems.filter(i => i.group === category && i.done).length;
          const total = bagItems.filter(i => i.group === category).length;
          const isSel = tab === category;

          return (
            <Tap
              key={category}
              label={catLabel}
              onPress={() => setTab(category)}
              style={[ts.tabBtn, isSel && ts.tabBtnActive]}
            >
              <T bold={isSel} style={[ts.tabBtnText, isSel && { color: 'white' }]}>
                {catLabel}
              </T>
              <T style={[ts.tabBtnSub, isSel && { color: '#E8DCEB' }]}>
                {count}/{total}
              </T>
            </Tap>
          );
        })}
      </View>

      {/* Eşya Ekleme Satırı */}
      <View style={ts.addItemRow}>
        <TextInput
          value={newItemText}
          onChangeText={setNewItemText}
          placeholder={`Bu sekmeye yeni eşya ekle...`}
          placeholderTextColor={colors.muted}
          style={ts.addInput}
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <Tap onPress={addItem} label="Eşyayı ekle" style={ts.addBtn}>
          <Icon name="plus" size={18} color="white" />
        </Tap>
      </View>

      {/* Eşya Listesi */}
      <View style={{ gap: 8 }}>
        {currentItems.map(item => (
          <Tap
            key={item.id}
            onPress={() => toggleItem(item.id)}
            label={item.text}
            style={[ts.checkItem, item.done && ts.checkItemDone]}
          >
            <View style={[ts.checkbox, item.done && ts.checkboxDone]}>
              {item.done && <Icon name="check" size={14} color="white" />}
            </View>
            <T
              style={[
                ts.checkText,
                item.done && { textDecorationLine: 'line-through', color: colors.muted },
              ]}
            >
              {item.text}
            </T>
            {item.id.startsWith('custom-') && (
              <Tap onPress={() => deleteItem(item.id)} label="Sil" style={{ padding: 6 }}>
                <Icon name="close" size={15} color={colors.muted} />
              </Tap>
            )}
          </Tap>
        ))}
      </View>
    </View>
  );
}

// ─── STİLLER ────────────────────────────────────────────────────────────────
const ts = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFE5F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 12, color: colors.purple, fontFamily: fonts.bold },
  timerDisplay: { fontSize: 24, letterSpacing: 1, color: colors.ink },
  kickCenter: { alignItems: 'center', paddingVertical: 12 },
  kickButton: { width: 190, height: 190, borderRadius: 95, overflow: 'hidden', ...shadow },
  kickButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 3, borderColor: '#FFF0F5', borderRadius: 95 },
  kickButtonLabel: { fontSize: 13, color: '#5A3458', marginTop: 8, letterSpacing: 0.5, textAlign: 'center' },
  kickButtonSub: { fontSize: 10, color: '#886788', marginTop: 3 },
  progressCard: { backgroundColor: '#FFFDFA', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F0EAE6', ...shadow },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dotGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  kickDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#DDD3DF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F9' },
  kickDotFilled: { backgroundColor: colors.purple, borderColor: colors.purple },
  kickDotActive: { borderColor: '#E8879E', transform: [{ scale: 1.15 }] },
  kickDotNum: { fontSize: 11, color: colors.muted },
  sessionActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line },
  miniAction: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F3EEF4', alignItems: 'center', justifyContent: 'center' },
  miniActionText: { fontSize: 12, color: colors.ink },
  warningBox: { flexDirection: 'row', gap: 10, backgroundColor: '#FBF2F4', borderRadius: 16, padding: 14, borderLeftWidth: 3, borderLeftColor: '#C96D7F' },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#68454D' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line },
  historyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3EAF5', alignItems: 'center', justifyContent: 'center' },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#EBF4EF' },
  // Contraction styles
  statusBanner: { padding: 14, borderRadius: 16, borderWidth: 1.5 },
  counterBox: { alignItems: 'center', paddingVertical: 10 },
  counterLabel: { fontSize: 11, letterSpacing: 2, color: colors.muted },
  counterNumber: { fontSize: 44, letterSpacing: 1, color: colors.ink, marginVertical: 4 },
  counterSub: { fontSize: 12, color: colors.muted },
  contractionBtn: { height: 60, borderRadius: 22, overflow: 'hidden', ...shadow },
  contractionBtnActive: { transform: [{ scale: 1.02 }] },
  contractionBtnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  contractionBtnText: { color: 'white', fontSize: 15, letterSpacing: 0.5 },
  intensityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 4 },
  intensityPill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  intensityPillActive: { backgroundColor: colors.purple },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.line },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F5EFF4' },
  thCol: { flex: 1, fontSize: 12, color: colors.muted },
  tdCol: { flex: 1, fontSize: 13, color: colors.ink },
  // Hospital Bag styles
  bagSummaryCard: { padding: 16 },
  bagSummaryHeader: { flexDirection: 'row', alignItems: 'center' },
  tabsRow: { flexDirection: 'row', gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 18, backgroundColor: '#F1ECE8', alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.purple },
  tabBtnText: { fontSize: 13 },
  tabBtnSub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  addItemRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addInput: { flex: 1, height: 44, borderRadius: 16, borderWidth: 1, borderColor: '#DDD3DF', paddingHorizontal: 14, backgroundColor: '#FFFDFA', fontSize: 13, color: colors.ink },
  addBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#F0EAE6', ...shadow },
  checkItemDone: { backgroundColor: '#FBF8FA', opacity: 0.8 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C8BAC9', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.sage, borderColor: colors.sage },
  checkText: { flex: 1, fontSize: 14, color: colors.ink },
});
