import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card } from './ui';

export function LegalScreen({ initialTab = 'privacy', lang = 'tr', close }) {
  const isEn = lang === 'en';
  const [tab, setTab] = useState(initialTab);

  const tabs = [
    { key: 'privacy', label: isEn ? 'Privacy Policy' : 'Gizlilik Politikası' },
    { key: 'terms', label: isEn ? 'Terms of Use' : 'Kullanım Koşulları' },
    { key: 'medical', label: isEn ? 'Medical Disclaimer' : 'Tıbbi Sorumluluk' },
  ];

  return (
    <View style={ls.container}>
      <View style={ls.tabRow}>
        {tabs.map(t => {
          const active = tab === t.key;
          return (
            <Tap
              key={t.key}
              onPress={() => setTab(t.key)}
              label={t.label}
              style={[ls.tabBtn, active && ls.tabBtnActive]}
            >
              <T bold={active} style={[ls.tabText, active && ls.tabTextActive]}>
                {t.label}
              </T>
            </Tap>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ls.content}>
        {tab === 'privacy' && (
          <Card style={ls.infoCard}>
            <View style={ls.badgeRow}>
              <View style={ls.pill}>
                <T bold style={ls.pillText}>{isEn ? 'KVKK & GDPR Compliant' : 'KVKK & GDPR Uyumlu'}</T>
              </View>
              <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Updated: May 2026' : 'Güncelleme: Mayıs 2026'}</T>
            </View>
            <T bold style={ls.sectionTitle}>
              {isEn ? '1. Offline-First Privacy' : '1. Cihazda Öncelikli Gizlilik'}
            </T>
            <T style={ls.bodyText}>
              {isEn
                ? 'Momora stores your sensitive health records, contraction intervals, kick counts, and notes directly on your local device. You retain 100% control and ownership of your personal health journey.'
                : 'Momora sağlık kayıtlarınızı, kasılma sürelerinizi, fetal tekmelerinizi ve notlarınızı öncelikli olarak cihazınızın yerel hafızasında saklar. Verilerinizin kontrolü ve mülkiyeti tamamen sizdedir.'}
            </T>
            <T bold style={[ls.sectionTitle, { marginTop: 14 }]}>
              {isEn ? '2. Opt-in Family Cloud Sync' : '2. İsteğe Bağlı Aile Eşitlemesi'}
            </T>
            <T style={ls.bodyText}>
              {isEn
                ? 'Cloud synchronization only activates when you pair with your partner via your private 8-character family code. Private health notes remain strictly on your personal device.'
                : 'Bulut eşitlemesi yalnızca eşinizle 8 haneli özel aile kodunuzu paylaştığınızda devreye girer. Mahrem olarak işaretlediğiniz sağlık notları yalnızca kendi cihazınızda kalır.'}
            </T>
            <T bold style={[ls.sectionTitle, { marginTop: 14 }]}>
              {isEn ? '3. Zero Data Commercialization' : '3. Sıfır Reklam ve Veri Satışı'}
            </T>
            <T style={ls.bodyText}>
              {isEn
                ? 'Momora never sells, rents, or shares your personal maternal data with third-party advertisers, data brokers, or pharmaceutical marketers.'
                : 'Momora, sizin veya bebeğinizin verilerini hiçbir reklamcıya, ilaç pazarlamacısına veya veri komisyoncusuna satmaz ve kiralamaz.'}
            </T>
          </Card>
        )}

        {tab === 'terms' && (
          <Card style={ls.infoCard}>
            <View style={ls.badgeRow}>
              <View style={ls.pill}>
                <T bold style={ls.pillText}>{isEn ? 'Terms of Service' : 'Kullanım Koşulları'}</T>
              </View>
              <T style={{ fontSize: 11, color: colors.muted }}>v1.0.0</T>
            </View>
            <T bold style={ls.sectionTitle}>
              {isEn ? '1. Service Scope' : '1. Hizmetin Kapsamı'}
            </T>
            <T style={ls.bodyText}>
              {isEn
                ? 'Momora is a maternal wellness tracking and daily organizational companion for expectant parents and postpartum families.'
                : 'Momora, anne adayları ve lohusa aileler için geliştirilmiş bir refakatçi, takip ve günlük düzenleme uygulamasıdır.'}
            </T>
            <T bold style={[ls.sectionTitle, { marginTop: 14 }]}>
              {isEn ? '2. Intellectual Property' : '2. Fikri Mülkiyet'}
            </T>
            <T style={ls.bodyText}>
              {isEn
                ? 'All original 3D clay art, illustrations, editorial content, and soundscapes are the proprietary intellectual property of Momora.'
                : 'Uygulamadaki tüm özgün 3D kil modeller, editoryal içerikler, sesler ve tasarımlar Momora mülkiyetindedir; izinsiz kopyalanamaz.'}
            </T>
          </Card>
        )}

        {tab === 'medical' && (
          <Card style={[ls.infoCard, { backgroundColor: '#FFFDF9', borderColor: '#F2DFD2' }]}>
            <View style={[ls.badgeRow, { marginBottom: 12 }]}>
              <View style={[ls.pill, { backgroundColor: '#FBE8DF' }]}>
                <T bold style={[ls.pillText, { color: '#9E3918' }]}>⚠️ {isEn ? 'Medical Notice' : 'Tıbbi Bilgilendirme'}</T>
              </View>
              <T style={{ fontSize: 11, color: '#9E3918', fontWeight: '700' }}>{isEn ? 'NOT A MEDICAL DEVICE' : 'TIBBİ CİHAZ DEĞİLDİR'}</T>
            </View>
            <T bold style={[ls.sectionTitle, { color: '#6A2A14' }]}>
              {isEn ? '1. Informational Companion' : '1. Bilgilendirici Refakatçi'}
            </T>
            <T style={[ls.bodyText, { color: '#5A3523' }]}>
              {isEn
                ? 'Momora is not a medical device and does not provide clinical diagnoses, triage, or treatment recommendations. Always consult your obstetrician for any health concerns.'
                : 'Momora tıbbi bir cihaz değildir; tanı, teşhis veya tedavi önerisinde bulunmaz. Her türlü sağlık endişenizde mutlaka hekiminize danışınız.'}
            </T>
            <T bold style={[ls.sectionTitle, { color: '#6A2A14', marginTop: 14 }]}>
              {isEn ? '2. Emergency Situations' : '2. Acil Durumlar (112)'}            </T>
            <T style={[ls.bodyText, { color: '#5A3523' }]}>
              {isEn
                ? 'In case of severe vaginal bleeding, sudden loss of amniotic fluid, or sudden cessation of fetal kicks, call emergency services (112) or your nearest hospital immediately.'
                : 'Şiddetli vajinal kanama, su gelmesi veya fetal hareketlerde ani kesilme gibi durumlarda vakit kaybetmeden 112 Acil Servis ile iletişime geçiniz.'}
            </T>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const ls = StyleSheet.create({
  container: { paddingTop: 6, paddingBottom: 24 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12, backgroundColor: '#F3EAF3', padding: 4, borderRadius: 14 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: 'white', shadowColor: '#5C3464', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  tabText: { fontSize: 11.5, color: '#765C7A', fontWeight: '600' },
  tabTextActive: { color: colors.purple, fontWeight: '700' },
  content: { paddingBottom: 20 },
  infoCard: { padding: 16, backgroundColor: '#FAF5FB', borderRadius: 18, borderWidth: 1, borderColor: '#EFE5F1' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pill: { backgroundColor: '#EBDDF0', paddingHorizontal: 10, paddingVertical: 3.5, borderRadius: 8 },
  pillText: { fontSize: 10.5, color: colors.purple },
  sectionTitle: { fontSize: 13.5, color: colors.ink, marginBottom: 4 },
  bodyText: { fontSize: 12, lineHeight: 18, color: '#4F4155' },
});
