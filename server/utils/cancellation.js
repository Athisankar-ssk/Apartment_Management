// Utility helpers for booking cancellation rules

export function getStartDateTime(dateStr, timeStr) {
  // dateStr expected 'YYYY-MM-DD', timeStr expected 'HH:MM'
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function canCancelBefore(dateStr, timeStr, cutoffMinutes = 20) {
  const start = getStartDateTime(dateStr, timeStr);
  const cutoff = new Date(start.getTime() - cutoffMinutes * 60 * 1000);
  return new Date() < cutoff;
}

export default {
  getStartDateTime,
  canCancelBefore
};
