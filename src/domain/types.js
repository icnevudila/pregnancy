/**
 * MOMORA Domain Types & Model Helpers
 * Based on cgpt öneri/implementation/domain_types.ts
 */

export const JourneyStages = {
  PREGNANCY: 'pregnancy',
  POSTPARTUM: 'postpartum',
  BABY: 'baby',
};

export const HouseholdRoles = {
  MOTHER: 'mother',
  FATHER: 'father',
  PARTNER: 'partner',
  CAREGIVER: 'caregiver',
};

export const TrackerEventTypes = {
  MOVEMENT: 'movement',
  CONTRACTION: 'contraction',
  WEIGHT: 'weight',
  BREASTFEEDING: 'breastfeeding',
  BOTTLE: 'bottle',
  PUMPING: 'pumping',
  SLEEP: 'sleep',
  DIAPER: 'diaper',
  POSTPARTUM_CHECKIN: 'postpartum_checkin',
  MILK_STASH: 'milk_stash',
  PARTNER_TASK: 'partner_task',
};

export const SyncStates = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
};

/**
 * Creates a unique client-side ID
 */
export function createId(prefix = 'momora') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a standardized TrackerEvent for the unified timeline
 */
export function createTrackerEvent({
  type,
  householdId = 'local',
  createdBy = 'user',
  metadata = {},
  occurredAt = new Date().toISOString(),
}) {
  return {
    id: createId('evt'),
    clientGeneratedId: createId('cli'),
    householdId,
    type,
    occurredAt,
    createdBy,
    syncState: SyncStates.PENDING,
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
