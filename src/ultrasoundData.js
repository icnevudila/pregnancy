// ─── MOMORA CLINICAL ULTRASOUND & BIOMETRY ENGINE ─────────────────────────
// Hadlock 10th-50th-90th percentile reference curves, anatomical hotspots,
// and trimester-by-trimester ultrasound milestones (bilingual TR/EN).

export const HADLOCK_BIOMETRY_NORMS = {
  12: { bpd: [17, 20, 23], hc: [63, 72, 81], ac: [50, 58, 66], fl: [7, 9, 11], efw: [12, 14, 18], crl: [51, 57, 65] },
  13: { bpd: [21, 24, 27], hc: [78, 88, 98], ac: [61, 70, 79], fl: [10, 12, 14], efw: [20, 24, 30], crl: [65, 72, 81] },
  14: { bpd: [24, 28, 32], hc: [93, 104, 115], ac: [72, 82, 92], fl: [13, 15, 18], efw: [35, 43, 52] },
  15: { bpd: [28, 32, 36], hc: [108, 120, 132], ac: [83, 94, 105], fl: [16, 19, 22], efw: [55, 68, 82] },
  16: { bpd: [32, 36, 40], hc: [122, 135, 148], ac: [95, 107, 119], fl: [19, 22, 25], efw: [85, 105, 125] },
  17: { bpd: [35, 39, 43], hc: [136, 150, 164], ac: [107, 120, 133], fl: [22, 25, 29], efw: [125, 150, 180] },
  18: { bpd: [39, 43, 47], hc: [149, 164, 179], ac: [119, 133, 147], fl: [25, 28, 32], efw: [170, 210, 250] },
  19: { bpd: [42, 46, 50], hc: [162, 178, 194], ac: [131, 146, 161], fl: [28, 31, 35], efw: [225, 270, 320] },
  20: { bpd: [45, 49, 53], hc: [175, 191, 207], ac: [143, 159, 175], fl: [31, 34, 38], efw: [285, 340, 400] },
  21: { bpd: [48, 52, 56], hc: [187, 204, 221], ac: [155, 172, 189], fl: [33, 37, 41], efw: [350, 420, 490] },
  22: { bpd: [51, 55, 59], hc: [199, 216, 233], ac: [167, 185, 203], fl: [36, 40, 44], efw: [420, 500, 580] },
  23: { bpd: [54, 58, 62], hc: [210, 228, 246], ac: [178, 197, 216], fl: [39, 43, 47], efw: [500, 590, 690] },
  24: { bpd: [57, 61, 65], hc: [221, 239, 257], ac: [189, 209, 229], fl: [41, 45, 49], efw: [580, 690, 800] },
  25: { bpd: [60, 64, 68], hc: [231, 250, 269], ac: [200, 221, 242], fl: [44, 48, 52], efw: [680, 800, 930] },
  26: { bpd: [62, 67, 72], hc: [241, 260, 279], ac: [211, 233, 255], fl: [46, 50, 54], efw: [790, 920, 1070] },
  27: { bpd: [65, 70, 75], hc: [250, 270, 290], ac: [221, 244, 267], fl: [48, 53, 58], efw: [900, 1050, 1220] },
  28: { bpd: [68, 73, 78], hc: [259, 280, 301], ac: [232, 256, 280], fl: [51, 55, 59], efw: [1020, 1200, 1390] },
  29: { bpd: [70, 75, 80], hc: [268, 289, 310], ac: [242, 267, 292], fl: [53, 57, 61], efw: [1150, 1350, 1570] },
  30: { bpd: [73, 78, 83], hc: [276, 298, 320], ac: [252, 278, 304], fl: [55, 59, 63], efw: [1300, 1520, 1760] },
  31: { bpd: [75, 80, 85], hc: [284, 306, 328], ac: [262, 289, 316], fl: [57, 61, 65], efw: [1450, 1700, 1960] },
  32: { bpd: [77, 82, 87], hc: [292, 314, 336], ac: [272, 300, 328], fl: [59, 63, 67], efw: [1620, 1900, 2180] },
  33: { bpd: [79, 84, 89], hc: [299, 322, 345], ac: [282, 311, 340], fl: [61, 65, 69], efw: [1800, 2100, 2420] },
  34: { bpd: [81, 86, 91], hc: [306, 329, 352], ac: [292, 321, 350], fl: [63, 67, 71], efw: [2000, 2320, 2670] },
  35: { bpd: [83, 88, 93], hc: [312, 336, 360], ac: [301, 331, 361], fl: [65, 69, 73], efw: [2200, 2550, 2930] },
  36: { bpd: [85, 90, 95], hc: [318, 342, 366], ac: [311, 341, 371], fl: [66, 71, 76], efw: [2420, 2800, 3200] },
  37: { bpd: [87, 92, 97], hc: [324, 348, 372], ac: [320, 351, 382], fl: [68, 73, 78], efw: [2640, 3050, 3480] },
  38: { bpd: [88, 93, 98], hc: [329, 353, 377], ac: [329, 360, 391], fl: [69, 74, 79], efw: [2850, 3300, 3760] },
  39: { bpd: [89, 94, 99], hc: [333, 357, 381], ac: [337, 369, 401], fl: [70, 75, 80], efw: [3050, 3520, 4000] },
  40: { bpd: [90, 95, 100], hc: [336, 360, 384], ac: [344, 376, 408], fl: [71, 76, 81], efw: [3200, 3680, 4180] },
};

// Anatomical Hotspots mapped by gestational milestones
export const ULTRASOUND_MILESTONES = [
  {
    weekRange: '6 - 8',
    targetWeek: 8,
    id: 'first_scan',
    titleTr: 'İlk Canlılık & Kese Taraması',
    titleEn: 'Viability & Gestational Sac Scan',
    badgeTr: 'Erken Gebelik',
    badgeEn: 'Early Scan',
    asset2d: 'usg_2d_w08_gestational_sac',
    telemetry: { probe: 'C9-3v Transvajinal / C5-2', freq: '6.5 MHz', depth: '8.0 cm', mi: '0.7', tib: '0.2' },
    summaryTr: 'Gebelik kesesinin rahim içi yerleşimi, yolk kesesi ve ilk embriyonik kalp atımı teyit edilir.',
    summaryEn: 'Intrauterine gestational sac location, yolk sac, and first embryonic heartbeat confirmation.',
    fetalBpm: '120 - 150 bpm',
    markers: [
      { id: 'sac', x: '42%', y: '36%', labelTr: 'Gestasyonel Kese', labelEn: 'Gestational Sac', descTr: 'Kesenin düzenli oval kenarı ve rahim içi yerleşimi sağlıklı tutunmayı doğrular.', descEn: 'Smooth oval contour confirming healthy intrauterine implantation.' },
      { id: 'yolk', x: '55%', y: '48%', labelTr: 'Yolk Sac (Vitellus)', labelEn: 'Yolk Sac', descTr: 'Plasenta devralana kadar embriyonun ilk besin kaynağını sağlayan dairesel kese.', descEn: 'Provides primary nutrition to the embryo before the placenta fully forms.' },
      { id: 'pole', x: '49%', y: '58%', labelTr: 'Embriyonik Kutup & Kalp', labelEn: 'Embryonic Pole & Heart', descTr: 'Bebeğin ilk hücresel silüeti ve dakikada 130-150 atan minik kalp atımı.', descEn: 'First visible embryonic silhouette with rhythmic 130-150 bpm cardiac flicker.' },
    ],
  },
  {
    weekRange: '11 - 14',
    targetWeek: 12,
    id: 'nt_scan',
    titleTr: '1. Trimester İkili Tarama (NT & CRL)',
    titleEn: 'First Trimester NT & CRL Scan',
    badgeTr: 'İkili Tarama',
    badgeEn: 'Screening Scan',
    asset2d: 'usg_2d_w12_nt_crl',
    telemetry: { probe: 'C5-1 Abdominal', freq: '4.8 MHz', depth: '11.0 cm', mi: '0.9', tib: '0.3' },
    summaryTr: 'Ense kalınlığı (NT), burun kemiği ve baş-popo boyu (CRL) milimetrik hassasiyetle ölçülür.',
    summaryEn: 'Nuchal translucency (NT), nasal bone, and crown-rump length (CRL) measured with sub-millimeter precision.',
    fetalBpm: '150 - 165 bpm',
    markers: [
      { id: 'nt', x: '38%', y: '32%', labelTr: 'Ense Kalınlığı (NT)', labelEn: 'Nuchal Translucency (NT)', descTr: 'Bebeğin ense arkasındaki sıvı katmanı. 2.5 mm altındaki değerler normal kabul edilir.', descEn: 'Fluid pocket behind the fetal neck. Normal range is strictly under 2.5 mm.' },
      { id: 'nasal', x: '32%', y: '28%', labelTr: 'Burun Kemiği (NB)', labelEn: 'Nasal Bone (NB)', descTr: 'Kromozomal taramada burun kemiğinin varlığı ve kıkırdak yapısı pozitif bir belirteçtir.', descEn: 'Presence of ossified nasal bone is a key reassuring marker in genetic screening.' },
      { id: 'crl', x: '54%', y: '52%', labelTr: 'CRL (Baş-Popo Boyu)', labelEn: 'CRL (Crown-Rump Length)', descTr: 'Bebeğin başından kuyruk sokumuna net uzunluğu; gebelik yaşının en kesin referansıdır.', descEn: 'Exact measurement from crown to rump, setting the definitive gestational due date.' },
    ],
  },
  {
    weekRange: '18 - 22',
    targetWeek: 20,
    id: 'anatomy_scan',
    titleTr: '2. Düzey Detaylı Anatomi Taraması',
    titleEn: 'Level II Detailed Anatomy Scan',
    badgeTr: 'Detaylı USG',
    badgeEn: 'Anatomy Scan',
    asset2d: 'usg_2d_w20_level2_anatomy',
    telemetry: { probe: 'EPIQ / Voluson E10 C5-2', freq: '4.2 MHz', depth: '13.5 cm', mi: '1.0', tib: '0.4' },
    summaryTr: 'Beyin, 4 odacıklı kalp, omurga, böbrekler, uzuvlar ve plasenta baştan aşağı incelenir.',
    summaryEn: 'Comprehensive examination of the brain, 4-chamber heart, spine, kidneys, limbs, and placenta.',
    fetalBpm: '135 - 155 bpm',
    markers: [
      { id: 'heart', x: '52%', y: '46%', labelTr: '4 Odacıklı Kalp', labelEn: '4-Chamber Heart', descTr: 'İki kulakçık ve iki karıncık simetrisi, kapakçık geçişleri ve septum bütünlüğü kontrol edilir.', descEn: 'Symmetry of left and right atria and ventricles, valve movement, and intact septum.' },
      { id: 'spine', x: '44%', y: '36%', labelTr: 'Omurga & Nöral Tüp', labelEn: 'Spine & Neural Tube', descTr: 'Boyundan kuyruk sokumuna omurga kemikleri ve üzerini örten cilt hattı kesintisiz incelenir.', descEn: 'Continuous skin-covering line over the entire vertebrae ruling out spina bifida.' },
      { id: 'brain', x: '35%', y: '25%', labelTr: 'Beyincik & Sisterna Magna', labelEn: 'Cerebellum & Cisterna Magna', descTr: 'Kafatası simetrisi, beyin yarımküreleri ve ventrikül sıvı genişlikleri ölçülür.', descEn: 'Brain hemisphere symmetry and normal fluid ventricles confirming CNS health.' },
      { id: 'kidneys', x: '58%', y: '60%', labelTr: 'Böbrekler & Mesane', labelEn: 'Kidneys & Bladder', descTr: 'Bebeğin amniyon sıvısını yutup böbrekleriyle süzdüğünü gösteren aktif dolum kontrolü.', descEn: 'Functional amniotic fluid recycling verified via visible bilateral renal filtration.' },
      { id: 'limbs', x: '66%', y: '72%', labelTr: 'Femur & Parmaklar', labelEn: 'Femur & Digits', descTr: 'Uyluk kemiği (FL) uzunluğu ve el-ayak parmaklarının eksiksiz simetrisi sayılır.', descEn: 'Femur length (FL) measurement and verification of all ten fingers and toes.' },
    ],
  },
  {
    weekRange: '28 - 36',
    targetWeek: 32,
    id: 'growth_scan',
    titleTr: '3. Trimester Büyüme & Doppler Taraması',
    titleEn: 'Third Trimester Growth & Doppler Scan',
    badgeTr: 'Gelişim & NST',
    badgeEn: 'Growth & NST',
    asset2d: 'usg_2d_w28_growth_bpd',
    telemetry: { probe: 'C5-1 Convex', freq: '3.8 MHz', depth: '15.0 cm', mi: '1.1', tib: '0.5' },
    summaryTr: 'Tahmini ağırlık (EFW), baş çevresi (HC), amniyon sıvı hacmi ve duruş pozisyonu takip edilir.',
    summaryEn: 'Estimated fetal weight (EFW), head circumference, amniotic fluid volume, and presentation.',
    fetalBpm: '125 - 145 bpm',
    markers: [
      { id: 'presentation', x: '36%', y: '28%', labelTr: 'Baş Gelişi (Sefalik Duruş)', labelEn: 'Cephalic Presentation', descTr: 'Bebeğin doğum kanalına doğru baş aşağı duruşu ve pelvise yerleşimi izlenir.', descEn: 'Head-down fetal orientation aligned with the birth canal preparing for labor.' },
      { id: 'placenta', x: '68%', y: '38%', labelTr: 'Plasenta Derecesi & Konum', labelEn: 'Placental Grade & Position', descTr: 'Plasentanın doğum yolunu kapatmadığı (previa olmadığı) ve kalsifikasyon olgunluğu.', descEn: 'Ensures placenta is positioned safely away from cervix with optimal nutrient transfer.' },
      { id: 'fluid', x: '50%', y: '64%', labelTr: 'Amniyon Sıvısı Cebi (AFI)', labelEn: 'Amniotic Fluid Index (AFI)', descTr: 'Bebeği darbelere karşı koruyan ve akciğer hareketine alan açan sıvı derinliği kontrol edilir.', descEn: 'Deepest vertical pocket assessment ensuring rich cushioning and lung training space.' },
      { id: 'doppler', x: '58%', y: '50%', labelTr: 'Göbek Kordonu Doppler Akımı', labelEn: 'Umbilical Doppler Flow', descTr: '3 damarlı kordonda plasentadan bebeğe akan oksijenli kanın direnç indeksi (S/D) ölçülür.', descEn: 'Color Doppler resistance index verifying robust oxygenation through umbilical vessels.' },
    ],
  },
];

/**
 * Get full ultrasound context for any week (4-40)
 */
export function getUltrasoundDetails(week = 20, lang = 'tr') {
  const isEn = lang === 'en';
  const clampedWeek = Math.max(4, Math.min(40, week));
  const norms = HADLOCK_BIOMETRY_NORMS[clampedWeek] || HADLOCK_BIOMETRY_NORMS[20];

  // Find nearest milestone
  let nearestMilestone = ULTRASOUND_MILESTONES[2]; // default 20w
  if (clampedWeek <= 9) nearestMilestone = ULTRASOUND_MILESTONES[0];
  else if (clampedWeek <= 15) nearestMilestone = ULTRASOUND_MILESTONES[1];
  else if (clampedWeek <= 24) nearestMilestone = ULTRASOUND_MILESTONES[2];
  else nearestMilestone = ULTRASOUND_MILESTONES[3];

  // Map 3D HDLive render from fetus_w04 to fetus_w40
  const fetusKey = `fetus_w${String(clampedWeek).padStart(2, '0')}`;

  // Telemetry string
  const gaString = isEn ? `GA: ${clampedWeek}w ${((clampedWeek * 3) % 7)}d` : `GA: ${clampedWeek}h ${((clampedWeek * 3) % 7)}g`;
  const eddWeeksLeft = Math.max(0, 40 - clampedWeek);
  const eddDays = eddWeeksLeft * 7;

  return {
    week: clampedWeek,
    milestone: nearestMilestone,
    fetusKey,
    asset2d: nearestMilestone.asset2d,
    assetDoppler: clampedWeek >= 20 ? 'usg_doppler_umbilical_flow' : 'usg_doppler_cardiac_flow',
    norms,
    telemetry: {
      ...nearestMilestone.telemetry,
      ga: gaString,
      edd: isEn ? `EDD: ${eddDays}d remaining` : `EDD: Doğuma ${eddDays} gün`,
      fps: '32 FPS',
    },
    title: isEn ? nearestMilestone.titleEn : nearestMilestone.titleTr,
    badge: isEn ? nearestMilestone.badgeEn : nearestMilestone.badgeTr,
    summary: isEn ? nearestMilestone.summaryEn : nearestMilestone.summaryTr,
    fetalBpm: nearestMilestone.fetalBpm,
    markers: nearestMilestone.markers.map(m => ({
      id: m.id,
      x: m.x,
      y: m.y,
      label: isEn ? m.labelEn : m.labelTr,
      desc: isEn ? m.descEn : m.descTr,
    })),
  };
}

/**
 * Decode mother's ultrasound report values and calculate percentiles
 */
export function decodeBiometryReport(values = {}, week = 20, lang = 'tr') {
  const isEn = lang === 'en';
  const clampedWeek = Math.max(12, Math.min(40, week));
  const norms = HADLOCK_BIOMETRY_NORMS[clampedWeek] || HADLOCK_BIOMETRY_NORMS[20];

  const results = [];
  const metrics = [
    { key: 'bpd', name: 'BPD (Biparietal Diameter)', label: isEn ? 'Head Width (BPD)' : 'Baş Çapı (BPD)', unit: 'mm', desc: isEn ? 'Distance between the two sides of the head' : 'Şakaklar arası kafa kemiği çapı' },
    { key: 'hc', name: 'HC (Head Circumference)', label: isEn ? 'Head Circumference (HC)' : 'Baş Çevresi (HC)', unit: 'mm', desc: isEn ? 'Total circumference of the baby’s head' : 'Başın toplam dış hat çevresi' },
    { key: 'ac', name: 'AC (Abdominal Circumference)', label: isEn ? 'Abdominal Circumference (AC)' : 'Karın Çevresi (AC)', unit: 'mm', desc: isEn ? 'Key indicator for fetal weight and growth' : 'Fetal kilo ve beslenmenin en hassas ölçüsü' },
    { key: 'fl', name: 'FL (Femur Length)', label: isEn ? 'Femur Length (FL)' : 'Uyluk Kemiği Boyu (FL)', unit: 'mm', desc: isEn ? 'Thigh bone length, reflects baby’s height' : 'Uyluk kemiği, bebeğin boy potansiyelini yansıtır' },
    { key: 'efw', name: 'EFW (Estimated Fetal Weight)', label: isEn ? 'Est. Weight (EFW)' : 'Tahmini Kilo (EFW)', unit: 'g', desc: isEn ? 'Hadlock calculated fetal weight estimate' : 'Hadlock formülüyle tahmini fetal ağırlık' },
  ];

  let onTrackCount = 0;
  let totalEvaluated = 0;

  metrics.forEach(m => {
    const rawVal = values[m.key];
    const entered = rawVal ? parseFloat(String(rawVal).replace(',', '.')) : NaN;
    const ref = norms[m.key];
    if (!ref) return;

    const [p10, p50, p90] = ref;
    let percentile = 50;
    let status = 'normal';
    let statusText = isEn ? 'Standard Growth' : 'Standart Gelişim';

    if (!isNaN(entered) && entered > 0) {
      totalEvaluated++;
      if (entered < p10) {
        percentile = Math.max(5, Math.round((entered / p10) * 10));
        status = 'low';
        statusText = isEn ? 'Gentle Slim Track' : 'Narin Seyir';
      } else if (entered > p90) {
        percentile = Math.min(98, 90 + Math.round(((entered - p90) / p90) * 10));
        status = 'high';
        statusText = isEn ? 'Robust Growth' : 'Güçlü İlerleme';
      } else {
        onTrackCount++;
        percentile = Math.round(10 + ((entered - p10) / (p90 - p10)) * 80);
      }
    }

    results.push({
      key: m.key,
      label: m.label,
      desc: m.desc,
      unit: m.unit,
      entered: isNaN(entered) ? null : entered,
      p10,
      p50,
      p90,
      percentile,
      status,
      statusText,
    });
  });

  const summaryMessage = isEn
    ? (totalEvaluated === 0
      ? 'Enter your scan measurements above to see where your baby lands on the Hadlock curve.'
      : onTrackCount === totalEvaluated
      ? 'All measurements are beautifully aligned with healthy gestational standards. 🌿'
      : 'Baby measurements reflect a healthy individual growth pattern. Always review details with your doctor. 💛')
    : (totalEvaluated === 0
      ? 'Ultrason çıktınızdaki milimetrik değerleri yukarıya girerek Hadlock persentil eğrisini görebilirsiniz.'
      : onTrackCount === totalEvaluated
      ? 'Tüm ölçümler gebelik haftasıyla kusursuz uyum gösteriyor, gelişim harika ilerliyor! 🌿'
      : 'Bebeğinizin ölçümleri sağlıklı ve kendine özgü bir seyir gösteriyor. Tüm sonuçları hekiminizle birlikte değerlendiriniz. 💛');

  return {
    results,
    totalEvaluated,
    onTrackCount,
    summaryMessage,
  };
}
