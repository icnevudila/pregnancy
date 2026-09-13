// MOMORA Bildirim Yönetim Merkezi (Notification Settings Screen)
// A'dan Z'ye Push Notification, Klinik Hatırlatıcılar, Canlı Test ve Kanal Yönetimi
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, ScrollView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero } from './ui';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  sendTestNotificationAsync,
  registerForPushNotificationsAsync,
} from './notifications';

export function NotificationSettingsScreen({ toast, lang = 'tr', week = 24, close }) {
  const isEn = lang === 'en';

  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [permStatus, setPermStatus] = useState('checking'); // 'granted' | 'denied' | 'undetermined'
  const [pushToken, setPushToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  async function loadSettings() {
    const loaded = await loadNotificationSettings();
    setSettings(loaded);
  }

  async function checkPermissions() {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setPermStatus(window.Notification.permission);
        } else {
          setPermStatus('granted');
        }
      } else {
        const { status } = await Notifications.getPermissionsAsync();
        setPermStatus(status);
      }
    } catch (e) {
      setPermStatus('undetermined');
    }
  }

  async function requestPermission() {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
      setPermStatus('granted');
      toast && toast(isEn ? 'Push notifications enabled successfully! 🔔' : 'Bildirim izni başarıyla etkinleştirildi! 🔔');
    } else {
      await checkPermissions();
      toast && toast(isEn ? 'Notification permission requested.' : 'Bildirim izni durumu güncellendi.');
    }
  }

  async function updateSetting(key, val) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    setSaving(true);
    await saveNotificationSettings(next, week, lang);
    setTimeout(() => setSaving(false), 400);
  }

  async function handleSendTest() {
    setTesting(true);
    const success = await sendTestNotificationAsync({
      title: isEn ? 'Momora Test Notification 🌸' : 'Momora Canlı Bildirim Testi 🌸',
      body: isEn
        ? 'Your clinical push notification engine is fully active! Hydration, vitamin & kick alerts are ready.'
        : 'Bildirim altyapınız mükemmel çalışıyor! Su, vitamin ve tekme sayımı hatırlatıcılarınız devrede.',
    });
    setTesting(false);
    if (success) {
      toast && toast(isEn ? '🔔 Test notification delivered!' : '🔔 Canlı test bildirimi başarıyla gönderildi!');
    } else {
      toast && toast(isEn ? '⚠️ Could not trigger notification. Check permissions.' : '⚠️ Bildirim gönderilemedi. İzinleri kontrol edin.');
    }
  }

  return (
    <ScrollView style={ns.container} contentContainerStyle={ns.content} showsVerticalScrollIndicator={false}>
      {/* 1. Üst Başlık & Hero */}
      <ScreenHero
        title={isEn ? "Notification & Alert Center" : "Bildirim & Hatırlatıcı Merkezi"}
        subtitle={isEn
          ? "Personalized clinical alerts, hydration prompts, and daily baby growth guides."
          : "Kişiselleştirilmiş klinik hatırlatıcılar, su takibi ve günlük bebek gelişim rehberleri."}
        badge={isEn ? "PUSH & SCHEDULED" : "CANLI & ZAMANLANMIŞ"}
        badgeColor="#4A7C59"
        icon="bell"
        lang={lang}
      />

      {/* 2. Anlık Test ve İzin Durum Kartı */}
      <Card style={ns.statusCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[ns.statusDot, { backgroundColor: permStatus === 'granted' ? '#43A047' : '#FB8C00' }]} />
            <View>
              <T bold style={{ fontSize: 15, color: colors.ink }}>
                {permStatus === 'granted'
                  ? (isEn ? 'Push Notifications Active' : 'Bildirimler Aktif')
                  : (isEn ? 'Permission Required' : 'Bildirim İzni Gerekli')}
              </T>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                {permStatus === 'granted'
                  ? (isEn ? 'Ready to deliver clinical reminders' : 'Klinik hatırlatıcılar ve alarmlar hazır')
                  : (isEn ? 'Allow notifications to receive daily alerts' : 'Günlük hatırlatıcıları almak için izin verin')}
              </T>
            </View>
          </View>
          {permStatus !== 'granted' && (
            <Tap onPress={requestPermission} label={isEn ? "Enable" : "İzin Ver"} style={ns.enableBtn}>
              <T bold style={{ fontSize: 12, color: 'white' }}>{isEn ? 'Enable' : 'İzin Ver'}</T>
            </Tap>
          )}
        </View>

        {/* Canlı Test Butonu */}
        <View style={ns.testBtnRow}>
          <Tap
            onPress={handleSendTest}
            label={isEn ? "Send Test Alert" : "Test Bildirimi Gönder"}
            style={ns.testBtn}
          >
            <Icon name="bell" size={16} color={colors.purple} />
            <T bold style={{ fontSize: 13, color: colors.purple }}>
              {testing ? (isEn ? 'Delivering...' : 'Gönderiliyor...') : (isEn ? '🔔 Send Instant Test Notification' : '🔔 Hemen Test Bildirimi Gönder')}
            </T>
          </Tap>
        </View>
      </Card>

      {/* 3. Ana Açma / Kapama */}
      <Card style={ns.card}>
        <View style={ns.toggleRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <T bold style={{ fontSize: 14.5 }}>{isEn ? 'Master Notifications' : 'Tüm Bildirimler'}</T>
            <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
              {isEn ? 'Turn all app notifications and sounds on or off' : 'Tüm uygulama bildirimlerini ve hatırlatıcıları yönet'}
            </T>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={v => updateSetting('enabled', v)}
            trackColor={{ true: colors.purple }}
          />
        </View>
      </Card>

      {/* 4. Klinik Hatırlatıcı Kanalları */}
      <View style={{ gap: 10 }}>
        <T bold style={ns.sectionHeader}>{isEn ? 'Clinical & Routine Reminders' : 'Klinik & Günlük Hatırlatıcılar'}</T>

        {/* 💧 Su Hatırlatıcısı */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>💧</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Daily Hydration Reminders' : 'Günlük Su Hatırlatıcısı'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'Gentle prompts throughout the day to protect amniotic fluid balance.'
                  : 'Amniyon sıvısı dengesini korumak için gün boyu düzenli su yudumlama uyarısı.'}
              </T>
            </View>
            <Switch
              value={settings.waterEnabled}
              onValueChange={v => updateSetting('waterEnabled', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>

          {settings.waterEnabled && (
            <View style={ns.subControlBox}>
              <T style={{ fontSize: 12, color: colors.ink, fontWeight: '600', marginBottom: 8 }}>
                {isEn ? 'Reminder Frequency:' : 'Hatırlatma Sıklığı:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { hours: 1, label: isEn ? 'Every 1 hr' : '1 Saatte Bir' },
                  { hours: 2, label: isEn ? 'Every 2 hrs' : '2 Saatte Bir' },
                  { hours: 3, label: isEn ? 'Every 3 hrs' : '3 Saatte Bir' },
                ].map(opt => (
                  <Tap
                    key={opt.hours}
                    onPress={() => updateSetting('waterIntervalHours', opt.hours)}
                    label={opt.label}
                    style={[
                      ns.pillBtn,
                      settings.waterIntervalHours === opt.hours && ns.pillBtnActive,
                    ]}
                  >
                    <T
                      bold={settings.waterIntervalHours === opt.hours}
                      style={[
                        ns.pillText,
                        settings.waterIntervalHours === opt.hours && ns.pillTextActive,
                      ]}
                    >
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
                {isEn ? '⏰ Active hours: 08:00 - 22:00' : '⏰ Aktif saatler: 08:00 - 22:00'}
              </T>
            </View>
          )}
        </Card>

        {/* 💊 Doğum Öncesi Vitamin & Demir */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>💊</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Prenatal Vitamin & Iron' : 'Doğum Öncesi Vitamin & Demir'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'Daily morning folic acid, iron & omega-3 supplement alert.'
                  : 'Bebeğin gelişimi için günlük folik asit, demir ve omega-3 takviye uyarısı.'}
              </T>
            </View>
            <Switch
              value={settings.vitaminEnabled}
              onValueChange={v => updateSetting('vitaminEnabled', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>

          {settings.vitaminEnabled && (
            <View style={ns.subControlBox}>
              <T style={{ fontSize: 12, color: colors.ink, fontWeight: '600', marginBottom: 8 }}>
                {isEn ? 'Preferred Time:' : 'Hatırlatma Saati:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['08:00', '09:00', '10:00', '13:00'].map(tm => (
                  <Tap
                    key={tm}
                    onPress={() => updateSetting('vitaminTime', tm)}
                    label={tm}
                    style={[
                      ns.pillBtn,
                      settings.vitaminTime === tm && ns.pillBtnActive,
                    ]}
                  >
                    <T
                      bold={settings.vitaminTime === tm}
                      style={[
                        ns.pillText,
                        settings.vitaminTime === tm && ns.pillTextActive,
                      ]}
                    >
                      {tm}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* 🦶 Akşam Fetal Tekme Takibi */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>🦶</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Evening Baby Kick Counting' : 'Akşam Fetal Tekme Takibi'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'ACOG protocol: Prompt after dinner when fetal movement is highest.'
                  : 'ACOG protokolü: Bebeğin en aktif olduğu akşam yemeği sonrası 10 tekme seansı.'}
              </T>
            </View>
            <Switch
              value={settings.kickEnabled}
              onValueChange={v => updateSetting('kickEnabled', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>

          {settings.kickEnabled && (
            <View style={ns.subControlBox}>
              <T style={{ fontSize: 12, color: colors.ink, fontWeight: '600', marginBottom: 8 }}>
                {isEn ? 'Session Time:' : 'Seans Saati:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['19:30', '20:00', '20:30', '21:00'].map(tm => (
                  <Tap
                    key={tm}
                    onPress={() => updateSetting('kickTime', tm)}
                    label={tm}
                    style={[
                      ns.pillBtn,
                      settings.kickTime === tm && ns.pillBtnActive,
                    ]}
                  >
                    <T
                      bold={settings.kickTime === tm}
                      style={[
                        ns.pillText,
                        settings.kickTime === tm && ns.pillTextActive,
                      ]}
                    >
                      {tm}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* 🥑 Günün Gelişimi & Başyazı */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>🥑</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Daily Growth & Lead Story' : 'Günün Gelişimi & Başyazı'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'Morning brief on your baby’s exact millimeter growth and today’s editorial guide.'
                  : 'Sabah bebeğinizin milimetrik büyüme haberi ve günün uzman başyazı rehberi.'}
              </T>
            </View>
            <Switch
              value={settings.dailyGuideEnabled}
              onValueChange={v => updateSetting('dailyGuideEnabled', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>

          {settings.dailyGuideEnabled && (
            <View style={ns.subControlBox}>
              <T style={{ fontSize: 12, color: colors.ink, fontWeight: '600', marginBottom: 8 }}>
                {isEn ? 'Morning Delivery Time:' : 'Sabah Bildirim Saati:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['08:00', '08:30', '09:00', '09:30'].map(tm => (
                  <Tap
                    key={tm}
                    onPress={() => updateSetting('dailyGuideTime', tm)}
                    label={tm}
                    style={[
                      ns.pillBtn,
                      settings.dailyGuideTime === tm && ns.pillBtnActive,
                    ]}
                  >
                    <T
                      bold={settings.dailyGuideTime === tm}
                      style={[
                        ns.pillText,
                        settings.dailyGuideTime === tm && ns.pillTextActive,
                      ]}
                    >
                      {tm}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* 🩺 Randevu Alarmları */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>🩺</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Doctor & Ultrasound Visits' : 'Doktor & Ultrason Randevuları'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'Automatic reminders 24 hours and 2 hours before scheduled appointments.'
                  : 'Takvime eklenen muayenelerden 24 saat ve 2 saat önce otomatik hatırlatma.'}
              </T>
            </View>
            <Switch
              value={settings.appointmentAlerts}
              onValueChange={v => updateSetting('appointmentAlerts', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>
        </Card>

        {/* 👨‍👩‍👧 Eş & Aile Bildirimleri */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>👨‍👩‍👧</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Partner Notes & Family Sync' : 'Eş Notu & Aile Paylaşımları'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'Real-time alerts when your partner sends a love note or updates a checkup.'
                  : 'Eşiniz sevgi notu paylaştığında veya randevu eklediğinde anlık bildirim.'}
              </T>
            </View>
            <Switch
              value={settings.partnerAlerts}
              onValueChange={v => updateSetting('partnerAlerts', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>
        </Card>

        {/* 🌙 Gece Rahatlama */}
        <Card style={ns.channelCard}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>🌙</T>
                <T bold style={{ fontSize: 14 }}>{isEn ? 'Bedtime Calm & Relaxation' : 'Gece Dinlenmesi & Rahatlama'}</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 3, lineHeight: 16 }}>
                {isEn
                  ? 'Evening left-side breathing and calming ocean ambiance prompt.'
                  : 'Uykudan önce sol yana yatış ve sakinleştirici fon sesi dinleme çağrısı.'}
              </T>
            </View>
            <Switch
              value={settings.nightRelaxEnabled}
              onValueChange={v => updateSetting('nightRelaxEnabled', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>
        </Card>
      </View>

      {/* 5. Sessiz Saatler (Do Not Disturb) */}
      <View style={{ gap: 10, marginTop: 6 }}>
        <T bold style={ns.sectionHeader}>{isEn ? 'Quiet Hours (Do Not Disturb)' : 'Sessiz Saatler (Rahatsız Etmeyin)'}</T>
        <Card style={ns.card}>
          <View style={ns.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <T bold style={{ fontSize: 14 }}>🤫 {isEn ? 'Mute Night Notifications' : 'Gece Bildirimlerini Sessize Al'}</T>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                {isEn ? '23:00 - 07:00 (Only critical labor alerts will sound)' : '23:00 - 07:00 (Yalnızca acil sancı takibi ses çıkarır)'}
              </T>
            </View>
            <Switch
              value={settings.quietHoursEnabled}
              onValueChange={v => updateSetting('quietHoursEnabled', v)}
              trackColor={{ true: colors.purple }}
            />
          </View>
        </Card>
      </View>

      {/* Kaydedildi İpuçları */}
      <View style={{ alignItems: 'center', paddingVertical: 14 }}>
        <T style={{ fontSize: 12, color: colors.muted }}>
          {saving ? (isEn ? 'Saving preferences...' : 'Ayarlar güncelleniyor...') : (isEn ? '✓ Preferences automatically applied' : '✓ Tercihler otomatik olarak cihaza kaydedildi')}
        </T>
      </View>
    </ScrollView>
  );
}

const ns = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  statusCard: { padding: 16, backgroundColor: '#FAF6FA', borderColor: '#EBE0ED', ...shadow },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  enableBtn: { backgroundColor: colors.purple, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  testBtnRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#ECE0EE' },
  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#D9C5DC' },
  card: { padding: 16, ...shadow },
  channelCard: { padding: 16, ...shadow },
  sectionHeader: { fontSize: 14.5, color: colors.ink, paddingHorizontal: 4, letterSpacing: -0.2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subControlBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#F2E9F3' },
  pillBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F0E8F2' },
  pillBtnActive: { backgroundColor: colors.purple },
  pillText: { fontSize: 12, color: colors.ink },
  pillTextActive: { color: 'white' },
});
