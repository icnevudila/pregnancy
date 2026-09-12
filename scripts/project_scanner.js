// MOMORA · Automated Project Visual Scanner & Missing Asset Detector
// Proje kaynak kodlarını tarar, eksik görsel varlıklarını tespit eder,
// akıllı promptlar oluşturur ve üretim kuyruğuna otomatik ekler.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const QUEUE_FILE = path.join(__dirname, 'generation_queue.json');

// Türkçe -> İngilizce Hayvan & Tatlı Sözlüğü
const ANIMAL_PROMPTS = {
  ant: "High-end 3D claymorphic cute tiny cartoon ant carrying a miniature golden water droplet, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  ladybug: "High-end 3D claymorphic cute friendly red ladybug with glossy black polka dots and shiny clay shell, smooth porcelain finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  bee: "High-end 3D claymorphic cute chubby bumblebee with tiny translucent wings and warm honey yellow stripes, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  snail: "High-end 3D claymorphic cute garden snail with a spiral pastel peach shell and friendly smile, smooth porcelain clay texture, isolated on pure solid white background, cut out style, 8k render, no text.",
  cricket: "High-end 3D claymorphic cute friendly green cricket with tiny antennae sitting peacefully, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  chick: "High-end 3D claymorphic cute fluffy yellow baby chick with tiny orange beak and sweet closed happy eyes, smooth porcelain finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  goldfish: "High-end 3D claymorphic cute chubby goldfish with wavy translucent fins and friendly eyes, pastel orange and gold porcelain clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  frog: "High-end 3D claymorphic cute cheerful pastel green tree frog sitting on a tiny water lily pad, glossy clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  hedgehog: "High-end 3D claymorphic cute chubby baby hedgehog curled up peacefully, soft cream belly and rounded soft quills, isolated on pure solid white background, cut out style, 8k render, no text.",
  hamster: "High-end 3D claymorphic cute chubby baby hamster holding a tiny sunflower seed with both paws, soft pastel apricot and cream clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  squirrel: "High-end 3D claymorphic cute bushy-tailed baby squirrel holding a smooth acorn, warm terracotta and cream porcelain, isolated on pure solid white background, cut out style, 8k render, no text.",
  kitten: "High-end 3D claymorphic cute sleeping kitten curled in a ball with paws tucked in, soft pastel cream and apricot tones, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  puppy: "High-end 3D claymorphic cute golden retriever puppy sitting attentively with floppy ears, soft caramel porcelain clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  otter: "High-end 3D claymorphic cute playful baby otter floating on back holding a tiny polished river pebble on chest, smooth matte clay texture, isolated on pure solid white background, cut out style, 8k render, no text.",
  koala: "High-end 3D claymorphic cute sleepy baby koala hugging a smooth eucalyptus twig, soft pastel gray and cream, smooth porcelain finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  duckling: "High-end 3D claymorphic adorable baby yellow duckling waddling cheerfully, smooth pastel porcelain clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  bunny: "High-end 3D claymorphic cute fluffy white bunny rabbit with long pastel pink inner ears, sitting peacefully, smooth porcelain clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  lamb: "High-end 3D claymorphic cute woolly baby lamb with curly clay fleece and gentle peaceful expression, soft ivory white, isolated on pure solid white background, cut out style, 8k render, no text.",
  fawn: "High-end 3D claymorphic graceful baby deer fawn with tiny white spots and big innocent eyes, soft warm fawn brown clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  lion_cub: "High-end 3D claymorphic majestic and adorable baby lion cub sitting proudly, fluffy golden fur texture in smooth clay, sweet friendly expression, isolated on pure solid white background, cut out style, 8k render, no text.",
  panda: "High-end 3D claymorphic cute chubby giant panda cub chewing gently on a bamboo shoot, soft matte porcelain clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  penguin: "High-end 3D claymorphic cute emperor penguin chick with soft gray downy feathers and sweet baby eyes, smooth porcelain, isolated on pure solid white background, cut out style, 8k render, no text.",
  seal: "High-end 3D claymorphic cute white baby harp seal pup lying on soft ice belly down, big shiny black eyes, isolated on pure solid white background, cut out style, 8k render, no text.",
  polar_bear: "High-end 3D claymorphic cute playful baby polar bear cub, smooth snowy white clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  elephant_calf: "High-end 3D claymorphic cute baby elephant calf with joyful raised trunk and oversized friendly ears, soft pastel gray porcelain, isolated on pure solid white background, cut out style, 8k render, no text."
};

const SWEET_PROMPTS = {
  sprinkle: "High-end 3D claymorphic cute golden sugar sprinkle pellet resting on a miniature cream podium, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  candy: "High-end 3D claymorphic cute wrapped bonbon candy with striped pastel coral and cream wrapper, glossy porcelain finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  chocolate: "High-end 3D claymorphic glossy milk chocolate bonbon with delicate golden caramel drizzle and hazelnut topping, smooth clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  gummybear: "High-end 3D claymorphic translucent glossy strawberry gummy bear with soft internal glow, cute toy aesthetic, isolated on pure solid white background, cut out style, 8k render, no text.",
  marshmallow: "High-end 3D claymorphic soft pillowy pastel pink and white twisted marshmallow, powdery matte clay texture, isolated on pure solid white background, cut out style, 8k render, no text.",
  jellybean: "High-end 3D claymorphic glossy speckled gourmet jellybean in juicy peach and coral gradient, porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  truffle: "High-end 3D claymorphic luxury dark chocolate truffle dusted with velvety cocoa powder and edible gold leaf flake, isolated on pure solid white background, cut out style, 8k render, no text.",
  macaron: "High-end 3D claymorphic Parisian pistachio and raspberry macaron with delicate ruffled feet and creamy ganache filling, isolated on pure solid white background, cut out style, 8k render, no text.",
  cookie: "High-end 3D claymorphic freshly baked chocolate chip cookie with embossed chocolate chunks, warm golden brown porcelain clay, isolated on pure solid white background, cut out style, 8k render, no text.",
  donut: "High-end 3D claymorphic cute ring donut with glossy pink strawberry frosting and pastel rainbow sprinkles, smooth clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  cupcake: "High-end 3D claymorphic cute cupcake with a tall swirl of fluffy vanilla cream and a glossy red cherry on top, pastel lavender baking cup, isolated on pure solid white background, cut out style, 8k render, no text.",
  croissant: "High-end 3D claymorphic flaky golden French croissant with delicate curved crescent shape and butter glaze, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  waffle: "High-end 3D claymorphic round Belgian waffle with crisp square grid, melted butter pat and a fresh raspberry, isolated on pure solid white background, cut out style, 8k render, no text.",
  pancake_stack: "High-end 3D claymorphic tall stack of three fluffy golden pancakes dripping with warm maple syrup and a cube of butter, isolated on pure solid white background, cut out style, 8k render, no text.",
  birthdaycake: "High-end 3D claymorphic two-tier pastel celebration birthday cake with delicate white piped frosting, a tiny golden candle, and sugar pearls, isolated on pure solid white background, cut out style, 8k render, no text.",
  eclair: "High-end 3D claymorphic French chocolate eclair pastry with rich glossy dark chocolate glaze and pastry cream piping, isolated on pure solid white background, cut out style, 8k render, no text.",
  tart: "High-end 3D claymorphic fresh fruit tart with golden fluted pastry shell filled with vanilla custard and topped with glossy glazed blueberries and strawberries, isolated on pure solid white background, cut out style, 8k render, no text.",
  lollipop: "High-end 3D claymorphic colorful swirl rainbow spiral lollipop on a white stick, glossy candy clay finish, isolated on pure solid white background, cut out style, 8k render, no text.",
  gelato: "High-end 3D claymorphic artisanal waffle cone holding two perfect scoops of strawberry and pistachio gelato with a tiny mint leaf, isolated on pure solid white background, cut out style, 8k render, no text."
};

function generatePromptForAsset(filename) {
  const base = filename.replace(/\.png$/i, '');

  // 1. Hayvanlar
  if (base.startsWith('animal_')) {
    const key = base.replace('animal_', '');
    if (ANIMAL_PROMPTS[key]) {
      return { prompt: ANIMAL_PROMPTS[key], transparent: true, preferredPlatform: 'any' };
    }
    const cleanKey = key.replace(/_/g, ' ');
    return {
      prompt: `High-end 3D claymorphic cute adorable baby ${cleanKey} sitting peacefully, smooth porcelain clay finish, pastel tones, isolated on pure solid white background, cut out style, 8k render, no text.`,
      transparent: true,
      preferredPlatform: 'any'
    };
  }

  // 2. Tatlılar
  if (base.startsWith('sweet_')) {
    const key = base.replace('sweet_', '');
    if (SWEET_PROMPTS[key]) {
      return { prompt: SWEET_PROMPTS[key], transparent: true, preferredPlatform: 'any' };
    }
    const cleanKey = key.replace(/_/g, ' ');
    return {
      prompt: `High-end 3D claymorphic delicious cute ${cleanKey} pastry sweet with glossy icing, smooth clay finish, isolated on pure solid white background, cut out style, 8k render, no text.`,
      transparent: true,
      preferredPlatform: 'any'
    };
  }

  // 3. Meyveler
  if (base.startsWith('fruit_')) {
    const fruitName = base.replace('fruit_', '').replace(/_/g, ' ');
    return {
      prompt: `High-end 3D claymorphic ripe organic ${fruitName} with smooth glossy skin and a fresh green leaf, vibrant appetizing pastel colors, porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.`,
      transparent: true,
      preferredPlatform: 'any'
    };
  }

  // 4. Gelecek Özellikler (Future Innovation Assets)
  if (base.startsWith('future_')) {
    const topic = base.replace('future_', '').replace(/_/g, ' ');
    return {
      prompt: `High-end 3D claymorphic innovative maternal technology widget representing ${topic}, futuristic glowing elements, warm pastel sage and rose gold tones, smooth porcelain texture, isolated on pure solid white background, cut out style, 8k render, no text.`,
      transparent: true,
      preferredPlatform: 'any'
    };
  }

  // 5. İnfografikler (Clinical Infographics)
  if (base.startsWith('infographic_')) {
    const topic = base.replace('infographic_', '').replace(/_/g, ' ');
    return {
      prompt: `Professional aesthetic medical visual infographic poster for ${topic}: clean Kinfolk and Architectural Digest flatlay aesthetic, warm morning sunlight, pastel color palette, ultra high resolution, elegant layout, no text, no watermarks, no logos.`,
      transparent: false,
      preferredPlatform: 'chatgpt'
    };
  }

  // 6. Blog Fotoğrafları
  if (base.startsWith('blog_')) {
    const topic = base.replace('blog_', '').replace(/_/g, ' ');
    return {
      prompt: `Award-winning authentic editorial lifestyle photography representing ${topic}, soft warm natural morning sunbeams, cozy modern interior, shallow depth of field, 85mm f/1.4 lens, natural skin texture, cinematic lighting, no text, no watermarks, no logos.`,
      transparent: false,
      preferredPlatform: 'chatgpt'
    };
  }

  // 7. UI İkonları & Kartlar
  if (base.startsWith('ui_') || base.startsWith('icon_') || base.startsWith('badge_')) {
    const name = base.replace(/^(ui_|icon_|badge_)/, '').replace(/_/g, ' ');
    return {
      prompt: `High-end 3D claymorphic tactile UI element of ${name}, elegant pastel colors, rose gold accents, smooth porcelain clay finish, isolated on pure solid white background, cut out style, 8k render, no text.`,
      transparent: true,
      preferredPlatform: 'any'
    };
  }

  // 8. Onboarding / Screen Hero
  if (base.startsWith('screen_hero_') || base.startsWith('onboarding_')) {
    const topic = base.replace(/^(screen_hero_|onboarding_)/, '').replace(/_/g, ' ');
    return {
      prompt: `Award-winning artistic 3D fine art concept representing ${topic}, serene maternal atmosphere, warm glowing ambient lighting, elegant pastel palette, 8k render, hyper-detailed, clean modern aesthetics, no text.`,
      transparent: false,
      preferredPlatform: 'chatgpt'
    };
  }

  // Genel Fallback
  const cleanBase = base.replace(/_/g, ' ');
  return {
    prompt: `High-end 3D claymorphic visual representation of ${cleanBase}, soft pastel colors, smooth porcelain finish, isolated on pure solid white background, cut out style, 8k render, no text.`,
    transparent: true,
    preferredPlatform: 'any'
  };
}

function scanProjectForMissingAssets() {
  const existingFiles = new Set();
  if (fs.existsSync(ASSETS_DIR)) {
    fs.readdirSync(ASSETS_DIR).forEach(f => {
      if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.glb')) {
        existingFiles.add(f);
      }
    });
  }

  // Queue oku
  let queueJobs = [];
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      const q = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
      queueJobs = q.jobs || [];
    } catch (e) {}
  }

  const queuedFilenames = new Set(queueJobs.map(j => j.filename));
  const doneFilenames = new Set(queueJobs.filter(j => j.status === 'done').map(j => j.filename));

  const referencedFilenames = new Set();

  // 1. Src dosyalarını tara
  if (fs.existsSync(SRC_DIR)) {
    const srcFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js'));
    srcFiles.forEach(sf => {
      const fullPath = path.join(SRC_DIR, sf);
      const content = fs.readFileSync(fullPath, 'utf8');

      // require('../assets/NAME.png')
      const reqRe = /require\(['"]\.\.\/assets\/([a-zA-Z0-9_\-\.]+)\.png['"]\)/g;
      let m;
      while ((m = reqRe.exec(content)) !== null) {
        referencedFilenames.add(m[1] + '.png');
      }

      // getAsset('NAME')
      const getAssetRe = /getAsset\(['"]([a-zA-Z0-9_\-]+)['"]\)/g;
      while ((m = getAssetRe.exec(content)) !== null) {
        referencedFilenames.add(m[1] + '.png');
      }

      // generatedAssets['NAME']
      const genRe = /generatedAssets\[['"]([a-zA-Z0-9_\-]+)['"]\]/g;
      while ((m = genRe.exec(content)) !== null) {
        referencedFilenames.add(m[1] + '.png');
      }
    });
  }

  // 2. weekData.js hayvan, tatlı ve meyveleri tara
  const weekDataPath = path.join(SRC_DIR, 'weekData.js');
  if (fs.existsSync(weekDataPath)) {
    const wd = fs.readFileSync(weekDataPath, 'utf8');
    let m;
    const animalRe = /animal:\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
    while ((m = animalRe.exec(wd)) !== null) {
      referencedFilenames.add('animal_' + m[1] + '.png');
    }
    const sweetRe = /sweet:\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
    while ((m = sweetRe.exec(wd)) !== null) {
      referencedFilenames.add('sweet_' + m[1] + '.png');
    }
    const fruitRe = /fruit:\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
    while ((m = fruitRe.exec(wd)) !== null) {
      referencedFilenames.add('fruit_' + m[1] + '.png');
    }
  }

  // 3. Eksikleri filtrele
  const missing = [];
  referencedFilenames.forEach(filename => {
    // Disk üzerinde zaten var mı?
    if (existingFiles.has(filename)) return;
    // Kuyrukta 'done' olarak işaretlenmiş mi?
    if (doneFilenames.has(filename)) return;

    // Kuyrukta pending veya processing mi?
    const isAlreadyQueued = queuedFilenames.has(filename);

    const generated = generatePromptForAsset(filename);
    missing.push({
      filename,
      prompt: generated.prompt,
      transparent: generated.transparent,
      preferredPlatform: generated.preferredPlatform,
      isAlreadyQueued
    });
  });

  return {
    totalReferenced: referencedFilenames.size,
    totalExisting: existingFiles.size,
    totalMissing: missing.length,
    missingNotQueued: missing.filter(m => !m.isAlreadyQueued),
    missingAll: missing
  };
}

function syncMissingToQueue() {
  const scanResult = scanProjectForMissingAssets();
  const toAdd = scanResult.missingNotQueued;

  if (toAdd.length === 0) {
    return { added: 0, totalMissing: scanResult.totalMissing, scanResult };
  }

  let queueData = { jobs: [] };
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      queueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch (e) {}
  }

  let addedCount = 0;
  toAdd.forEach(item => {
    const exists = queueData.jobs.some(j => j.filename === item.filename);
    if (!exists) {
      queueData.jobs.push({
        id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        filename: item.filename,
        prompt: item.prompt,
        transparent: item.transparent,
        preferredPlatform: item.preferredPlatform,
        status: 'pending',
        attempts: 0,
        createdAt: Date.now()
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf8');
    console.log(`[PROJECT-SCANNER] 🚀 ${addedCount} eksik görsel otomatik tespit edildi ve kuyruğa eklendi!`);
  }

  return { added: addedCount, totalMissing: scanResult.totalMissing, scanResult };
}

// Standalone CLI çalıştırılması
if (require.main === module) {
  console.log('[PROJECT-SCANNER] 🔍 Momora projesi taranıyor...');
  const res = syncMissingToQueue();
  console.log(`[PROJECT-SCANNER] 📊 Sonuç:`);
  console.log(`  - Referans Verilen Toplam Görsel: ${res.scanResult.totalReferenced}`);
  console.log(`  - Disk Üzerinde Mevcut: ${res.scanResult.totalExisting}`);
  console.log(`  - Eksik Olan Toplam: ${res.scanResult.totalMissing}`);
  console.log(`  - Kuyruğa Yeni Eklenen: ${res.added}`);
}

module.exports = {
  scanProjectForMissingAssets,
  syncMissingToQueue,
  generatePromptForAsset
};
