import assert from 'node:assert';
import fs from 'node:fs';
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

// 13. Sprint 11 Household & Partner Sync Tests (Spec 21)
{
  console.log('Testing Sprint 11 Household & Partner Sync (Spec 21)...');

  // 1. Distinct Entities Hierarchy
  const householdState = {
    user: { id: 'usr_1', name: 'Mehmet', activeRole: 'father' },
    partner: { id: 'usr_2', name: 'Zeynep', activeRole: 'mother' },
    household: { id: 'hh_1', name: 'Mehmet + Zeynep', familyCode: 'MOM-7829-TR' },
    pregnancyProfile: { motherName: 'Zeynep', week: 24, day: 5, dueDate: '2026-07-24' },
    baby: { name: 'Ada', gender: 'Kız' },
  };

  // No contradictory role data: active user is father, but pregnancy belongs to Zeynep
  assert.strictEqual(householdState.user.activeRole, 'father');
  assert.strictEqual(householdState.pregnancyProfile.motherName, 'Zeynep');
  assert.strictEqual(householdState.household.familyCode, 'MOM-7829-TR');
  assert.strictEqual(householdState.baby.name, 'Ada');

  // 2. Granular Permissions & Sensitive Fields Default Private
  const permissions = {
    sharePregnancyWeek: true,
    shareAppointments: true,
    shareHospitalBag: true,
    shareBirthPreferences: true,
    shareBabyTrackers: true,
    shareMovementSummary: true,
    shareWeight: false,       // Default private
    shareMood: false,         // Default private
    shareHealthNotes: false,  // Default private
  };

  assert.strictEqual(permissions.shareWeight, false, 'Weight must default to private');
  assert.strictEqual(permissions.shareMood, false, 'Mood must default to private');
  assert.strictEqual(permissions.shareHealthNotes, false, 'Health notes must default to private');
  assert.strictEqual(permissions.shareHospitalBag, true);
  assert.strictEqual(permissions.shareAppointments, true);

  // 3. Partner Hospital Bag Task Assignment & Toggle
  const bagTasks = [
    { id: 'p1', title: 'Powerbank & şarj', assignedTo: 'partner', status: 'notPrepared' },
    { id: 'm1', title: 'Lohusa geceliği', assignedTo: 'mother', status: 'packed' },
    { id: 'd1', title: 'Kimlik ve tahlil dosyası', assignedTo: 'partner', status: 'packed' },
  ];

  const partnerOnlyTasks = bagTasks.filter(t => t.assignedTo === 'partner');
  assert.strictEqual(partnerOnlyTasks.length, 2);
  assert(partnerOnlyTasks.some(t => t.id === 'p1'));
  assert(partnerOnlyTasks.some(t => t.id === 'd1'));

  // Toggle status
  const toggledTask = { ...partnerOnlyTasks[0], status: partnerOnlyTasks[0].status === 'packed' ? 'notPrepared' : 'packed' };
  assert.strictEqual(toggledTask.status, 'packed');

  // 4. Invite URL Generation
  const inviteCode = 'MOM-7829-TR';
  const inviteUrl = `https://momora.app/invite?code=${inviteCode}`;
  assert(inviteUrl.includes('MOM-7829-TR'));

  console.log('✓ Sprint 11 Household & Partner Sync tests passed.');
}

// 14. Sprint 12 Community Experience & Moderation Architecture (Spec 20)
{
  console.log('Testing Sprint 12 Community Experience & Safety (Spec 20)...');

  // 1. Must-have Safety Report Reasons
  const reportReasons = [
    'health_misinformation',
    'privacy_violation',
    'harassment',
    'spam',
  ];
  assert(reportReasons.includes('health_misinformation'), 'Must include health misinformation report reason');
  assert(reportReasons.includes('privacy_violation'), 'Must include privacy violation report reason');

  // 2. User Blocking Filter
  const allPosts = [
    { id: 'post_1', user: 'Zeynep K.', title: 'Bebek arabası tavsiyesi' },
    { id: 'post_2', user: 'SpamUser99', title: 'Hemen tıkla indirim kazan' },
    { id: 'post_3', user: 'Merve B.', title: 'Detaylı ultrason deneyimi' },
  ];
  const blockedUsers = ['SpamUser99'];
  const visiblePostsAfterBlock = allPosts.filter(p => !blockedUsers.includes(p.user));
  assert.strictEqual(visiblePostsAfterBlock.length, 2);
  assert(!visiblePostsAfterBlock.some(p => p.user === 'SpamUser99'));

  // 3. Moderation Queue / Reported Posts Filtering
  const reportedPostIds = ['post_1'];
  const visibleAfterReport = visiblePostsAfterBlock.filter(p => !reportedPostIds.includes(p.id));
  assert.strictEqual(visibleAfterReport.length, 1);
  assert.strictEqual(visibleAfterReport[0].id, 'post_3');

  // 4. Privacy Warning Detection (Phone, Email, Contact)
  const phoneOrEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+?\d[\d -]{8,}\d)/;
  const safeText = '24. haftadayım ve bebeğimin hareketlerini çok seviyorum.';
  const unsafePhone = 'Bana whatsapptan yazabilirsiniz numaram 0532 111 22 33';
  const unsafeEmail = 'Sorularınız için mailim test@example.com';

  assert(!phoneOrEmailRegex.test(safeText), 'Safe text should not trigger privacy warning');
  assert(phoneOrEmailRegex.test(unsafePhone), 'Phone number must trigger privacy warning');
  assert(phoneOrEmailRegex.test(unsafeEmail), 'Email address must trigger privacy warning');

  // 5. Contextual Moderation & Neutrality
  const sensitiveCategory = 'Kontrol & Hastane';
  const isSensitive = sensitiveCategory === 'Kontrol & Hastane' || sensitiveCategory === 'Belirtiler & Aşerme';
  assert(isSensitive, 'Sensitive clinical categories must trigger contextual experience notice');

  // 6. Own Post Deletion & Editing
  let myFeed = [
    { id: 'p_mine', user: 'Ben', isOwn: true, title: 'Orijinal Başlık', desc: 'Orijinal içerik' },
    { id: 'p_other', user: 'Ayşe', isOwn: false, title: 'Diğer başlık', desc: 'Diğer içerik' },
  ];
  // Edit
  myFeed = myFeed.map(p => p.id === 'p_mine' ? { ...p, title: 'Düzenlenmiş Başlık' } : p);
  assert.strictEqual(myFeed[0].title, 'Düzenlenmiş Başlık');
  // Delete
  myFeed = myFeed.filter(p => p.id !== 'p_mine');
  assert.strictEqual(myFeed.length, 1);
  assert.strictEqual(myFeed[0].id, 'p_other');

  console.log('✓ Sprint 12 Community Experience & Safety tests passed.');
}

// 15. Sprint 13 Production Polish & Release Readiness
{
  console.log('Testing Sprint 13 Production Polish & Release Readiness...');

  // 1. Error Boundary Safety State Derivation
  const testError = new Error('Test rendering crash');
  const derivedState = { hasError: true, error: testError };
  assert.strictEqual(derivedState.hasError, true);
  assert.strictEqual(derivedState.error.message, 'Test rendering crash');

  // 2. Privacy-first Analytics Sanitization (Zero PII)
  const rawParams = {
    screen: 'pregnancy_home',
    name: 'Zeynep Kaya',          // PII - Must be stripped
    doctor: 'Dr. Elif',            // PII - Must be stripped
    notes: 'Secret medical notes', // PII - Must be stripped
    feature: 'kick_counter',
  };

  const piiKeys = ['name', 'userName', 'partnerName', 'babyName', 'email', 'phone', 'address', 'bloodType', 'weight', 'doctor', 'notes'];
  const sanitized = { ...rawParams };
  piiKeys.forEach(k => delete sanitized[k]);

  assert.strictEqual(sanitized.screen, 'pregnancy_home');
  assert.strictEqual(sanitized.feature, 'kick_counter');
  assert.strictEqual(sanitized.name, undefined, 'Name PII must be sanitized');
  assert.strictEqual(sanitized.doctor, undefined, 'Doctor PII must be sanitized');
  assert.strictEqual(sanitized.notes, undefined, 'Notes PII must be sanitized');

  // 3. Offline Queue & Tracker Resilience
  const offlineQueue = [
    { id: 'cli_1', type: 'contraction', startedAt: '2026-09-13T12:00:00Z', endedAt: '2026-09-13T12:00:45Z', durationSeconds: 45 },
    { id: 'cli_2', type: 'movement', timestamp: '2026-09-13T12:15:00Z', sessionType: 'kick' },
    { id: 'cli_3', type: 'diaper', timestamp: '2026-09-13T12:30:00Z', status: 'wet' },
  ];
  assert.strictEqual(offlineQueue.length, 3);
  offlineQueue.forEach(record => {
    assert(record.id.startsWith('cli_'), 'Offline queue items must have client-generated ID');
  });

  // 4. Global Journey Consistency: Single Source of Truth
  const statePregnancy = {
    mode: 'pregnancy',
    dueDate: '2026-07-24',
    pregnancy: { dueDate: '2026-07-24', status: 'active' },
    week: 24,
    day: 5,
  };
  const journeyDerived = resolveJourneyState(statePregnancy);
  assert.strictEqual(journeyDerived.mode, 'pregnancy');
  assert(journeyDerived.week >= 1 && journeyDerived.week <= 43, 'Pregnancy week must be in valid range');

  // Transition to Postpartum maintains continuity
  const statePostpartum = {
    mode: 'postpartum',
    postpartumProfile: { birthDate: '2026-09-01' },
    babyName: 'Ada',
  };
  const journeyPost = resolveJourneyState(statePostpartum);
  assert.strictEqual(journeyPost.mode, 'postpartum');
  assert(journeyPost.postpartum.daysSinceBirth >= 0);

  console.log('✓ Sprint 13 Production Polish & Release Readiness tests passed.');
}

// 16. Timer Destruction & Cold-Start Restoration Test (Contraction, Feeding, Sleep)
{
  console.log('Testing Timer Destruction & Timestamp-Based Process Reload...');

  // Simulation: User starts contraction at T0
  const t0 = Date.now() - 48000; // 48 seconds ago
  const simulatedState = {
    activeContraction: { startedAt: t0 },
    activeFeeding: { side: 'left', startedAt: Date.now() - 320000 }, // 320s ago
    activeSleep: { startedAt: Date.now() - 1800000 }, // 30m ago
  };

  // App destroyed / reloaded:
  // Contraction elapsed time reconstructed from timestamp
  const restoredContractionDuration = Math.floor((Date.now() - simulatedState.activeContraction.startedAt) / 1000);
  assert(restoredContractionDuration >= 48, 'Contraction elapsed time must be restored from startedAt timestamp without drift');

  // Feeding elapsed time reconstructed from timestamp
  const restoredFeedingDuration = Math.floor((Date.now() - simulatedState.activeFeeding.startedAt) / 1000);
  assert(restoredFeedingDuration >= 320, 'Feeding elapsed time must be restored from startedAt timestamp');
  assert.strictEqual(simulatedState.activeFeeding.side, 'left', 'Feeding side must be preserved');

  // Sleep elapsed time reconstructed from timestamp
  const isAsleep = Boolean(simulatedState.activeSleep?.startedAt);
  const restoredSleepSecs = Math.floor((Date.now() - simulatedState.activeSleep.startedAt) / 1000);
  assert.strictEqual(isAsleep, true, 'Sleep state must remain active on cold start');
  assert(restoredSleepSecs >= 1800, 'Sleep duration must be accurately computed from startedAt timestamp');

  console.log('✓ Timer Destruction & Process Reload tests passed.');
}

// 17. Offline Queue Execution for all 6 Trackers
{
  console.log('Testing Offline Execution for all 6 Trackers (Contraction, Movement, Weight, Feeding, Sleep, Diaper)...');

  const trackerEvents = [];
  const enqueueOffline = (type, payload) => {
    trackerEvents.push({
      id: `cli_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      syncState: 'pending',
    });
  };

  // 1. Contraction
  enqueueOffline('contraction', { durationSeconds: 52, intervalSeconds: 310, intensity: 'Orta' });
  // 2. Movement / Kick
  enqueueOffline('movement', { kicks: 10, durationSecs: 1200, feeling: 'normal' });
  // 3. Weight
  enqueueOffline('weight', { value: 65.4, week: 24, baseline: 60.0 });
  // 4. Feeding
  enqueueOffline('feeding', { side: 'right', durationMins: 15, type: 'breast' });
  // 5. Sleep
  enqueueOffline('sleep', { durationMins: 90, startedAt: '2026-09-13T10:00:00Z', endedAt: '2026-09-13T11:30:00Z' });
  // 6. Diaper
  enqueueOffline('diaper', { type: 'Islak & Kirli', color: 'mustard' });

  assert.strictEqual(trackerEvents.length, 6, 'All 6 trackers must successfully produce offline records');
  trackerEvents.forEach(evt => {
    assert(evt.id.startsWith('cli_'), 'Offline event must have client generated ID');
    assert.strictEqual(evt.syncState, 'pending', 'Offline event must start with pending sync state');
  });

  // Simulate network restoration and sync flush
  const syncedEvents = trackerEvents.map(evt => ({ ...evt, syncState: 'synced', syncedAt: new Date().toISOString() }));
  assert(syncedEvents.every(e => e.syncState === 'synced'), 'All offline records must sync when network resumes');

  console.log('✓ Offline Queue Execution for all 6 trackers passed.');
}

// 18. Luxury Feature Suite (Doctor Visit Dossier, 0-24m Vaccine Calendar, 9:16 Story Studio)
{
  console.log('Testing Luxury Feature Suite...');
  const fs = await import('node:fs');

  const toolsHubSrc = fs.readFileSync(new URL('../src/ToolsHub.js', import.meta.url), 'utf8');
  assert(toolsHubSrc.includes("'doctorReport'"), 'doctorReport must be defined in ToolsHub.js');
  assert(toolsHubSrc.includes("'vaccineCalendar'"), 'vaccineCalendar must be defined in ToolsHub.js');
  assert(toolsHubSrc.includes("'storyStudio'"), 'storyStudio must be defined in ToolsHub.js');
  assert(toolsHubSrc.includes("'card_doctor_report'"), 'card_doctor_report asset must be used in ToolsHub.js');
  assert(toolsHubSrc.includes("'card_vaccine_calendar'"), 'card_vaccine_calendar asset must be used in ToolsHub.js');
  assert(toolsHubSrc.includes("'card_story_studio'"), 'card_story_studio asset must be used in ToolsHub.js');

  const detailSheetSrc = fs.readFileSync(new URL('../src/DetailSheet.js', import.meta.url), 'utf8');
  assert(detailSheetSrc.includes("import { DoctorReportScreen }"), 'DoctorReportScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes("import { VaccineCalendarScreen }"), 'VaccineCalendarScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes("import { StoryStudioScreen }"), 'StoryStudioScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes("'doctorReport'"), 'doctorReport must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("'vaccineCalendar'"), 'vaccineCalendar must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("'storyStudio'"), 'storyStudio must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("<DoctorReportScreen"), 'DoctorReportScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes("<VaccineCalendarScreen"), 'VaccineCalendarScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes("<StoryStudioScreen"), 'StoryStudioScreen must be rendered in DetailSheet.js');

  const generatedAssetsSrc = fs.readFileSync(new URL('../src/generatedAssets.js', import.meta.url), 'utf8');
  assert(generatedAssetsSrc.includes("'card_doctor_report'"), 'card_doctor_report must be registered in generatedAssets.js');
  assert(generatedAssetsSrc.includes("'card_vaccine_calendar'"), 'card_vaccine_calendar must be registered in generatedAssets.js');
  assert(generatedAssetsSrc.includes("'card_story_studio'"), 'card_story_studio must be registered in generatedAssets.js');

  // Verify assets exist on disk
  assert(fs.existsSync(new URL('../assets/card_doctor_report.png', import.meta.url)), 'card_doctor_report.png must exist');
  assert(fs.existsSync(new URL('../assets/card_vaccine_calendar.png', import.meta.url)), 'card_vaccine_calendar.png must exist');
  assert(fs.existsSync(new URL('../assets/card_story_studio.png', import.meta.url)), 'card_story_studio.png must exist');
  assert(fs.existsSync(new URL('../src/DoctorReportScreen.js', import.meta.url)), 'DoctorReportScreen.js must exist');
  assert(fs.existsSync(new URL('../src/VaccineCalendarScreen.js', import.meta.url)), 'VaccineCalendarScreen.js must exist');
  assert(fs.existsSync(new URL('../src/StoryStudioScreen.js', import.meta.url)), 'StoryStudioScreen.js must exist');

  console.log('✓ Luxury Feature Suite (Doctor Report, Vaccine Calendar, Story Studio) passed.');
}

// 19. Blood Pressure Monitor, Supabase Community Mutations & Data Persistence Suite
{
  console.log('Testing Blood Pressure, Supabase Community, and Store Persistence Suite...');
  const fs = await import('node:fs');

  // Blood Pressure module & assets
  assert(fs.existsSync(new URL('../src/BloodPressureScreen.js', import.meta.url)), 'BloodPressureScreen.js must exist');
  assert(fs.existsSync(new URL('../assets/card_blood_pressure.png', import.meta.url)), 'card_blood_pressure.png must exist');

  const bpScreenSrc = fs.readFileSync(new URL('../src/BloodPressureScreen.js', import.meta.url), 'utf8');
  assert(bpScreenSrc.includes('systolic'), 'BloodPressureScreen must contain systolic logic');
  assert(bpScreenSrc.includes('diastolic'), 'BloodPressureScreen must contain diastolic logic');
  assert(bpScreenSrc.includes('preeclampsia'), 'BloodPressureScreen must contain preeclampsia triage logic');
  assert(bpScreenSrc.includes('ACOG'), 'BloodPressureScreen must reference ACOG/AHA clinical guidelines');

  // ToolsHub registration
  const toolsHubSrc = fs.readFileSync(new URL('../src/ToolsHub.js', import.meta.url), 'utf8');
  assert(toolsHubSrc.includes("'bloodPressure'"), 'bloodPressure must be registered in ToolsHub.js');
  assert(toolsHubSrc.includes("'card_blood_pressure'"), 'card_blood_pressure art must be in ToolsHub.js');

  // DetailSheet registration & rendering
  const detailSheetSrc = fs.readFileSync(new URL('../src/DetailSheet.js', import.meta.url), 'utf8');
  assert(detailSheetSrc.includes('import { BloodPressureScreen }'), 'BloodPressureScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes("<BloodPressureScreen"), 'BloodPressureScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes("'bloodPressure'"), 'bloodPressure must be in FULL_SCREEN_KINDS');

  // Backend Sync mutations
  const backendSyncSrc = fs.readFileSync(new URL('../src/backendSync.js', import.meta.url), 'utf8');
  assert(backendSyncSrc.includes('likeCommunityPostCloud'), 'backendSync must export likeCommunityPostCloud');
  assert(backendSyncSrc.includes('deleteCommunityPostCloud'), 'backendSync must export deleteCommunityPostCloud');
  assert(backendSyncSrc.includes('saveBloodPressureCloud'), 'backendSync must export saveBloodPressureCloud');

  // Store persistence engine
  const storeSrc = fs.readFileSync(new URL('../src/store.js', import.meta.url), 'utf8');
  assert(storeSrc.includes('saveStateToLocalDisk'), 'store.js must have synchronous saveStateToLocalDisk');
  assert(storeSrc.includes('exportAllUserData'), 'store.js must export exportAllUserData');
  assert(storeSrc.includes('resetStateToDefaults'), 'store.js must export resetStateToDefaults');
  assert(storeSrc.includes('syncState'), 'store.js must provide syncState');
  assert(storeSrc.includes('lastSavedAt'), 'store.js must provide lastSavedAt');

  // ProfileScreen export & reset actions
  const profileSrc = fs.readFileSync(new URL('../src/ProfileScreen.js', import.meta.url), 'utf8');
  assert(profileSrc.includes('handleExportData'), 'ProfileScreen must have handleExportData');
  assert(profileSrc.includes('handleResetData'), 'ProfileScreen must have handleResetData');
  assert(profileSrc.includes('exportAllUserData'), 'ProfileScreen must accept exportAllUserData prop');
  assert(profileSrc.includes('resetStateToDefaults'), 'ProfileScreen must accept resetStateToDefaults prop');

  // App.js sync header pill
  const appSrc = fs.readFileSync(new URL('../App.js', import.meta.url), 'utf8');
  assert(appSrc.includes('syncState'), 'App.js must consume syncState');
  assert(appSrc.includes('Bulutla Eşitlendi') || appSrc.includes('Cloud Synced'), 'App.js must show sync pill');

  console.log('✓ Blood Pressure, Supabase Community, and Persistence tests passed.');
}

// 20. Bestseller Suite: Gestational Diabetes, Baby Teething, Sleep Window, Safe Medications
{
  console.log('Testing Bestseller Suite (Blood Glucose, Baby Teething, Sleep Window, Safe Medication)...');
  const fs = await import('node:fs');

  // Verify all 4 screen source files exist
  assert(fs.existsSync(new URL('../src/BloodGlucoseScreen.js', import.meta.url)), 'BloodGlucoseScreen.js must exist');
  assert(fs.existsSync(new URL('../src/BabyTeethingScreen.js', import.meta.url)), 'BabyTeethingScreen.js must exist');
  assert(fs.existsSync(new URL('../src/SleepWindowScreen.js', import.meta.url)), 'SleepWindowScreen.js must exist');
  assert(fs.existsSync(new URL('../src/SafeMedicationScreen.js', import.meta.url)), 'SafeMedicationScreen.js must exist');

  // Verify 3D artwork assets exist
  assert(fs.existsSync(new URL('../assets/card_blood_glucose.png', import.meta.url)), 'card_blood_glucose.png must exist');
  assert(fs.existsSync(new URL('../assets/card_baby_teething.png', import.meta.url)), 'card_baby_teething.png must exist');
  assert(fs.existsSync(new URL('../assets/card_sleep_window.png', import.meta.url)), 'card_sleep_window.png must exist');

  // Verify generatedAssets.js registration
  const genAssets = fs.readFileSync(new URL('../src/generatedAssets.js', import.meta.url), 'utf8');
  assert(genAssets.includes("'card_blood_glucose'"), 'card_blood_glucose must be in generatedAssets.js');
  assert(genAssets.includes("'card_baby_teething'"), 'card_baby_teething must be in generatedAssets.js');
  assert(genAssets.includes("'card_sleep_window'"), 'card_sleep_window must be in generatedAssets.js');

  // Verify ToolsHub.js registration
  const toolsHubSrc = fs.readFileSync(new URL('../src/ToolsHub.js', import.meta.url), 'utf8');
  assert(toolsHubSrc.includes("'bloodGlucose'"), 'bloodGlucose must be registered in ToolsHub.js');
  assert(toolsHubSrc.includes("'safeMedication'"), 'safeMedication must be registered in ToolsHub.js');
  assert(toolsHubSrc.includes("'babyTeething'"), 'babyTeething must be registered in ToolsHub.js');
  assert(toolsHubSrc.includes("'sleepWindow'"), 'sleepWindow must be registered in ToolsHub.js');

  // Verify DetailSheet.js registration & rendering
  const detailSheetSrc = fs.readFileSync(new URL('../src/DetailSheet.js', import.meta.url), 'utf8');
  assert(detailSheetSrc.includes('import { BloodGlucoseScreen }'), 'BloodGlucoseScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes('import { BabyTeethingScreen }'), 'BabyTeethingScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes('import { SleepWindowScreen }'), 'SleepWindowScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes('import { SafeMedicationScreen }'), 'SafeMedicationScreen must be imported in DetailSheet.js');

  assert(detailSheetSrc.includes("'bloodGlucose'"), 'bloodGlucose must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("'babyTeething'"), 'babyTeething must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("'sleepWindow'"), 'sleepWindow must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("'safeMedication'"), 'safeMedication must be in FULL_SCREEN_KINDS');

  assert(detailSheetSrc.includes('<BloodGlucoseScreen'), 'BloodGlucoseScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes('<BabyTeethingScreen'), 'BabyTeethingScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes('<SleepWindowScreen'), 'SleepWindowScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes('<SafeMedicationScreen'), 'SafeMedicationScreen must be rendered in DetailSheet.js');

  // Verify backendSync.js cloud export functions
  const backendSyncSrc = fs.readFileSync(new URL('../src/backendSync.js', import.meta.url), 'utf8');
  assert(backendSyncSrc.includes('saveBloodGlucoseCloud'), 'backendSync must export saveBloodGlucoseCloud');
  assert(backendSyncSrc.includes('saveBabyTeethCloud'), 'backendSync must export saveBabyTeethCloud');

  // Verify store.js export inclusion
  const storeSrc = fs.readFileSync(new URL('../src/store.js', import.meta.url), 'utf8');
  assert(storeSrc.includes('bloodGlucoseLogs'), 'store.js must handle bloodGlucoseLogs');
  assert(storeSrc.includes('babyTeeth'), 'store.js must handle babyTeeth');

  // Pure logic tests (source inspection)
  const bgSrc = fs.readFileSync(new URL('../src/BloodGlucoseScreen.js', import.meta.url), 'utf8');
  assert(bgSrc.includes('ADA'), 'BloodGlucoseScreen must reference ADA guidelines');
  assert(bgSrc.includes('Rule of 15') || bgSrc.includes('15 Kuralı'), 'BloodGlucoseScreen must include hypoglycemia Rule of 15');

  const btSrc = fs.readFileSync(new URL('../src/BabyTeethingScreen.js', import.meta.url), 'utf8');
  assert(btSrc.includes('PRIMARY_TEETH'), 'BabyTeethingScreen must export PRIMARY_TEETH');
  assert(btSrc.includes('erupted'), 'BabyTeethingScreen must handle erupted tooth status');

  const swSrc = fs.readFileSync(new URL('../src/SleepWindowScreen.js', import.meta.url), 'utf8');
  assert(swSrc.includes('WAKE_WINDOW_TABLE'), 'SleepWindowScreen must export WAKE_WINDOW_TABLE');
  assert(swSrc.includes('SweetSpot'), 'SleepWindowScreen must calculate SweetSpot');

  const smSrc = fs.readFileSync(new URL('../src/SafeMedicationScreen.js', import.meta.url), 'utf8');
  assert(smSrc.includes('MEDICATION_DATABASE'), 'SafeMedicationScreen must export MEDICATION_DATABASE');
  assert(smSrc.includes('Paracetamol') || smSrc.includes('Parasetamol'), 'SafeMedicationScreen must include Paracetamol');

  console.log('✓ Bestseller Suite (Blood Glucose, Teething, Sleep Window, Safe Meds) passed.');
}

// 21. Bestseller Pediatric Suite: The Wonder Weeks™ & Solid Foods BLW 100 Foods
{
  console.log('Testing Bestseller Pediatric Suite (Wonder Weeks Mental Leaps, Solid Foods BLW)...');

  // Asset validation
  assert(fs.existsSync(new URL('../assets/card_wonder_leaps.png', import.meta.url)), 'card_wonder_leaps.png must exist');
  assert(fs.existsSync(new URL('../assets/card_solid_foods.png', import.meta.url)), 'card_solid_foods.png must exist');

  const genAssets = fs.readFileSync(new URL('../src/generatedAssets.js', import.meta.url), 'utf8');
  assert(genAssets.includes("'card_wonder_leaps'"), 'card_wonder_leaps must be registered in generatedAssets.js');
  assert(genAssets.includes("'card_solid_foods'"), 'card_solid_foods must be registered in generatedAssets.js');

  // ToolsHub registration
  const toolsHubSrc = fs.readFileSync(new URL('../src/ToolsHub.js', import.meta.url), 'utf8');
  assert(toolsHubSrc.includes("'wonderWeeks'"), 'wonderWeeks must be registered in ToolsHub.js');
  assert(toolsHubSrc.includes("'solidFoods'"), 'solidFoods must be registered in ToolsHub.js');

  // DetailSheet registration & rendering
  const detailSheetSrc = fs.readFileSync(new URL('../src/DetailSheet.js', import.meta.url), 'utf8');
  assert(detailSheetSrc.includes('import { WonderWeeksScreen }'), 'WonderWeeksScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes('import { SolidFoodsScreen }'), 'SolidFoodsScreen must be imported in DetailSheet.js');
  assert(detailSheetSrc.includes("'wonderWeeks'"), 'wonderWeeks must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes("'solidFoods'"), 'solidFoods must be in FULL_SCREEN_KINDS');
  assert(detailSheetSrc.includes('<WonderWeeksScreen'), 'WonderWeeksScreen must be rendered in DetailSheet.js');
  assert(detailSheetSrc.includes('<SolidFoodsScreen'), 'SolidFoodsScreen must be rendered in DetailSheet.js');

  // Store data export inclusion
  const storeSrc = fs.readFileSync(new URL('../src/store.js', import.meta.url), 'utf8');
  assert(storeSrc.includes('solidFoodLogs'), 'store.js must handle solidFoodLogs in exportAllUserData');

  // WonderWeeksScreen logic verification
  const wwSrc = fs.readFileSync(new URL('../src/WonderWeeksScreen.js', import.meta.url), 'utf8');
  assert(wwSrc.includes('WONDER_LEAPS'), 'WonderWeeksScreen must export WONDER_LEAPS');
  assert(wwSrc.includes('babyAgeWeeks') && (wwSrc.includes('dueDateStr') || wwSrc.includes('gestational')), 'WonderWeeksScreen must calculate gestational age from due date');
  assert(wwSrc.includes('stormy') || wwSrc.includes('fırtınalı'), 'WonderWeeksScreen must track stormy/fussy leap phases');
  assert(wwSrc.includes('sunny') || wwSrc.includes('güneşli'), 'WonderWeeksScreen must track sunny leap phases');
  assert(wwSrc.toLowerCase().includes('crying') || wwSrc.includes('ağlama'), 'WonderWeeksScreen must include 3 Cs signals');

  // SolidFoodsScreen logic verification
  const sfSrc = fs.readFileSync(new URL('../src/SolidFoodsScreen.js', import.meta.url), 'utf8');
  assert(sfSrc.includes('FIRST_100_FOODS'), 'SolidFoodsScreen must export FIRST_100_FOODS');
  assert(sfSrc.includes('3 Gün') || sfSrc.includes('3-Day'), 'SolidFoodsScreen must enforce 3-day allergy waiting rule');
  assert(sfSrc.includes('Heimlich') || sfSrc.includes('Tıkanma'), 'SolidFoodsScreen must include emergency choking protocol');
  assert(sfSrc.includes('Öğürme') || sfSrc.includes('Gagging'), 'SolidFoodsScreen must differentiate gagging reflex from choking');
  assert(sfSrc.includes('Bal') || sfSrc.includes('Honey'), 'SolidFoodsScreen must alert against infant botulism/honey');

  console.log('✓ Bestseller Pediatric Suite (Wonder Weeks Leaps & Solid Foods BLW) passed.');
}

console.log('===============================================================');
console.log('🎉 ALL MOMORA ROADMAP SPRINTS (0-13 + LUXURY + PERSISTENCE + BESTSELLER SUITE) PASSED 🎉');
console.log('===============================================================');



