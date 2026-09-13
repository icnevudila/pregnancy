// MOMORA Push Notification & Klinik Hatırlatıcı Servisi
// Expo Notifications, Android/iOS kanalları, yerel zamanlayıcılar ve Supabase eşitleme
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

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
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7E4E8A',
      sound: 'default',
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
    } else if (Device.isDevice) {
      // Fiziksel cihaz (iOS / Android)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
        token = tokenData ? tokenData.data : null;
      }
    } else {
      // Emülatör / Simülatör fallback
      token = 'simulator-token-' + Platform.OS;
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

// 5. ANLIK TEST BİLDİRİMİ TETİKLEME (Tek Dokunuşla Canlı Test)
export async function sendTestNotificationAsync({
  title = 'Momora Test Bildirimi 🌸',
  body = 'Bildirim altyapınız başarıyla çalışıyor! Su, vitamin ve tekme sayımı hatırlatıcılarınız hazır.',
  data = { screen: 'profile', tab: 'settings' },
} = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1,
      },
      trigger: null, // Hemen tetikle
    });
    return true;
  } catch (err) {
    console.warn('[Notifications] sendTestNotificationAsync error:', err);
    // Web fallback alert
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(title, { body });
        return true;
      } catch (e) {
        // ignore
      }
    }
    return false;
  }
}

// 6. KLİNİK ZAMANLANMIŞ HATIRLATICILAR (Local Scheduling)

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
          hour,
          minute: 0,
          repeats: true,
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
        hour,
        minute,
        repeats: true,
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
        hour,
        minute,
        repeats: true,
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
        hour,
        minute,
        repeats: true,
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
        hour,
        minute,
        repeats: true,
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
        trigger: alert24h,
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
        trigger: alert2h,
      });
    }
  } catch (err) {
    console.warn('[Notifications] scheduleAppointmentAlert error:', err);
  }
}

// 7. TÜM HATIRLATICILARI TOPLU GÜNCELLE
export async function rescheduleAllReminders(settings = DEFAULT_NOTIFICATION_SETTINGS, week = 24, lang = 'tr') {
  try {
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
