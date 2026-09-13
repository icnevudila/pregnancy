const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function optimizeAll() {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.png'));
  console.log(`Bulunan PNG dosyasi: ${files.length}`);

  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    const statBefore = fs.statSync(filePath);
    totalBefore += statBefore.size;

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      const isLargePhoto = file.startsWith('blog_') || file.startsWith('onboarding_') || file.startsWith('infographic_') || file.startsWith('mother');
      const maxDim = isLargePhoto ? 640 : 384;

      let pipeline = sharp(filePath);

      if (metadata.width > maxDim || metadata.height > maxDim) {
        pipeline = pipeline.resize({
          width: maxDim,
          height: maxDim,
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      const buffer = await pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          quality: 90
        })
        .toBuffer();

      if (buffer.length < statBefore.size) {
        fs.writeFileSync(filePath, buffer);
        totalAfter += buffer.length;
        count++;
        const savedPercent = Math.round((1 - buffer.length / statBefore.size) * 100);
        console.log(`[${count}/${files.length}] ${file}: ${(statBefore.size / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB (-%${savedPercent})`);
      } else {
        totalAfter += statBefore.size;
      }
    } catch (err) {
      console.error(`Hata (${file}):`, err.message);
      totalAfter += statBefore.size;
    }
  }

  const beforeMB = (totalBefore / (1024 * 1024)).toFixed(1);
  const afterMB = (totalAfter / (1024 * 1024)).toFixed(1);
  const totalSavedPercent = Math.round((1 - totalAfter / totalBefore) * 100);

  console.log('\n========================================');
  console.log(`Tamamlandi!`);
  console.log(`Onceki Toplam Boyut: ${beforeMB} MB`);
  console.log(`Yeni Toplam Boyut:   ${afterMB} MB`);
  console.log(`Tasarruf:           -%${totalSavedPercent} kazanc!`);
  console.log('========================================');
}

optimizeAll().catch(err => console.error('Genel hata:', err));
