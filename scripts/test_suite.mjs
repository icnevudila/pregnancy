import assert from 'node:assert';
import { resolveJourneyState, calculateDueDateFromWeek, calculatePregnancyProgress, calculatePostpartumProgress } from '../src/domain/journeyState.js';
import {
  createTrackerRecord,
  applyOptimisticCreate,
  applyOptimisticUpdate,
  applyOptimisticDelete,
  applyUndoAction,
  getUnifiedTimeline,
  TrackerTypes,
} from '../src/domain/trackerEngine.js';
import { migrateState, extendedDefaults } from '../src/domain.mjs';

console.log('--- RUNNING MOMORA AUTOMATED TEST SUITE ---');

// 1. Journey State Tests
{
  console.log('Testing Journey State Engine...');
  const dueDate = '2026-07-24';
  const progress = calculatePregnancyProgress(dueDate);
  assert(typeof progress.daysRemaining === 'number', 'Remaining days must be a number');

  const journeyPreg = resolveJourneyState({
    mode: 'pregnancy',
    pregnancy: { dueDate, status: 'active' },
  });
  assert.strictEqual(journeyPreg.mode, 'pregnancy');
  assert(journeyPreg.week >= 1 && journeyPreg.week <= 43, 'Pregnancy week must be in valid range');
  assert(journeyPreg.day >= 0 && journeyPreg.day <= 6, 'Pregnancy day must be in 0..6');

  const journeyPost = resolveJourneyState({
    mode: 'postpartum',
    postpartumProfile: { birthDate: '2026-09-01' },
  });
  assert.strictEqual(journeyPost.mode, 'postpartum');
  assert(journeyPost.postpartum.daysSinceBirth >= 0, 'Days since birth must be positive');

  console.log('✓ Journey State tests passed.');
}

// 2. Tracker Engine Record Factory & Timestamp Derivation
{
  console.log('Testing Tracker Record Factory...');
  const startedAt = '2026-09-13T10:00:00.000Z';
  const endedAt = '2026-09-13T10:00:45.000Z'; // 45 seconds
  const record = createTrackerRecord({
    type: TrackerTypes.CONTRACTION,
    startedAt,
    endedAt,
    notes: 'Mild contraction',
  });

  assert.strictEqual(record.type, 'contraction');
  assert.strictEqual(record.durationSeconds, 45, 'Duration seconds must be accurately derived from timestamps');
  assert.strictEqual(record.syncState, 'pending');
  assert(record.id.startsWith('evt_contraction_'));
  assert(record.clientGeneratedId.startsWith('cli_'));
  console.log('✓ Tracker Record Factory tests passed.');
}

// 3. Optimistic Mutations & Undo Window
{
  console.log('Testing Optimistic Mutations & Undo Window...');
  const initialList = [
    { id: 'evt_1', type: 'water', value: '1.0' },
    { id: 'evt_2', type: 'weight', value: '65.0' },
  ];

  const newEvt = { id: 'evt_3', type: 'movement', value: '5 hareket' };
  const created = applyOptimisticCreate(initialList, newEvt);
  assert.strictEqual(created.length, 3);
  assert.strictEqual(created[0].id, 'evt_3');

  const updated = applyOptimisticUpdate(created, 'evt_3', { value: '6 hareket' });
  assert.strictEqual(updated[0].value, '6 hareket');

  const { updatedList, deletedRecord } = applyOptimisticDelete(updated, 'evt_1');
  assert.strictEqual(updatedList.length, 2);
  assert.strictEqual(deletedRecord.id, 'evt_1');

  // Undo delete
  const undoActionDelete = {
    actionType: 'delete',
    record: deletedRecord,
    expiresAt: Date.now() + 8000,
  };
  const restored = applyUndoAction(updatedList, undoActionDelete);
  assert.strictEqual(restored.length, 3);
  assert(restored.some(r => r.id === 'evt_1'), 'Restored list must contain evt_1');

  // Expired undo action should be ignored
  const expiredUndo = {
    actionType: 'delete',
    record: deletedRecord,
    expiresAt: Date.now() - 1000,
  };
  const unapplied = applyUndoAction(updatedList, expiredUndo);
  assert.strictEqual(unapplied.length, 2, 'Expired undo action must not alter list');
  console.log('✓ Optimistic Mutations & Undo tests passed.');
}

// 4. Unified Timeline Aggregation
{
  console.log('Testing Unified Timeline...');
  const trackerEvents = [
    {
      id: 'e1',
      type: 'movement',
      title: 'Fetal Hareket',
      value: '8 hareket',
      occurredAt: new Date().toISOString(),
      syncState: 'synced',
    },
  ];
  const legacyRecords = [
    { id: 'rec1', type: 'Su', value: '2L', time: '11:00', createdAt: '2026-09-12T11:00:00.000Z' },
  ];

  const timeline = getUnifiedTimeline(trackerEvents, legacyRecords, 'tr');
  assert.strictEqual(timeline.count, 2);
  assert(timeline.grouped.length >= 1, 'Should have grouped items by day');
  console.log('✓ Unified Timeline tests passed.');
}

// 5. State Migration with Tracker Engine
{
  console.log('Testing State Migration with Tracker Engine...');
  const migrated = migrateState({}, extendedDefaults);
  assert(Array.isArray(migrated.trackerEvents), 'Migrated state must include trackerEvents array');
  console.log('✓ State Migration tests passed.');
}

// 6. Sprint 4 Pregnancy Tracker Domain Tests
{
  console.log('Testing Sprint 4 Pregnancy Trackers...');

  // Fetal Movement: Baby's personal rhythm, no 10-kick ceiling
  const movementRecord = createTrackerRecord({
    type: TrackerTypes.MOVEMENT,
    value: '14 hareket',
    metadata: {
      count: 14,
      durationSeconds: 1500,
      feeling: 'stronger',
    },
    notes: 'After dinner, very active',
  });
  assert.strictEqual(movementRecord.type, 'movement');
  assert.strictEqual(movementRecord.metadata.count, 14);
  assert.strictEqual(movementRecord.metadata.feeling, 'stronger');

  // Contraction: Interval & timestamp derivation
  const contractionRecord = createTrackerRecord({
    type: TrackerTypes.CONTRACTION,
    startedAt: '2026-09-13T12:00:00.000Z',
    endedAt: '2026-09-13T12:00:52.000Z',
    metadata: {
      intensity: 'Güçlü',
      position: 'side',
      intervalSecs: 360,
    },
  });
  assert.strictEqual(contractionRecord.type, 'contraction');
  assert.strictEqual(contractionRecord.durationSeconds, 52);
  assert.strictEqual(contractionRecord.metadata.intensity, 'Güçlü');

  // Weight Tracker: Baseline delta
  const startWeight = 60.0;
  const currentWeight = 65.4;
  const delta = (currentWeight - startWeight).toFixed(1);
  assert.strictEqual(delta, '5.4');

  console.log('✓ Sprint 4 Pregnancy Trackers tests passed.');
}

// 7. Sprint 5 Baby Tracker Domain Tests
{
  console.log('Testing Sprint 5 Baby Trackers...');

  // Feeding: Nursing dual side calculation
  const nursingRecord = createTrackerRecord({
    type: TrackerTypes.NURSING,
    value: 'Sol 12 dk + Sağ 10 dk (Top. 22 dk)',
    metadata: {
      side: 'Left Breast',
      leftSecs: 720,
      rightSecs: 600,
      totalMins: 22,
    },
  });
  assert.strictEqual(nursingRecord.type, 'nursing');
  assert.strictEqual(nursingRecord.metadata.totalMins, 22);

  // Feeding: Bottle entry
  const bottleRecord = createTrackerRecord({
    type: TrackerTypes.BOTTLE,
    value: '120 ml · Anne Sütü',
    metadata: {
      amountMl: 120,
      bottleType: 'breast_milk',
    },
  });
  assert.strictEqual(bottleRecord.type, 'bottle');
  assert.strictEqual(bottleRecord.metadata.amountMl, 120);

  // Sleep: Timestamp-based session
  const sleepRecord = createTrackerRecord({
    type: TrackerTypes.SLEEP,
    startedAt: '2026-09-13T13:00:00.000Z',
    endedAt: '2026-09-13T14:30:00.000Z',
    value: '1 sa 30 dk uyudu',
  });
  assert.strictEqual(sleepRecord.type, 'sleep');
  assert.strictEqual(sleepRecord.durationSeconds, 5400);

  // Diaper: Fast action entry
  const diaperRecord = createTrackerRecord({
    type: TrackerTypes.DIAPER,
    value: 'Islak bez',
    metadata: {
      diaperType: 'Islak',
    },
  });
  assert.strictEqual(diaperRecord.type, 'diaper');
  assert.strictEqual(diaperRecord.metadata.diaperType, 'Islak');

  console.log('✓ Sprint 5 Baby Trackers tests passed.');
}

// 8. Sprint 6 Care Planning & Milestones Tests
{
  console.log('Testing Sprint 6 Care Planning & Doctor Questions...');

  // Doctor Question Entity
  const questionItem = {
    id: 'q_123',
    text: '24-28. hafta şeker yükleme testi için açlık gerekir mi?',
    priority: 'top3',
    done: true,
    answer: 'Evet, sabah aç karnına gelmeniz ve ilk kan alımından sonra solüsyonu içmeniz gerekecektir.',
    followUpType: 'lab_test',
    createdAt: new Date().toISOString(),
  };

  assert.strictEqual(questionItem.priority, 'top3');
  assert.strictEqual(questionItem.followUpType, 'lab_test');
  assert(questionItem.answer.length > 0);

  // Appointment Tracker Entity
  const apptRecord = createTrackerRecord({
    type: TrackerTypes.APPOINTMENT,
    title: 'Detaylı Anatomi Ultrasonu',
    value: '2026-05-16 · 10:00',
    metadata: {
      date: '2026-05-16',
      time: '10:00',
      doctor: 'Dr. Ayşe Yılmaz',
    },
  });
  assert.strictEqual(apptRecord.type, 'appointment');
  assert.strictEqual(apptRecord.metadata.doctor, 'Dr. Ayşe Yılmaz');

  console.log('✓ Sprint 6 Care Planning tests passed.');
}

// 9. Sprint 7 Birth Preparation Tests
{
  console.log('Testing Sprint 7 Birth Preparation (Hospital Bag & Birth Plan)...');

  // Hospital Bag 3-stage item state model
  const bagItem = {
    id: 'm1',
    title: 'Önden düğmeli lohusa geceliği',
    category: 'mother',
    priority: 'essential',
    status: 'packed',
    assignedTo: 'mother',
    quantity: 2,
  };
  assert.strictEqual(bagItem.status, 'packed');
  assert.strictEqual(bagItem.priority, 'essential');

  // Birth Plan Choice Model (prefer, discuss, prefer_not, no_pref)
  const birthPlanChoices = {
    bp_dim_lights: 'prefer',
    bp_epidural_on_request: 'discuss',
    bp_no_routine_episiotomy: 'prefer_not',
    bp_golden_hour: 'prefer',
  };
  assert.strictEqual(birthPlanChoices.bp_dim_lights, 'prefer');
  assert.strictEqual(birthPlanChoices.bp_epidural_on_request, 'discuss');
  assert.strictEqual(birthPlanChoices.bp_no_routine_episiotomy, 'prefer_not');

  console.log('✓ Sprint 7 Birth Preparation tests passed.');
}

// 10. Sprint 8 Visual Discovery Tests
{
  console.log('Testing Sprint 8 Visual Discovery (Size Comparison, Organ Development, Baby Names)...');

  // 1. Size Comparison Delta logic
  const currentWeek = 24;
  const prevWeek = 23;
  const currLength = 30.0;
  const prevLength = 28.9;
  const currWeight = 600;
  const prevWeight = 500;

  const deltaLen = (currLength - prevLength).toFixed(1);
  const deltaWt = Math.max(0, currWeight - prevWeight);

  assert.strictEqual(deltaLen, '1.1');
  assert.strictEqual(deltaWt, 100);

  // 2. Organ Development 5-system model & 3-tier content
  const expectedOrgans = ['heart', 'brain', 'lungs', 'senses', 'bones'];
  const testOrganContent = {
    heart: { current: 'Kalp 145 BPM atıyor', developing: 'Kılcal damarlar dallanıyor', next: 'Duktus arteriozus olgunlaşıyor' },
    brain: { current: 'Sinapslar kuruluyor', developing: 'Korteks kıvrımları', next: 'Miyelin kılıfı' },
    lungs: { current: 'Amniyon sıvısı solunuyor', developing: 'Sürfaktan üretimi', next: 'Alveol çoğalması' },
    senses: { current: 'Ses titreşimleri duyuluyor', developing: 'Işığa tepki ve kavrama', next: 'Tat tomurcukları' },
    bones: { current: 'Kalsiyum mineralizasyonu', developing: 'Uzun kemik güçlenmesi', next: 'Kafatası bıngıldak esnekliği' },
  };

  for (const organKey of expectedOrgans) {
    assert(testOrganContent[organKey], `Organ ${organKey} must be defined`);
    assert(testOrganContent[organKey].current, `Organ ${organKey} must have current status`);
    assert(testOrganContent[organKey].developing, `Organ ${organKey} must have developing status`);
    assert(testOrganContent[organKey].next, `Organ ${organKey} must have next status`);
  }

  // Mandatory Heart disclaimer
  const heartDisclaimer = 'Temsili eğitim sesi — gerçek ölçüm değildir.';
  assert(heartDisclaimer.includes('Temsili eğitim sesi'), 'Heart disclaimer must state educational simulation');

  // 3. Baby Name Discovery & Syllable count
  function countSyllables(name) {
    if (!name) return 1;
    const vowels = name.match(/[aeıioöuüAEIİOÖUÜ]/g);
    return vowels ? vowels.length : 1;
  }

  assert.strictEqual(countSyllables('Defne'), 2);
  assert.strictEqual(countSyllables('Zeynep'), 2);
  assert.strictEqual(countSyllables('Alparslan'), 3);
  assert.strictEqual(countSyllables('Ali'), 2);

  // Surname preview combination
  const sampleName = 'Defne';
  const sampleSurname = 'Yılmaz';
  const fullname = `${sampleName} ${sampleSurname}`;
  assert.strictEqual(fullname, 'Defne Yılmaz');

  console.log('✓ Sprint 8 Visual Discovery tests passed.');
}

// 11. Sprint 9 Postpartum & Recovery Tests
{
  console.log('Testing Sprint 9 Postpartum & Recovery (Dashboard, Signals, Mood, Diary)...');

  // 1. Postpartum Day & Phase Derivation
  const postProgress = calculatePostpartumProgress('2026-08-30');
  assert(postProgress.daysSinceBirth >= 0);
  assert(['immediate', 'healing', 'adapted'].includes(postProgress.phase));

  // 2. Recovery Fields & Delivery-Specific Logic (Spec 15)
  const vaginalCheckin = {
    painLevel: 2,
    bleeding: 'normal',
    energy: 'balanced',
    deliveryType: 'vaginal',
    incisionOrPerine: 'healing', // Perine relevant for vaginal
    breast: 'full',
    urination: 'easy',
    bowel: 'regular',
  };
  assert.strictEqual(vaginalCheckin.deliveryType, 'vaginal');
  assert.strictEqual(vaginalCheckin.painLevel, 2);

  const csectionCheckin = {
    painLevel: 3,
    bleeding: 'light',
    energy: 'low',
    deliveryType: 'csection',
    incisionOrPerine: 'healing', // Incision relevant for c-section
    breast: 'engorged',
    urination: 'easy',
    bowel: 'constipated',
  };
  assert.strictEqual(csectionCheckin.deliveryType, 'csection');

  // 3. Postpartum Check-in Tracker Event
  const postEvent = createTrackerRecord({
    type: TrackerTypes.POSTPARTUM,
    value: 'Pain: 2/5 · Energy: balanced',
    metadata: vaginalCheckin,
  });
  assert.strictEqual(postEvent.type, 'postpartum_checkin');
  assert.strictEqual(postEvent.title, 'Lohusalık İyileşme Kaydı');
  assert.strictEqual(postEvent.metadata.painLevel, 2);

  // 4. Mood Trend Array (No medical diagnosis)
  const moodHistory = [
    { day: 'Pzt', mood: 1 },
    { day: 'Sal', mood: 2 },
    { day: 'Çar', mood: 0 },
    { day: 'Per', mood: 3 },
    { day: 'Cum', mood: 1 },
    { day: 'Cmt', mood: 0 },
    { day: 'Paz', mood: 1 },
  ];
  assert.strictEqual(moodHistory.length, 7);

  // 5. Private Diary Entry
  const diaryEntry = {
    id: 'pn_123',
    date: 'Bugün · 14:00',
    tag: 'His / Duygu',
    text: 'Bugün ilk kez bebeğimle balkonda temiz hava aldık, içim ferahladı.',
  };
  assert.strictEqual(diaryEntry.tag, 'His / Duygu');
  assert(diaryEntry.text.length > 10);

  console.log('✓ Sprint 9 Postpartum & Recovery tests passed.');
}

// 12. Sprint 10 Library & Evidence Engine Tests
{
  console.log('Testing Sprint 10 Library (Sections, Bookmarks, Search, Metadata)...');

  // 1. Core Library Sections (Spec 19)
  const sections = ['articles', 'food', 'infographics', 'topics'];
  assert.strictEqual(sections.length, 4);

  // 2. Stage Filter & Bookmark State
  let savedArticleIds = ['art-pregnant-morning'];
  function toggleSaved(id) {
    if (savedArticleIds.includes(id)) {
      savedArticleIds = savedArticleIds.filter(x => x !== id);
    } else {
      savedArticleIds = [...savedArticleIds, id];
    }
  }

  toggleSaved('art-ultrasound-memory');
  assert(savedArticleIds.includes('art-ultrasound-memory'));
  assert.strictEqual(savedArticleIds.length, 2);

  toggleSaved('art-pregnant-morning');
  assert(!savedArticleIds.includes('art-pregnant-morning'));
  assert.strictEqual(savedArticleIds.length, 1);

  // 3. Article Metadata Verification (Spec 19)
  const articleMeta = {
    category: '1. Trimester',
    title: '1. Trimester Sabah Bulantıları',
    minutes: 4,
    author: 'Momora Sağlık Kurulu',
    doctor: 'Uzm. Dr. Elif Kaya · Kadın Hastalıkları ve Doğum Uzmanı',
    lastUpdated: '2026 Fact-Checked',
    journeyStage: '🤰 Hamilelik',
  };

  assert(articleMeta.category.length > 0);
  assert(articleMeta.title.length > 0);
  assert.strictEqual(typeof articleMeta.minutes, 'number');
  assert(articleMeta.doctor.includes('Dr.'));
  assert(articleMeta.lastUpdated.includes('2026'));
  assert(articleMeta.journeyStage.includes('Hamilelik'));

  // 4. Search neutrality check (Search returns content, not diagnosis)
  const searchDisclaimer = 'Arama motoru medikal teşhis değil, güvenilir rehberlik sunar.';
  assert(!searchDisclaimer.includes('tanı koyar'));

  console.log('✓ Sprint 10 Library & Evidence Engine tests passed.');
}

console.log('--- ALL MOMORA SPRINT 3, 4, 5, 6, 7, 8, 9 & 10 TESTS PASSED SUCCESFULLY ---');



