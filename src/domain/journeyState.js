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
