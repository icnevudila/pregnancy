const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'generation_queue.json');
const ULTRASOUND_DATA_FILE = path.join(__dirname, '..', 'src', 'ultrasoundData.js');

const WEEKLY_SCANS = {
  4: {
    filename: 'usg_2d_w04_decidual_reaction.png',
    titleTr: 'Decidual Reaksiyon & Erken Tutunma',
    titleEn: 'Decidual Reaction & Early Implantation',
    badgeTr: 'Erken Kese',
    badgeEn: 'Early Sac',
    probe: 'C9-3v Transvaginal',
    freq: '7.5 MHz',
    depth: '6.0 cm',
    mi: '0.6',
    tib: '0.1',
    fetalBpm: 'Henüz izlenmez (Dönem öncesi)',
    summaryTr: 'Rahim içi endometrium kalınlaşması ve blastosistin tutunduğu ekojenik decidual halka izlenir.',
    summaryEn: 'Endometrial thickening and echogenic decidual ring marking blastocyst implantation.',
    prompt: 'Clinical transvaginal 2D B-mode ultrasound scan of an early 4-week pregnancy, displaying thickened echogenic decidual endometrium and an early intradecidual implantation sign in the uterine fundus, authentic hospital sonogram monitor texture, genuine ultrasound grayscale contrast and acoustic speckle, professional monochrome, no text, no watermark.',
    markers: [
      { id: 'endo', x: '45%', y: '40%', labelTr: 'Ekojenik Endometrium', labelEn: 'Echogenic Endometrium', descTr: 'Bebeğin tutunduğu zengin kan damarlı süngerimsi rahim içi tabakası.', descEn: 'Richly vascularized uterine lining supporting blastocyst implantation.' },
      { id: 'site', x: '52%', y: '48%', labelTr: 'İmplantasyon Odağı', labelEn: 'Implantation Focus', descTr: 'Blastosistin rahim duvarına güvenle yerleştiği milimetrik mikro halka.', descEn: 'Microscopic nidus where the blastocyst nests securely into uterine tissue.' },
    ]
  },
  5: {
    filename: 'usg_2d_w05_gestational_ring.png',
    titleTr: 'İlk Gestasyonel Kese (G-Sac)',
    titleEn: 'First Gestational Sac Sign',
    badgeTr: '5 mm Kese',
    badgeEn: '5 mm Sac',
    probe: 'C9-3v Transvaginal',
    freq: '7.0 MHz',
    depth: '6.5 cm',
    mi: '0.7',
    tib: '0.2',
    fetalBpm: '100 - 115 bpm (İlk Titreşim)',
    summaryTr: 'Rahim boşluğunda 5-6 mm çapında çift decidual halka (Double Decidual Sign) teyit edilir.',
    summaryEn: 'Confirmation of a 5-6 mm intrauterine gestational sac with classic double decidual sign.',
    prompt: 'Clinical high-resolution transvaginal 2D ultrasound sonogram of a 5-week pregnancy, showing a small round anechoic gestational sac (5mm) with double decidual sac sign embedded in the uterine cavity, authentic grayscale acoustic sonography monitor screen, diagnostic monochrome, no text, no watermark.',
    markers: [
      { id: 'gsac', x: '50%', y: '46%', labelTr: 'Gestasyonel Kese (5mm)', labelEn: 'Gestational Sac (5mm)', descTr: 'Amniyon sıvısıyla dolu ilk anekoik siyah yuvarlak kese alanı.', descEn: 'Initial fluid-filled anechoic dark pocket harboring early embryonic cells.' },
      { id: 'ddsign', x: '56%', y: '42%', labelTr: 'Çift Decidual Halka', labelEn: 'Double Decidual Sign', descTr: 'Kesenin etrafındaki iki katmanlı parlak sınır; sağlıklı rahim içi gebeliğin kesin kanıtıdır.', descEn: 'Concentric echogenic rings confirming true intrauterine pregnancy.' },
    ]
  },
  6: {
    filename: 'usg_2d_w06_yolk_sac_cardiac.png',
    titleTr: 'Yolk Kesesi & İlk Kalp Titreşimi',
    titleEn: 'Yolk Sac & First Cardiac Flicker',
    badgeTr: 'İlk Kalp Atımı',
    badgeEn: 'First Heartbeat',
    probe: 'C9-3v Transvaginal',
    freq: '6.8 MHz',
    depth: '7.0 cm',
    mi: '0.7',
    tib: '0.2',
    fetalBpm: '110 - 130 bpm',
    summaryTr: '3 mm vitellus (yolk sac) halkası yanında minik embriyonik kutup ve ilk kalp titreşimi izlenir.',
    summaryEn: 'Visible 3 mm circular yolk sac alongside embryonic pole with first rhythmic cardiac flicker.',
    prompt: 'Clinical transvaginal 2D B-mode ultrasound sonogram of a 6-week pregnancy, showing a distinct circular yolk sac with hyperechoic rim and adjacent 3mm embryonic pole showing tiny cardiac motion flicker inside gestational sac, authentic ultrasound monitor grain, monochrome, no text, no watermark.',
    markers: [
      { id: 'yolk', x: '46%', y: '48%', labelTr: 'Yolk Sac (Vitellus Kesesi)', labelEn: 'Yolk Sac (Vitelline)', descTr: 'Plasenta oluşana dek embriyoya besin ve kan hücresi sağlayan dairesel halka.', descEn: 'Nutrient-rich ring nourishing the embryo before placenta maturity.' },
      { id: 'heart', x: '54%', y: '52%', labelTr: 'Embriyo & Kalp Titreşimi', labelEn: 'Embryo & Cardiac Flicker', descTr: 'Dakikada 110-130 kez titreşen ilk hücresel kalp kasılmaları.', descEn: 'Initial embryonic silhouette with rhythmic cardiac pulsatile contractions.' },
    ]
  },
  7: {
    filename: 'usg_2d_w07_embryo_crl_10mm.png',
    titleTr: 'CRL Ölçümü & Baş-Gövde Ayrımı',
    titleEn: 'Embryo CRL & Early Body Axis',
    badgeTr: 'CRL 10 mm',
    badgeEn: 'CRL 10 mm',
    probe: 'C9-3v Transvaginal',
    freq: '6.5 MHz',
    depth: '7.5 cm',
    mi: '0.8',
    tib: '0.2',
    fetalBpm: '130 - 150 bpm',
    summaryTr: 'Embriyo boyu (CRL) yaklaşık 10 mm’ye ulaşır; baş ve gövde aksı belirginleşir.',
    summaryEn: 'Crown-rump length reaches 10 mm; head prominence and embryonic body axis clearly distinguished.',
    prompt: 'Clinical obstetric transvaginal 2D ultrasound sonogram of a 7-week human embryo, measuring 10mm crown-rump length (CRL) with caliper markers (+---+), visible cranial prominence, gestational sac with yolk sac, realistic ultrasound monitor display, authentic acoustic grain, black and white, no text, no watermark.',
    markers: [
      { id: 'crl_head', x: '42%', y: '42%', labelTr: 'Kranial Kutup (Baş)', labelEn: 'Cranial Pole (Head)', descTr: 'Hızla büyüyen ilkel beyin veziküllerinin oluşturduğu baş çıkıntısı.', descEn: 'Early cranial vesicle forming the prominent embryonic head.' },
      { id: 'crl_tail', x: '58%', y: '56%', labelTr: 'Kaudal Kutup (Gövde)', labelEn: 'Caudal Pole (Rump)', descTr: 'Omurga hattının başlangıcı ve kuyruk sokumu referans noktası.', descEn: 'Spinal neural tube origin and rump caliper landmark.' },
    ]
  },
  8: {
    filename: 'usg_2d_w08_gestational_sac.png',
    titleTr: 'İlk Canlılık & Kese Taraması',
    titleEn: 'Viability & Gestational Sac Scan',
    badgeTr: 'Erken Gebelik',
    badgeEn: 'Early Scan',
    probe: 'C9-3v Transvaginal / C5-2',
    freq: '6.5 MHz',
    depth: '8.0 cm',
    mi: '0.7',
    tib: '0.2',
    fetalBpm: '140 - 160 bpm',
    summaryTr: 'Kese içi yerleşim, yolk kesesi ve dakikada 150 vuran güçlü fetal kalp atımı kesinleştirilir.',
    summaryEn: 'Intrauterine sac contour, yolk sac, and steady 150 bpm embryonic heartbeat confirmation.',
    prompt: 'Clinical obstetric ultrasound sonogram of 8-week pregnancy showing intrauterine gestational sac...',
    markers: [
      { id: 'sac', x: '42%', y: '36%', labelTr: 'Gestasyonel Kese', labelEn: 'Gestational Sac', descTr: 'Kesenin düzenli oval kenarı ve rahim içi yerleşimi sağlıklı tutunmayı doğrular.', descEn: 'Smooth oval contour confirming healthy intrauterine implantation.' },
      { id: 'yolk', x: '55%', y: '48%', labelTr: 'Yolk Sac (Vitellus)', labelEn: 'Yolk Sac', descTr: 'Plasenta devralana kadar embriyonun ilk besin kaynağını sağlayan dairesel kese.', descEn: 'Provides primary nutrition to the embryo before the placenta fully forms.' },
      { id: 'pole', x: '49%', y: '58%', labelTr: 'Embriyonik Kutup & Kalp', labelEn: 'Embryonic Pole & Heart', descTr: 'Bebeğin ilk hücresel silüeti ve dakikada 130-150 atan minik kalp atımı.', descEn: 'First visible embryonic silhouette with rhythmic 130-150 bpm cardiac flicker.' },
    ]
  },
  9: {
    filename: 'usg_2d_w09_fetal_physiologic_herniation.png',
    titleTr: 'Fizyolojik Herniasyon & Uzuv Tomurcukları',
    titleEn: 'Midgut Herniation & Limb Buds',
    badgeTr: 'CRL 22 mm',
    badgeEn: 'CRL 22 mm',
    probe: 'C5-1 Abdominal',
    freq: '5.5 MHz',
    depth: '9.0 cm',
    mi: '0.8',
    tib: '0.3',
    fetalBpm: '160 - 175 bpm',
    summaryTr: 'Bağırsakların kordon girişinde geçici fizyolojik çıkıntısı ve el-kol tomurcukları izlenir.',
    summaryEn: 'Normal physiologic midgut herniation at umbilical insertion and elongating limb buds.',
    prompt: 'Clinical obstetric 2D B-mode ultrasound sonogram of a 9-week human fetus (CRL 22mm), showing early upper and lower limb buds and normal temporary physiologic midgut herniation at the umbilical cord base, genuine sonography hospital screen, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'limbs', x: '40%', y: '48%', labelTr: 'Kol Tomurcukları', labelEn: 'Upper Limb Buds', descTr: 'Omuzdan uzayan ve minik kürek şeklinde beliren kollar.', descEn: 'Paddle-shaped early forelimbs extending from fetal shoulders.' },
      { id: 'hernia', x: '54%', y: '54%', labelTr: 'Fizyolojik Kordon Çıkıntısı', labelEn: 'Midgut Herniation', descTr: 'Gelişen bağırsakların göbek kordonu tabanındaki tamamen normal geçici konumu.', descEn: 'Benign developmental loop of embryonic intestines temporarily in the cord.' },
    ]
  },
  10: {
    filename: 'usg_2d_w10_early_fetal_movement.png',
    titleTr: 'Fetüs Dönemine Geçiş & İlk Spontan Hareket',
    titleEn: 'Fetal Period Transition & Spontaneous Twitches',
    badgeTr: 'Fetüs Fazı',
    badgeEn: 'Fetal Phase',
    probe: 'C5-1 Abdominal',
    freq: '5.2 MHz',
    depth: '9.5 cm',
    mi: '0.8',
    tib: '0.3',
    fetalBpm: '155 - 170 bpm',
    summaryTr: 'Embriyo dönemi tamamlandı; kafatası kemikleşmesi ve minik spontan gövde seğirmeleri başlar.',
    summaryEn: 'Embryonic organogenesis complete; transition to fetus with skull ossification and subtle reflex body twitches.',
    prompt: 'Clinical obstetric 2D ultrasound sonogram of a 10-week fetus (CRL 32mm), showing clear cranial vault contour, flexed spine, and gentle hand-to-face posture, authentic hospital ultrasound monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'skull', x: '38%', y: '36%', labelTr: 'Kafatası Kemikleşmesi', labelEn: 'Cranial Vault', descTr: 'Kafatasını çevreleyen ince parlak kıkırdak-kemikleşme hattı.', descEn: 'Thin hyperechoic rim marking early fetal skull bone mineralization.' },
      { id: 'posture', x: '52%', y: '50%', labelTr: 'Fleksiyon Duruşu', labelEn: 'Flexion Posture', descTr: 'Bebeğin anne rahmindeki huzurlu C-şekilli kıvrılma pozisyonu.', descEn: 'Characteristic gentle C-shaped fetal spine curve in amniotic fluid.' },
    ]
  },
  11: {
    filename: 'usg_2d_w11_fetal_profile_midface.png',
    titleTr: 'Yüz Profili & Burun Kemiği Başlangıcı',
    titleEn: 'Facial Profile & Nasal Bone Ossification',
    badgeTr: 'Yüz Silüeti',
    badgeEn: 'Facial Profile',
    probe: 'C5-1 Abdominal',
    freq: '5.0 MHz',
    depth: '10.0 cm',
    mi: '0.9',
    tib: '0.3',
    fetalBpm: '150 - 165 bpm',
    summaryTr: 'Orta-sagittal planda alın, burun çıkıntısı, üst-alt çene ve karın ön duvarı netleşir.',
    summaryEn: 'Mid-sagittal profile showing forehead, distinct nasal tip, chin, and intact anterior abdominal wall.',
    prompt: 'Clinical 2D ultrasound sonogram of an 11-week fetus in mid-sagittal profile view, displaying facial silhouette with nasal bone cartilage, forehead, chin, and clear amniotic fluid pocket, authentic ultrasound display grain, grayscale, no text, no watermark.',
    markers: [
      { id: 'profile', x: '35%', y: '34%', labelTr: 'Yüz Profili & Çene', labelEn: 'Facial Profile & Chin', descTr: 'Burun ucu, dudak kavsi ve çene hattının kusursuz orantısı.', descEn: 'Delicate aesthetic contour of nose, upper lip, and mandibular jaw.' },
      { id: 'abdo', x: '58%', y: '56%', labelTr: 'Karın Ön Duvarı', labelEn: 'Abdominal Wall', descTr: 'Göbeğin tamamen kapanıp bağırsakların karın içine yerleşmesi.', descEn: 'Intact ventral wall confirming closure of physiologic umbilical hernia.' },
    ]
  },
  12: {
    filename: 'usg_2d_w12_nt_crl.png',
    titleTr: '1. Trimester İkili Tarama (NT & CRL)',
    titleEn: 'First Trimester NT & CRL Scan',
    badgeTr: 'İkili Tarama',
    badgeEn: 'Screening Scan',
    probe: 'C5-1 Abdominal',
    freq: '4.8 MHz',
    depth: '11.0 cm',
    mi: '0.9',
    tib: '0.3',
    fetalBpm: '150 - 165 bpm',
    summaryTr: 'Ense kalınlığı (NT), burun kemiği ve baş-popo boyu (CRL) milimetrik hassasiyetle ölçülür.',
    summaryEn: 'Nuchal translucency (NT), nasal bone, and crown-rump length measured with sub-millimeter precision.',
    prompt: 'Clinical obstetric ultrasound sonogram of 12-week fetus showing NT measurement calipers...',
    markers: [
      { id: 'nt', x: '38%', y: '32%', labelTr: 'Ense Kalınlığı (NT)', labelEn: 'Nuchal Translucency (NT)', descTr: 'Bebeğin ense arkasındaki sıvı katmanı. 2.5 mm altındaki değerler normal kabul edilir.', descEn: 'Fluid pocket behind the fetal neck. Normal range is strictly under 2.5 mm.' },
      { id: 'nasal', x: '32%', y: '28%', labelTr: 'Burun Kemiği (NB)', labelEn: 'Nasal Bone (NB)', descTr: 'Kromozomal taramada burun kemiğinin varlığı ve kıkırdak yapısı pozitif bir belirteçtir.', descEn: 'Presence of ossified nasal bone is a key reassuring marker in genetic screening.' },
      { id: 'crl', x: '54%', y: '52%', labelTr: 'CRL (Baş-Popo Boyu)', labelEn: 'CRL (Crown-Rump Length)', descTr: 'Bebeğin başından kuyruk sokumuna net uzunluğu; gebelik yaşının en kesin referansıdır.', descEn: 'Exact measurement from crown to rump, setting the definitive gestational due date.' },
    ]
  },
  13: {
    filename: 'usg_2d_w13_cranial_choroid_plexus.png',
    titleTr: 'Kranial Anatomi & Kelebek İşareti (Koroit Pleksus)',
    titleEn: 'Cranial Symmetry & Butterfly Sign (Choroid Plexus)',
    badgeTr: 'Beyin Simetrisi',
    badgeEn: 'Brain Symmetry',
    probe: 'C5-1 Abdominal',
    freq: '4.8 MHz',
    depth: '11.5 cm',
    mi: '0.9',
    tib: '0.3',
    fetalBpm: '145 - 160 bpm',
    summaryTr: 'Kafatası kesitinde bilateral koroit pleksusların oluşturduğu simetrik "kelebek" işareti izlenir.',
    summaryEn: 'Transverse cranial plane showing the symmetric hyperechoic "butterfly" sign of lateral ventricles and choroid plexus.',
    prompt: 'Clinical 2D obstetric ultrasound sonogram of a 13-week fetus, transverse axial cranial view displaying the classic symmetric butterfly sign formed by bilateral choroid plexuses in lateral ventricles, authentic hospital monitor B-mode grain, grayscale, no text, no watermark.',
    markers: [
      { id: 'choroid', x: '48%', y: '38%', labelTr: 'Koroit Pleksus (Kelebek)', labelEn: 'Choroid Plexus (Butterfly)', descTr: 'Beyin omurilik sıvısı üreten simetrik iki parlak süngerimsi doku.', descEn: 'Symmetric echogenic lobes producing protective cerebrospinal fluid.' },
      { id: 'falx', x: '50%', y: '28%', labelTr: 'Falks Serebri (Orta Hat)', labelEn: 'Falx Cerebri (Midline)', descTr: 'Beyni iki eşit yarımküreye bölen düzgün orta çizgi.', descEn: 'Straight echogenic midline confirming balanced left and right brain development.' },
    ]
  },
  14: {
    filename: 'usg_2d_w14_fetal_spine_coronal.png',
    titleTr: 'Omurga Kemikleşmesi & Koronal Hat',
    titleEn: 'Spinal Ossification & Vertebral Alignment',
    badgeTr: 'Omurga Hattı',
    badgeEn: 'Spine Alignment',
    probe: 'C5-1 Abdominal',
    freq: '4.5 MHz',
    depth: '12.0 cm',
    mi: '1.0',
    tib: '0.3',
    fetalBpm: '140 - 160 bpm',
    summaryTr: 'Boyundan kuyruk sokumuna paralel uzanan tren rayı (railroad) omurga kemikleşme merkezleri kontrol edilir.',
    summaryEn: 'Parallel ossification centers of vertebrae running smoothly from cervical to sacral spine.',
    prompt: 'Clinical 2D ultrasound sonogram of a 14-week fetus showing a longitudinal sagittal view of the entire spinal column with parallel hyperechoic vertebral bodies and intact overlying skin line, authentic ultrasound hospital monitor, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'spine', x: '45%', y: '44%', labelTr: 'Vertebra Kemikleri', labelEn: 'Vertebral Bodies', descTr: 'Birbiriyle uyumlu aralıklarla dizilen omur kemikçikleri.', descEn: 'Regularly spaced hyperechoic ossification points along spinal column.' },
      { id: 'skin', x: '38%', y: '42%', labelTr: 'Kesintisiz Cilt Hattı', labelEn: 'Intact Skin Covering', descTr: 'Omurgayı örten derinin tam kapalı olduğunu teyit eden pürüzsüz hat.', descEn: 'Smooth continuous cutaneous border confirming neural tube integrity.' },
    ]
  },
  15: {
    filename: 'usg_2d_w15_amniotic_fluid_pocket.png',
    titleTr: 'Amniyon Sıvısı & Aktif El Hareketleri',
    titleEn: 'Amniotic Cushioning & Active Hand Movements',
    badgeTr: 'Sıvı & Hareket',
    badgeEn: 'Fluid & Motion',
    probe: 'C5-1 Abdominal',
    freq: '4.5 MHz',
    depth: '12.5 cm',
    mi: '1.0',
    tib: '0.3',
    fetalBpm: '140 - 155 bpm',
    summaryTr: 'Bebeğin berrak amniyon sıvısında serbestçe yüzdüğü ve parmaklarını yüzüne götürdüğü anlar izlenir.',
    summaryEn: 'Generous anechoic amniotic fluid pockets facilitating spontaneous fetal limb flexion and hand-to-face exploration.',
    prompt: 'Clinical 2D obstetric ultrasound sonogram of a 15-week fetus surrounded by rich dark anechoic amniotic fluid, fetus floating with hands raised toward face and curled feet, authentic B-mode medical ultrasound display, black and white, no text, no watermark.',
    markers: [
      { id: 'fluid', x: '60%', y: '35%', labelTr: 'Amniyon Sıvı Cebi', labelEn: 'Amniotic Fluid Pocket', descTr: 'Bebeğin kas ve akciğer hareketlerini rahatça çalışabildiği koruyucu sıvı alanı.', descEn: 'Deep protective fluid chamber allowing effortless musculoskeletal movement.' },
      { id: 'hands', x: '42%', y: '46%', labelTr: 'El & Parmaklar', labelEn: 'Hands & Digits', descTr: 'Minik parmaklarını açıp kapayan ve yüzüne dokunan eller.', descEn: 'Delicate open palm and curled fingers brushing against cheek.' },
    ]
  },
  16: {
    filename: 'usg_2d_w16_bpd_thalamic_plane.png',
    titleTr: 'BPD Ölçüm Kesiti & Talamus Planı',
    titleEn: 'Transthalamic BPD Plane & Cavum Septi',
    badgeTr: 'BPD ~36 mm',
    badgeEn: 'BPD ~36 mm',
    probe: 'C5-1 Abdominal',
    freq: '4.2 MHz',
    depth: '13.0 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '135 - 155 bpm',
    summaryTr: 'Kafatası oval kesitinde talamuslar ve kavitum septi pellusidi (CSP) hizasında BPD ve HC ölçülür.',
    summaryEn: 'Standard axial transthalamic plane displaying symmetric thalami and cavum septi pellucidi for BPD/HC.',
    prompt: 'Clinical 2D ultrasound sonogram of a 16-week fetal head in transthalamic axial view, showing oval cranium with measurement calipers measuring BPD (36mm) and HC, visible thalami and midline cavum septi pellucidi, authentic hospital ultrasound telemetry, grayscale, no text, no watermark.',
    markers: [
      { id: 'bpd', x: '50%', y: '38%', labelTr: 'BPD Çapı (Şakaklar Arası)', labelEn: 'Biparietal Diameter (BPD)', descTr: 'Kafatasının en geniş iki kemiği arasındaki milimetrik çap.', descEn: 'Outer-to-inner parietal bone diameter defining gestational progress.' },
      { id: 'csp', x: '50%', y: '46%', labelTr: 'Kavitum Septi Pellusidi', labelEn: 'Cavum Septi Pellucidi', descTr: 'Beyin orta hattında yer alan sağlıklı nörolojik belirteç kutucuğu.', descEn: 'Fluid-filled midline box landmark confirming normal brain architecture.' },
    ]
  },
  17: {
    filename: 'usg_2d_w17_fetal_femur_length.png',
    titleTr: 'Uyluk Kemiği Ölçümü (FL) & Kemik Yoğunluğu',
    titleEn: 'Femur Length (FL) & Acoustic Shadowing',
    badgeTr: 'FL ~25 mm',
    badgeEn: 'FL ~25 mm',
    probe: 'C5-1 Abdominal',
    freq: '4.2 MHz',
    depth: '13.0 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '135 - 150 bpm',
    summaryTr: 'Femur (uyluk kemiği) gövdesi düz ve net bir parlak hat halinde ölçülür (~25 mm).',
    summaryEn: 'Measurement of the long straight hyperechoic femur diaphysis with posterior acoustic shadowing.',
    prompt: 'Clinical obstetric 2D ultrasound sonogram of a 17-week fetus showing isolated femur bone with caliper markers measuring femur length (FL 25mm), clean echogenic bone texture and acoustic shadowing underneath, authentic hospital sonogram display, grayscale, no text, no watermark.',
    markers: [
      { id: 'fl', x: '48%', y: '52%', labelTr: 'Femur Diyafizi (~25 mm)', labelEn: 'Femur Diaphysis (~25mm)', descTr: 'Bebeğin bacak boyu ve genetik boy potansiyelinin en güvenilir ölçüsü.', descEn: 'Linear hyperechoic shaft of the thigh bone assessing skeletal growth.' },
      { id: 'shadow', x: '48%', y: '64%', labelTr: 'Akustik Gölge', labelEn: 'Acoustic Shadow', descTr: 'Kalsiyumla güçlenen kemiğin ses dalgalarını durdurarak arkasında bıraktığı doğal gölge.', descEn: 'Acoustic shadowing confirming rich calcium mineralization in the bone.' },
    ]
  },
  18: {
    filename: 'usg_2d_w18_stomach_bubble_situs.png',
    titleTr: 'Mide Cebi & Karın İçi Organ Yerleşimi (Situs)',
    titleEn: 'Stomach Bubble & Abdominal Situs Verification',
    badgeTr: 'Mide Cebi',
    badgeEn: 'Stomach Bubble',
    probe: 'C5-1 Abdominal',
    freq: '4.2 MHz',
    depth: '13.5 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '135 - 150 bpm',
    summaryTr: 'Sol tarafta sıvı dolu anekoik mide cebi izlenerek bebeğin amniyon yutma refleksi doğrulanır.',
    summaryEn: 'Anechoic fluid-filled gastric bubble in the left upper quadrant confirming normal swallowing and situs.',
    prompt: 'Clinical 2D ultrasound sonogram of an 18-week fetus, transverse abdominal view displaying the round black fluid-filled stomach bubble on the left side and umbilical vein entering liver, authentic medical sonography screen, monochrome, no text, no watermark.',
    markers: [
      { id: 'stomach', x: '42%', y: '48%', labelTr: 'Mide Cebi (Sol)', labelEn: 'Stomach Bubble (Left)', descTr: 'Bebeğin amniyon sıvısını başarıyla yuttuğunu gösteren sıvı dolu kese.', descEn: 'Fluid collection confirming patent esophagus and active swallowing.' },
      { id: 'situs', x: '55%', y: '46%', labelTr: 'Karaciğer & Portal Ven', labelEn: 'Liver & Portal Vein', descTr: 'Karın içi organların doğru anatomik pozisyonda yerleştiğinin teyidi.', descEn: 'Normal right-sided liver lobe and umbilical venous branching.' },
    ]
  },
  19: {
    filename: 'usg_2d_w19_renal_pelvis_transverse.png',
    titleTr: 'Bilateral Böbrekler & Mesane Dolumu',
    titleEn: 'Bilateral Kidneys & Urinary Bladder Recycling',
    badgeTr: 'Böbrekler',
    badgeEn: 'Renal Anatomy',
    probe: 'C5-1 Abdominal',
    freq: '4.0 MHz',
    depth: '13.5 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '130 - 150 bpm',
    summaryTr: 'Omurganın her iki yanındaki fasulye biçimli böbrekler ve pelviste mesane dolumu kontrol edilir.',
    summaryEn: 'Transverse lumbar view displaying bilateral bean-shaped kidneys with normal non-dilated renal pelves (<4mm).',
    prompt: 'Clinical obstetric 2D B-mode ultrasound sonogram of a 19-week fetus showing bilateral transverse renal view flanking the spine, bean-shaped kidneys with non-dilated renal pelves and pelvis bladder bubble, authentic diagnostic monitor, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'kidney_l', x: '38%', y: '50%', labelTr: 'Sol Böbrek', labelEn: 'Left Kidney', descTr: 'Korteks ve medullası net seçilen sağlıklı filtreleme ünitesi.', descEn: 'Normal renal parenchyma without pelvicalyceal dilation.' },
      { id: 'kidney_r', x: '58%', y: '50%', labelTr: 'Sağ Böbrek', labelEn: 'Right Kidney', descTr: 'Sağ omurga yanında simetrik yerleşimli böbrek dokusu.', descEn: 'Contralateral kidney demonstrating symmetric functional development.' },
    ]
  },
  20: {
    filename: 'usg_2d_w20_level2_anatomy.png',
    titleTr: '2. Düzey Detaylı Anatomi Taraması',
    titleEn: 'Level II Detailed Anatomy Scan',
    badgeTr: 'Detaylı USG',
    badgeEn: 'Anatomy Scan',
    probe: 'EPIQ / Voluson E10 C5-2',
    freq: '4.2 MHz',
    depth: '13.5 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '135 - 155 bpm',
    summaryTr: 'Beyin, 4 odacıklı kalp, omurga, böbrekler, uzuvlar ve plasenta baştan aşağı incelenir.',
    summaryEn: 'Comprehensive examination of the brain, 4-chamber heart, spine, kidneys, limbs, and placenta.',
    prompt: 'Clinical Level II detailed anatomy 2D B-mode ultrasound sonogram of a 20-week human fetus, showing a clear transverse view of the fetal spine vertebrae, ribs, and abdominal contour with amniotic fluid pocket, authentic hospital sonography monitor texture, genuine ultrasound grayscale contrast and acoustic grain, professional medical sonogram, monochrome, no text, no watermark.',
    markers: [
      { id: 'heart', x: '52%', y: '46%', labelTr: '4 Odacıklı Kalp', labelEn: '4-Chamber Heart', descTr: 'İki kulakçık ve iki karıncık simetrisi, kapakçık geçişleri ve septum bütünlüğü kontrol edilir.', descEn: 'Symmetry of left and right atria and ventricles, valve movement, and intact septum.' },
      { id: 'spine', x: '44%', y: '36%', labelTr: 'Omurga & Nöral Tüp', labelEn: 'Spine & Neural Tube', descTr: 'Boyundan kuyruk sokumuna omurga kemikleri ve üzerini örten cilt hattı kesintisiz incelenir.', descEn: 'Continuous skin-covering line over the entire vertebrae ruling out spina bifida.' },
      { id: 'brain', x: '35%', y: '25%', labelTr: 'Beyincik & Sisterna Magna', labelEn: 'Cerebellum & Cisterna Magna', descTr: 'Kafatası simetrisi, beyin yarımküreleri ve ventrikül sıvı genişlikleri ölçülür.', descEn: 'Brain hemisphere symmetry and normal fluid ventricles confirming CNS health.' },
      { id: 'kidneys', x: '58%', y: '60%', labelTr: 'Böbrekler & Mesane', labelEn: 'Kidneys & Bladder', descTr: 'Bebeğin amniyon sıvısını yutup böbrekleriyle süzdüğünü gösteren aktif dolum kontrolü.', descEn: 'Functional amniotic fluid recycling verified via visible bilateral renal filtration.' },
      { id: 'limbs', x: '66%', y: '72%', labelTr: 'Femur & Parmaklar', labelEn: 'Femur & Digits', descTr: 'Uyluk kemiği (FL) uzunluğu ve el-ayak parmaklarının eksiksiz simetrisi sayılır.', descEn: 'Femur length (FL) measurement and verification of all ten fingers and toes.' },
    ]
  },
  21: {
    filename: 'usg_2d_w21_cardiac_outflow_tracts.png',
    titleTr: 'Kalp Çıkım Yolları (LVOT & RVOT)',
    titleEn: 'Cardiac Outflow Tracts (LVOT & RVOT)',
    badgeTr: 'Kalp Damarları',
    badgeEn: 'Great Vessels',
    probe: 'C5-1 Matrix',
    freq: '4.0 MHz',
    depth: '14.0 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '135 - 150 bpm',
    summaryTr: 'Sol ve sağ ventrikülden çıkan aort ve pulmoner arterin normal çapraz geçişi kontrol edilir.',
    summaryEn: 'Crossing of the great arteries (aortic root and main pulmonary trunk) ruling out transposition anomalies.',
    prompt: 'Clinical 2D echocardiography ultrasound sonogram of a 21-week fetal heart, showing the left ventricular outflow tract (LVOT) and aortic arch crossing with pulmonary artery, hospital diagnostic sonography monitor, grayscale acoustic grain, monochrome, no text, no watermark.',
    markers: [
      { id: 'aorta', x: '46%', y: '46%', labelTr: 'Aort Kökü (LVOT)', labelEn: 'Aortic Root (LVOT)', descTr: 'Sol karıncıktan çıkıp vücuda temiz kan pompalayan ana damar kavsi.', descEn: 'Aortic valve and ascending aorta emerging seamlessly from the left ventricle.' },
      { id: 'pulmonary', x: '56%', y: '42%', labelTr: 'Pulmoner Arter (RVOT)', labelEn: 'Pulmonary Trunk (RVOT)', descTr: 'Sağ karıncıktan çıkıp aortu çaprazlayan akciğer damar gövdesi.', descEn: 'Pulmonary trunk crossing anterior and orthogonal to the aortic root.' },
    ]
  },
  22: {
    filename: 'usg_2d_w22_cerebellum_cisterna_magna.png',
    titleTr: 'Beyincik Çapı (TCD) & Sisterna Magna',
    titleEn: 'Transverse Cerebellar Diameter (TCD) & Posterior Fossa',
    badgeTr: 'Beyincik 22 mm',
    badgeEn: 'TCD 22 mm',
    probe: 'C5-1 Abdominal',
    freq: '4.0 MHz',
    depth: '14.0 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '130 - 150 bpm',
    summaryTr: 'Kumbara şeklindeki beyincik çapı gebelik haftasıyla birebir örtüşür (22 mm); sisterna magna berraktır.',
    summaryEn: 'Transverse cerebellar diameter matching gestational week (22 mm) and normal cisterna magna depth (<10mm).',
    prompt: 'Clinical 2D ultrasound sonogram of a 22-week fetal brain in suboccipitobregmatic axial view, showing dumbbell-shaped cerebellum, nuchal fold, and fluid-filled cisterna magna with caliper measurement markers, authentic hospital monitor, grayscale, no text, no watermark.',
    markers: [
      { id: 'cerebellum', x: '48%', y: '45%', labelTr: 'Beyincik (Kumbara Görünümü)', labelEn: 'Cerebellum (Dumbbell)', descTr: 'İki simetrik yarımküresiyle denge ve motor kontrol merkezinin olgunlaşması.', descEn: 'Characteristic dumbbell-shaped bilateral cerebellar hemispheres.' },
      { id: 'cisterna', x: '48%', y: '58%', labelTr: 'Sisterna Magna (<10 mm)', labelEn: 'Cisterna Magna (<10mm)', descTr: 'Beyincik arkasındaki koruyucu sıvı cebi; 2-10 mm arası ideal derinliktir.', descEn: 'Fluid space behind cerebellum ruling out Chiari malformations.' },
    ]
  },
  23: {
    filename: 'usg_2d_w23_fetal_face_lips_nose.png',
    titleTr: 'Yüz Koronal Kesiti (Dudak & Burun Delikleri)',
    titleEn: 'Coronal Facial View (Upper Lip & Nostrils)',
    badgeTr: 'Dudak Simetrisi',
    badgeEn: 'Intact Lip',
    probe: 'C5-1 Abdominal',
    freq: '3.8 MHz',
    depth: '14.0 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '130 - 145 bpm',
    summaryTr: 'Burun delikleri, üst dudak hattı ve filtrumun kesintisiz bütünlüğü incelenir (yarık dudak dışlanır).',
    summaryEn: 'Coronal nose/lips plane confirming intact upper vermilion border and bilateral symmetrical nostrils.',
    prompt: 'Clinical 2D ultrasound sonogram of a 23-week fetus in coronal facial plane, displaying clear symmetrical nostrils, intact continuous upper and lower lips, and eye orbits, authentic hospital ultrasound monitor texture, monochrome, no text, no watermark.',
    markers: [
      { id: 'lip', x: '48%', y: '52%', labelTr: 'Kesintisiz Üst Dudak', labelEn: 'Intact Upper Lip', descTr: 'Dudak hattının pürüzsüz bir yay şeklinde birleştiğinin görsel teyidi.', descEn: 'Continuous mucosal line ruling out cleft lip defects.' },
      { id: 'nostrils', x: '48%', y: '44%', labelTr: 'Simetrik Burun Delikleri', labelEn: 'Bilateral Nostrils', descTr: 'Nefes yollarının temel yapısını oluşturan iki simetrik kıkırdak açıklık.', descEn: 'Two distinct patent circular nostrils framed by nasal tip.' },
    ]
  },
  24: {
    filename: 'usg_2d_w24_abdominal_circumference.png',
    titleTr: 'Karın Çevresi (AC) & Fetal Kilo Öngörüsü',
    titleEn: 'Abdominal Circumference (AC) & Growth Baseline',
    badgeTr: 'AC ~209 mm',
    badgeEn: 'AC ~209 mm',
    probe: 'C5-1 Abdominal',
    freq: '3.8 MHz',
    depth: '14.5 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '130 - 145 bpm',
    summaryTr: 'Karaciğer içi portal ven ve mide cebi seviyesinde AC ölçülerek Hadlock kilo hesabı yapılır (~690 g).',
    summaryEn: 'Standard round AC plane showing single rib pair, stomach bubble, and J-shaped portal vein estimating ~690g weight.',
    prompt: 'Clinical 2D ultrasound sonogram of a 24-week fetal abdomen in standard transverse plane for abdominal circumference (AC 209mm), showing round abdominal contour with ellipse calipers, stomach bubble, and portal vein branch, hospital diagnostic sonogram monitor, grayscale, no text, no watermark.',
    markers: [
      { id: 'ac_ellipse', x: '50%', y: '48%', labelTr: 'AC Elips Ölçümü', labelEn: 'AC Ellipse Caliper', descTr: 'Fetal ağırlık formüllerinin en hassas parametresi olan karın dış hattı.', descEn: 'Primary biometric parameter determining fetal nutrition and weight.' },
      { id: 'portal', x: '54%', y: '46%', labelTr: 'J-Biçimli Portal Ven', labelEn: 'J-Shaped Portal Vein', descTr: 'Ölçümün doğru seviyeden yapıldığını kanıtlayan karaciğer damar kavsi.', descEn: 'Internal acoustic landmark ensuring exact cross-sectional validity.' },
    ]
  },
  25: {
    filename: 'usg_2d_w25_fetal_foot_plantar.png',
    titleTr: 'Ayak Tabanı (Plantar Plan) & 5 Parmak',
    titleEn: 'Plantar Foot View & Digit Verification',
    badgeTr: 'Ayak Anatomisi',
    badgeEn: 'Foot Anatomy',
    probe: 'C5-1 Abdominal',
    freq: '3.8 MHz',
    depth: '14.5 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '130 - 145 bpm',
    summaryTr: 'Ayak tabanında topuk (kalkaneus), metatarslar ve yan yana dizilmiş 5 minik parmak sayılır.',
    summaryEn: 'Plantar view of the fetal foot showing calcaneus, longitudinal arch, and five aligned separate toes.',
    prompt: 'Clinical 2D ultrasound sonogram of a 25-week fetus displaying a detailed plantar view of the fetal foot, showing the heel bone, sole of foot, and all five distinct toes aligned in amniotic fluid, authentic hospital ultrasound monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'heel', x: '42%', y: '60%', labelTr: 'Topuk Kemiği (Kalkaneus)', labelEn: 'Heel (Calcaneus)', descTr: 'Ayak iskeletinin en güçlü kemikleşme noktası.', descEn: 'Prominent echogenic ossification point of the heel.' },
      { id: 'toes', x: '58%', y: '40%', labelTr: '5 Ayrı Ayak Parmağı', labelEn: 'Five Aligned Toes', descTr: 'Başparmaktan küçük parmağa simetrik ve serbestçe hareket eden parmaklar.', descEn: 'Distinct digital rays confirming complete digit separation.' },
    ]
  },
  26: {
    filename: 'usg_2d_w26_optic_lenses_orbits.png',
    titleTr: 'Göz Küreleri & Optik Lens Halkaları',
    titleEn: 'Bilateral Orbits & Echogenic Lens Rings',
    badgeTr: 'Göz Küreleri',
    badgeEn: 'Eye Orbits',
    probe: 'C5-1 Abdominal',
    freq: '3.8 MHz',
    depth: '14.5 cm',
    mi: '1.0',
    tib: '0.4',
    fetalBpm: '130 - 145 bpm',
    summaryTr: 'Göz çukurları içindeki yuvarlak berrak lens halkaları ve göz kırpma refleksleri gözlenir.',
    summaryEn: 'Axial orbital plane showing circular hyperechoic lens rings within bilateral orbits and early blink movements.',
    prompt: 'Clinical 2D ultrasound sonogram of a 26-week fetus showing coronal axial view of the fetal eyes, displaying bilateral circular eye orbits and bright echogenic lens rings, hospital sonography monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'lens_l', x: '42%', y: '45%', labelTr: 'Sol Göz Merceği (Lens)', labelEn: 'Left Optic Lens', descTr: 'Işığa ve karanlığa tepki verecek saydam göz küresi halkası.', descEn: 'Circular echogenic border outlining the clear crystalline lens.' },
      { id: 'lens_r', x: '58%', y: '45%', labelTr: 'Sağ Göz Merceği (Lens)', labelEn: 'Right Optic Lens', descTr: 'Simetrik derinlikte konumlanan sağ göz merceği.', descEn: 'Symmetrical contralateral orbit confirming normal interpupillary distance.' },
    ]
  },
  27: {
    filename: 'usg_2d_w27_placental_retroplacental_clear.png',
    titleTr: 'Plasenta Matürasyonu & Retroplasental Alan',
    titleEn: 'Placental Maturation & Retroplacental Clear Zone',
    badgeTr: 'Evre 1 Plasenta',
    badgeEn: 'Grade 1 Placenta',
    probe: 'C5-1 Convex',
    freq: '3.6 MHz',
    depth: '15.0 cm',
    mi: '1.1',
    tib: '0.4',
    fetalBpm: '125 - 145 bpm',
    summaryTr: 'Plasentanın homojen dokusu, rahim duvarıyla pürüzsüz bağlantısı ve berrak retroplasental alan izlenir.',
    summaryEn: 'Grade 1 placenta with subtle chorionic indentations and distinct clear retroplacental hypoechoic vascular zone.',
    prompt: 'Clinical obstetric 2D ultrasound sonogram of a 27-week pregnancy displaying placental architecture, showing smooth chorionic plate, homogeneous cotyledon substance, and clear retroplacental hypoechoic space, hospital sonography monitor display, monochrome, no text, no watermark.',
    markers: [
      { id: 'placenta', x: '50%', y: '36%', labelTr: 'Plasenta Dokusu (Evre 1)', labelEn: 'Placenta (Grade 1)', descTr: 'Bebeğe oksijen ve besin taşıyan zengin süngerimsi kılcal damar ağı.', descEn: 'Vascular organ transferring maternal nutrients and oxygen to fetus.' },
      { id: 'retro', x: '50%', y: '26%', labelTr: 'Retroplasental Alan', labelEn: 'Retroplacental Zone', descTr: 'Plasentanın rahim kasına sağlıklı tutunduğunu gösteren koyu sıvı şeridi.', descEn: 'Hypoechoic vascular clear space ruling out invasive accreta.' },
    ]
  },
  28: {
    filename: 'usg_2d_w28_growth_bpd.png',
    titleTr: '3. Trimester Büyüme & Doppler Taraması',
    titleEn: 'Third Trimester Growth & Doppler Scan',
    badgeTr: 'Gelişim & NST',
    badgeEn: 'Growth & NST',
    probe: 'C5-1 Convex',
    freq: '3.8 MHz',
    depth: '15.0 cm',
    mi: '1.1',
    tib: '0.5',
    fetalBpm: '125 - 145 bpm',
    summaryTr: 'Tahmini ağırlık (EFW ~1200g), baş çevresi (HC), amniyon sıvı hacmi ve duruş pozisyonu takip edilir.',
    summaryEn: 'Estimated fetal weight (~1200g), head circumference, amniotic fluid volume, and presentation.',
    prompt: 'Clinical obstetric ultrasound sonogram of a 28-week fetus growth scan, transverse cranial BPD/HC measurement with calipers, hospital monitor display texture, grayscale monochrome, no text, no watermark.',
    markers: [
      { id: 'presentation', x: '36%', y: '28%', labelTr: 'Baş Gelişi (Sefalik Duruş)', labelEn: 'Cephalic Presentation', descTr: 'Bebeğin doğum kanalına doğru baş aşağı duruşu ve pelvise yerleşimi izlenir.', descEn: 'Head-down fetal orientation aligned with the birth canal preparing for labor.' },
      { id: 'placenta', x: '68%', y: '38%', labelTr: 'Plasenta Derecesi & Konum', labelEn: 'Placental Grade & Position', descTr: 'Plasentanın doğum yolunu kapatmadığı (previa olmadığı) ve kalsifikasyon olgunluğu.', descEn: 'Ensures placenta is positioned safely away from cervix with optimal nutrient transfer.' },
      { id: 'fluid', x: '50%', y: '64%', labelTr: 'Amniyon Sıvısı Cebi (AFI)', labelEn: 'Amniotic Fluid Index (AFI)', descTr: 'Bebeği darbelere karşı koruyan ve akciğer hareketine alan açan sıvı derinliği kontrol edilir.', descEn: 'Deepest vertical pocket assessment ensuring rich cushioning and lung training space.' },
      { id: 'doppler', x: '58%', y: '50%', labelTr: 'Göbek Kordonu Doppler Akımı', labelEn: 'Umbilical Doppler Flow', descTr: '3 damarlı kordonda plasentadan bebeğe akan oksijenli kanın direnç indeksi (S/D) ölçülür.', descEn: 'Color Doppler resistance index verifying robust oxygenation through umbilical vessels.' },
    ]
  },
  29: {
    filename: 'usg_2d_w29_fetal_breathing_movements.png',
    titleTr: 'Fetal Solunum Egzersizleri (FBM) & Göğüs Hareketi',
    titleEn: 'Fetal Breathing Movements (FBM) & Diaphragm',
    badgeTr: 'Solunum Takibi',
    badgeEn: 'Practice Breathing',
    probe: 'C5-1 Convex',
    freq: '3.6 MHz',
    depth: '15.0 cm',
    mi: '1.1',
    tib: '0.5',
    fetalBpm: '125 - 145 bpm',
    summaryTr: 'Bebeğin diyaframını ve göğüs kafesini ritmik olarak hareket ettirdiği solunum egzersizleri izlenir.',
    summaryEn: 'Continuous rhythmic thoracic inward and diaphragmatic downward movements during practice breathing.',
    prompt: 'Clinical 2D ultrasound sonogram of a 29-week fetus in longitudinal thoracoabdominal view, displaying chest wall excursions, diaphragm curvature, and ribs during fetal breathing exercise, authentic hospital ultrasound monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'diaphragm', x: '46%', y: '50%', labelTr: 'Diyafram Hattı', labelEn: 'Diaphragmatic Arc', descTr: 'Göğüs ve karın boşluğunu ayıran kubbe şekilli koyu kas çizgisi.', descEn: 'Hypoechoic curved muscular barrier moving rhythmically.' },
      { id: 'thorax', x: '46%', y: '40%', labelTr: 'Göğüs Kafesi & Akciğerler', labelEn: 'Thorax & Lungs', descTr: 'Doğum sonrası ilk nefese hazırlanan süngerimsi akciğer dokusu.', descEn: 'Echogenic pulmonary tissue preparing for atmospheric respiration.' },
    ]
  },
  30: {
    filename: 'usg_2d_w30_umbilical_cord_coiling.png',
    titleTr: '3 Damarlı Göbek Kordonu (Kordon Sarmalı)',
    titleEn: '3-Vessel Umbilical Cord Coiling & Insertion',
    badgeTr: '3 Damar Kordon',
    badgeEn: '3-Vessel Cord',
    probe: 'C5-1 Convex',
    freq: '3.5 MHz',
    depth: '15.5 cm',
    mi: '1.1',
    tib: '0.5',
    fetalBpm: '125 - 140 bpm',
    summaryTr: 'İki arter ve bir venden oluşan helikal kordon yapısı ve Wharton jölesi zenginliği teyit edilir.',
    summaryEn: 'Transverse "Mickey Mouse" sign of the 3-vessel umbilical cord (2 arteries, 1 vein) floating in fluid.',
    prompt: 'Clinical 2D ultrasound sonogram of a 30-week pregnancy showing high-magnification transverse cross-section of the 3-vessel umbilical cord with classic two small arteries and one large vein, authentic hospital ultrasound monitor, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'vein', x: '48%', y: '42%', labelTr: 'Umbilikal Ven (Oksijen Taşıyıcı)', labelEn: 'Umbilical Vein', descTr: 'Plasentadan bebeğe temiz kan getiren geniş lümenli ana damar.', descEn: 'Large central vessel carrying oxygenated blood to the fetal heart.' },
      { id: 'arteries', x: '52%', y: '54%', labelTr: '2 Umbilikal Arter', labelEn: 'Two Umbilical Arteries', descTr: 'Atık kanı plasentaya geri taşıyan iki küçük simetrik damar.', descEn: 'Dual coiled arteries returning blood to the placenta.' },
    ]
  },
  31: {
    filename: 'usg_2d_w31_deepest_vertical_pocket.png',
    titleTr: 'Amniyon Sıvısı Ölçümü (DVP & AFI)',
    titleEn: 'Deepest Vertical Pocket (DVP) Amniotic Index',
    badgeTr: 'AFI Ölçümü',
    badgeEn: 'AFI Index',
    probe: 'C5-1 Convex',
    freq: '3.5 MHz',
    depth: '15.5 cm',
    mi: '1.1',
    tib: '0.5',
    fetalBpm: '125 - 140 bpm',
    summaryTr: 'Kordon veya uzuv içermeyen en derin dikey sıvı cebi ölçülür (normal: 2 - 8 cm aralığı).',
    summaryEn: 'Measurement of the single deepest vertical pocket (DVP = 5.4 cm) free of umbilical cord and fetal limbs.',
    prompt: 'Clinical obstetric 2D ultrasound sonogram of a 31-week pregnancy showing measurement of the single deepest vertical pocket (DVP) of clear amniotic fluid with vertical measurement calipers (+---+), authentic diagnostic sonography monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'dvp', x: '50%', y: '50%', labelTr: 'Dikey Sıvı Cebi (5.4 cm)', labelEn: 'Deepest Pocket (5.4cm)', descTr: 'Bebeğin böbrek fonksiyonu ve plasenta sağlığını yansıtan mükemmel sıvı derinliği.', descEn: 'Clear vertical acoustic column confirming optimal fluid equilibrium.' },
    ]
  },
  32: {
    filename: 'usg_2d_w32_middle_cerebral_artery.png',
    titleTr: 'Orta Serebral Arter (MCA) & Beyin Kan Akımı',
    titleEn: 'Middle Cerebral Artery (MCA) Hemodynamics',
    badgeTr: 'Beyin Doppleri',
    badgeEn: 'Brain Doppler',
    probe: 'C5-1 Convex',
    freq: '3.5 MHz',
    depth: '16.0 cm',
    mi: '1.1',
    tib: '0.5',
    fetalBpm: '120 - 140 bpm',
    summaryTr: 'Kafatası tabanında Willis poligonundan çıkan MCA damarında kan akım hızı (PSV) ölçülür.',
    summaryEn: 'Axial skull base view visualizing the circle of Willis and middle cerebral artery peak systolic velocity.',
    prompt: 'Clinical 2D ultrasound sonogram of a 32-week fetus showing the axial base of skull with the circle of Willis arterial ring and middle cerebral artery (MCA) trajectory, hospital diagnostic monitor display, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'mca', x: '45%', y: '44%', labelTr: 'MCA Damar Yolu', labelEn: 'Middle Cerebral Artery', descTr: 'Bebeğin beynine giden oksijen miktarını milisaniyelik hassasiyetle gösterir.', descEn: 'Cerebral arterial trunk assessing oxygen delivery to fetal brain tissue.' },
      { id: 'willis', x: '52%', y: '46%', labelTr: 'Willis Poligonu', labelEn: 'Circle of Willis', descTr: 'Beyin tabanındaki dairesel koruyucu damar çemberi.', descEn: 'Hexagonal vascular anastomotic ring at the base of the fetal cranium.' },
    ]
  },
  33: {
    filename: 'usg_2d_w33_fetal_hair_scalp.png',
    titleTr: 'Saç Telleri (Saçlı Deri) & Kafa Çevresi',
    titleEn: 'Fetal Scalp Hair & Full Head Circumference',
    badgeTr: 'Saç Telleri',
    badgeEn: 'Scalp Hair',
    probe: 'C5-1 Convex',
    freq: '3.5 MHz',
    depth: '16.0 cm',
    mi: '1.1',
    tib: '0.5',
    fetalBpm: '120 - 140 bpm',
    summaryTr: 'Bebeğin ensesinde ve başında amniyon sıvısında dalgalanan minik parlak saç telleri izlenir.',
    summaryEn: 'Fine hyperechoic undulating strands of scalp hair floating in amniotic fluid behind the fetal occiput.',
    prompt: 'Clinical high-resolution 2D ultrasound sonogram of a 33-week fetus, displaying close-up view of fetal occiput with fine hyperechoic hair strands floating in clear amniotic fluid, authentic hospital monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'hair', x: '40%', y: '36%', labelTr: 'Dalgalanan Saçlar', labelEn: 'Floating Hair Strands', descTr: 'Amniyon sıvısında narin bir püskül gibi salınan ilk saç tutamları.', descEn: 'Fine echogenic filaments extending from the scalp into amniotic fluid.' },
      { id: 'scalp', x: '48%', y: '44%', labelTr: 'Kafa Kemik Hattı', labelEn: 'Scalp Soft Tissue', descTr: 'Kemik üzerinde kalınlaşan koruyucu yumuşak doku katmanı.', descEn: 'Subcutaneous fat cushion protecting the ossified parietal bones.' },
    ]
  },
  34: {
    filename: 'usg_2d_w34_distal_femoral_epiphysis.png',
    titleTr: 'Femur Epifizi (DFE) & Akciğer Olgunluk Belirteci',
    titleEn: 'Distal Femoral Epiphysis (DFE) Maturity Marker',
    badgeTr: 'Kemik Matürasyonu',
    badgeEn: 'Epiphysis Marker',
    probe: 'C5-1 Convex',
    freq: '3.4 MHz',
    depth: '16.0 cm',
    mi: '1.2',
    tib: '0.5',
    fetalBpm: '120 - 140 bpm',
    summaryTr: 'Diz ekleminde distal femoral epifiz (DFE) kemikleşme noktasının belirmesi matürasyonu teyit eder.',
    summaryEn: 'Identification of the distal femoral epiphysis (DFE) ossification center at the knee joint indicating fetal maturity.',
    prompt: 'Clinical 2D obstetric ultrasound sonogram of a 34-week fetus knee joint, showing the distal end of the femur with clear distinct distal femoral epiphysis (DFE) ossification speckle, authentic hospital sonography display, grayscale, no text, no watermark.',
    markers: [
      { id: 'dfe', x: '52%', y: '48%', labelTr: 'DFE Epifiz Çekirdeği', labelEn: 'DFE Ossification Center', descTr: 'Bebeğin gelişim haftasının 34+ olduğunu ve akciğerlerin olgunlaştığını fısıldayan küçük kıkırdak inci.', descEn: 'Small discrete bone nodule reliably indicating advanced fetal maturity.' },
    ]
  },
  35: {
    filename: 'usg_2d_w35_placental_grade2_calcifications.png',
    titleTr: 'Evre 2 Plasenta & Kotiledon Olgunlaşması',
    titleEn: 'Grade II Placenta & Cotyledon Indentations',
    badgeTr: 'Evre 2 Plasenta',
    badgeEn: 'Grade 2 Placenta',
    probe: 'C5-1 Convex',
    freq: '3.4 MHz',
    depth: '16.5 cm',
    mi: '1.2',
    tib: '0.5',
    fetalBpm: '120 - 140 bpm',
    summaryTr: 'Koryonik plak üzerinde virgül biçimli ekojeniteler ve kotiledon sınırlarının belirginleşmesi izlenir.',
    summaryEn: 'Mature Grade II placenta displaying comma-like echogenic calcifications and indentation of the chorionic plate.',
    prompt: 'Clinical 2D ultrasound sonogram of a 35-week pregnancy placenta, showing Grade 2 maturity with comma-shaped echogenic indentations along chorionic plate and rich vascular maternal lake, hospital diagnostic sonogram, grayscale, no text, no watermark.',
    markers: [
      { id: 'calc', x: '46%', y: '42%', labelTr: 'Virgül Kalsifikasyonlar', labelEn: 'Comma-like Densities', descTr: 'Plasentanın doğuma hazırlanan olgun yapısının doğal ekojenik çizgileri.', descEn: 'Physiological echogenic densities characteristic of near-term placenta.' },
      { id: 'plate', x: '52%', y: '32%', labelTr: 'Koryonik Plak Girintileri', labelEn: 'Chorionic Plate Folds', descTr: 'Besin alışverişini son haftalarda en yüksek verimde tutan yüzey katlanmaları.', descEn: 'Wavy undulating contour of the fetal placental surface.' },
    ]
  },
  36: {
    filename: 'usg_2d_w36_cephalic_presentation.png',
    titleTr: 'Pelvik Baş Angajmanı (Sefalik Duruş)',
    titleEn: 'Cephalic Head Engagement in Pelvis',
    badgeTr: 'Baş Gelişi',
    badgeEn: 'Cephalic Term',
    probe: 'C5-1 Convex',
    freq: '3.4 MHz',
    depth: '16.5 cm',
    mi: '1.2',
    tib: '0.5',
    fetalBpm: '120 - 140 bpm',
    summaryTr: 'Bebeğin başı pelvik girişe yerleşmiştir (baş gelişi); serviks kapalı ve doğum pozisyonu hazırdır.',
    summaryEn: 'Fetal head positioned firmly deep in maternal pelvic brim in cephalic presentation.',
    prompt: 'Clinical 2D obstetric ultrasound sonogram of a 36-week pregnant uterus, showing fetal head in deep cephalic presentation wedged against maternal pelvis, closed cervical canal, hospital ultrasound monitor screen, monochrome, no text, no watermark.',
    markers: [
      { id: 'head_pelvis', x: '45%', y: '35%', labelTr: 'Pelvise Yerleşen Baş', labelEn: 'Engaged Cranium', descTr: 'Bebeğin doğum kanalına hizalanmış baş aşağı güvenli pozisyonu.', descEn: 'Well-flexed fetal skull snugly fitted in maternal pelvic brim.' },
      { id: 'cervix', x: '55%', y: '65%', labelTr: 'Kapalı Rahim Ağzı (Serviks)', labelEn: 'Closed Internal Os', descTr: 'Doğum sancıları başlayana kadar bebeği koruyan uzun ve kapalı boyun.', descEn: 'Competent long endocervical canal holding firm before labor.' },
    ]
  },
  37: {
    filename: 'usg_2d_w37_biparietal_engagement.png',
    titleTr: 'Erken Term & Kemik Kemik Angajman',
    titleEn: 'Early Term Biparietal Diameter Alignment',
    badgeTr: 'Erken Term',
    badgeEn: 'Early Term',
    probe: 'C5-1 Convex',
    freq: '3.2 MHz',
    depth: '17.0 cm',
    mi: '1.2',
    tib: '0.5',
    fetalBpm: '115 - 135 bpm',
    summaryTr: '37. hafta tamamlandı: Erken term dönem; BPD ~92 mm, bebek doğum reflekslerini tamamlamıştır.',
    summaryEn: 'Early term landmark; mature BPD (92 mm) and occipital presentation firmly aligned in birth canal.',
    prompt: 'Clinical 2D ultrasound sonogram of a 37-week early term pregnancy, showing low-transverse pelvic view of engaged fetal head with parietal bones and thick cranial soft tissue, authentic hospital sonography display, grayscale, no text, no watermark.',
    markers: [
      { id: 'subocciput', x: '48%', y: '42%', labelTr: 'Suboksipitobregmatik Çap', labelEn: 'Suboccipitobregmatic', descTr: 'Doğumda en küçük çapla kanala girmesini sağlayan çene göğse eğilme açısı.', descEn: 'Optimal cranial flexion presenting the smallest circumference for delivery.' },
    ]
  },
  38: {
    filename: 'usg_2d_w38_full_term_cheeks_profile.png',
    titleTr: 'Tombul Yanaklar & Emme Refleksi',
    titleEn: 'Term Buccal Fat Pads & Sucking Reflex',
    badgeTr: 'Tam Term',
    badgeEn: 'Full Term',
    probe: 'C5-1 Convex',
    freq: '3.2 MHz',
    depth: '17.0 cm',
    mi: '1.2',
    tib: '0.5',
    fetalBpm: '115 - 135 bpm',
    summaryTr: 'Bebeğin yanaklarındaki bukkal yağ yastıkçıkları tombul bir profil verir; emme hareketi izlenir.',
    summaryEn: 'Chubby echogenic buccal fat pads on fetal cheeks and active rhythmic sucking reflex in amniotic fluid.',
    prompt: 'Clinical 2D ultrasound sonogram of a 38-week full-term fetus facial profile, showing rounded plump buccal fat cheek cushions, pursed lips in sucking motion, and umbilical cord loop, hospital diagnostic monitor display, grayscale, no text, no watermark.',
    markers: [
      { id: 'cheeks', x: '44%', y: '46%', labelTr: 'Bukkal Yağ Yastığı (Yanak)', labelEn: 'Buccal Fat Pad', descTr: 'Doğum sonrası anne memesini güçlüce kavramak için biriken yanak yağı.', descEn: 'Prominent cheek fat deposit specialized for powerful breastfeeding suction.' },
      { id: 'suck', x: '52%', y: '52%', labelTr: 'Aktif Emme Hareketi', labelEn: 'Sucking Reflex', descTr: 'Dudakların ritmik büzülmesiyle ilk beslenmeye hazır refleks.', descEn: 'Pursed lips practicing rhythmic oral feeding coordination.' },
    ]
  },
  39: {
    filename: 'usg_2d_w39_cervical_length_internal_os.png',
    titleTr: 'Servikal Olgunlaşma & Doğum Kanalı Hazırlığı',
    titleEn: 'Cervical Effacement & Birth Canal Priming',
    badgeTr: 'Doğum Hazırlığı',
    badgeEn: 'Labor Priming',
    probe: 'C5-1 Convex / C9-3v',
    freq: '3.5 MHz',
    depth: '14.0 cm',
    mi: '1.1',
    tib: '0.4',
    fetalBpm: '115 - 135 bpm',
    summaryTr: 'Rahim ağzı yumuşamış, silinme (effasman) başlamış ve fetal baş doğrudan iç servikal ağza dayanmıştır.',
    summaryEn: 'Shortening of cervical canal and early effacement with fetal presenting part applied firmly against internal os.',
    prompt: 'Clinical obstetric 2D ultrasound sonogram of a 39-week pregnancy at cervix level, showing internal cervical os with presenting fetal cranial pole resting against cervix, authentic hospital sonography display, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'efface', x: '50%', y: '56%', labelTr: 'İç Servikal Ağız (Internal Os)', labelEn: 'Internal Cervical Os', descTr: 'Kasılmalarla birlikte açılmaya başlayacak olan rahim kapısı.', descEn: 'Cervical junction where dilation and effacement initiate.' },
      { id: 'presenting', x: '50%', y: '36%', labelTr: 'Önde Gelen Kısım (Baş)', labelEn: 'Presenting Fetal Part', descTr: 'Açılmayı tetiklemek üzere servikse baskı yapan baş küresi.', descEn: 'Direct hydrostatic pressure applied by fetal head onto cervix.' },
    ]
  },
  40: {
    filename: 'usg_2d_w40_term_biophysical_profile.png',
    titleTr: 'Term Biyofizik Profil (BPP) & Kavuşma Anı',
    titleEn: 'Term Biophysical Profile (BPP) & Arrival Ready',
    badgeTr: 'Doğum Zamanı',
    badgeEn: 'Due Date',
    probe: 'C5-1 Convex',
    freq: '3.2 MHz',
    depth: '17.0 cm',
    mi: '1.2',
    tib: '0.5',
    fetalBpm: '120 - 135 bpm',
    summaryTr: 'Tam 8/8 BPP skoru: Güçlü kas tonusu, aktif gövde rotasyonu, matür plasenta ve berrak amniyon sıvısı.',
    summaryEn: 'Full 8/8 biophysical profile (BPP): robust flexion tone, active gross body movement, mature amniotic fluid with vernix flakes.',
    prompt: 'Clinical 2D ultrasound sonogram of a 40-week full-term pregnancy displaying complete biophysical profile scan, tightly flexed fetus with vernix particles suspended in fluid, mature Grade 3 placenta, authentic hospital ultrasound monitor texture, monochrome grayscale, no text, no watermark.',
    markers: [
      { id: 'tone', x: '45%', y: '48%', labelTr: 'Fetal Fleksiyon Tonusu', labelEn: 'Fetal Flexion Tone', descTr: 'Kollar ve bacakların göğse doğru sımsıkı toplanmış güçlü kas tonusu.', descEn: 'Vigorous active flexion of limbs reflecting healthy central nervous system.' },
      { id: 'vernix', x: '58%', y: '38%', labelTr: 'Verniks Partikülleri', labelEn: 'Vernix Flakes in Fluid', descTr: 'Bebeğin cildini koruyan kremsi tabakanın sıvı içinde uçuşan parlak pulları.', descEn: 'Echogenic floating vernix caseosa flakes confirming full-term skin maturity.' },
    ]
  }
};

function main() {
  console.log('🚀 [ULTRASOUND-POPULATOR] 37 haftalık ultrason atlası senkronizasyonu başlatılıyor...');

  // 1. Queue'ya eksik haftaları ekle
  let queueData = { jobs: [] };
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      queueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch (e) {}
  }

  const existingFilenames = new Set(queueData.jobs.map(j => j.filename));
  let addedCount = 0;

  for (let w = 4; w <= 40; w++) {
    const item = WEEKLY_SCANS[w];
    if (!item) continue;

    if (!existingFilenames.has(item.filename)) {
      queueData.jobs.push({
        id: 'job_usg_' + Date.now() + '_w' + String(w).padStart(2, '0'),
        filename: item.filename,
        prompt: item.prompt,
        transparent: false,
        status: 'pending',
        attempts: 0,
        createdAt: Date.now(),
        preferredPlatform: 'chatgpt'
      });
      addedCount++;
      console.log(`  ➕ Hafta ${w}: ${item.filename} kuyruğa eklendi.`);
    }
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf8');
  console.log(`✅ ${addedCount} adet haftalık 2D ultrason işi generation_queue.json dosyasına başarıyla eklendi!`);

  // 2. src/ultrasoundData.js dosyasını 37 haftanın tamamıyla güncelle
  generateUltrasoundDataJs();
}

function generateUltrasoundDataJs() {
  const code = `// ─── MOMORA CLINICAL ULTRASOUND & BIOMETRY ENGINE ─────────────────────────
// 37 Gestational Weeks (4 to 40) complete clinical sonography atlas,
// Hadlock 10th-50th-90th percentile reference curves, anatomical markers,
// hospital telemetry, and biometry decoder. Bilingual TR & EN.

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

export const WEEKLY_ULTRASOUND_DATA = ${JSON.stringify(WEEKLY_SCANS, null, 2)};

export const ULTRASOUND_MILESTONES = [
  { weekRange: '6 - 8', targetWeek: 8, id: 'first_scan', titleTr: 'İlk Canlılık & Kese Taraması', titleEn: 'Viability & Gestational Sac Scan', badgeTr: 'Erken Gebelik', badgeEn: 'Early Scan' },
  { weekRange: '11 - 14', targetWeek: 12, id: 'nt_scan', titleTr: '1. Trimester İkili Tarama (NT & CRL)', titleEn: 'First Trimester NT & CRL Scan', badgeTr: 'İkili Tarama', badgeEn: 'Screening Scan' },
  { weekRange: '18 - 22', targetWeek: 20, id: 'anatomy_scan', titleTr: '2. Düzey Detaylı Anatomi Taraması', titleEn: 'Level II Detailed Anatomy Scan', badgeTr: 'Detaylı USG', badgeEn: 'Anatomy Scan' },
  { weekRange: '28 - 36', targetWeek: 32, id: 'growth_scan', titleTr: '3. Trimester Büyüme & Doppler Taraması', titleEn: 'Third Trimester Growth & Doppler Scan', badgeTr: 'Gelişim & NST', badgeEn: 'Growth & NST' },
];

/**
 * Get full authentic ultrasound context for every single week (4-40)
 */
export function getUltrasoundDetails(week = 20, lang = 'tr') {
  const isEn = lang === 'en';
  const clampedWeek = Math.max(4, Math.min(40, week));
  const weeklyEntry = WEEKLY_ULTRASOUND_DATA[clampedWeek] || WEEKLY_ULTRASOUND_DATA[20];
  const norms = HADLOCK_BIOMETRY_NORMS[clampedWeek] || HADLOCK_BIOMETRY_NORMS[20];

  // Map 3D HDLive render (fetus_w04 to fetus_w40)
  const fetusKey = \`fetus_w\${String(clampedWeek).padStart(2, '0')}\`;

  // Determine active milestone category
  let milestone = ULTRASOUND_MILESTONES[2]; // default 20w
  if (clampedWeek <= 9) milestone = ULTRASOUND_MILESTONES[0];
  else if (clampedWeek <= 15) milestone = ULTRASOUND_MILESTONES[1];
  else if (clampedWeek <= 24) milestone = ULTRASOUND_MILESTONES[2];
  else milestone = ULTRASOUND_MILESTONES[3];

  const gaString = isEn ? \`GA: \${clampedWeek}w \${((clampedWeek * 3) % 7)}d\` : \`GA: \${clampedWeek}h \${((clampedWeek * 3) % 7)}g\`;
  const eddWeeksLeft = Math.max(0, 40 - clampedWeek);
  const eddDays = eddWeeksLeft * 7;

  return {
    week: clampedWeek,
    milestone,
    fetusKey,
    asset2d: weeklyEntry.filename.replace(/\\.png$/, ''),
    assetDoppler: clampedWeek >= 20 ? 'usg_doppler_umbilical_flow' : 'usg_doppler_cardiac_flow',
    norms,
    telemetry: {
      probe: weeklyEntry.probe,
      freq: weeklyEntry.freq,
      depth: weeklyEntry.depth,
      mi: weeklyEntry.mi,
      tib: weeklyEntry.tib,
      ga: gaString,
      edd: isEn ? \`EDD: \${eddDays}d remaining\` : \`EDD: Doğuma \${eddDays} gün\`,
      fps: '32 FPS',
    },
    title: isEn ? weeklyEntry.titleEn : weeklyEntry.titleTr,
    badge: isEn ? weeklyEntry.badgeEn : weeklyEntry.badgeTr,
    summary: isEn ? weeklyEntry.summaryEn : weeklyEntry.summaryTr,
    fetalBpm: weeklyEntry.fetalBpm,
    markers: (weeklyEntry.markers || []).map(m => ({
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
`;

  fs.writeFileSync(ULTRASOUND_DATA_FILE, code, 'utf8');
  console.log('✅ src/ultrasoundData.js 37 haftalık tam klinik atlas ile güncellendi!');
}

main();
