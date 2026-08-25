/**
 * Date & Time Utilities for Thai EMS System
 * Timezone: Asia/Bangkok
 * Buddhist Calendar (พ.ศ. = ค.ศ. + 543)
 */

export const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_DAY_NAMES = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ',
  'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

export const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * Returns current Date in Asia/Bangkok
 */
export function getBangkokNow() {
  return new Date();
}

/**
 * Convert Gregorian Year to Buddhist Era (พ.ศ.)
 */
export function toBuddhistYear(gregorianYear) {
  return gregorianYear + 543;
}

/**
 * Convert Buddhist Year (พ.ศ.) to Gregorian Year
 */
export function toGregorianYear(buddhistYear) {
  return buddhistYear - 543;
}

/**
 * Get number of days in a specific month & year
 * @param {number} year - Gregorian Year (e.g. 2026)
 * @param {number} month - 1-12 (1 = Jan, 12 = Dec)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Format Date string 'YYYY-MM-DD' to Thai Full Text (e.g. '25 สิงหาคม 2569')
 */
export function formatThaiDate(dateString) {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const thaiMonth = THAI_MONTH_NAMES[month - 1] || '';
  const thaiYear = toBuddhistYear(year);

  return `${day} ${thaiMonth} ${thaiYear}`;
}

/**
 * Format Date string 'YYYY-MM-DD' to Thai Short Text (e.g. '25 ส.ค. 69')
 */
export function formatThaiDateShort(dateString) {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const thaiMonth = THAI_MONTH_SHORT[month - 1] || '';
  const thaiYearShort = (toBuddhistYear(year) % 100).toString().padStart(2, '0');

  return `${day} ${thaiMonth} ${thaiYearShort}`;
}

/**
 * Format Full Realtime Banner Text:
 * e.g. "วันอังคารที่ 25 สิงหาคม 2569" and "14:44:32 น."
 */
export function getFormattedLiveDateTime(dateObj = new Date()) {
  const dayOfWeek = THAI_DAY_NAMES[dateObj.getDay()];
  const day = dateObj.getDate();
  const month = THAI_MONTH_NAMES[dateObj.getMonth()];
  const year = toBuddhistYear(dateObj.getFullYear());

  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');

  return {
    fullDateText: `${dayOfWeek}ที่ ${day} ${month} ${year}`,
    timeText: `${hours}:${minutes}:${seconds} น.`,
    dayOfWeek,
    day,
    monthName: month,
    buddhistYear: year,
    gregorianYear: dateObj.getFullYear(),
    monthNumber: dateObj.getMonth() + 1,
    isoDate: `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  };
}

/**
 * Generate selectable months and years for dropdown
 */
export function getMonthYearOptions(currentYear = new Date().getFullYear(), rangeYears = 2) {
  const options = [];
  const startYear = currentYear - 1;
  const endYear = currentYear + rangeYears;

  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const thaiYear = toBuddhistYear(y);
      const thaiMonth = THAI_MONTH_NAMES[m - 1];
      options.push({
        value: `${y}-${m.toString().padStart(2, '0')}`,
        year: y,
        buddhistYear: thaiYear,
        month: m,
        label: `${thaiMonth} ${thaiYear}`
      });
    }
  }
  return options;
}

/**
 * Format time only (HH:MM น.)
 */
export function formatThaiTime(timestamp) {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return timestamp;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} น.`;
}
