const http = require('http');
const fs = require('fs');
const path = require('path');

let Jimp = null;
try {
  const j = require('jimp');
  Jimp = j.Jimp || j;
} catch (e) {
  console.warn('[MOMORA] Jimp modulu yuklenemedi.');
}

const PORT = 3456;
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const DOWNLOADS_DIR = 'C:\\Users\\TP2\\Downloads';
const QUEUE_FILE = path.join(__dirname, 'generation_queue.json');
const GENERATED_ASSETS_FILE = path.join(__dirname, '..', 'src', 'generatedAssets.js');

// --- GLOBAL MUTEX LOCK (Çakışma Önleyici Tekil Kilit) ---
// ChatGPT ve Gemini'nin aynı anda üretmesini kesin olarak engeller
let activeLock = null; // { platform, filename, jobId, startedAt }
let reloadRequested = false;

function loadQueue() {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[QUEUE] Error reading queue file:', e.message);
  }
  return { jobs: [] };
}

function saveQueue(queueData) {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf8');
  } catch (e) {
    console.error('[QUEUE] Error saving queue file:', e.message);
  }
}

function getNextJob(clientPlatform = 'unknown') {
  const queueData = loadQueue();
  const now = Date.now();

  // 1. Kilit zaman aşımı kontrolü (3.5 dakika işlem olmazsa kilidi otomatik kaldır)
  if (activeLock && (now - activeLock.startedAt > 210000)) {
    console.log('[MUTEX] ⚠️ Zaman asimina ugrayan kilit serbest birakildi:', activeLock.filename);
    const stuckJob = queueData.jobs.find(j => j.id === activeLock.jobId);
    if (stuckJob && stuckJob.status === 'processing') {
      stuckJob.status = 'pending';
      saveQueue(queueData);
    }
    activeLock = null;
  }

  // 2. KİLİT KONTROLÜ: Başka bir sekme (ChatGPT veya Gemini) şu an üretim yapıyor mu?
  if (activeLock) {
    return {
      status: 'busy',
      activePlatform: activeLock.platform,
      activeFilename: activeLock.filename,
      message: 'Aktif uretim: ' + activeLock.platform.toUpperCase() + ' (' + activeLock.filename + '). Cakismayi onlemek icin bekleniyor.'
    };
  }

  // 3. Platform Uyumluluğuna Göre Sıradaki İşi Seç (AKILLI YÖNLENDİRME)
  let pendingJob = null;

  if (clientPlatform === 'gemini') {
    // Gemini'ye insan / hamilelik kuralına takılmayan 3D ikon, obje, hayvan, tatlı veya infografik ver
    pendingJob = queueData.jobs.find(j => j.status === 'pending' && j.preferredPlatform !== 'chatgpt');
    if (!pendingJob) {
      console.log('[ROUTER] Gemini icin uygun obje/ikon kalmadi. Insan/maternal gorseller ChatGPT bekleniyor.');
      return { status: 'idle', reason: 'Kalan isler ChatGPT oncelikli (insan/gebelik politikasi)' };
    }
  } else if (clientPlatform === 'chatgpt') {
    // ChatGPT her şeyi üretebilir; insan/gebelik işlerine öncelik ver
    pendingJob = queueData.jobs.find(j => j.status === 'pending' && j.preferredPlatform === 'chatgpt') ||
                 queueData.jobs.find(j => j.status === 'pending');
  } else {
    pendingJob = queueData.jobs.find(j => j.status === 'pending');
  }

  if (pendingJob) {
    pendingJob.status = 'processing';
    pendingJob.startedAt = now;
    pendingJob.platform = clientPlatform;
    pendingJob.attempts = (pendingJob.attempts || 0) + 1;

    activeLock = {
      platform: clientPlatform,
      filename: pendingJob.filename,
      jobId: pendingJob.id,
      startedAt: now
    };

    saveQueue(queueData);
    console.log('[MUTEX] 🔒 Kilit verildi -> [' + clientPlatform.toUpperCase() + '] Uretilecek: ' + pendingJob.filename);
    return { status: 'job', job: pendingJob };
  }

  return { status: 'idle' };
}

function releaseLock(jobIdOrFilename) {
  if (activeLock) {
    if (!jobIdOrFilename || activeLock.jobId === jobIdOrFilename || activeLock.filename === jobIdOrFilename) {
      console.log('[MUTEX] 🔓 Kilit kaldirildi:', activeLock.filename);
      activeLock = null;
      return true;
    }
  }
  return false;
}

function updateJobStatus(idOrFilename, status, extra = {}) {
  const queueData = loadQueue();
  const job = queueData.jobs.find(j => j.id === idOrFilename || j.filename === idOrFilename);
  if (job) {
    job.status = status;
    job.updatedAt = Date.now();
    Object.assign(job, extra);
    saveQueue(queueData);
    console.log('[QUEUE] 📌 Job ' + job.filename + ' -> ' + status);

    if (status === 'done' || status === 'error') {
      releaseLock(job.id);
    }
    return true;
  }
  return false;
}

// Flood Fill Alpha Remover
async function makeTransparentPNG(filePath) {
  if (!Jimp) return;
  try {
    const img = await Jimp.read(filePath);
    const { width, height } = img.bitmap;
    const bgR = img.bitmap.data[0];
    const bgG = img.bitmap.data[1];
    const bgB = img.bitmap.data[2];
    const tolerance = 24;

    function isBg(r, g, b) {
      return (
        Math.abs(r - bgR) < tolerance &&
        Math.abs(g - bgG) < tolerance &&
        Math.abs(b - bgB) < tolerance
      ) || (r > 248 && g > 248 && b > 248);
    }

    const visited = new Uint8Array(width * height);
    const queue = [];
    for (let x = 0; x < width; x++) {
      queue.push(x, 0);
      queue.push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      queue.push(0, y);
      queue.push(width - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const idx1D = y * width + x;
      if (visited[idx1D]) continue;
      visited[idx1D] = 1;

      const pIdx = (y * width + x) * 4;
      const r = img.bitmap.data[pIdx + 0];
      const g = img.bitmap.data[pIdx + 1];
      const b = img.bitmap.data[pIdx + 2];
      if (isBg(r, g, b)) {
        img.bitmap.data[pIdx + 3] = 0;
        if (x > 0 && !visited[y * width + (x - 1)]) queue.push(x - 1, y);
        if (x < width - 1 && !visited[y * width + (x + 1)]) queue.push(x + 1, y);
        if (y > 0 && !visited[(y - 1) * width + x]) queue.push(x, y - 1);
        if (y < height - 1 && !visited[(y + 1) * width + x]) queue.push(x, y + 1);
      }
    }

    await img.write(filePath);
    console.log('[MOMORA] ✨ Arka plan seffaf yapildi:', path.basename(filePath));
  } catch (err) {
    console.warn('[MOMORA] Seffaflastirma hatasi:', err.message);
  }
}

let lastGeneratedContent = '';

// Otomatik İndirilenler Klasörü Hasatçısı (Downloads Harvester)
// Tarayıcı fallback olarak indirse bile anında yakalayıp projeye çeker
async function harvestDownloadsFolder() {
  try {
    if (!fs.existsSync(DOWNLOADS_DIR)) return;
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const targets = files.filter(f => {
      const lower = f.toLowerCase();
      return (
        lower.startsWith('onboarding_') ||
        lower.startsWith('infographic_') ||
        lower.startsWith('ui_') ||
        lower.startsWith('fruit_') ||
        lower.startsWith('animal_') ||
        lower.startsWith('sweet_') ||
        lower.startsWith('blog_')
      ) && lower.endsWith('.png');
    });

    for (const f of targets) {
      const srcPath = path.join(DOWNLOADS_DIR, f);
      const destPath = path.join(ASSETS_DIR, f);
      try {
        fs.copyFileSync(srcPath, destPath);
        fs.unlinkSync(srcPath);
        console.log('[DOWNLOADS-HARVESTER] 🌾 Yakalandi ve tasindi: ' + f);

        const shouldBeTrans = f.startsWith('ui_') || f.startsWith('fruit_') || f.startsWith('animal_') || f.startsWith('sweet_');
        if (shouldBeTrans) {
          await makeTransparentPNG(destPath);
        }

        updateGeneratedAssetsFile();
        updateJobStatus(f, 'done', { thumb: '/assets/' + f });
        releaseLock(f);
      } catch (err) {
        console.error('[DOWNLOADS-HARVESTER] Hata:', err.message);
      }
    }
  } catch (e) {}
}

function updateGeneratedAssetsFile() {
  try {
    if (!fs.existsSync(ASSETS_DIR)) return;
    const allEntries = fs.readdirSync(ASSETS_DIR);
    const pngFiles = allEntries.filter(f => {
      try {
        if (fs.statSync(path.join(ASSETS_DIR, f)).isDirectory()) return false;
        if (!f.endsWith('.png')) return false;
        if (f.startsWith('android-') || f.startsWith('favicon') || f.startsWith('icon') || f.startsWith('splash')) return false;
        return true;
      } catch (e) { return false; }
    }).sort();

    const lines = [
      '// AUTO-GENERATED BY MOMORA ASSET PIPELINE',
      '// Bu dosya yeni gorseller indirildikce otomatik olarak guncellenir.',
      '',
      'export const generatedAssets = {'
    ];
    pngFiles.forEach(f => {
      const key = path.basename(f, '.png');
      lines.push("  '" + key + "': require('../assets/" + f + "'),");
    });
    lines.push('};');
    lines.push('');
    lines.push('export function getAsset(name) {');
    lines.push('  if (generatedAssets[name]) return generatedAssets[name];');
    lines.push('  if (name && name.startsWith("blog_")) {');
    lines.push('    if (name.includes("seafood") || name.includes("coffee")) return generatedAssets["blog_healthy_breakfast"];');
    lines.push('    if (name.includes("morning")) return generatedAssets["blog_pregnant_morning"];');
    lines.push('    if (name.includes("contraction") || name.includes("braxton")) return generatedAssets["blog_couple_bump"];');
    lines.push('    if (name.includes("epidural") || name.includes("hospital")) return generatedAssets["blog_hospital_bag_pack"];');
    lines.push('    if (name.includes("breastmilk")) return generatedAssets["blog_breastfeeding_cozy"];');
    lines.push('    if (name.includes("colic") || name.includes("massage")) return generatedAssets["blog_baby_massage"];');
    lines.push('    if (name.includes("sleep")) return generatedAssets["blog_sleeping_crib"];');
    lines.push('    if (name.includes("blues") || name.includes("depression")) return generatedAssets["blog_postpartum_selfcare"];');
    lines.push('    return generatedAssets["blog_pregnant_morning"] || generatedAssets["blog_newborn_hand"];');
    lines.push('  }');
    lines.push('  return null;');
    lines.push('}');
    lines.push('');
    const newContent = lines.join('\n');
    if (newContent !== lastGeneratedContent) {
      fs.writeFileSync(GENERATED_ASSETS_FILE, newContent, 'utf8');
      lastGeneratedContent = newContent;
      console.log('[MOMORA-WATCHER] 🔄 Kod tabani guncellendi! (' + pngFiles.length + ' gorsel: src/generatedAssets.js)');
    }
  } catch (err) {
    console.error('[MOMORA-WATCHER] Hata:', err.message);
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // --- BOT HEALTH / LIVE RELOAD PING ---
  if (req.method === 'GET' && req.url.startsWith('/bot/ping')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', reload: reloadRequested, activeLock }));
    if (reloadRequested) reloadRequested = false;
    return;
  }

  // A. Sonraki Isi Getir (Mutual Exclusion Lock - Tek Seferde Tek Sekme!)
  if (req.method === 'GET' && req.url.startsWith('/job/next')) {
    const urlObj = new URL(req.url, 'http://localhost:' + PORT);
    const platform = urlObj.searchParams.get('platform') || 'unknown';
    const result = getNextJob(platform);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // B. Kilidi Serbest Bırak (Release Mutex)
  if (req.method === 'POST' && req.url === '/job/release') {
    try {
      const data = await parseJsonBody(req);
      releaseLock(data.id || data.filename);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // C. Is Durumu Guncelle
  if (req.method === 'POST' && req.url === '/job/status') {
    try {
      const data = await parseJsonBody(req);
      const updated = updateJobStatus(data.id || data.filename, data.status, data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: updated }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // D. Yeni Is Ekle
  if (req.method === 'POST' && req.url === '/job/add') {
    try {
      const data = await parseJsonBody(req);
      const jobsToAdd = Array.isArray(data.jobs) ? data.jobs : [data];
      const queueData = loadQueue();
      let added = 0;
      jobsToAdd.forEach(j => {
        if (!j.filename || !j.prompt) return;
        const exists = queueData.jobs.some(existing => existing.filename === j.filename);
        if (!exists) {
          queueData.jobs.push({
            id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            filename: j.filename,
            prompt: j.prompt,
            transparent: j.transparent !== false,
            status: 'pending',
            attempts: 0,
            createdAt: Date.now()
          });
          added++;
        }
      });
      saveQueue(queueData);
      console.log('[JOB-ADD] ➕ ' + added + ' yeni gorsel kuyruga eklendi.');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, added, total: queueData.jobs.length }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // E. Kuyruk Listesi ve Istatistikleri
  if (req.method === 'GET' && req.url === '/job/list') {
    const queueData = loadQueue();
    const stats = {
      total: queueData.jobs.length,
      pending: queueData.jobs.filter(j => j.status === 'pending').length,
      processing: queueData.jobs.filter(j => j.status === 'processing').length,
      done: queueData.jobs.filter(j => j.status === 'done').length,
      error: queueData.jobs.filter(j => j.status === 'error').length,
      activeLock
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ stats, jobs: queueData.jobs }));
    return;
  }

  // 1. Mevcut Dosya Listesi Endpointi
  if (req.method === 'GET' && (req.url === '/list' || req.url.startsWith('/list?'))) {
    try {
      const allEntries = fs.readdirSync(ASSETS_DIR);
      const files = allEntries.filter(f => {
        try {
          return !fs.statSync(path.join(ASSETS_DIR, f)).isDirectory() && f.endsWith('.png');
        } catch (e) { return false; }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 2. Asset Dosyasi Sunucu Endpointi
  if (req.method === 'GET' && req.url.startsWith('/assets/')) {
    const filename = decodeURIComponent(req.url.replace('/assets/', ''));
    const filePath = path.join(ASSETS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.glb') contentType = 'model/gltf-binary';
      else if (ext === '.gltf') contentType = 'model/gltf+json';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  // 3. Gorsel Yukleme Endpointi
  if (req.method === 'POST' && req.url.startsWith('/upload')) {
    const urlObj = new URL(req.url, 'http://localhost:' + PORT);
    const filename = urlObj.searchParams.get('filename') || ('image_' + Date.now() + '.png');
    const shouldMakeTransparent = urlObj.searchParams.get('transparent') !== 'false';
    const dest = path.join(ASSETS_DIR, filename);
    const writeStream = fs.createWriteStream(dest);
    req.pipe(writeStream);
    req.on('end', async () => {
      console.log('[ASSET-RECEIVER] 📥 Alindi: ' + filename + ' (Seffaf: ' + (shouldMakeTransparent ? 'EVET' : 'HAYIR') + ')');
      if (shouldMakeTransparent && !filename.endsWith('.glb')) {
        await makeTransparentPNG(dest);
      }
      updateGeneratedAssetsFile();
      updateJobStatus(filename, 'done', { thumb: '/assets/' + filename });
      releaseLock(filename);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', filename, transparent: shouldMakeTransparent }));
    });
    req.on('error', (err) => {
      console.error('[ASSET-RECEIVER] Hata:', err);
      releaseLock(filename);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('MOMORA Transparent Asset Receiver & Global AI Mutex Engine calisiyor.');
});

server.listen(PORT, () => {
  console.log('[MOMORA] 🪄 Otomatik Seffaf PNG Alici ve Global AI Mutex Motoru http://localhost:' + PORT + ' uzerinde hazir!');
  updateGeneratedAssetsFile();
  setInterval(updateGeneratedAssetsFile, 3000);
  setInterval(harvestDownloadsFolder, 2500);
});
