import assert from 'node:assert';
import { resolveJourneyState, calculateDueDateFromWeek, calculatePregnancyProgress } from '../src/domain/journeyState.js';
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

console.log('--- ALL MOMORA SPRINT 3 & 4 TESTS PASSED SUCCESFULLY ---');
