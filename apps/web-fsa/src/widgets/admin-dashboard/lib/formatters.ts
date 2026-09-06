import type { Language } from "@/features/language/model";

export function formatMetric(value: number | null, unit: "count" | "percent" | "hours", language: Language) {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US", {
    maximumFractionDigits: 1,
  }).format(value);
  if (unit === "percent") return `${formatted}%`;
  if (unit === "hours") return `${formatted}h`;
  return formatted;
}

export function formatPeriod(value: string, language: Language, compact = true) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    month: compact ? "short" : "long",
    day: "numeric",
    year: compact ? undefined : "numeric",
  }).format(date);
}

export function formatDateTime(value: string, language: Language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function humanize(value: string) {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
