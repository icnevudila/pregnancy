const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'generation_queue.json');

const FILO_ICONS = [
  {
    filename: 'filo_icon_overview.png',
    title: 'Filo - Genel Özet Dashboard',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic and frosted glass tech icon of an executive analytics dashboard, showing modular floating metric blocks, a curved cobalt blue growth trendline, smooth matte white porcelain base with cobalt blue (#2f5bff) accents and semi-transparent frosted glass layers, soft ambient studio lighting, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_accounts.png',
    title: 'Filo - WhatsApp Hatları & Telefon',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a sleek modern smartphone with a glowing emerald green signal status dot and a floating translucent frosted glass QR code tile, matte porcelain body with cobalt blue (#2f5bff) rim, soft ambient studio lighting, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_contacts.png',
    title: 'Filo - Müşteri Rehberi & Segmentler',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a modern customer directory card stack, featuring layered translucent frosted glass contact cards with cobalt blue (#2f5bff) index tabs and a minimalist user silhouette badge, smooth matte porcelain finish, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_campaigns.png',
    title: 'Filo - Toplu Kampanyalar Megafon',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a dynamic broadcasting megaphone, rendered in rich cobalt blue (#2f5bff) with translucent frosted glass soundwaves radiating outward, smooth porcelain texture, studio lighting with soft reflections, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_quick_send.png',
    title: 'Filo - Hızlı Gönderim Kağıt Uçak',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a sleek aerodynamic origami paper airplane soaring forward, crafted in premium cobalt blue (#2f5bff) with frosted glass wings and a subtle glowing speed streak, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_inbox.png',
    title: 'Filo - Canlı Sohbet & Gelen Kutusu',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of dual interlocking speech bubbles, one in smooth cobalt blue (#2f5bff) porcelain and one in frosted translucent glass with a glowing unread notification gem, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_outbound.png',
    title: 'Filo - Giden Mesaj Kuyruğu',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of an outgoing message tray holding neat envelopes with a floating emerald green double-checkmark delivery seal, cobalt blue (#2f5bff) accents and frosted glass details, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_blacklist.png',
    title: 'Filo - Kara Liste & Güvenlik Kalkanı',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a solid security shield with a frosted glass inner barrier, brushed cobalt blue (#2f5bff) border and a minimalist geometric stop restriction symbol, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_reports.png',
    title: 'Filo - Raporlar & İstatistik',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of an ascending 3-column bar chart with a floating percentage pill badge, columns rendered in matte porcelain and translucent cobalt blue (#2f5bff) glass, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_brand_kit.png',
    title: 'Filo - Marka Kiti & Tasarım Stüdyosu',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a creative artist color swatch fan and a glowing digital stylus wand with tiny cobalt blue and gold sparks, smooth frosted glass and cobalt blue (#2f5bff) porcelain, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_auto_reply.png',
    title: 'Filo - Otomatik Yanıt & AI Bot',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of an intelligent AI automation orb core, surrounded by concentric cobalt blue (#2f5bff) orbiting rings and a friendly glowing digital pulse face, frosted glass shell, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_settings.png',
    title: 'Filo - Ayarlar & Entegrasyon',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of precision interlocking mechanical gears, one in cobalt blue (#2f5bff) porcelain and one in frosted matte glass with a central brass core, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_system_health.png',
    title: 'Filo - Sistem Durumu & VPS Sunucu',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a miniature high-tech server rack tower with a dynamic glowing emerald green heartbeat lifeline and cobalt blue (#2f5bff) LED status indicators, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_setup_wizard.png',
    title: 'Filo - Kurulum Sihirbazı',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a 3-step ascending milestone staircase leading to a proud cobalt blue (#2f5bff) flag with a glowing completion checkmark badge, frosted glass steps, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_help.png',
    title: 'Filo - Yardım & Dokümantasyon',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of an open hardcover documentation handbook with a warm glowing lightbulb floating above in translucent frosted glass, cobalt blue (#2f5bff) book cover, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_admin.png',
    title: 'Filo - Platform Süper Admin',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a modern corporate enterprise headquarters glass building crowned with a dignified cobalt blue (#2f5bff) royal emblem, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_auth_lock.png',
    title: 'Filo - Giriş & Güvenlik Kilidi',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a heavy cryptographic security padlock in brushed cobalt blue (#2f5bff) metal with a glowing white keyhole and a floating security key, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_hub_network.png',
    title: 'Filo - Çoklu Hat Dağıtım Ağı',
    preferredPlatform: 'chatgpt',
    prompt: 'High-end 3D tech conceptual illustration of a central glowing distribution hub terminal routing encrypted message streams across multiple surrounding smartphone nodes, cobalt blue (#2f5bff) and frosted glass aesthetic, clean minimalist enterprise technology, pure solid white background, 8k resolution, no text.'
  },
  {
    filename: 'filo_icon_csv_excel.png',
    title: 'Filo - Excel & CSV Yükleme',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a structured spreadsheet document card with glowing data rows sliding effortlessly into a cobalt blue (#2f5bff) cylinder database, frosted glass finish, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_webhook.png',
    title: 'Filo - API & Webhook Bağlantı',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of two magnetic electrical connector plugs locking together with a brilliant cobalt blue (#2f5bff) lightning data spark between them, smooth porcelain and frosted glass, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_qr_connect.png',
    title: 'Filo - QR Kod Tarama',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a floating translucent QR matrix plate being scanned by a precise horizontal cobalt blue (#2f5bff) laser scanning beam, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_delivery_speed.png',
    title: 'Filo - Gönderim Hızı & TPS Sayacı',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of a high-performance speedometer gauge widget with a cobalt blue (#2f5bff) pointer needle dialed into the optimum green zone, smooth glass cover, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_battery_charger.png',
    title: 'Filo - Hat Batarya & Şarj Durumu',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of an upright translucent battery cell showing 4 glowing green power charge bars and a micro golden lightning symbol, cobalt blue (#2f5bff) terminals, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_template_vars.png',
    title: 'Filo - Dinamik Şablon Değişkeni',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of sleek mathematical curly brackets { } framing a floating glowing cobalt blue (#2f5bff) star crystal gem, representing dynamic personalized variables, pure solid white background, cut out style, 8k render, no text.'
  },
  {
    filename: 'filo_icon_empty_state.png',
    title: 'Filo - Boş Durum / Veri Yok',
    preferredPlatform: 'gemini',
    prompt: 'High-end 3D claymorphic tech icon of an open minimalist clean parcel box in soft white porcelain with a floating gentle cobalt blue (#2f5bff) spark above it, quiet and elegant, pure solid white background, cut out style, 8k render, no text.'
  }
];

function run() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.error('generation_queue.json bulunamadı!');
    return;
  }

  const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  let added = 0;
  let updated = 0;

  FILO_ICONS.forEach((item, idx) => {
    const existingIndex = data.jobs.findIndex(j => j.filename === item.filename);
    const jobEntry = {
      id: `job_filo_${Date.now()}_${idx}`,
      filename: item.filename,
      category: 'filo_icons',
      title: item.title,
      description: item.title,
      preferredPlatform: item.preferredPlatform,
      prompt: item.prompt,
      transparent: true,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now()
    };

    if (existingIndex !== -1) {
      data.jobs[existingIndex] = Object.assign(data.jobs[existingIndex], jobEntry, {
        id: data.jobs[existingIndex].id || jobEntry.id
      });
      updated++;
      console.log(`  🔄 Güncellendi: ${item.filename}`);
    } else {
      // Kuyruğun en başına ekle ki bot öncelikle bu ikonları alsın!
      data.jobs.unshift(jobEntry);
      added++;
      console.log(`  ➕ Başa eklendi: ${item.filename} [${item.preferredPlatform.toUpperCase()}]`);
    }
  });

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ ${added} yeni Filo ikonu eklendi, ${updated} güncellendi. Toplam kuyruk: ${data.jobs.length}`);
}

run();
