/** Calendar values are ISO dates, not instants. UTC arithmetic prevents DST from moving a date. */
export function parseDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : undefined;
}
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export function addDays(value: string, days: number) {
  const date = parseDate(value);
  if (!date) throw new RangeError("Expected a valid ISO calendar date.");
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}
export function addMonths(value: string, months: number) {
  const date = parseDate(value);
  if (!date) throw new RangeError("Expected a valid ISO calendar date.");
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(date);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  date.setUTCDate(Math.min(day, last.getUTCDate()));
  return isoDate(date);
}
export function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function formatDate(
  value: string,
  locale = "en-GB",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
        date,
      )
    : "";
}
export function parseTime(value: string): number | undefined {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}
export function timeValue(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
export function formatTime(value: string, format: "12h" | "24h" = "24h") {
  const minutes = parseTime(value);
  if (minutes === undefined) return "";
  const hour = Math.floor(minutes / 60);
  return format === "24h"
    ? value
    : `${String(hour % 12 || 12).padStart(2, "0")}:${value.slice(3)} ${hour < 12 ? "AM" : "PM"}`;
}
