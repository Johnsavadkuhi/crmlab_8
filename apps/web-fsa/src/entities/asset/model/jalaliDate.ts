const JALALI_BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262,
  2324, 2394, 2456, 3178,
] as const;

type DateParts = {
  year: number;
  month: number;
  day: number;
};

const divide = (value: number, divisor: number) => Math.trunc(value / divisor);
const modulo = (value: number, divisor: number) =>
  value - divide(value, divisor) * divisor;

function jalaliCalendar(year: number) {
  const gregorianYear = year + 621;
  let leapJalali = -14;
  let previousBreak: number = JALALI_BREAKS[0];
  let jump = 0;

  if (year < previousBreak || year >= JALALI_BREAKS[JALALI_BREAKS.length - 1]) {
    throw new RangeError("Jalali year is outside the supported range.");
  }

  for (let index = 1; index < JALALI_BREAKS.length; index += 1) {
    const currentBreak = JALALI_BREAKS[index];
    jump = currentBreak - previousBreak;
    if (year < currentBreak) break;
    leapJalali += divide(jump, 33) * 8 + divide(modulo(jump, 33), 4);
    previousBreak = currentBreak;
  }

  let offset = year - previousBreak;
  leapJalali += divide(offset, 33) * 8 + divide(modulo(offset, 33) + 3, 4);
  if (modulo(jump, 33) === 4 && jump - offset === 4) leapJalali += 1;

  const leapGregorian =
    divide(gregorianYear, 4) - divide((divide(gregorianYear, 100) + 1) * 3, 4) - 150;
  const marchDay = 20 + leapJalali - leapGregorian;

  if (jump - offset < 6) {
    offset = offset - jump + divide(jump + 4, 33) * 33;
  }

  let leap = modulo(modulo(offset + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { gregorianYear, marchDay, leap };
}

function gregorianToDayNumber(year: number, month: number, day: number) {
  let dayNumber =
    divide((year + divide(month - 8, 6) + 100_100) * 1461, 4) +
    divide(153 * modulo(month + 9, 12) + 2, 5) +
    day -
    34_840_408;
  dayNumber =
    dayNumber - divide(divide(year + 100_100 + divide(month - 8, 6), 100) * 3, 4) + 752;
  return dayNumber;
}

function dayNumberToGregorian(dayNumber: number): DateParts {
  let value = 4 * dayNumber + 139_361_631;
  value = value + divide(divide(4 * dayNumber + 183_187_720, 146_097) * 3, 4) * 4 - 3908;
  const monthValue = divide(modulo(value, 1461), 4) * 5 + 308;
  const day = divide(modulo(monthValue, 153), 5) + 1;
  const month = modulo(divide(monthValue, 153), 12) + 1;
  const year = divide(value, 1461) - 100_100 + divide(8 - month, 6);
  return { year, month, day };
}

function jalaliToDayNumber(year: number, month: number, day: number) {
  const calendar = jalaliCalendar(year);
  return (
    gregorianToDayNumber(calendar.gregorianYear, 3, calendar.marchDay) +
    (month - 1) * 31 -
    divide(month, 7) * (month - 7) +
    day -
    1
  );
}

function dayNumberToJalali(dayNumber: number): DateParts {
  const gregorian = dayNumberToGregorian(dayNumber);
  let year = gregorian.year - 621;
  const calendar = jalaliCalendar(year);
  const firstFarvardin = gregorianToDayNumber(gregorian.year, 3, calendar.marchDay);
  let offset = dayNumber - firstFarvardin;

  if (offset >= 0 && offset <= 185) {
    return {
      year,
      month: 1 + divide(offset, 31),
      day: modulo(offset, 31) + 1,
    };
  }

  if (offset < 0) {
    year -= 1;
    offset += 179;
    if (calendar.leap === 1) offset += 1;
  } else {
    offset -= 186;
  }

  return {
    year,
    month: 7 + divide(offset, 30),
    day: modulo(offset, 30) + 1,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function parseJalaliDate(value: string): DateParts | null {
  const normalized = toLatinDigits(value.trim()).replace(/[.\\-]/g, "/");
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (month < 1 || month > 12 || day < 1) return null;

  try {
    const monthLength =
      month <= 6 ? 31 : month <= 11 ? 30 : jalaliCalendar(year).leap === 0 ? 30 : 29;
    return day <= monthLength ? { year, month, day } : null;
  } catch {
    return null;
  }
}

export function jalaliToGregorianDate(value: string): string | null {
  const date = parseJalaliDate(value);
  if (!date) return null;
  const gregorian = dayNumberToGregorian(
    jalaliToDayNumber(date.year, date.month, date.day)
  );
  return `${gregorian.year}-${pad(gregorian.month)}-${pad(gregorian.day)}`;
}

export function gregorianToJalaliDate(value?: string | null): string {
  if (!value) return "";
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const jalali = dayNumberToJalali(
    gregorianToDayNumber(Number(match[1]), Number(match[2]), Number(match[3]))
  );
  return toPersianDigits(`${jalali.year}/${pad(jalali.month)}/${pad(jalali.day)}`);
}
