import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero, InfoNote, MetricCard, ToolExperienceCard } from './ui';
import { uid, formatLocalizedDate } from './domain.mjs';
import { saveBloodPressureCloud } from './backendSync';

export function getBloodPressureCategory(sys, dia, isEn = false) {
  const s = Number(sys);
  const d = Number(dia);

  if (s >= 160 || d >= 110) {
    return {
      status: 'severe',
      label: isEn ? 'CRITICAL / CALL DOCTOR (≥160/110)' : 'ACİL ALARM: DOKTORUNUZU ARAYIN (≥160/110)',
      color: '#B42318',
      bgColor: '#FEF3F2',
      badgeColor: '#FEE4E2',
      desc: isEn 
        ? 'Severe hypertension threshold. Contact your obstetrician or hospital emergency triage immediately.'
        : 'Şiddetli hipertansiyon eşiği. Vakit kaybetmeden kadın doğum hekiminize veya acil servise başvurun.',
      isAlert: true,
    };
  }
  if (s >= 140 || d >= 90) {
    return {
      status: 'stage2',
      label: isEn ? 'Stage 2 Hypertension (≥140/90)' : 'Evre 2 Hipertansiyon (≥140/90)',
      color: '#D92D20',
      bgColor: '#FFF4F2',
      badgeColor: '#FECDCA',
      desc: isEn 
        ? 'High blood pressure reading. Rest for 15 minutes and repeat. Notify your doctor if persistent.'
        : 'Yüksek tansiyon değeri. 15 dakika dinlenip ölçümü tekrarlayın; devam ederse doktorunuzu bilgilendirin.',
      isAlert: true,
    };
  }
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) {
    return {
      status: 'stage1',
      label: isEn ? 'Stage 1 Mild Elevation (130-139/80-89)' : 'Evre 1 Hafif Yüksek (130-139/80-89)',
      color: '#B54708',
      bgColor: '#FFFAEB',
      badgeColor: '#FEDF89',
      desc: isEn
        ? 'Mildly elevated reading. Ensure calm breathing, avoid caffeine and track regularly.'
        : 'Hafif yüksek değer. Sakin nefes alın, tuz tüketimini sınırlayın ve düzenli takip edin.',
      isAlert: false,
    };
  }
  if (s >= 120 && s <= 129 && d < 80) {
    return {
      status: 'elevated',
      label: isEn ? 'Elevated Systolic (120-129/<80)' : 'Sınırda Tansiyon (120-129/<80)',
      color: '#717bbc',
      bgColor: '#F5F8FF',
      badgeColor: '#D1E9FF',
      desc: isEn
        ? 'Slight systolic elevation. Maintain daily hydration and restful sleep.'
        : 'Sistolik değer sınırda. Günlük su tüketimine ve dinlenmeye özen gösterin.',
      isAlert: false,
    };
  }
  return {
    status: 'normal',
    label: isEn ? 'Optimal & Normal (<120/<80)' : 'Optimal & Sağlıklı (<120/<80)',
    color: '#027A48',
    bgColor: '#ECFDF3',
    badgeColor: '#D1FADF',
    desc: isEn
      ? 'Healthy blood pressure range. Mother and baby circulatory balance is optimal.'
      : 'Tansiyon değerleriniz ideal aralıkta. Anne ve bebek dolaşım dengesi mükemmel.',
    isAlert: false,
  };
}

export function BloodPressureScreen({ state, update, toast, close, lang = 'tr' }) {
  const isEn = lang === 'en';
  const week = state?.week || 24;
  const motherName = state?.name || (isEn ? 'Mother' : 'Anne Adayı');

  const [systolic, setSystolic] = useState('115');
  const [diastolic, setDiastolic] = useState('75');
  const [pulse, setPulse] = useState('78');
  const [arm, setArm] = useState('Sol'); // 'Sol' | 'Sağ'
  const [position, setPosition] = useState('Oturarak'); // 'Oturarak' | 'Uzanarak'
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('measure'); // 'measure' | 'history' | 'preeclampsia'

  // Preeclampsia checklist state
  const [preeclampsiaSymptoms, setPreeclampsiaSymptoms] = useState([
    { id: 'vision', labelTr: 'Göz önünde şimşek çakması / uçuşan noktalar / bulanık görme', labelEn: 'Flashing lights, spots or blurry vision', checked: false },
    { id: 'headache', labelTr: 'Ağrı kesiciyle veya dinlenmeyle geçmeyen zonklayıcı baş ağrısı', labelEn: 'Severe persistent throbbing headache', checked: false },
    { id: 'stomach', labelTr: 'Sağ kaburga altında veya mide bölgesinde şiddetli ağrı', labelEn: 'Severe pain under right ribs or stomach area', checked: false },
    { id: 'swelling', labelTr: 'Ellerde, yüzde veya göz çevresinde ani başlayan şişlik (ödem)', labelEn: 'Sudden swelling in face, hands, or around eyes', checked: false },
    { id: 'breath', labelTr: 'Nefes darlığı veya göğüste ani sıkışma hissi', labelEn: 'Shortness of breath or tightness in chest', checked: false },
  ]);

  const logs = state?.bloodPressureLogs || [
    { id: 'bp_1', systolic: 116, diastolic: 76, pulse: 74, arm: 'Sol', position: 'Oturarak', date: '2026-09-14 09:30', note: 'Sabah dinlenmiş ölçüm' },
    { id: 'bp_2', systolic: 118, diastolic: 78, pulse: 80, arm: 'Sol', position: 'Oturarak', date: '2026-09-13 18:00', note: 'Akşam rutin kontrol' },
  ];

  const currentCategory = useMemo(() => {
    return getBloodPressureCategory(systolic || 115, diastolic || 75, isEn);
  }, [systolic, diastolic, isEn]);

  const activeSymptomCount = preeclampsiaSymptoms.filter(s => s.checked).length;

  function toggleSymptom(id) {
    setPreeclampsiaSymptoms(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  }

  function handleSaveMeasurement() {
    const s = Number(systolic);
    const d = Number(diastolic);
    const p = Number(pulse);

    if (!s || s < 50 || s > 250 || !d || d < 30 || d > 160) {
      toast && toast(isEn ? 'Please enter realistic blood pressure values.' : 'Lütfen geçerli tansiyon değerleri girin (örn: 115 / 75).');
      return;
    }

    const newLog = {
      id: uid(),
      systolic: s,
      diastolic: d,
      pulse: p || null,
      arm,
      position,
      note: note.trim(),
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      week,
      categoryStatus: currentCategory.status,
    };

    const updatedLogs = [newLog, ...logs];
    update({ bloodPressureLogs: updatedLogs });
    saveBloodPressureCloud(newLog).catch(() => {});

    toast && toast(currentCategory.isAlert 
      ? (isEn ? '⚠️ Reading saved. Please note clinical advisory!' : '⚠️ Ölçüm kaydedildi. Lütfen hekim uyarısını inceleyin!') 
      : (isEn ? 'Blood pressure logged successfully! 🩺' : 'Tansiyon ölçümü başarıyla kaydedildi! 🩺')
    );

    setNote('');
  }

  function shareWithDoctorWhatsApp() {
    const dateStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const last3 = logs.slice(0, 5);
    const textLines = [
      `🩺 *MOMORA TANSİYON TAKİP RAPORU*`,
      `📅 *Tarih:* ${dateStr}`,
      `🤰 *Anne Adayı:* ${motherName} (${week}. Hafta)`,
      `──────────────────────────`,
      `📊 *Son Ölçüm:* ${systolic}/${diastolic} mmHg (Nabız: ${pulse} bpm)`,
      `🏷 *Durum:* ${currentCategory.label}`,
      `📍 *Pozisyon / Kol:* ${position} (${arm} kol)`,
      note ? `📝 *Not:* ${note}` : '',
      `──────────────────────────`,
      `📈 *Son Ölçümler:*`,
      ...last3.map(l => `• ${l.date.slice(5)}: ${l.systolic}/${l.diastolic} mmHg (Nabız: ${l.pulse || '-'} bpm)`),
      activeSymptomCount > 0 ? `\n⚠️ *Bildirilen Belirtiler:* ${preeclampsiaSymptoms.filter(s => s.checked).map(s => s.labelTr).join(', ')}` : '',
      `──────────────────────────`,
      `Momora Klinik Takip Modülü ile hazırlandı.`
    ].filter(Boolean).join('\n');

    const url = 'https://wa.me/?text=' + encodeURIComponent(textLines);
    Linking.openURL(url).catch(() => {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(textLines);
      }
      toast && toast(isEn ? 'Summary copied to clipboard!' : 'Rapor panoya kopyalandı!');
    });
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Hero Banner */}
      <ScreenHero
        kicker={isEn ? 'CARDIOVASCULAR & PREECLAMPSIA MONITOR' : 'KARDİYOVASKÜLER & PREEKLAMPSİ TAKİPÇİSİ'}
        title={isEn ? 'Blood Pressure Monitor' : 'Tansiyon & Preeklampsi'}
        body={isEn
          ? 'Track systolic/diastolic blood pressure curve, screen for preeclampsia red flags, and share clinical logs with your doctor.'
          : 'Büyük ve küçük tansiyon eğrini takip et, preeklampsi alarm belirtilerini denetle ve hekiminle klinik rapor paylaş.'}
        icon="heart"
        art="card_blood_pressure"
        stat={`${systolic}/${diastolic} mmHg`}
        tint="#D92D20"
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'measure', label: isEn ? 'New Reading' : 'Yeni Ölçüm', icon: 'heart' },
          { key: 'preeclampsia', label: isEn ? 'Preeclampsia Check' : 'Preeklampsi Testi', icon: 'shield' },
          { key: 'history', label: isEn ? 'Log History' : 'Ölçüm Günlüğü', icon: 'scale' },
        ].map(t => (
          <Tap
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={[styles.tabButton, activeTab === t.key && styles.tabButtonActive]}
          >
            <Icon name={t.icon} size={15} color={activeTab === t.key ? '#FFFFFF' : '#70567A'} />
            <T bold={activeTab === t.key} style={[styles.tabButtonText, activeTab === t.key && styles.tabButtonTextActive]}>
              {t.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* ─── TAB 1: MEASURE (Yeni Ölçüm) ─── */}
      {activeTab === 'measure' && (
        <View style={{ gap: 14 }}>
          {/* Main Dial & Inputs Card */}
          <Card style={styles.inputsCard}>
            <T bold style={styles.cardSectionTitle}>{isEn ? 'Enter Blood Pressure Reading' : 'Tansiyon Değerlerini Girin'}</T>

            <View style={styles.dialRow}>
              {/* Systolic (Büyük) */}
              <View style={styles.dialBox}>
                <T style={styles.dialLabel}>{isEn ? 'SYSTOLIC (Big)' : 'BÜYÜK (Sistolik)'}</T>
                <TextInput
                  value={systolic}
                  onChangeText={setSystolic}
                  keyboardType="numeric"
                  maxLength={3}
                  style={styles.dialInput}
                />
                <T style={styles.dialUnit}>mmHg</T>
              </View>

              <T style={styles.dialDivider}>/</T>

              {/* Diastolic (Küçük) */}
              <View style={styles.dialBox}>
                <T style={styles.dialLabel}>{isEn ? 'DIASTOLIC (Small)' : 'KÜÇÜK (Diyastolik)'}</T>
                <TextInput
                  value={diastolic}
                  onChangeText={setDiastolic}
                  keyboardType="numeric"
                  maxLength={3}
                  style={styles.dialInput}
                />
                <T style={styles.dialUnit}>mmHg</T>
              </View>

              {/* Pulse (Nabız) */}
              <View style={[styles.dialBox, { backgroundColor: '#FAF6FA' }]}>
                <T style={styles.dialLabel}>{isEn ? 'PULSE' : 'NABIZ'}</T>
                <TextInput
                  value={pulse}
                  onChangeText={setPulse}
                  keyboardType="numeric"
                  maxLength={3}
                  style={[styles.dialInput, { color: '#883E65' }]}
                />
                <T style={styles.dialUnit}>bpm</T>
              </View>
            </View>

            {/* Real-time Category Status Alert Card */}
            <View style={[styles.statusBox, { backgroundColor: currentCategory.bgColor, borderColor: currentCategory.color }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.statusDot, { backgroundColor: currentCategory.color }]} />
                <T bold style={[styles.statusTitle, { color: currentCategory.color }]}>
                  {currentCategory.label}
                </T>
              </View>
              <T style={styles.statusDesc}>{currentCategory.desc}</T>
            </View>

            {/* Arm & Position Selectors */}
            <View style={styles.metaRow}>
              <View style={{ flex: 1 }}>
                <T style={styles.metaLabel}>{isEn ? 'Arm' : 'Ölçülen Kol'}</T>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  {['Sol', 'Sağ'].map(a => (
                    <Tap
                      key={a}
                      onPress={() => setArm(a)}
                      style={[styles.miniChip, arm === a && styles.miniChipActive]}
                    >
                      <T bold={arm === a} style={{ fontSize: 12, color: arm === a ? '#FFFFFF' : '#6A5675' }}>
                        {isEn ? (a === 'Sol' ? 'Left' : 'Right') : a}
                      </T>
                    </Tap>
                  ))}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <T style={styles.metaLabel}>{isEn ? 'Position' : 'Vücut Pozisyonu'}</T>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  {['Oturarak', 'Uzanarak'].map(p => (
                    <Tap
                      key={p}
                      onPress={() => setPosition(p)}
                      style={[styles.miniChip, position === p && styles.miniChipActive]}
                    >
                      <T bold={position === p} style={{ fontSize: 12, color: position === p ? '#FFFFFF' : '#6A5675' }}>
                        {isEn ? (p === 'Oturarak' ? 'Sitting' : 'Reclined') : p}
                      </T>
                    </Tap>
                  ))}
                </View>
              </View>
            </View>

            {/* Optional Note */}
            <View style={{ marginTop: 6 }}>
              <T style={styles.metaLabel}>{isEn ? 'Note (optional)' : 'Not / Belirtiler (opsiyonel)'}</T>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={isEn ? 'e.g. Resting after walking, slight headache...' : 'Örn: Dinlenmiş ölçüm, sabah kahvaltı öncesi...'}
                placeholderTextColor="#A394A8"
                style={styles.noteInput}
              />
            </View>

            {/* Save Button */}
            <Tap onPress={handleSaveMeasurement} style={styles.saveBtn}>
              <Icon name="check" size={18} color="#FFFFFF" />
              <T bold style={styles.saveBtnText}>{isEn ? 'Save Blood Pressure Reading' : 'Tansiyon Ölçümünü Kaydet'}</T>
            </Tap>
          </Card>

          {/* Quick Doctor WhatsApp Share */}
          <Tap onPress={shareWithDoctorWhatsApp} style={styles.whatsAppBtn}>
            <Icon name="chat" size={17} color="#FFFFFF" />
            <T bold style={{ color: '#FFFFFF', fontSize: 14 }}>
              {isEn ? 'Share Vitals via WhatsApp' : "Tansiyon Raporunu WhatsApp'la Gönder"}
            </T>
          </Tap>

          {/* Medical Guidance Note */}
          <InfoNote
            title={isEn ? 'Correct Technique & Clinical Guidelines (ACOG / AHA)' : 'Doğru Ölçüm & Klinik Kılavuzlar (ACOG / AHA)'}
            text={isEn
              ? 'Sit quietly with feet flat on the floor for 5 minutes before measuring. Support arm at heart level. Avoid caffeine, talking, or exercise 30 minutes prior. Staged according to ACOG and AHA clinical obstetric guidelines.'
              : 'Ölçümden önce 5 dakika dinlenin. Kolunuzu kalp hizasında masaya destekleyin. Ölçümden 30 dakika önce kafein almayın ve konuşmayın. Değerler ACOG ve AHA kılavuzlarına göre sınıflandırılmıştır.'}
            tone="neutral"
          />
        </View>
      )}

      {/* ─── TAB 2: PREECLAMPSIA (Preeklampsi Kontrolü) ─── */}
      {activeTab === 'preeclampsia' && (
        <View style={{ gap: 14 }}>
          <Card style={styles.preeclampsiaCard}>
            <View style={styles.preeclampsiaHeader}>
              <Icon name="shield" size={20} color="#D92D20" />
              <T bold style={styles.preeclampsiaTitle}>
                {isEn ? 'Preeclampsia Warning Symptoms' : 'Preeklampsi (Gebelik Zehirlenmesi) Alarm Belirtileri'}
              </T>
            </View>
            <T style={styles.preeclampsiaSub}>
              {isEn
                ? 'Check any symptoms you are currently experiencing. If you check any of these alongside elevated blood pressure, contact your doctor immediately.'
                : 'Aşağıdaki belirtilerden herhangi birini yaşıyorsanız işaretleyin. Yüksek tansiyon ile birlikte görüldüğünde hekiminize acilen danışmanız önerilir.'}
            </T>

            <View style={{ gap: 10, marginTop: 6 }}>
              {preeclampsiaSymptoms.map(s => (
                <Tap
                  key={s.id}
                  onPress={() => toggleSymptom(s.id)}
                  style={[styles.symptomItem, s.checked && styles.symptomItemChecked]}
                >
                  <View style={[styles.checkbox, s.checked && styles.checkboxChecked]}>
                    {s.checked && <Icon name="check" size={14} color="#FFFFFF" />}
                  </View>
                  <T style={[styles.symptomText, s.checked && styles.symptomTextChecked]}>
                    {isEn ? s.labelEn : s.labelTr}
                  </T>
                </Tap>
              ))}
            </View>

            {activeSymptomCount > 0 ? (
              <View style={styles.alertBox}>
                <T bold style={{ color: '#B42318', fontSize: 13.5 }}>
                  🚨 {activeSymptomCount} {isEn ? 'Alarm Symptom(s) Checked' : 'Alarm Belirtisi Seçildi'}
                </T>
                <T style={{ color: '#882232', fontSize: 12, lineHeight: 17, marginTop: 4 }}>
                  {isEn
                    ? 'Please call your doctor or maternity triage hospital. Preeclampsia requires prompt clinical evaluation.'
                    : 'Lütfen vakit kaybetmeden kadın doğum uzmanınızı arayın veya acil muayeneye başvurun. Preeklampsi erken tıbbi müdahale gerektirir.'}
                </T>
              </View>
            ) : (
              <View style={styles.calmBox}>
                <T bold style={{ color: '#027A48', fontSize: 13 }}>
                  ✓ {isEn ? 'No alarm symptoms reported' : 'Herhangi bir alarm belirtisi seçilmedi'}
                </T>
                <T style={{ color: '#275E40', fontSize: 11.5, marginTop: 2 }}>
                  {isEn ? 'Continue regular weekly blood pressure monitoring.' : 'Rutin tansiyon takiplerinizi düzenli sürdürün.'}
                </T>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* ─── TAB 3: HISTORY (Ölçüm Günlüğü) ─── */}
      {activeTab === 'history' && (
        <View style={{ gap: 12 }}>
          {logs.map(log => {
            const cat = getBloodPressureCategory(log.systolic, log.diastolic, isEn);
            return (
              <Card key={log.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <T bold style={styles.historyPressure}>{log.systolic}/{log.diastolic} <T style={{ fontSize: 13, fontWeight: 'normal', color: colors.muted }}>mmHg</T></T>
                    {log.pulse && (
                      <View style={styles.pulsePill}>
                        <Icon name="heart" size={11} color="#C4485D" />
                        <T style={{ fontSize: 11, color: '#C4485D' }}>{log.pulse} bpm</T>
                      </View>
                    )}
                  </View>
                  <View style={[styles.catBadge, { backgroundColor: cat.badgeColor }]}>
                    <T bold style={{ fontSize: 10.5, color: cat.color }}>
                      {cat.status.toUpperCase()}
                    </T>
                  </View>
                </View>

                <View style={styles.historyMetaRow}>
                  <T style={styles.historyDate}>{log.date}</T>
                  <T style={styles.historyPosition}>{log.position} • {log.arm} kol</T>
                </View>

                {log.note ? (
                  <T style={styles.historyNote}>\"{log.note}\"</T>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3EBF5',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#D92D20',
  },
  tabButtonText: {
    fontSize: 12.5,
    color: '#70567A',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  inputsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAE0EE',
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  cardSectionTitle: {
    fontSize: 15,
    color: '#3B2349',
  },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dialBox: {
    flex: 1,
    backgroundColor: '#F9F4FA',
    borderWidth: 1.5,
    borderColor: '#E8DCEB',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  dialLabel: {
    fontSize: 10,
    color: '#8A7394',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  dialInput: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2F183C',
    textAlign: 'center',
    paddingVertical: 2,
    minWidth: 60,
  },
  dialUnit: {
    fontSize: 10.5,
    color: '#9883A3',
  },
  dialDivider: {
    fontSize: 32,
    color: '#C4ADC9',
    fontWeight: '300',
  },
  statusBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 13,
  },
  statusDesc: {
    fontSize: 12,
    color: '#49364F',
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaLabel: {
    fontSize: 11.5,
    color: '#775F81',
    fontWeight: '600',
  },
  miniChip: {
    flex: 1,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DEEC',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  miniChipActive: {
    backgroundColor: '#D92D20',
    borderColor: '#D92D20',
  },
  noteInput: {
    backgroundColor: '#FAF7FA',
    borderWidth: 1,
    borderColor: '#E6D9EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#2A1736',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#D92D20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
  },
  whatsAppBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  preeclampsiaCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAE0EE',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  preeclampsiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preeclampsiaTitle: {
    fontSize: 14.5,
    color: '#B42318',
    flex: 1,
  },
  preeclampsiaSub: {
    fontSize: 12.5,
    color: '#6F567B',
    lineHeight: 18,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF7FA',
    borderWidth: 1,
    borderColor: '#EAE1EE',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  symptomItemChecked: {
    backgroundColor: '#FFF4F2',
    borderColor: '#FDA29B',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#A892B0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#D92D20',
    borderColor: '#D92D20',
  },
  symptomText: {
    flex: 1,
    fontSize: 13,
    color: '#341E41',
    lineHeight: 18,
  },
  symptomTextChecked: {
    color: '#B42318',
    fontWeight: '700',
  },
  alertBox: {
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  calmBox: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#A6F4C5',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EBE1EF',
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyPressure: {
    fontSize: 20,
    color: '#281434',
  },
  pulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2F4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 11.5,
    color: '#8A7595',
  },
  historyPosition: {
    fontSize: 11.5,
    color: '#8A7595',
  },
  historyNote: {
    fontSize: 12,
    color: '#4F395B',
    fontStyle: 'italic',
    backgroundColor: '#FAF6FA',
    padding: 6,
    borderRadius: 6,
  },
});
