const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const assetsDir = path.join(__dirname, '..', 'assets');

const existingAssets = new Set(
  fs.readdirSync(assetsDir).map(f => path.basename(f, path.extname(f)))
);

// 1. Audit Blog Articles in src/content.js
console.log('====================================================');
console.log('1. BLOG / REHBER MAKALE GÖRSELLERİ ANALİZİ');
console.log('====================================================');

const contentJs = fs.readFileSync(path.join(srcDir, 'content.js'), 'utf8');

// Extract all article objects
const articleRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?image:\s*['"]([^'"]+)['"]/g;
const articles = [];
let match;

while ((match = articleRegex.exec(contentJs)) !== null) {
  articles.push({
    id: match[1],
    title: match[2],
    image: match[3],
    exists: existingAssets.has(match[3])
  });
}

// Also check topics
const topicMatches = contentJs.matchAll(/id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*image:\s*['"]([^'"]+)['"]/g);
const topics = [];
for (const tm of topicMatches) {
  topics.push({ id: tm[1], title: tm[2], image: tm[3], exists: existingAssets.has(tm[3]) });
}

console.log(`Toplam Makale / Konu Sayısı: ${articles.length}`);
const missingArticleImages = articles.filter(a => !a.exists);
const existingArticleImages = articles.filter(a => a.exists);

// Check image reuse / duplicates
const imageUsageCount = {};
articles.forEach(a => {
  imageUsageCount[a.image] = (imageUsageCount[a.image] || 0) + 1;
});

console.log(`Gerçekte Diskinde Bulunan Özel Görsel: ${existingArticleImages.length}`);
console.log(`Diskinde Olmayan (Fallback'e Düşen): ${missingArticleImages.length}`);
console.log('\nEn Çok Tekrar Eden (Aynı Resmi Kullanan) Blog Görselleri:');
Object.entries(imageUsageCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([img, count]) => {
    if (count > 1) {
      console.log(`  - [${img}] -> ${count} farklı makalede AYNI resim kullanılıyor!`);
    }
  });

console.log('\nÖrnek Makaleler ve Görselleri:');
articles.slice(0, 15).forEach(a => {
  console.log(`  ${a.exists ? '✅' : '❌'} [${a.image}] - "${a.title.slice(0, 45)}..."`);
});

// 2. Audit Emojis in All Screens
console.log('\n====================================================');
console.log('2. EKRANLARDA EMOJİ KULLANILAN YERLER (ARAÇLAR, KARTLAR, BUTONLAR)');
console.log('====================================================');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

const screenEmojiAudit = [];

files.forEach(file => {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    // Exclude comments, console.log
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.includes('console.log')) return;

    if (emojiRegex.test(line)) {
      // Find what emojis are on this line
      const emojis = line.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu);
      if (emojis && emojis.length > 0) {
        screenEmojiAudit.push({
          file,
          line: idx + 1,
          emojis: [...new Set(emojis)].join(' '),
          code: line.trim().slice(0, 90)
        });
      }
    }
  });
});

console.log(`Toplam Emoji Bulunan Satır: ${screenEmojiAudit.length}`);

// Group by file
const byFile = {};
screenEmojiAudit.forEach(item => {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item);
});

for (const [file, items] of Object.entries(byFile)) {
  console.log(`\n📁 ${file} (${items.length} adet):`);
  // Print unique emojis in this file
  const allEmojisInFile = [...new Set(items.flatMap(i => i.emojis.split(' ')))].join(' ');
  console.log(`   Kullanılan Emojiler: ${allEmojisInFile}`);
  // Show first 4 examples
  items.slice(0, 4).forEach(i => {
    console.log(`   L${i.line}: [${i.emojis}] ${i.code}`);
  });
}

// 3. Fetus / Fruit Week Comparisons
console.log('\n====================================================');
console.log('3. 40 HAFTA BEBEK BOYUTU / FETUS GÖRSEL DURUMU');
console.log('====================================================');
const fetusAssets = fs.readdirSync(assetsDir).filter(f => f.startsWith('fetus_w') && f.endsWith('.png'));
const fruitAssets = fs.readdirSync(assetsDir).filter(f => f.startsWith('fruit_') && f.endsWith('.png'));
console.log(`Mevcut Fetus Görselleri (assets/fetus_wXX.png): ${fetusAssets.length} / 37 hafta`);
console.log(`Mevcut 3D Kil Meyve İkonları (assets/fruit_XX.png): ${fruitAssets.length} / 37 hafta`);
