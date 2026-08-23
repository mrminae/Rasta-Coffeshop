import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into Persian Toman currency with separators
 * e.g. 85000 -> "۸۵,۰۰۰ تومان"
 */
export function formatCurrency(amount: number, currency: string = "تومان", includeUnit: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `۰ ${currency}`;
  }
  const formatted = new Intl.NumberFormat("fa-IR").format(amount);
  return includeUnit ? `${formatted} ${currency}` : formatted;
}

/**
 * Formats numbers into Persian digits
 */
export function toPersianDigits(n: number | string): string {
  if (n === null || n === undefined) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * Formats ISO timestamp to readable Persian date/time
 */
export function formatPersianDateTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Calculates elapsed minutes from an ISO string
 */
export function getElapsedMinutes(isoString?: string): number {
  if (!isoString) return 0;
  try {
    const start = new Date(isoString).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - start) / 60000));
  } catch {
    return 0;
  }
}
