/**
 * Shared Formatting Utilities for Experience and Platform Display
 */

/**
 * Format human-readable calculated duration for work experiences
 */
export function formatExperienceDuration(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  if (!startDate) return "";
  const startMatch = startDate.match(/\b(19\d\d|20\d\d)\b/);
  const startYear = startMatch ? parseInt(startMatch[1], 10) : null;
  const currentYear = new Date().getFullYear();

  const isOngoing = Boolean(isCurrent) || !endDate || /present|current/i.test(endDate);
  let endYear = currentYear;
  if (!isOngoing && endDate) {
    const endMatch = endDate.match(/\b(19\d\d|20\d\d)\b/);
    if (endMatch) endYear = parseInt(endMatch[1], 10);
  }

  if (startYear) {
    const years = Math.max(1, endYear - startYear + (isOngoing ? 1 : 0));
    const range = `${startDate} – ${isOngoing ? "Present" : (endDate || endYear)}`;
    return `${range} (~${years} yr${years > 1 ? "s" : ""})`;
  }

  return `${startDate} – ${endDate || "Present"}`;
}
