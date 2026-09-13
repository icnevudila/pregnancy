// MOMORA · Harmonized Size Comparison Visual Engine
// Meyve, Hayvan ve Tatlı kıyaslamalarını Apple Design Award seviyesinde
// TEK ve ORTAK bir görsel dilde (3D Claymorphic Porcelain Studio) birleştirir.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const QUEUE_FILE = path.join(__dirname, 'generation_queue.json');

// MASTER STIL FORMÜLÜ (Ortak Tasarım Dili)
const MASTER_STYLE = "handcrafted smooth porcelain clay texture, delicate soft pastel tones, gentle satin sheen, warm studio lighting with subtle ambient occlusion, isolated on pure solid white background, cut out style, 8k render, hyper-detailed, clean modern aesthetics, no text, no watermarks.";

const FRUIT_SPECS = {
  seed: { name: "Poppy Seed", prompt: `High-end 3D claymorphic tiny golden poppy seed resting on a miniature soft cream clay leaf, ${MASTER_STYLE}` },
  pea: { name: "Sweet Pea Pod", prompt: `High-end 3D claymorphic cute fresh green sweet pea pod gently split open revealing three plump round peas, ${MASTER_STYLE}` },
  blueberry: { name: "Blueberry", prompt: `High-end 3D claymorphic plump juicy blueberry with a delicate star calyx and tiny green leaf, velvety pastel purple-blue, ${MASTER_STYLE}` },
  raspberry: { name: "Raspberry", prompt: `High-end 3D claymorphic cute ripe raspberry with clustered soft clay drupelets and fresh green stem, warm coral pink, ${MASTER_STYLE}` },
  grape: { name: "Grapes", prompt: `High-end 3D claymorphic cute cluster of glossy translucent green grapes on a tiny twisted clay vine, soft pastel jade, ${MASTER_STYLE}` },
  kumquat: { name: "Kumquat", prompt: `High-end 3D claymorphic cute oval bright orange kumquat with glossy porcelain clay skin and two delicate leaves, ${MASTER_STYLE}` },
  fig: { name: "Fig", prompt: `High-end 3D claymorphic plump teardrop-shaped purple fig with gentle pink blush and smooth matte clay texture, ${MASTER_STYLE}` },
  plum: { name: "Plum", prompt: `High-end 3D claymorphic glossy round purple plum with warm golden blush and natural clay indentation, ${MASTER_STYLE}` },
  lemon: { name: "Lemon", prompt: `High-end 3D claymorphic bright cheerful sunny yellow lemon with gentle clay zest texture and a single green leaf, ${MASTER_STYLE}` },
  peach: { name: "Peach", prompt: `High-end 3D claymorphic soft velvety peach with warm blush gradient from pastel apricot to rosy pink, ${MASTER_STYLE}` },
  apple: { name: "Apple", prompt: `High-end 3D claymorphic cute glossy red apple with smooth porcelain finish and a tiny brown clay stem, ${MASTER_STYLE}` },
  avocado: { name: "Avocado", prompt: `High-end 3D claymorphic cute avocado half with smooth dark green pebbled skin, creamy pastel lime flesh, and smooth round brown pit, ${MASTER_STYLE}` },
  pear: { name: "Pear", prompt: `High-end 3D claymorphic elegant golden Bosc pear with slender curved neck and warm honey glaze, ${MASTER_STYLE}` },
  sweetpotato: { name: "Sweet Potato", prompt: `High-end 3D claymorphic cute smooth sweet potato with warm copper skin and vibrant terracotta orange interior slice, ${MASTER_STYLE}` },
  mango: { name: "Mango", prompt: `High-end 3D claymorphic juicy ripe mango with rich sunset gradient from golden yellow to coral red, ${MASTER_STYLE}` },
  banana: { name: "Banana", prompt: `High-end 3D claymorphic cute cheerful curved bright yellow banana with delicate green tips, ${MASTER_STYLE}` },
  carrot: { name: "Carrot", prompt: `High-end 3D claymorphic cute tapering bright orange carrot with embossed texture lines and fluffy green clay leafy top, ${MASTER_STYLE}` },
  coconut: { name: "Coconut", prompt: `High-end 3D claymorphic cute round coconut with textured brown husk, pure white porcelain coconut meat, and a miniature flower, ${MASTER_STYLE}` },
  grapefruit: { name: "Grapefruit", prompt: `High-end 3D claymorphic cute pink grapefruit sliced in half showing juicy translucent segmented pink interior and yellow-orange rind, ${MASTER_STYLE}` },
  melon: { name: "Cantaloupe Melon", prompt: `High-end 3D claymorphic cute cantaloupe melon with textured cream webbing over soft sage skin, ${MASTER_STYLE}` },
  cauliflower: { name: "Cauliflower", prompt: `High-end 3D claymorphic cute head of cauliflower with creamy white floret clouds nestled in crisp pastel green protective clay leaves, ${MASTER_STYLE}` },
  cucumber: { name: "Cucumber", prompt: `High-end 3D claymorphic crisp garden cucumber with subtle bumps and rich emerald green clay skin, ${MASTER_STYLE}` },
  cabbage: { name: "Cabbage", prompt: `High-end 3D claymorphic cute head of Savoy cabbage with ruffled overlapping mint and sage green clay leaves, ${MASTER_STYLE}` },
  eggplant: { name: "Eggplant", prompt: `High-end 3D claymorphic glossy deep violet purple eggplant with elegant curved silhouette and bright green clay calyx, ${MASTER_STYLE}` },
  squash: { name: "Butternut Squash", prompt: `High-end 3D claymorphic smooth golden butternut squash with hourglass shape and matte porcelain finish, ${MASTER_STYLE}` },
  pineapple: { name: "Pineapple", prompt: `High-end 3D claymorphic cute golden pineapple with embossed geometric diamond skin and vibrant spiky green crown leaves, ${MASTER_STYLE}` },
  zucchini: { name: "Zucchini", prompt: `High-end 3D claymorphic smooth fresh green zucchini squash with delicate yellow blossom flower attached, ${MASTER_STYLE}` },
  honeydew: { name: "Honeydew", prompt: `High-end 3D claymorphic smooth pale celadon green honeydew melon with porcelain satin finish, ${MASTER_STYLE}` },
  watermelon: { name: "Watermelon", prompt: `High-end 3D claymorphic round watermelon with dark green wavy stripes and glossy porcelain finish, ${MASTER_STYLE}` },
  pumpkin: { name: "Pumpkin", prompt: `High-end 3D claymorphic plump autumn pumpkin with rich orange ribbed segments and curly green clay vine stem, ${MASTER_STYLE}` }
};

const ANIMAL_SPECS = {
  ant: `High-end 3D claymorphic cute tiny cartoon ant carrying a miniature golden water droplet, ${MASTER_STYLE}`,
  ladybug: `High-end 3D claymorphic cute friendly red ladybug with glossy black polka dots and shiny clay shell, ${MASTER_STYLE}`,
  bee: `High-end 3D claymorphic cute chubby bumblebee with tiny translucent wings and warm honey yellow stripes, ${MASTER_STYLE}`,
  caterpillar: `High-end 3D claymorphic cute segmented pastel green baby caterpillar with tiny friendly smiling face, ${MASTER_STYLE}`,
  dragonfly: `High-end 3D claymorphic cute delicate baby dragonfly with iridescent pastel turquoise wings, ${MASTER_STYLE}`,
  snail: `High-end 3D claymorphic cute garden snail with a spiral pastel peach shell and friendly smile, ${MASTER_STYLE}`,
  grasshopper: `High-end 3D claymorphic cute friendly green grasshopper with tiny antennae sitting peacefully, ${MASTER_STYLE}`,
  fish: `High-end 3D claymorphic cute chubby goldfish with wavy translucent fins and friendly eyes, pastel orange and gold, ${MASTER_STYLE}`,
  chick: `High-end 3D claymorphic cute fluffy yellow baby chick with tiny orange beak and sweet closed happy eyes, ${MASTER_STYLE}`,
  treefrog: `High-end 3D claymorphic cute cheerful pastel green tree frog sitting on a tiny water lily pad, ${MASTER_STYLE}`,
  hamster: `High-end 3D claymorphic cute chubby baby hamster holding a tiny sunflower seed with both paws, soft pastel apricot and cream, ${MASTER_STYLE}`,
  sparrow: `High-end 3D claymorphic cute chubby baby sparrow with soft warm brown and cream clay feathers, ${MASTER_STYLE}`,
  hedgehog: `High-end 3D claymorphic cute chubby baby hedgehog curled up peacefully, soft cream belly and rounded soft quills, ${MASTER_STYLE}`,
  squirrel: `High-end 3D claymorphic cute bushy-tailed baby squirrel holding a smooth acorn, warm terracotta and cream, ${MASTER_STYLE}`,
  chameleon: `High-end 3D claymorphic cute baby chameleon with spiral curled tail in soft pastel rainbow gradient, ${MASTER_STYLE}`,
  parakeet: `High-end 3D claymorphic adorable baby parakeet with soft pastel mint green feathers and sweet yellow cheeks, ${MASTER_STYLE}`,
  bunny: `High-end 3D claymorphic cute fluffy white bunny rabbit with long pastel pink inner ears, sitting peacefully, ${MASTER_STYLE}`,
  chinchilla: `High-end 3D claymorphic adorable round baby chinchilla with ultra soft pastel gray clay texture, ${MASTER_STYLE}`,
  ferret: `High-end 3D claymorphic playful cute baby ferret curled gently, soft cream and brown mask, ${MASTER_STYLE}`,
  duckling: `High-end 3D claymorphic adorable baby yellow duckling waddling cheerfully with tiny orange flippers, ${MASTER_STYLE}`,
  kitten: `High-end 3D claymorphic cute sleeping kitten curled in a ball with paws tucked in, soft pastel cream and apricot, ${MASTER_STYLE}`,
  puppy: `High-end 3D claymorphic cute golden retriever puppy sitting attentively with floppy ears, soft caramel clay, ${MASTER_STYLE}`,
  otter: `High-end 3D claymorphic cute playful baby otter floating on back holding a tiny polished river pebble on chest, ${MASTER_STYLE}`,
  raccoon: `High-end 3D claymorphic adorable baby raccoon with tiny bandit eye mask and ringed tail, sitting sweet, ${MASTER_STYLE}`,
  sloth: `High-end 3D claymorphic cute sleepy baby sloth gently hugging a smooth branch, peaceful closed eyes, ${MASTER_STYLE}`,
  badger: `High-end 3D claymorphic cute baby badger with black and white striped face sitting cozy, ${MASTER_STYLE}`,
  koala: `High-end 3D claymorphic cute sleepy baby koala hugging a smooth eucalyptus twig, soft pastel gray and cream, ${MASTER_STYLE}`,
  fennec: `High-end 3D claymorphic adorable baby fennec fox kit with oversized plush ears and fluffy bushy tail, ${MASTER_STYLE}`,
  kangaroo: `High-end 3D claymorphic cute baby kangaroo joey peeking out cheerfully with long friendly ears, ${MASTER_STYLE}`,
  penguin: `High-end 3D claymorphic cute emperor penguin chick with soft gray downy feathers and sweet baby eyes, ${MASTER_STYLE}`,
  beaver: `High-end 3D claymorphic cute chubby baby beaver with textured flat paddle tail and friendly front paws, ${MASTER_STYLE}`,
  skunk: `High-end 3D claymorphic adorable baby skunk with silky white dorsal stripe and sweet smiling expression, ${MASTER_STYLE}`,
  panda: `High-end 3D claymorphic cute chubby giant panda cub chewing gently on a bamboo shoot, soft matte clay, ${MASTER_STYLE}`,
  lamb: `High-end 3D claymorphic cute woolly baby lamb with curly clay fleece and gentle peaceful expression, soft ivory, ${MASTER_STYLE}`,
  seal: `High-end 3D claymorphic cute white baby harp seal pup lying on soft ice belly down, big shiny black eyes, ${MASTER_STYLE}`,
  bear_cub: `High-end 3D claymorphic adorable chubby brown bear cub sitting with paws out, teddy bear aesthetic, ${MASTER_STYLE}`,
  lion_cub: `High-end 3D claymorphic majestic and adorable baby lion cub sitting proudly, fluffy golden fur texture in smooth clay, ${MASTER_STYLE}`
};

const SWEET_SPECS = {
  sprinkle: `High-end 3D claymorphic cute golden sugar sprinkle pellet resting on a miniature cream podium, ${MASTER_STYLE}`,
  candy: `High-end 3D claymorphic cute wrapped bonbon candy with striped pastel coral and cream wrapper, ${MASTER_STYLE}`,
  chocolate: `High-end 3D claymorphic glossy milk chocolate bonbon with delicate golden caramel drizzle and hazelnut, ${MASTER_STYLE}`,
  blueberry_bonbon: `High-end 3D claymorphic translucent glossy blueberry candy drop with crystalline sugar shimmer, ${MASTER_STYLE}`,
  gummybear: `High-end 3D claymorphic translucent glossy strawberry gummy bear with soft internal glow, cute toy aesthetic, ${MASTER_STYLE}`,
  caramel: `High-end 3D claymorphic golden butter caramel cube with warm translucent gloss and sea salt flake, ${MASTER_STYLE}`,
  almond_candy: `High-end 3D claymorphic delicate pastel Jordan sugared almond with smooth matte porcelain finish, ${MASTER_STYLE}`,
  turkish_delight: `High-end 3D claymorphic rosewater Turkish delight cube dusted with velvety powdered sugar and a pistachio piece, ${MASTER_STYLE}`,
  macaron: `High-end 3D claymorphic Parisian pistachio and raspberry macaron with delicate ruffled feet and creamy ganache, ${MASTER_STYLE}`,
  cookie: `High-end 3D claymorphic freshly baked chocolate chip cookie with embossed chocolate chunks, warm golden brown clay, ${MASTER_STYLE}`,
  teacup: `High-end 3D claymorphic miniature pastel vintage porcelain teacup with floral gold trim and steaming herbal tea, ${MASTER_STYLE}`,
  donut: `High-end 3D claymorphic cute ring donut with glossy pink strawberry frosting and pastel rainbow sprinkles, ${MASTER_STYLE}`,
  cupcake: `High-end 3D claymorphic cute cupcake with a tall swirl of fluffy vanilla cream and glossy red cherry on top, ${MASTER_STYLE}`,
  croissant: `High-end 3D claymorphic flaky golden French croissant with delicate curved crescent shape and butter glaze, ${MASTER_STYLE}`,
  pretzel: `High-end 3D claymorphic twisted golden Bavarian pretzel drizzled with glossy chocolate and sugar pearls, ${MASTER_STYLE}`,
  pancake: `High-end 3D claymorphic golden fluffy pancake topped with melting butter pat and dripping amber honey, ${MASTER_STYLE}`,
  icecream: `High-end 3D claymorphic waffle cone holding a tall swirl of pastel strawberry and vanilla soft serve ice cream, ${MASTER_STYLE}`,
  waffle: `High-end 3D claymorphic round Belgian waffle with crisp square grid, melted butter pat and fresh raspberry, ${MASTER_STYLE}`,
  honeyjar: `High-end 3D claymorphic cute miniature ceramic honey pot with golden dripping wooden dipper, ${MASTER_STYLE}`,
  cheesecake: `High-end 3D claymorphic slice of New York cheesecake with graham crust and glossy raspberry coulis swirl, ${MASTER_STYLE}`,
  pie: `High-end 3D claymorphic miniature lattice-crust baked apple pie with golden fluted pastry rim, ${MASTER_STYLE}`,
  pancake_stack: `High-end 3D claymorphic tall stack of three fluffy golden pancakes dripping with warm maple syrup and butter, ${MASTER_STYLE}`,
  birthdaycake: `High-end 3D claymorphic two-tier pastel celebration birthday cake with delicate white piped frosting and golden candle, ${MASTER_STYLE}`,
  parfait: `High-end 3D claymorphic tall glass parfait with visible layers of yogurt, granola, and strawberry puree, ${MASTER_STYLE}`,
  chocobox: `High-end 3D claymorphic elegant heart-shaped pink chocolate gift box tied with a satin gold ribbon, ${MASTER_STYLE}`,
  sundae: `High-end 3D claymorphic vintage sundae dish with three pastel ice cream scoops, whipped cream swirl, and cherry, ${MASTER_STYLE}`,
  basket: `High-end 3D claymorphic cute woven wicker pastry basket filled with miniature golden croissants and rolls, ${MASTER_STYLE}`,
  pecan_pie: `High-end 3D claymorphic individual fluted pecan tart with glossy caramel glaze and toasted pecan halves, ${MASTER_STYLE}`,
  giant_croissant: `High-end 3D claymorphic grand golden artisan croissant with pronounced crisp buttery layers, ${MASTER_STYLE}`,
  teapot: `High-end 3D claymorphic vintage porcelain teapot in soft pastel lavender with delicate rosebud handle, ${MASTER_STYLE}`,
  cotton_candy: `High-end 3D claymorphic fluffy cloud of pastel pink and blue cotton candy spun on a striped white stick, ${MASTER_STYLE}`,
  strawberry_cake: `High-end 3D claymorphic slice of Japanese strawberry shortcake with light sponge, whipped cream, and fresh berry, ${MASTER_STYLE}`,
  tier_cake: `High-end 3D claymorphic luxury tiered pastel wedding cake with cascading miniature sugar flowers, ${MASTER_STYLE}`,
  mega_donut: `High-end 3D claymorphic oversized celebration party donut with vibrant purple galaxy glaze and edible stars, ${MASTER_STYLE}`,
  picnic_hamper: `High-end 3D claymorphic opened picnic hamper with folded red gingham napkin and fresh baked pastries, ${MASTER_STYLE}`,
  balloon_bouquet: `High-end 3D claymorphic bunch of pastel chrome balloons tied with a golden string, floating gently, ${MASTER_STYLE}`,
  gift_box: `High-end 3D claymorphic large luxury celebration gift box wrapped in dusty rose paper with grand golden bow, ${MASTER_STYLE}`
};

function getHarmonizedBatch() {
  const batch = [];

  // 1. Meyveler (30 Görsel)
  Object.keys(FRUIT_SPECS).forEach(key => {
    batch.push({
      category: 'fruit',
      filename: `fruit_${key}.png`,
      prompt: FRUIT_SPECS[key].prompt,
      transparent: true,
      preferredPlatform: 'any'
    });
  });

  // 2. Hayvanlar (37 Görsel)
  Object.keys(ANIMAL_SPECS).forEach(key => {
    batch.push({
      category: 'animal',
      filename: `animal_${key}.png`,
      prompt: ANIMAL_SPECS[key],
      transparent: true,
      preferredPlatform: 'any'
    });
  });

  // 3. Tatlılar (37 Görsel)
  Object.keys(SWEET_SPECS).forEach(key => {
    batch.push({
      category: 'sweet',
      filename: `sweet_${key}.png`,
      prompt: SWEET_SPECS[key],
      transparent: true,
      preferredPlatform: 'any'
    });
  });

  return batch;
}

function harmonizeAndSyncQueue(forceRegenerateAll = false) {
  const batch = getHarmonizedBatch();
  let queueData = { jobs: [] };
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      queueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch (e) {}
  }

  let updatedCount = 0;
  let addedCount = 0;

  batch.forEach(item => {
    const existingJob = queueData.jobs.find(j => j.filename === item.filename);
    const fileExistsOnDisk = fs.existsSync(path.join(ASSETS_DIR, item.filename));
    
    // Eski veya küçük boyutlu dosyalar (örneğin < 70KB eski raster iconlar) tekrar üretilmeli
    let isOldLowRes = false;
    if (fileExistsOnDisk) {
      try {
        const sz = fs.statSync(path.join(ASSETS_DIR, item.filename)).size;
        // Eğer dosya 70KB'den küçükse (eski vektör veya kalitesiz raster) mutlaka yenilenmeli
        if (sz < 75000 && item.filename.startsWith('fruit_')) {
          isOldLowRes = true;
        }
      } catch (e) {}
    }

    if (forceRegenerateAll || isOldLowRes || !fileExistsOnDisk) {
      if (existingJob) {
        // Mevcut işi yeni master prompt ile güncelle ve tekrar pending yap
        if (forceRegenerateAll || isOldLowRes || existingJob.status !== 'done') {
          existingJob.prompt = item.prompt;
          existingJob.status = 'pending';
          existingJob.attempts = 0;
          existingJob.preferredPlatform = 'any';
          existingJob.updatedAt = Date.now();
          updatedCount++;
        }
      } else {
        // Kuyrukta yoksa yeni ekle
        queueData.jobs.push({
          id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          filename: item.filename,
          prompt: item.prompt,
          transparent: true,
          preferredPlatform: 'any',
          status: 'pending',
          attempts: 0,
          createdAt: Date.now()
        });
        addedCount++;
      }
    }
  });

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf8');
  console.log(`[HARMONIZER] ✨ Kıyaslama Tablosu Uyumlaştırması Tamamlandı:`);
  console.log(`  - Toplam Kıyaslama Varlığı: ${batch.length} (Meyve: 30, Hayvan: 37, Tatlı: 37)`);
  console.log(`  - Güncellenen / Yeniden Başlatılan: ${updatedCount}`);
  console.log(`  - Yeni Eklenen: ${addedCount}`);
  console.log(`  - Toplam Kuyruk Boyutu: ${queueData.jobs.length}`);

  return { total: batch.length, updated: updatedCount, added: addedCount, totalQueue: queueData.jobs.length };
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  harmonizeAndSyncQueue(force);
}

module.exports = {
  getHarmonizedBatch,
  harmonizeAndSyncQueue
};
