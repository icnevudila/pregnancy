const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const assetsDir = path.join(__dirname, '..', 'assets');

// 1. Assets on disk
const existingAssets = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.glb'));
const existingAssetKeys = new Set(existingAssets.map(f => path.basename(f, path.extname(f))));

// 2. Scan all JS files in src
const jsFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

const imageReferences = new Set();
const emojiUsages = [];

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

for (const file of jsFiles) {
  const filePath = path.join(srcDir, file);
  const code = fs.readFileSync(filePath, 'utf8');

  // Find image: 'name' or image: "name"
  const imgMatches = code.matchAll(/image:\s*['"]([^'"]+)['"]/g);
  for (const m of imgMatches) {
    imageReferences.add({ key: m[1], file });
  }

  // Find getAsset('name')
  const getAssetMatches = code.matchAll(/getAsset\(['"]([^'"]+)['"]\)/g);
  for (const m of getAssetMatches) {
    imageReferences.add({ key: m[1], file });
  }

  // Find generatedAssets['name']
  const genMatches = code.matchAll(/generatedAssets\[['"]([^'"]+)['"]\]/g);
  for (const m of genMatches) {
    imageReferences.add({ key: m[1], file });
  }

  // Find lines with emojis in Text components or object definitions
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      // Check if it's a UI icon or placeholder
      if (line.includes('fontSize: 2') || line.includes('fontSize: 3') || line.includes('icon:') || line.includes('<Text style=') || line.includes('emoji:')) {
        const match = line.match(emojiRegex);
        emojiUsages.push({
          file,
          line: idx + 1,
          emoji: match ? match[0] : '?',
          snippet: line.trim().slice(0, 80)
        });
      }
    }
  });
}

// 3. Analyze missing images
const uniqueReferencedKeys = [...new Set([...imageReferences].map(r => r.key))].sort();
const missingImages = [];
const existingReferencedImages = [];

for (const key of uniqueReferencedKeys) {
  if (existingAssetKeys.has(key)) {
    existingReferencedImages.push(key);
  } else {
    // Check which files reference it
    const files = [...imageReferences].filter(r => r.key === key).map(r => r.file);
    missingImages.push({ key, files: [...new Set(files)] });
  }
}

console.log('==================================================');
console.log('MOMORA VISUAL AUDIT REPORT');
console.log('==================================================');
console.log(`Assets on disk: ${existingAssets.length}`);
console.log(`Referenced image keys in code: ${uniqueReferencedKeys.length}`);
console.log(`Active & Present: ${existingReferencedImages.length}`);
console.log(`MISSING / Fallback image keys: ${missingImages.length}`);
console.log('--------------------------------------------------');
console.log('\nMISSING IMAGES (Referenced in code but not in assets):');
missingImages.forEach(m => {
  console.log(`  - [${m.key}] (used in: ${m.files.join(', ')})`);
});

console.log('\n--------------------------------------------------');
console.log(`EMOJI PLACEHOLDERS DETECTED IN UI: ${emojiUsages.length}`);
// Group emojis by file
const emojisByFile = {};
emojiUsages.forEach(e => {
  if (!emojisByFile[e.file]) emojisByFile[e.file] = [];
  emojisByFile[e.file].push(e);
});

for (const [file, list] of Object.entries(emojisByFile)) {
  console.log(`\n📄 ${file} (${list.length} emoji placeholders):`);
  list.slice(0, 8).forEach(e => {
    console.log(`   L${e.line}: ${e.emoji} -> ${e.snippet}`);
  });
  if (list.length > 8) {
    console.log(`   ... ve ${list.length - 8} tane daha`);
  }
}
