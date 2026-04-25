const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns an array of Date objects for the week(s) starting from Monday.
 * @param {Date} referenceDate - Any date in the target week
 * @param {number} weekSpan - 1 or 2 weeks
 */
export function getWeekDates(referenceDate, weekSpan = 1) {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  // Adjust to Monday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7 * weekSpan; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Format a date as YYYY-MM-DD for use as storage keys.
 */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns display parts { day, date, month } for a date.
 */
export function formatDisplayDate(date) {
  return {
    day: DAY_NAMES[date.getDay()],
    date: date.getDate(),
    month: MONTH_NAMES[date.getMonth()],
  };
}

/**
 * Returns a display string for a date range (e.g., "Jan 6 – Jan 12, 2025").
 */
export function formatWeekRange(dates) {
  if (!dates.length) return '';
  const first = dates[0];
  const last = dates[dates.length - 1];
  const firstStr = `${MONTH_NAMES[first.getMonth()]} ${first.getDate()}`;
  const lastStr = `${MONTH_NAMES[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
  return `${firstStr} – ${lastStr}`;
}

/**
 * Formats a YYYY-MM-DD string as "Apr 25, 2026" for display.
 */
export function formatPostDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}
