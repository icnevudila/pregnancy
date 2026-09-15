/**
 * MOMORA Unified Journey State Engine
 * Single source of truth for Pregnancy, Postpartum and Baby milestones
 * Derived from canonical dates (dueDate, birthDate) rather than hardcoded mock numbers.
 */

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const GESTATION_DAYS = 280; // 40 weeks standard reference

/**
 * Calculates current pregnancy week, day and trimester from dueDate (YYYY-MM-DD)
 */
export function calculatePregnancyProgress(dueDateStr) {
  if (!dueDateStr) {
    return { week: 24, day: 0, daysRemaining: 112, trimester: 2, percent: 60 };
  }

  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) {
    return { week: 24, day: 0, daysRemaining: 112, trimester: 2, percent: 60 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const daysRemaining = Math.round((due.getTime() - today.getTime()) / MILLIS_PER_DAY);
  const elapsedDays = Math.max(0, Math.min(GESTATION_DAYS, GESTATION_DAYS - daysRemaining));
  
  const week = Math.min(42, Math.max(1, Math.floor(elapsedDays / 7)));
  const day = elapsedDays % 7;
  const percent = Math.min(100, Math.max(0, Math.round((elapsedDays / GESTATION_DAYS) * 100)));

  let trimester = 1;
  if (week >= 28) trimester = 3;
  else if (week >= 14) trimester = 2;

  return {
    week,
    day,
    elapsedDays,
    daysRemaining: Math.max(0, daysRemaining),
    percent,
    trimester,
    isOverdue: daysRemaining < 0,
  };
}

/**
 * Calculates postpartum day and phase from birthDate (YYYY-MM-DD)
 */
export function calculatePostpartumProgress(birthDateStr) {
  if (!birthDateStr) {
    return { daysSinceBirth: 14, weeksSinceBirth: 2, phase: 'early' };
  }

  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) {
    return { daysSinceBirth: 14, weeksSinceBirth: 2, phase: 'early' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  birth.setHours(0, 0, 0, 0);

  const daysSinceBirth = Math.max(0, Math.round((today.getTime() - birth.getTime()) / MILLIS_PER_DAY));
  const weeksSinceBirth = Math.floor(daysSinceBirth / 7);

  // Phases: first 2 weeks (immediate recovery), weeks 2-6 (involution), weeks 6+ (postpartum adaptation)
  let phase = 'immediate';
  if (daysSinceBirth > 42) phase = 'adapted';
  else if (daysSinceBirth > 14) phase = 'healing';

  return {
    daysSinceBirth,
    weeksSinceBirth,
    phase,
  };
}

/**
 * Calculates human-readable baby age from birthDate
 */
export function calculateBabyAge(birthDateStr, lang = 'tr') {
  const isEn = lang === 'en';
  if (!birthDateStr) {
    return isEn ? '2 weeks old' : '2 haftalık';
  }

  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) {
    return isEn ? '2 weeks old' : '2 haftalık';
  }

  const today = new Date();
  const diffDays = Math.max(0, Math.round((today.getTime() - birth.getTime()) / MILLIS_PER_DAY));

  if (diffDays < 7) {
    return isEn ? `${diffDays} days old` : `${diffDays} günlük`;
  }
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return isEn ? `${w} weeks old` : `${w} haftalık`;
  }
  const months = Math.floor(diffDays / 30.4375);
  return isEn ? `${months} months old` : `${months} aylık`;
}

/**
 * Derives approximate estimated due date from pregnancy week and optional day
 */
export function calculateDueDateFromWeek(week = 24, day = 0) {
  const clampedWeek = Math.max(1, Math.min(42, Number(week) || 24));
  const clampedDay = Math.max(0, Math.min(6, Number(day) || 0));
  const elapsedDays = (clampedWeek * 7) + clampedDay;
  const remainingDays = GESTATION_DAYS - elapsedDays;
  const target = new Date(Date.now() + (remainingDays * MILLIS_PER_DAY));
  return target.toISOString().slice(0, 10);
}

/**
 * Unified Journey State Resolver
 * Resolves current stage, progress, milestone days and remaining time from canonical state
 */
export function resolveJourneyState(state) {
  const mode = state?.mode || 'pregnancy';
  let dueDate = state?.dueDate || state?.pregnancy?.dueDate;
  const currentWeek = Number(state?.week || state?.pregnancy?.week || 24);

  // Validate dueDate: if missing, invalid or in the past while pregnancy is active
  let isPastOrInvalid = false;
  if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    const dueTime = new Date(dueDate + 'T12:00:00Z').getTime();
    if (isNaN(dueTime) || dueTime <= Date.now()) {
      isPastOrInvalid = true;
    }
  } else {
    isPastOrInvalid = true;
  }

  if (isPastOrInvalid && currentWeek < 40) {
    dueDate = calculateDueDateFromWeek(currentWeek, 0);
  }

  const birthDate = state?.birthDate || state?.baby?.birthDate || '2026-03-01';
  let preg = calculatePregnancyProgress(dueDate);

  // Safeguard: Active pregnancy under 40 weeks should always have positive daysRemaining
  if (preg.daysRemaining <= 0 && currentWeek < 40) {
    const expectedRemaining = Math.max(1, (40 - currentWeek) * 7);
    preg = {
      ...preg,
      week: currentWeek,
      daysRemaining: expectedRemaining,
      isOverdue: false,
    };
  }

  const post = calculatePostpartumProgress(birthDate);
  const babyAge = calculateBabyAge(birthDate, state?.lang || 'tr');

  return {
    stage: mode,
    mode,
    pregnancy: preg,
    postpartum: post,
    babyAge,
    dueDate,
    birthDate,
    week: currentWeek || preg.week,
    day: preg.day,
    daysRemaining: preg.daysRemaining,
    percent: preg.percent,
    trimester: preg.trimester,
    isOverdue: preg.isOverdue,
  };
}

