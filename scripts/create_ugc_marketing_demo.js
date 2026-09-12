const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Jimp } = require('jimp');

const OUT_DIR = path.join(__dirname, '..', 'marketing_output');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function createMockupPhone() {
  console.log('🎨 [UGC-STUDIO] iPhone & MOMORA arayüzü çiziliyor...');

  // iPhone Ekranı (420 x 860 px)
  const phoneWidth = 440;
  const phoneHeight = 900;
  const phone = new Jimp({ width: phoneWidth, height: phoneHeight, color: 0x1A1A1Aff });

  // Ekran alanı (İç dolgu)
  const screenWidth = 416;
  const screenHeight = 876;
  const screen = new Jimp({ width: screenWidth, height: screenHeight, color: 0xFAF6F2ff });

  // 3D Şeftali Görselini yükle ve ortala
  const peachPath = path.join(__dirname, '..', 'assets', 'fruit_peach.png');
  if (fs.existsSync(peachPath)) {
    const peach = await Jimp.read(peachPath);
    peach.resize({ w: 260, h: 260 });
    // Ekranın ortasına yerleştir
    const peachX = Math.round((screenWidth - 260) / 2);
    screen.composite(peach, peachX, 220);
  }

  // Buton ikonları ekle (Uyku ve Emzirme)
  const sleepIconPath = path.join(__dirname, '..', 'assets', 'btn_sleep.png');
  const bottleIconPath = path.join(__dirname, '..', 'assets', 'btn_bottle.png');

  if (fs.existsSync(sleepIconPath)) {
    const sIcon = await Jimp.read(sleepIconPath);
    sIcon.resize({ w: 90, h: 90 });
    screen.composite(sIcon, 60, 600);
  }

  if (fs.existsSync(bottleIconPath)) {
    const bIcon = await Jimp.read(bottleIconPath);
    bIcon.resize({ w: 90, h: 90 });
    screen.composite(bIcon, 260, 600);
  }

  // Ekranı telefon kasasına yapıştır
  phone.composite(screen, 12, 12);

  const phonePath = path.join(OUT_DIR, 'phone_screen.png');
  await phone.write(phonePath);
  console.log('📱 Telefon ekranı kaydedildi:', phonePath);
  return phonePath;
}

async function createStillMockup(phonePath) {
  console.log('🖼️ [UGC-STUDIO] Gerçekçi oda zeminine telefon oturtuluyor...');

  // Arka plan: Gerçekçi bebek odası fotoğrafı
  const bgPath = path.join(__dirname, '..', 'assets', 'blog_nursery_aesthetic.png');
  let bg = await Jimp.read(bgPath);
  
  // 9:16 formatına uyarla (1080 x 1920)
  bg.resize({ w: 1080, h: 1920 });
  bg.blur(14); // Gerçekçi sığ alan derinliği (DoF)

  // Telefonu oku ve arka planın ortasına yerleştir
  const phone = await Jimp.read(phonePath);
  phone.resize({ w: 620, h: 1260 });

  const posX = Math.round((1080 - 620) / 2);
  const posY = 380;

  bg.composite(phone, posX, posY);

  const outPoster = path.join(OUT_DIR, 'ugc_poster_week14.png');
  await bg.write(outPoster);
  console.log('✨ UGC Mockup Posteri hazırlandı:', outPoster);
  return outPoster;
}

function renderUGCVideo(posterPath) {
  console.log('🎬 [UGC-STUDIO] FFmpeg ile 9:16 TikTok / Reels videosu render ediliyor...');
  const outVideo = path.join(OUT_DIR, 'ugc_momora_reels.mp4');

  // FFmpeg komutu: 5 saniyelik 1080x1920 dikey video + yumuşak zoom (Ken Burns) + viral metin kancaları
  const cmd = `ffmpeg -y -loop 1 -i "${posterPath}" ` +
    `-filter_complex "` +
    `[0:v]scale=1080:1920,zoompan=z='min(zoom+0.0015,1.08)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920,` +
    `drawbox=y=0:color=black@0.3:width=iw:height=320:t=fill,` +
    `drawtext=text='🌸 MOMORA · 14. HAFTA':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=120,` +
    `drawtext=text='Bebeğin bu hafta bir Şeftali boyutunda! 🍑':fontsize=48:fontcolor=#FFD272:x=(w-text_w)/2:y=190,` +
    `drawbox=y=1720:color=white@0.95:width=iw-160:height=110:x=80:t=fill,` +
    `drawtext=text='📲 Ücretsiz İndir ve Takip Et':fontsize=44:fontcolor=#4A2860:x=(w-text_w)/2:y=1752" ` +
    `-t 5 -c:v libx264 -pix_fmt yuv420p -r 30 "${outVideo}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('🎉 [UGC-STUDIO] 9:16 REELS VİDEOSU BAŞARIYLA ÜRETİLDİ:', outVideo);
    return outVideo;
  } catch (err) {
    console.error('FFmpeg video hatası:', err.message);
  }
}

async function main() {
  try {
    const phonePath = await createMockupPhone();
    const posterPath = await createStillMockup(phonePath);
    renderUGCVideo(posterPath);
    console.log('\n🚀 Tüm UGC demo çıktıları hazırdır: marketing_output/');
  } catch (e) {
    console.error('Genel hata:', e);
  }
}

main();
