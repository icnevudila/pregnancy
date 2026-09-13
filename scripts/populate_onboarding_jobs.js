const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'generation_queue.json');

const ONBOARDING_JOBS = [
  {
    filename: 'onboarding_role_mother.png',
    title: 'Onboarding Anne Rolü Portresi',
    description: 'Ben Anneyim seçimi için gerçekçi, sıcak ve şefkatli anne portresi',
    preferredPlatform: 'gemini',
    prompt: 'Warm, candid editorial photography portrait of a glowing, radiant smiling young expectant mother in her late 20s, wearing a modest cozy cream cable-knit sweater, soft warm natural morning sunlight streaming from a bright living room window, softly blurred indoor greenery in the background, genuine warm happy expression, natural skin texture, completely non-erotic, modest and wholesome, high-end family lifestyle magazine cover style, photorealistic, 8k resolution, no text, no watermarks.'
  },
  {
    filename: 'onboarding_role_father.png',
    title: 'Onboarding Baba Rolü Portresi',
    description: 'Ben Babayım seçimi için gerçekçi, samimi ve destekleyici baba portresi',
    preferredPlatform: 'gemini',
    prompt: 'Warm, candid editorial photography portrait of a kind, friendly smiling young father-to-be in his late 20s, wearing a comfortable slate navy knit crewneck sweater, soft warm natural window daylight, softly blurred bright modern Scandinavian home interior, warm reassuring smile, natural skin texture, completely non-erotic, modest and wholesome, high-end parenting magazine style, photorealistic, 8k resolution, no text, no watermarks.'
  },
  {
    filename: 'onboarding_mother_pregnancy.png',
    title: 'Onboarding Anne - Hamileyim',
    description: 'Hamileyim kartı için anne gebelik anı',
    preferredPlatform: 'gemini',
    prompt: 'Authentic lifestyle editorial photograph of a serene pregnant woman in her second trimester standing gracefully and cradling her baby bump with both hands, wearing a modest, cozy blush pink long-sleeve knit maternity dress, soft morning natural sunlight from a sheer curtain window, clean bright warm home setting, tranquil loving expression, completely non-erotic, modest and wholesome, photorealistic 8k, no text, no watermarks.'
  },
  {
    filename: 'onboarding_mother_postpartum.png',
    title: 'Onboarding Anne - Yeni Doğum Yaptım',
    description: 'Lohusa anne ve kucağında uyuyan yenidoğan bebek',
    preferredPlatform: 'gemini',
    prompt: 'Tender, peaceful editorial photograph of a loving mother sitting in a cozy nursery armchair, gently cradling her sleeping newborn baby against her chest, baby is wrapped securely in a soft cream organic cotton swaddle, mother wearing a cozy oatmeal buttoned cardigan, gentle maternal smile, soft morning light, serene postpartum recovery moment, completely non-erotic, authentic, photorealistic 8k, no text, no watermarks.'
  },
  {
    filename: 'onboarding_mother_baby.png',
    title: 'Onboarding Anne - Bebeğimi Büyütüyorum',
    description: 'Anne ve gülen 7 aylık bebek oyun anı',
    preferredPlatform: 'gemini',
    prompt: 'Joyful, candid editorial photograph of a happy mother sitting on a soft nursery rug playing with her smiling 7-month-old baby, holding baby up under the arms while baby laughs, baby wearing a soft sage-green cotton romper, mother wearing a cozy casual knit top, bright airy Scandinavian living room with natural daylight, authentic parent-child bond, completely non-erotic, photorealistic 8k, no text, no watermarks.'
  },
  {
    filename: 'onboarding_father_pregnancy.png',
    title: 'Onboarding Baba - Bebeğimizi Bekliyoruz',
    description: 'Baba perspektifinden anne karnını şefkatle destekleme anı',
    preferredPlatform: 'gemini',
    prompt: 'Heartwarming editorial photograph of an expectant father standing tenderly beside his pregnant wife, smiling warmly as he gently rests his hand over her baby bump, both dressed in comfortable casual modest knitwear, soft natural morning window light, warm cozy modern living room, genuine loving partnership, completely non-erotic, high-end family lifestyle, photorealistic 8k, no text, no watermarks.'
  },
  {
    filename: 'onboarding_father_postpartum.png',
    title: 'Onboarding Baba - Lohusalık Desteği',
    description: 'Baba omzunda uyuyan yenidoğan bebek ve baba desteği',
    preferredPlatform: 'gemini',
    prompt: 'Touching, authentic editorial photograph of a gentle, caring father cradling and soothing a sleeping newborn baby against his shoulder and chest, supporting the baby\'s tiny head with his hand, baby wrapped in a neutral soft knit blanket, father wearing a comfortable charcoal grey henley long-sleeve shirt, warm quiet nursery lighting, deep paternal bond, completely non-erotic, photorealistic 8k, no text, no watermarks.'
  },
  {
    filename: 'onboarding_father_baby.png',
    title: 'Onboarding Baba - Bebeğimizi Büyütüyoruz',
    description: 'Baba ve kahkaha atan 8 aylık bebek neşeli an',
    preferredPlatform: 'gemini',
    prompt: 'Delightful candid editorial photograph of a cheerful father playing airplane with his giggling 8-month-old baby, gently lifting the baby above him while sitting on a soft cream carpet, baby laughing with joy, father smiling brightly, bright daylight, comfortable modest casual clothing, heartwarming fatherhood moment, photorealistic 8k, no text, no watermarks.'
  }
];

function run() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.error('generation_queue.json bulunamadı!');
    return;
  }

  const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  let added = 0;
  let updated = 0;

  ONBOARDING_JOBS.forEach((job, idx) => {
    const existingIndex = data.jobs.findIndex(j => j.filename === job.filename);
    const jobEntry = {
      id: `job_onb_${Date.now()}_${idx}`,
      filename: job.filename,
      category: 'onboarding',
      title: job.title,
      description: job.description,
      preferredPlatform: job.preferredPlatform,
      prompt: job.prompt,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now()
    };

    if (existingIndex !== -1) {
      data.jobs[existingIndex] = Object.assign(data.jobs[existingIndex], jobEntry, {
        id: data.jobs[existingIndex].id || jobEntry.id
      });
      updated++;
      console.log(`  🔄 Güncellendi: ${job.filename}`);
    } else {
      data.jobs.unshift(jobEntry);
      added++;
      console.log(`  ➕ Başa eklendi: ${job.filename}`);
    }
  });

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ ${added} yeni iş eklendi, ${updated} iş güncellendi. Toplam kuyruk: ${data.jobs.length}`);
}

run();
