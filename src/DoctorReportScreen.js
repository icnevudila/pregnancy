import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Linking, Platform, Clipboard } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero, InfoNote, MetricCard, ToolExperienceCard } from './ui';
import { generatedAssets } from './generatedAssets';
import { uid, formatLocalizedDate } from './domain.mjs';

export function DoctorReportScreen({ state, update, toast, close, lang = 'tr' }) {
  const isEn = lang === 'en';
  const week = state?.week || 24;
  const motherName = state?.name || (isEn ? 'Mother' : 'Anne Adayı');
  const babyName = state?.babyName || (isEn ? 'Baby' : 'Bebek');
  const dueDate = state?.dueDate || (isEn ? 'Not specified' : 'Belirtilmedi');

  // Metrics from state
  const weights = state?.weights || [];
  const startWeight = Number(state?.startWeight || 60.0);
  const currentWeight = Number(weights[0]?.value || startWeight);
  const totalGained = (currentWeight - startWeight).toFixed(1);

  const kickSessions = state?.kickSessions || [];
  const recentKicks = kickSessions.slice(0, 5);
  const avgKicks = kickSessions.length > 0 
    ? Math.round(kickSessions.slice(0, 7).reduce((acc, k) => acc + (k.count || 0), 0) / Math.min(kickSessions.length, 7))
    : 10;

  const contractionSessions = state?.contractionSessions || [];
  const lastContraction = contractionSessions[0];

  const waterGlasses = state?.waterGlasses || 8;

  // Local draft inputs
  const [doctorName, setDoctorName] = useState(state?.doctorReportDraft?.doctorName || '');
  const [clinicName, setClinicName] = useState(state?.doctorReportDraft?.clinicName || '');
  const [bloodPressure, setBloodPressure] = useState(state?.doctorReportDraft?.bloodPressure || '115/75');
  const [ultrasoundWeight, setUltrasoundWeight] = useState(state?.doctorReportDraft?.ultrasoundWeight || '');
  const [amnioticFluid, setAmnioticFluid] = useState(state?.doctorReportDraft?.amnioticFluid || 'Normal');
  const [cervicalLength, setCervicalLength] = useState(state?.doctorReportDraft?.cervicalLength || '38 mm');
  const [doctorNotes, setDoctorNotes] = useState(state?.doctorReportDraft?.doctorNotes || '');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'questions' | 'history'

  // Questions for doctor
  const [questions, setQuestions] = useState([
    { id: '1', text: isEn ? 'Are fetal movement patterns and kick counts normal for this week?' : 'Bu hafta için bebek hareketleri ve tekmeler beklenen sıklıkta mı?', checked: false },
    { id: '2', text: isEn ? 'Do I need any routine screening tests (e.g. glucose challenge, blood count)?' : 'Bu kontrolde yapılması gereken rutin tarama/kan testi (şeker yükleme vb.) var mı?', checked: false },
    { id: '3', text: isEn ? 'Are my current prenatal vitamins, iron, and magnesium dosages appropriate?' : 'Kullandığım vitamin, demir ve magnezyum dozajı uygun mu?', checked: false },
    { id: '4', text: isEn ? 'How is the placental location and amniotic fluid volume?' : 'Plasentanın yerleşimi ve amniyon sıvısı miktarı nasıl görünüyor?', checked: false },
    { id: '5', text: isEn ? 'Are pelvic tightness sensations Braxton Hicks or true contractions?' : 'Hafif kasılma ve sertleşmelerim Braxton Hicks mi, normal mi?', checked: false },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const savedReports = state?.doctorReports || [];

  function toggleQuestion(id) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, checked: !q.checked } : q));
  }

  function addCustomQuestion() {
    if (!newQuestionText.trim()) return;
    setQuestions(prev => [...prev, { id: uid(), text: newQuestionText.trim(), checked: false }]);
    setNewQuestionText('');
    toast && toast(isEn ? 'Question added' : 'Soru eklendi');
  }

  // Clinical Summary Text Generation for WhatsApp & Export
  const summaryText = useMemo(() => {
    const dateStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const divider = '──────────────────────────';
    return [
      `📋 *MOMORA KLİNİK KONTROL ÖZETİ*`,
      `📅 ${dateStr}`,
      divider,
      `🤰 *Anne Adayı:* ${motherName}`,
      `👶 *Bebek:* ${babyName} (${week}. Gebelik Haftası)`,
      `🗓 *Tahmini Doğum Tarihi:* ${dueDate}`,
      `🩺 *Hekim / Klinik:* ${doctorName || 'Dr. Kontrolü'} ${clinicName ? '(' + clinicName + ')' : ''}`,
      divider,
      `📊 *VİTAL VE GÜNCEL BULGULAR*`,
      `• Tansiyon: ${bloodPressure} mmHg`,
      `• Güncel Kilo: ${currentWeight} kg (Başlangıçtan bu yana: ${totalGained >= 0 ? '+' : ''}${totalGained} kg)`,
      `• Ortalama Tekme: Günde ~${avgKicks} hareket`,
      `• Günlük Su Tüketimi: ${waterGlasses} bardak (~ ${(waterGlasses * 0.25).toFixed(1)} L)`,
      lastContraction ? `• Son Kasılma Kaydı: ${lastContraction.duration || '30 sn'} süreli, ${lastContraction.interval || '15 dk'} aralıklarla` : '• Kasılma Kaydı: Düzenli kasılma bildirilmedi',
      divider,
      `🔬 *ULTRASON & KLİNİK NOTLAR*`,
      ultrasoundWeight ? `• Tahmini Fetal Ağırlık (EFW): ${ultrasoundWeight} gr` : '• Fetal Ağırlık: Muayenede ölçülecek',
      `• Amniyon Sıvısı: ${amnioticFluid}`,
      `• Rahim Ağzı (Servikal) Uzunluğu: ${cervicalLength}`,
      doctorNotes ? `• Hekim Notu: ${doctorNotes}` : '• Hekim Notu: Rutin kontrol',
      divider,
      `❓ *DOKTORA SORULACAKLAR*`,
      ...questions.map(q => `${q.checked ? '✅' : '⚪'} ${q.text}`),
      divider,
      `✨ Momora Klinik Destek Asistanı tarafından hazırlandı.`
    ].join('\n');
  }, [motherName, babyName, week, dueDate, doctorName, clinicName, bloodPressure, currentWeight, totalGained, avgKicks, waterGlasses, lastContraction, ultrasoundWeight, amnioticFluid, cervicalLength, doctorNotes, questions, isEn]);

  function shareViaWhatsApp() {
    const url = 'https://wa.me/?text=' + encodeURIComponent(summaryText);
    Linking.openURL(url).catch(() => {
      copyToClipboard();
    });
  }

  function copyToClipboard() {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
    } else if (Clipboard && Clipboard.setString) {
      Clipboard.setString(summaryText);
    }
    toast && toast(isEn ? 'Report summary copied to clipboard! 📋' : 'Rapor özeti panoya kopyalandı! 📋');
  }

  function saveReportSnapshot() {
    const reportItem = {
      id: uid(),
      createdAt: new Date().toISOString(),
      week,
      doctorName: doctorName || (isEn ? 'Routine Visit' : 'Rutin Muayene'),
      clinicName,
      bloodPressure,
      weight: currentWeight,
      totalGained,
      ultrasoundWeight,
      doctorNotes,
      questionsCount: questions.length,
      answeredCount: questions.filter(q => q.checked).length
    };

    update(prev => ({
      doctorReports: [reportItem, ...(prev?.doctorReports || [])],
      doctorReportDraft: {
        doctorName,
        clinicName,
        bloodPressure,
        ultrasoundWeight,
        amnioticFluid,
        cervicalLength,
        doctorNotes
      }
    }));

    toast && toast(isEn ? 'Clinical visit report saved to history! 🩺' : 'Muayene raporu geçmişe kaydedildi! 🩺');
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Hero Banner */}
      <ScreenHero
        kicker={isEn ? 'CLINICAL SUMMARY & VISIT DOSSIER' : 'KLİNİK ÖZET & MUAYENE DOSYASI'}
        title={isEn ? 'Doctor Visit Report' : 'Doktor Muayene Raporu'}
        body={isEn
          ? 'Instantly aggregate kicks, weight curve, vital signs, and checklist questions into a physician-ready clinical summary.'
          : 'Tekme sayımları, kilo eğrisi, tansiyon ve hazırladığın soruları hekiminin bir bakışta okuyabileceği klinik özete dönüştür.'}
        icon="book"
        art="card_doctor_report"
        stat={`${week}. ${isEn ? 'Week' : 'Hafta'}`}
        tint="#583D7A"
      />

      {/* Quick Action Navigation Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'summary', label: isEn ? 'Clinical Dossier' : 'Klinik Dosya', icon: 'book' },
          { key: 'questions', label: isEn ? 'Questions' : 'Sorularım', icon: 'chat' },
          { key: 'history', label: isEn ? 'Past Visits' : 'Geçmiş Raporlar', icon: 'milestone' }
        ].map(tab => (
          <Tap
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <Icon name={tab.icon} size={15} color={activeTab === tab.key ? '#FFFFFF' : '#6A5675'} />
            <T bold={activeTab === tab.key} style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
              {tab.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* ─── TAB 1: SUMMARY (Klinik Dosya) ─── */}
      {activeTab === 'summary' && (
        <View style={styles.tabContent}>
          {/* Patient Header Card */}
          <Card style={styles.patientCard}>
            <View style={styles.patientHeader}>
              <View style={{ flex: 1 }}>
                <T bold style={styles.patientName}>{motherName}</T>
                <T style={styles.patientSub}>
                  {isEn ? `Baby ${babyName} • Week ${week}` : `Bebek: ${babyName} • ${week}. Hafta`}
                </T>
              </View>
              <View style={styles.badge}>
                <T bold style={styles.badgeText}>{isEn ? `EDD: ${dueDate}` : `TDT: ${dueDate}`}</T>
              </View>
            </View>

            {/* Doctor Info Fields */}
            <View style={styles.inputGrid}>
              <View style={{ flex: 1 }}>
                <T style={styles.inputLabel}>{isEn ? 'Physician / Ob-Gyn' : 'Hekim / Kadın Doğum Uzmanı'}</T>
                <TextInput
                  value={doctorName}
                  onChangeText={setDoctorName}
                  placeholder={isEn ? 'Dr. Name...' : 'Op. Dr. Ad Soyad...'}
                  placeholderTextColor="#A394A8"
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <T style={styles.inputLabel}>{isEn ? 'Hospital / Clinic' : 'Hastane / Klinik'}</T>
                <TextInput
                  value={clinicName}
                  onChangeText={setClinicName}
                  placeholder={isEn ? 'Clinic Name...' : 'Hastane Adı...'}
                  placeholderTextColor="#A394A8"
                  style={styles.textInput}
                />
              </View>
            </View>
          </Card>

          {/* Key Vitals Grid */}
          <T bold style={styles.sectionTitle}>{isEn ? 'Recorded Vitals & Rhythm' : 'Kayıtlı Vitaller ve Ritim'}</T>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalBox}>
              <View style={styles.vitalIconRow}>
                <Icon name="scale" size={16} color="#4E8865" />
                <T style={styles.vitalLabel}>{isEn ? 'Weight Gain' : 'Kilo Artışı'}</T>
              </View>
              <T bold style={styles.vitalValue}>{currentWeight} kg</T>
              <T style={styles.vitalHint}>{totalGained >= 0 ? '+' : ''}{totalGained} kg {isEn ? 'total' : 'başlangıçtan'}</T>
            </View>

            <View style={styles.vitalBox}>
              <View style={styles.vitalIconRow}>
                <Icon name="footprint" size={16} color="#C45778" />
                <T style={styles.vitalLabel}>{isEn ? 'Kick Rhythm' : 'Tekme Düzeni'}</T>
              </View>
              <T bold style={styles.vitalValue}>~{avgKicks} / {isEn ? 'day' : 'gün'}</T>
              <T style={styles.vitalHint}>{recentKicks.length} {isEn ? 'recent logs' : 'son kayıt'}</T>
            </View>

            <View style={styles.vitalBox}>
              <View style={styles.vitalIconRow}>
                <Icon name="water" size={16} color="#3B7EA1" />
                <T style={styles.vitalLabel}>{isEn ? 'Hydration' : 'Hidrasyon'}</T>
              </View>
              <T bold style={styles.vitalValue}>{waterGlasses} {isEn ? 'glasses' : 'bardak'}</T>
              <T style={styles.vitalHint}>~{(waterGlasses * 0.25).toFixed(1)} L / {isEn ? 'day' : 'gün'}</T>
            </View>

            <View style={styles.vitalBox}>
              <View style={styles.vitalIconRow}>
                <Icon name="heart" size={16} color="#944E72" />
                <T style={styles.vitalLabel}>{isEn ? 'Blood Pressure' : 'Tansiyon'}</T>
              </View>
              <TextInput
                value={bloodPressure}
                onChangeText={setBloodPressure}
                placeholder="115/75"
                placeholderTextColor="#A394A8"
                style={[styles.textInputSmall, { marginTop: 4, fontWeight: '700' }]}
              />
              <T style={styles.vitalHint}>mmHg</T>
            </View>
          </View>

          {/* Ultrasound & Medical Findings */}
          <Card style={styles.medicalExamCard}>
            <View style={styles.cardHeaderRow}>
              <Icon name="ultrasound" size={18} color="#583D7A" />
              <T bold style={styles.cardHeaderTitle}>{isEn ? 'Ultrasound & Examination Findings' : 'Ultrason ve Muayene Notları'}</T>
            </View>

            <View style={styles.examInputsRow}>
              <View style={{ flex: 1 }}>
                <T style={styles.inputLabel}>{isEn ? 'Est. Fetal Weight (gr)' : 'Tahmini Bebek Kilosu (gr)'}</T>
                <TextInput
                  value={ultrasoundWeight}
                  onChangeText={setUltrasoundWeight}
                  placeholder={isEn ? 'e.g. 680 gr' : 'Örn: 680 gr'}
                  placeholderTextColor="#A394A8"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <T style={styles.inputLabel}>{isEn ? 'Amniotic Fluid' : 'Amniyon Sıvısı'}</T>
                <TextInput
                  value={amnioticFluid}
                  onChangeText={setAmnioticFluid}
                  placeholder={isEn ? 'Normal / Adequate' : 'Yeterli / Normal'}
                  placeholderTextColor="#A394A8"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <T style={styles.inputLabel}>{isEn ? "Physician's Recommendations & Prescription" : 'Hekimin Önerileri ve Reçete / Dozaj Notu'}</T>
              <TextInput
                value={doctorNotes}
                onChangeText={setDoctorNotes}
                placeholder={isEn ? 'Notes on iron supplement, screening results, follow-up date...' : 'Demir dozu, tarama sonucu, bir sonraki kontrol tarihi veya öneriler...'}
                placeholderTextColor="#A394A8"
                multiline
                style={[styles.textInput, { minHeight: 70, textAlignVertical: 'top' }]}
              />
            </View>
          </Card>

          {/* Clinical Disclaimer Note */}
          <InfoNote
            title={isEn ? 'Clinical Guidance Note' : 'Klinik Bilgilendirme Notu'}
            text={isEn
              ? 'This summary is a supportive communication tool based on your self-recorded data. It does not replace professional medical diagnosis or urgent clinical triage.'
              : 'Bu özet, girdiğin verilerden derlenen destekleyici bir iletişim aracıdır. Tıbbi teşhis veya acil müdahale yerine geçmez; hekiminizle muayene sırasında doğrudan paylaşabilirsiniz.'}
            tone="neutral"
          />

          {/* Action Buttons: WhatsApp & Copy & Save */}
          <View style={styles.actionsBar}>
            <Tap onPress={shareViaWhatsApp} style={styles.primaryActionBtn}>
              <Icon name="chat" size={18} color="#FFFFFF" />
              <T bold style={styles.primaryActionText}>{isEn ? 'Share via WhatsApp' : "WhatsApp'la Doktora Gönder"}</T>
            </Tap>

            <View style={styles.secondaryActionsRow}>
              <Tap onPress={copyToClipboard} style={styles.secondaryActionBtn}>
                <Icon name="book" size={16} color="#583D7A" />
                <T bold style={styles.secondaryActionText}>{isEn ? 'Copy Text' : 'Metni Kopyala'}</T>
              </Tap>

              <Tap onPress={saveReportSnapshot} style={[styles.secondaryActionBtn, { backgroundColor: '#F0EAF5' }]}>
                <Icon name="heart" size={16} color="#7C458A" />
                <T bold style={[styles.secondaryActionText, { color: '#7C458A' }]}>{isEn ? 'Save to History' : 'Geçmişe Kaydet'}</T>
              </Tap>
            </View>
          </View>
        </View>
      )}

      {/* ─── TAB 2: QUESTIONS (Doktora Sorulacaklar) ─── */}
      {activeTab === 'questions' && (
        <View style={styles.tabContent}>
          <Card style={styles.questionsCard}>
            <View style={styles.cardHeaderRow}>
              <Icon name="chat" size={18} color="#583D7A" />
              <T bold style={styles.cardHeaderTitle}>{isEn ? 'Prenatal Visit Questions' : 'Kontrol Randevusu Soruları'}</T>
            </View>
            <T style={styles.questionsDesc}>
              {isEn
                ? 'Check off questions during your exam as they are answered by your doctor.'
                : 'Muayene esnasında hekimin yanıtladığı soruları işaretleyerek aklında hiçbir soru işareti kalmamasını sağla.'}
            </T>

            {questions.map(q => (
              <Tap key={q.id} onPress={() => toggleQuestion(q.id)} style={styles.questionItem}>
                <View style={[styles.checkbox, q.checked && styles.checkboxChecked]}>
                  {q.checked && <Icon name="check" size={14} color="#FFFFFF" />}
                </View>
                <T style={[styles.questionText, q.checked && styles.questionTextDone]}>{q.text}</T>
              </Tap>
            ))}

            {/* Add Custom Question Field */}
            <View style={styles.addQuestionRow}>
              <TextInput
                value={newQuestionText}
                onChangeText={setNewQuestionText}
                placeholder={isEn ? 'Add personal question for your doctor...' : 'Doktoruna sormak istediğin yeni bir soru ekle...'}
                placeholderTextColor="#A394A8"
                style={[styles.textInput, { flex: 1 }]}
              />
              <Tap onPress={addCustomQuestion} style={styles.addBtn}>
                <Icon name="plus" size={18} color="#FFFFFF" />
              </Tap>
            </View>
          </Card>
        </View>
      )}

      {/* ─── TAB 3: HISTORY (Geçmiş Muayeneler) ─── */}
      {activeTab === 'history' && (
        <View style={styles.tabContent}>
          {savedReports.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="book" size={32} color="#B39EB5" />
              <T bold style={styles.emptyTitle}>{isEn ? 'No Saved Reports Yet' : 'Henüz Kayıtlı Rapor Yok'}</T>
              <T style={styles.emptySub}>
                {isEn
                  ? 'Complete your visit details in the Clinical Dossier tab and tap "Save to History" to archive it here.'
                  : 'Klinik Dosya sekmesinden muayene notlarını doldurup "Geçmişe Kaydet" butonuna bastığında tüm geçmiş ziyaretlerin burada listelenir.'}
              </T>
            </Card>
          ) : (
            savedReports.map(rep => (
              <Card key={rep.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View>
                    <T bold style={styles.historyTitle}>{rep.doctorName} • {rep.week}. {isEn ? 'Week' : 'Hafta'}</T>
                    <T style={styles.historyDate}>{formatLocalizedDate(rep.createdAt, lang)}</T>
                  </View>
                  <View style={styles.historyBadge}>
                    <T bold style={styles.historyBadgeText}>{rep.weight} kg</T>
                  </View>
                </View>
                {rep.doctorNotes ? (
                  <T style={styles.historyNotes}>"{rep.doctorNotes}"</T>
                ) : null}
                <View style={styles.historyFooter}>
                  <T style={styles.historyStat}>
                    {isEn ? `${rep.answeredCount || 0} questions answered` : `${rep.answeredCount || 0} soru görüşüldü`}
                  </T>
                  {rep.ultrasoundWeight ? (
                    <T style={styles.historyStat}>EFW: {rep.ultrasoundWeight} gr</T>
                  ) : null}
                </View>
              </Card>
            ))
          )}
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
    backgroundColor: '#583D7A',
  },
  tabButtonText: {
    fontSize: 12.5,
    color: '#6A5675',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    gap: 16,
  },
  patientCard: {
    backgroundColor: '#FAF5FA',
    borderColor: '#EBDDEB',
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientName: {
    fontSize: 17,
    color: '#3B2348',
  },
  patientSub: {
    fontSize: 13,
    color: '#84678E',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#F0E2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11.5,
    color: '#6E457D',
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    color: '#705877',
    marginBottom: 5,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD0E2',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2C1D35',
  },
  textInputSmall: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD0E2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: '#2C1D35',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14.5,
    color: '#462C54',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7F2',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  vitalIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vitalLabel: {
    fontSize: 11.5,
    color: '#7B6783',
  },
  vitalValue: {
    fontSize: 16,
    color: '#341E41',
  },
  vitalHint: {
    fontSize: 11,
    color: '#A08EA6',
  },
  medicalExamCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8DEEC',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderTitle: {
    fontSize: 14.5,
    color: '#3F254E',
  },
  examInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsBar: {
    gap: 10,
    marginTop: 4,
  },
  primaryActionBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14.5,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: '#F6EFF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  secondaryActionText: {
    color: '#583D7A',
    fontSize: 13,
  },
  questionsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAE1EE',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  questionsDesc: {
    fontSize: 12.5,
    color: '#7D6A85',
    lineHeight: 18,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFF7',
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
    backgroundColor: '#583D7A',
    borderColor: '#583D7A',
  },
  questionText: {
    flex: 1,
    fontSize: 13,
    color: '#341E41',
    lineHeight: 19,
  },
  questionTextDone: {
    textDecorationLine: 'line-through',
    color: '#9C88A3',
  },
  addQuestionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  addBtn: {
    backgroundColor: '#583D7A',
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#FAF5FA',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#493056',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#846F8B',
    textAlign: 'center',
    lineHeight: 18,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAE1EE',
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyTitle: {
    fontSize: 14,
    color: '#351F42',
  },
  historyDate: {
    fontSize: 11.5,
    color: '#97829F',
    marginTop: 2,
  },
  historyBadge: {
    backgroundColor: '#F3ECF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11.5,
    color: '#654273',
  },
  historyNotes: {
    fontSize: 12.5,
    color: '#553E60',
    fontStyle: 'italic',
    backgroundColor: '#FAF7FA',
    padding: 8,
    borderRadius: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  historyStat: {
    fontSize: 11.5,
    color: '#897592',
  },
});
