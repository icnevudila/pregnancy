// MOMORA Push Notification & Klinik Hatırlatıcı Servisi
// Expo Notifications, Android/iOS kanalları, yerel zamanlayıcılar ve Supabase eşitleme
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { playNotificationChime } from './soundEngine';

const STORAGE_KEYS = {
  PUSH_TOKEN: '@momora_push_token',
  SETTINGS: '@momora_notification_settings',
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  sound: true,
  vibrate: true,
  // 💧 Su Hatırlatıcısı
  waterEnabled: true,
  waterIntervalHours: 2,
  waterStartHour: 8,
  waterEndHour: 22,
  // 💊 Doğum Öncesi Vitamin
  vitaminEnabled: true,
  vitaminTime: '09:00',
  // 🦶 Akşam Fetal Tekme Takibi
  kickEnabled: true,
  kickTime: '20:00',
  // 🥑 Günün Gelişimi & Editoryal Başyazı
  dailyGuideEnabled: true,
  dailyGuideTime: '08:30',
  // 🩺 Doktor & Ultrason Randevu Uyarıları
  appointmentAlerts: true,
  // 👨‍👩‍👧 Eş Notu & Aile Eşitleme
  partnerAlerts: true,
  // 🌙 Gece Dinlenme & Uyku Öncesi Rahatlama
  nightRelaxEnabled: true,
  nightRelaxTime: '22:30',
  // 🤫 Sessiz Saatler (Do Not Disturb)
  quietHoursEnabled: true,
  quietStart: '23:00',
  quietEnd: '07:00',
};

// 1. ÖN PLANDA (Foreground) BİLDİRİM SUNUM AYARI
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
  }),
});

// 2. ANDROID BİLDİRİM KANALLARINI KURMA (Android 8.0+)
export async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  try {
    // Klinik & Acil Uyarılar Kanalı (Yüksek Öncelik, Titreşim, Ses)
    await Notifications.setNotificationChannelAsync('clinical-alerts', {
      name: 'Klinik & Acil Uyarılar',
      description: 'Sancı sıklığı, doktor randevuları ve kritik klinik kontroller',
      importance: Notifications.AndroidImportance?.MAX || 5,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7E4E8A',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Su Hatırlatıcısı Kanalı
    await Notifications.setNotificationChannelAsync('water-reminders', {
      name: '💧 Su & Sıvı Hatırlatıcıları',
      description: 'Gebelik ve lohusalıkta düzenli hidrasyon bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#4A8DB7',
      sound: 'default',
    });

    // Günlük Gelişim & Başyazı Kanalı
    await Notifications.setNotificationChannelAsync('daily-guides', {
      name: '🥑 Günlük Bebek Rehberi & Magazin',
      description: 'Bebeğinizin günlük büyüme boyutu ve uzman editoryal yazılar',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#7E4E8A',
      sound: 'default',
    });

    // Eş & Aile Bildirimleri Kanalı
    await Notifications.setNotificationChannelAsync('family-sync', {
      name: '👨‍👩‍👧 Eş & Aile Paylaşımları',
      description: 'Eşinizden gelen sevgi notları ve ortak randevu güncellemeleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#B65D82',
      sound: 'default',
    });
  } catch (err) {
    console.warn('[Notifications] setupAndroidChannels error:', err);
  }
}

// 3. PUSH BİLDİRİM İZNİ VE TOKEN ALMA
export async function registerForPushNotificationsAsync() {
  await setupAndroidChannels();

  let token = null;

  try {
    if (Platform.OS === 'web') {
      // Web platformunda tarayıcı bildirim izni
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await window.Notification.requestPermission();
        if (perm === 'granted') {
          token = 'web-push-' + Date.now();
        }
      }
    } else {
      // Fiziksel cihaz (iOS / Android) veya emülatör
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: true, allowSound: true },
        });
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
          token = tokenData ? tokenData.data : null;
        } catch (e) {
          // projectId yoksa Expo token hata atabilir
        }
        if (!token) {
          try {
            const devToken = await Notifications.getDevicePushTokenAsync().catch(() => null);
            token = devToken ? (devToken.data || devToken) : null;
          } catch (e) {}
        }
        if (!token) {
          token = 'local-device-' + Platform.OS + '-' + Date.now();
        }
      }
    }

    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    }
  } catch (err) {
    console.warn('[Notifications] registerForPushNotificationsAsync error:', err);
  }

  return token;
}

// 4. SUPABASE İLE PUSH TOKEN EŞİTLEME
export async function syncPushTokenWithSupabase(token, userId) {
  if (!supabase || !token || !userId) return;

  try {
    const platform = Platform.OS;
    await supabase.from('device_push_tokens').upsert(
      {
        user_id: userId,
        token: token,
        platform: platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' }
    );
  } catch (err) {
    console.warn('[Notifications] syncPushTokenWithSupabase error:', err);
  }
}

// 5. UYGULAMA İÇİ VE CANLI BİLDİRİM DAĞITICI (In-App Notification Dispatcher)
const inAppNotificationListeners = new Set();

export function addInAppNotificationListener(fn) {
  inAppNotificationListeners.add(fn);
  return () => inAppNotificationListeners.delete(fn);
}

export function emitInAppNotification({
  title = 'Momora Bildirimi 🌸',
  body = '',
  data = {},
  icon = 'bell',
  channelId = 'clinical-alerts',
}) {
  // 1. Doğal akustik iki tonlu zil çanı çal
  try {
    playNotificationChime();
  } catch (e) {}

  // 2. Destekleyen cihazlarda dokunsal titreşim (Haptic Vibration)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([120, 60, 120]);
    } catch (e) {}
  }

  // 3. Ekrandaki tüm aktif canlı banner bileşenlerine dağıt
  const notificationPayload = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    body,
    data,
    icon,
    channelId,
    timestamp: Date.now(),
  };

  inAppNotificationListeners.forEach(fn => {
    try {
      fn(notificationPayload);
    } catch (e) {}
  });

  return notificationPayload;
}

// 6. ANLIK TEST BİLDİRİMİ TETİKLEME (Tek Dokunuşla Canlı Test)
export async function sendTestNotificationAsync({
  title = 'Momora Test Bildirimi 🌸',
  body = 'Bildirim altyapınız başarıyla çalışıyor! Su, vitamin ve tekme sayımı hatırlatıcılarınız hazır.',
  data = { screen: 'profile', tab: 'settings' },
  icon = 'bell',
} = {}) {
  // A) Her zaman uygulama içi canlı banner'ı ve ses efektini tetikle
  emitInAppNotification({ title, body, data, icon });

  // B) Web Platformunda Tarayıcı Sistem Bildirimi
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (window.Notification.permission === 'granted') {
        const n = new window.Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'momora-alert-' + Date.now(),
        });
        n.onclick = () => {
          try {
            window.focus();
            n.close();
          } catch (e) {}
        };
      } else if (window.Notification.permission !== 'denied') {
        const perm = await window.Notification.requestPermission();
        if (perm === 'granted') {
          const n = new window.Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'momora-alert-' + Date.now(),
          });
          n.onclick = () => {
            try {
              window.focus();
              n.close();
            } catch (e) {}
          };
        }
      }
    } catch (err) {
      console.warn('[Notifications] Web browser notification dispatch error:', err);
    }
  }

  // C) Mobil Native Platform (Android / iOS)
  if (Platform.OS !== 'web') {
    try {
      await setupAndroidChannels();
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          channelId: 'clinical-alerts',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        },
        trigger: null, // Hemen fırlat
      });
    } catch (err) {
      console.warn('[Notifications] Native scheduleNotificationAsync error:', err);
    }
  }

  return true;
}

// 7. KANAL ÖZELİNDE ANLIK TEST TETİKLEYİCİ
export async function testSpecificChannelNotification(channelKey, lang = 'tr') {
  const isEn = lang === 'en';
  let title = '';
  let body = '';
  let data = {};
  let icon = 'bell';

  if (channelKey === 'water') {
    title = isEn ? '💧 Hydration Time for Baby & You' : '💧 Bebeğiniz ve Sizin İçin Su Vakti';
    body = isEn
      ? 'A glass of fresh water supports amniotic fluid balance and relieves maternal fatigue.'
      : 'Bir bardak ılık su amniyon sıvısı dengesini korur ve gebelik yorgunluğunu hafifletir.';
    data = { screen: 'tools', tool: 'water' };
    icon = 'water';
  } else if (channelKey === 'vitamin') {
    title = isEn ? '💊 Prenatal Vitamin & Iron Reminder' : '💊 Doğum Öncesi Vitamin & Demir Takviyesi';
    body = isEn
      ? 'Time for your daily folic acid & iron. Best absorbed with vitamin C.'
      : 'Günün folik asit ve demir desteği vakti. Demir emilimini artırmak için narenciye veya C vitaminiyle tüketebilirsiniz.';
    data = { screen: 'tools', tool: 'vitamin' };
    icon = 'pill';
  } else if (channelKey === 'kick') {
    title = isEn ? '🦶 Baby Kick Counting Time' : '🦶 Bebeğinizle İletişim: Tekme Sayımı Vakti';
    body = isEn
      ? 'Baby is active right now. Lie on your side and record 10 kicks in Momora.'
      : 'Bebeğiniz akşam yemeğinden sonra en aktif evresindedir. Sol yanınıza uzanıp 10 tekme seansını başlatabilirsiniz.';
    data = { screen: 'tools', tool: 'kicks' };
    icon = 'footprint';
  } else if (channelKey === 'dailyGuide') {
    title = isEn ? '🥑 Daily Growth & Editor’s Pick' : '🥑 Günün Gelişimi & Editörün Seçimi';
    body = isEn
      ? 'Discover what miracle developed in your baby today. Physician-approved guide ready.'
      : 'Bebeğinizin bugünkü milimetrik organ gelişimi ve uzman hekim onaylı editoryal rehber hazır.';
    data = { screen: 'discover' };
    icon = 'book';
  } else if (channelKey === 'partner') {
    title = isEn ? '👨‍👩‍👧 Love Note from Partner' : '👨‍👩‍👧 Eşinizden Yeni Bir Sevgi Notu';
    body = isEn
      ? 'Your partner left a sweet milestone message in your family sync journal.'
      : 'Eşiniz ortak aile günlüğünüze yeni bir sevgi notu bıraktı: "Sizi çok seviyorum 💜"';
    data = { screen: 'assistant' };
    icon = 'heart';
  }

  return sendTestNotificationAsync({ title, body, data, icon });
}

// 💧 Su Hatırlatıcılarını Yenile
export async function scheduleWaterReminders(settings = DEFAULT_NOTIFICATION_SETTINGS, lang = 'tr') {
  if (!settings.waterEnabled) return;
  const isEn = lang === 'en';

  try {
    const start = settings.waterStartHour || 8;
    const end = settings.waterEndHour || 22;
    const interval = settings.waterIntervalHours || 2;

    const messages = isEn ? [
      { title: '💧 Hydration Time for Baby & You', body: 'A glass of warm water supports amniotic fluid balance and relieves maternal fatigue.' },
      { title: '💧 Gentle Water Reminder', body: 'Time to take a few slow sips. Staying hydrated reduces pregnancy cramps and Braxton Hicks.' },
      { title: '💧 Fresh & Calm Sip', body: 'Your body is working hard today. Sip 250 ml of water to keep blood circulation optimal.' },
    ] : [
      { title: '💧 Bebeğiniz ve Sizin İçin Su Vakti', body: 'Bir bardak ılık su amniyon sıvısı dengesini korur ve gebelik yorgunluğunu hafifletir.' },
      { title: '💧 Nazik Su Hatırlatıcısı', body: 'Birkaç yudum su içme zamanı. Yeterli sıvı krampları ve yalancı kasılmaları azaltır.' },
      { title: '💧 Ferahlatıcı Bir Yudum Alın', body: 'Bedeniniz bugün harika bir mucize gerçekleştiriyor. Dolaşımı desteklemek için 250 ml su için.' },
    ];

    let msgIdx = 0;
    for (let hour = start; hour <= end; hour += interval) {
      const msg = messages[msgIdx % messages.length];
      msgIdx++;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: 'tools', tool: 'water' },
          channelId: 'water-reminders',
          sound: settings.sound,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
          hour,
          minute: 0,
          channelId: 'water-reminders',
        },
      });
    }
  } catch (err) {
    console.warn('[Notifications] scheduleWaterReminders error:', err);
  }
}

// 💊 Sabah Vitamini & Demir Takviyesi
export async function scheduleVitaminReminder(settings = DEFAULT_NOTIFICATION_SETTINGS, lang = 'tr') {
  if (!settings.vitaminEnabled) return;
  const isEn = lang === 'en';

  try {
    const [hStr, mStr] = (settings.vitaminTime || '09:00').split(':');
    const hour = parseInt(hStr, 10) || 9;
    const minute = parseInt(mStr, 10) || 0;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: isEn ? '💊 Prenatal Vitamin & Iron Reminder' : '💊 Doğum Öncesi Vitamin & Demir Takviyesi',
        body: isEn
          ? 'Time for your daily folic acid & iron. Take with vitamin C (lemon water/citrus) for maximum absorption.'
          : 'Günün folik asit ve demir desteği vakti. Demir emilimini artırmak için narenciye veya C vitaminiyle tüketebilirsiniz.',
        data: { screen: 'tools', tool: 'vitamin' },
        channelId: 'clinical-alerts',
        sound: settings.sound,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour,
        minute,
        channelId: 'clinical-alerts',
      },
    });
  } catch (err) {
    console.warn('[Notifications] scheduleVitaminReminder error:', err);
  }
}

// 🦶 Akşam Fetal Tekme Takibi (ACOG Protokolü: Yemekten Sonra 20:00)
export async function scheduleKickReminder(settings = DEFAULT_NOTIFICATION_SETTINGS, lang = 'tr') {
  if (!settings.kickEnabled) return;
  const isEn = lang === 'en';

  try {
    const [hStr, mStr] = (settings.kickTime || '20:00').split(':');
    const hour = parseInt(hStr, 10) || 20;
    const minute = parseInt(mStr, 10) || 0;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: isEn ? '🦶 Baby Kick Counting Time' : '🦶 Bebeğinizle İletişim: Tekme Sayımı Vakti',
        body: isEn
          ? 'Baby is typically most active after dinner. Lie on your left side and count 10 kicks in the Momora Kick Counter.'
          : 'Bebeğiniz akşam yemeğinden sonra en aktif evresindedir. Sol yanınıza uzanıp 10 tekme seansını başlatabilirsiniz.',
        data: { screen: 'tools', tool: 'kicks' },
        channelId: 'clinical-alerts',
        sound: settings.sound,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour,
        minute,
        channelId: 'clinical-alerts',
      },
    });
  } catch (err) {
    console.warn('[Notifications] scheduleKickReminder error:', err);
  }
}

// 🥑 Günlük Gelişim & Editoryal Başyazı (Sabah 08:30)
export async function scheduleDailyGuideReminder(settings = DEFAULT_NOTIFICATION_SETTINGS, week = 24, lang = 'tr') {
  if (!settings.dailyGuideEnabled) return;
  const isEn = lang === 'en';

  try {
    const [hStr, mStr] = (settings.dailyGuideTime || '08:30').split(':');
    const hour = parseInt(hStr, 10) || 8;
    const minute = parseInt(mStr, 10) || 30;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: isEn ? `🥑 Week ${week} Daily Growth Story` : `🥑 ${week}. Hafta Günün Gelişimi & Editörün Seçimi`,
        body: isEn
          ? `Discover what milestone your baby is developing today. Read today's physician-checked guide in Momora.`
          : `${week}. haftada bebeğinizin yeni duyuları aktifleşiyor. Uzman hekim onaylı editoryal rehberi inceleyin.`,
        data: { screen: 'discover' },
        channelId: 'daily-guides',
        sound: settings.sound,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour,
        minute,
        channelId: 'daily-guides',
      },
    });
  } catch (err) {
    console.warn('[Notifications] scheduleDailyGuideReminder error:', err);
  }
}

// 🌙 Gece Sakinleşme & Meditasyon (22:30)
export async function scheduleNightRelaxReminder(settings = DEFAULT_NOTIFICATION_SETTINGS, lang = 'tr') {
  if (!settings.nightRelaxEnabled) return;
  const isEn = lang === 'en';

  try {
    const [hStr, mStr] = (settings.nightRelaxTime || '22:30').split(':');
    const hour = parseInt(hStr, 10) || 22;
    const minute = parseInt(mStr, 10) || 30;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: isEn ? '🌙 Bedtime Calm & Ocean Waves' : '🌙 Gece Dinlenmesi & Sakinleştirici Dalga Sesi',
        body: isEn
          ? 'Unwind before sleep with gentle left-side breathing and soothing ambient sounds.'
          : 'Uykudan önce sol yanınıza uzanıp sakinleştirici fon sesiyle zihninizi ve bedeninizi dinlendirin.',
        data: { screen: 'tools', tool: 'whitenoise' },
        channelId: 'daily-guides',
        sound: settings.sound,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour,
        minute,
        channelId: 'daily-guides',
      },
    });
  } catch (err) {
    console.warn('[Notifications] scheduleNightRelaxReminder error:', err);
  }
}

// 🩺 Randevu Alarmı (Randevudan 24 Saat ve 2 Saat Önce)
export async function scheduleAppointmentAlert({
  appointmentId,
  date,
  doctorName = 'Doktor Kontrolü',
  lang = 'tr',
}) {
  const isEn = lang === 'en';
  try {
    const appDate = new Date(date);
    const now = new Date();

    // 24 Saat Önce
    const alert24h = new Date(appDate.getTime() - 24 * 60 * 60 * 1000);
    if (alert24h > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isEn ? '🩺 Tomorrow: Doctor Appointment' : '🩺 Yarın: Doktor Muayenesi',
          body: isEn
            ? `Your prenatal visit with ${doctorName} is tomorrow. Check your questions list in Momora.`
            : `${doctorName} ile muayeneniz yarın. Doktorunuza sorulacak sorular listenizi gözden geçirin.`,
          data: { screen: 'tools', tool: 'appointment', appointmentId },
          channelId: 'clinical-alerts',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes?.DATE || 'date',
          date: alert24h,
          channelId: 'clinical-alerts',
        },
      });
    }

    // 2 Saat Önce
    const alert2h = new Date(appDate.getTime() - 2 * 60 * 60 * 1000);
    if (alert2h > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isEn ? '🩺 In 2 Hours: Clinical Visit' : '🩺 2 Saat Sonra: Klinik Randevusu',
          body: isEn
            ? `Your appointment with ${doctorName} is in 2 hours. Bring your ultrasound files and questions.`
            : `${doctorName} ile randevunuza 2 saat kaldı. Dosyalarınızı ve notlarınızı yanınıza almayı unutmayın.`,
          data: { screen: 'tools', tool: 'appointment', appointmentId },
          channelId: 'clinical-alerts',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes?.DATE || 'date',
          date: alert2h,
          channelId: 'clinical-alerts',
        },
      });
    }
  } catch (err) {
    console.warn('[Notifications] scheduleAppointmentAlert error:', err);
  }
}

// 7. TÜM HATIRLATICILARI TOPLU GÜNCELLE
export async function rescheduleAllReminders(settings = DEFAULT_NOTIFICATION_SETTINGS, week = 24, lang = 'tr') {
  try {
    await setupAndroidChannels();
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

    if (!settings.enabled) return;

    await scheduleWaterReminders(settings, lang);
    await scheduleVitaminReminder(settings, lang);
    await scheduleKickReminder(settings, lang);
    await scheduleDailyGuideReminder(settings, week, lang);
    await scheduleNightRelaxReminder(settings, lang);
  } catch (err) {
    console.warn('[Notifications] rescheduleAllReminders error:', err);
  }
}

// 8. AYARLARI KAYDETME VE YÜKLEME
export async function loadNotificationSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(settings, week = 24, lang = 'tr') {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    await rescheduleAllReminders(settings, week, lang);
  } catch (err) {
    console.warn('[Notifications] saveNotificationSettings error:', err);
  }
}
