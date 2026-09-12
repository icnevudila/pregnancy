const fs = require('fs');
const path = require('path');

const missingList = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_assets.json'), 'utf8'));

async function fetchImageBuffer(prompt) {
  const enc = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${enc}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(18000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function uploadToReceiver(filename, buffer) {
  const res = await fetch(`http://localhost:3456/upload?filename=${filename}&transparent=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: buffer,
    signal: AbortSignal.timeout(10000)
  });
  return await res.json();
}

async function run() {
  console.log(`🚀 [AUTO-GENERATOR] ${missingList.length} adet eksik görsel üretimi başlatılıyor...`);

  for (let i = 0; i < missingList.length; i++) {
    const item = missingList[i];
    console.log(`\n▶ [${i + 1}/${missingList.length}] ${item.filename}...`);
    
    let success = false;
    for (let retry = 0; retry < 2; retry++) {
      try {
        const buf = await fetchImageBuffer(item.prompt);
        const resp = await uploadToReceiver(item.filename, buf);
        console.log(`  ✨ Başarılı: ${item.filename} (Saydam PNG kaydedildi)`);
        success = true;
        break;
      } catch (err) {
        console.warn(`  ⚠️ Deneme ${retry + 1} başarısız (${err.message}). Yeniden deneniyor...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!success) {
      console.error(`  ❌ ${item.filename} üretilemedi.`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n🎉 [AUTO-GENERATOR] Bitti!');
}

run();
