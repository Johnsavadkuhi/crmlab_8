import assert from "node:assert/strict";
import test from "node:test";
import {
  gregorianToJalaliDate,
  jalaliToGregorianDate,
  parseJalaliDate,
  toLatinDigits,
} from "./jalaliDate";

test("converts known Jalali dates to Gregorian date-only values", () => {
  assert.equal(jalaliToGregorianDate("1403/01/01"), "2024-03-20");
  assert.equal(jalaliToGregorianDate("۱۴۰۴/۱/۱"), "2025-03-21");
  assert.equal(jalaliToGregorianDate("۱۳۹۹-۱۲-۳۰"), "2021-03-20");
});

test("converts persisted Gregorian dates to Persian Jalali display values", () => {
  assert.equal(gregorianToJalaliDate("2024-03-20T00:00:00.000Z"), "۱۴۰۳/۰۱/۰۱");
  assert.equal(gregorianToJalaliDate("2025-03-21"), "۱۴۰۴/۰۱/۰۱");
});

test("accepts Persian and Arabic digits and rejects invalid Jalali dates", () => {
  assert.equal(toLatinDigits("۱۴۰۳/٠١/۰۱"), "1403/01/01");
  assert.deepEqual(parseJalaliDate("۱۴۰۳.۰۶.۳۱"), {
    year: 1403,
    month: 6,
    day: 31,
  });
  assert.equal(parseJalaliDate("۱۴۰۰/۱۲/۳۰"), null);
  assert.equal(parseJalaliDate("۱۴۰۳/۰۷/۳۱"), null);
  assert.equal(parseJalaliDate("1403/13/01"), null);
});

test("round-trips persisted dates without a timezone shift", () => {
  const persisted = "2026-09-06T21:00:00.000Z";
  assert.equal(jalaliToGregorianDate(gregorianToJalaliDate(persisted)), "2026-09-06");
});
