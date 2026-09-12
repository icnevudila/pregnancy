const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const assetsDir = path.join(__dirname, '..', 'assets');
const existingAssets = new Set(fs.readdirSync(assetsDir).map(f => path.basename(f, path.extname(f))));

const contentJs = fs.readFileSync(path.join(srcDir, 'content.js'), 'utf8');

// Find all articles
const articleMatches = [...contentJs.matchAll(/id:\s*['"](art-[^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?image:\s*['"]([^'"]+)['"]/g)];

console.log('TOPLAM BLOG MAKALESİ:', articleMatches.length);

const imageCounts = {};
articleMatches.forEach(m => {
  const img = m[3];
  imageCounts[img] = (imageCounts[img] || 0) + 1;
});

console.log('\n--- KULLANILAN GÖRSELLER VE TEKRAR SAYILARI ---');
Object.entries(imageCounts).sort((a, b) => b[1] - a[1]).forEach(([img, count]) => {
  const exists = existingAssets.has(img);
  console.log(`${exists ? '✅ VAR ' : '❌ YOK '} [${img}] -> ${count} makale`);
});

console.log('\n--- HANGİ MAKALE HANGİ GÖRSELİ KULLANIYOR (VE UYUMSUZLUKLAR) ---');
articleMatches.forEach(m => {
  const id = m[1];
  const title = m[2];
  const img = m[3];
  console.log(`• "${title.slice(0, 45)}"`);
  console.log(`  └─ Görsel: [${img}] (${existingAssets.has(img) ? 'Mevcut' : 'YOK - Fallback'})`);
});
