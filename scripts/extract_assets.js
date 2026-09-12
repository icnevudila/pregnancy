const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function extract() {
  const srcPath = 'c:/Users/TP2/Documents/annelik/9ecb89ab-204a-429d-9c90-d826a5c37190.png';
  const outDir = path.join(__dirname, '..', 'assets', 'extracted');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const img = await Jimp.read(srcPath);
  console.log('Source loaded:', img.bitmap.width, 'x', img.bitmap.height);

  // Phone 4 (Baby Tracking): roughly x ~ 840-1110, y ~ 150-800
  // Action buttons: Emzirme, Biberon, Uyku, Bez
  // In reference Phone 4:
  // Emzirme circle: ~x=875, y=270, w=90, h=90
  // Biberon circle: ~x=990, y=270, w=90, h=90
  // Uyku circle: ~x=875, y=375, w=90, h=90
  // Bez circle: ~x=990, y=375, w=90, h=90

  // Phone 5 (Discover): roughly x ~ 1115-1380
  // Categories: Bebek bezi, Islak mendil, Beslenme, Banyo
  // Diaper cat: ~x=1150, y=495, w=95, h=65
  // Wipes cat: ~x=1265, y=495, w=95, h=65
  // Bowl cat: ~x=1150, y=570, w=95, h=65
  // Soap cat: ~x=1265, y=570, w=95, h=65

  // Products:
  // Jar: ~x=1160, y=685, w=90, h=90
  // Wipes pack: ~x=1270, y=685, w=90, h=90

  // Melon on Phone 2: ~x=320, y=435, w=65, h=65

  const crops = {
    'btn_nursing.png': { x: 872, y: 268, w: 98, h: 98 },
    'btn_bottle.png': { x: 985, y: 268, w: 98, h: 98 },
    'btn_sleep.png': { x: 872, y: 375, w: 98, h: 98 },
    'btn_diaper.png': { x: 985, y: 375, w: 98, h: 98 },

    'cat_diaper.png': { x: 1145, y: 495, w: 100, h: 68 },
    'cat_wipes.png': { x: 1258, y: 495, w: 100, h: 68 },
    'cat_bowl.png': { x: 1145, y: 570, w: 100, h: 68 },
    'cat_soap.png': { x: 1258, y: 570, w: 100, h: 68 },

    'prod_jar.png': { x: 1152, y: 675, w: 102, h: 105 },
    'prod_wipes.png': { x: 1262, y: 675, w: 102, h: 105 },

    'fruit_melon.png': { x: 320, y: 435, w: 60, h: 60 },
  };

  for (const [name, c] of Object.entries(crops)) {
    const cropped = img.clone().crop({ x: c.x, y: c.y, w: c.w, h: c.h });
    const target = path.join(outDir, name);
    await cropped.write(target);
    console.log('Saved:', name, c.w, 'x', c.h);
  }
  console.log('All crops extracted successfully!');
}

extract().catch(console.error);
