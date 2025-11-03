/**
 * Get ISO 8601 week number for a given date
 * @param date - The date to get the week number for
 * @returns Object containing year, week number, and the week's date range
 */
export function getISOWeek(date: Date): {
  year: number;
  week: number;
  weekStart: Date;
  weekEnd: Date;
} {
  const target = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7; // Convert Sunday=0 to Sunday=6

  // Set to nearest Thursday (current date + 4 - current day number)
  target.setDate(target.getDate() - dayNum + 3);

  // Get first day of year
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const dayNum2 = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - dayNum2 + 3);

  // Calculate week number
  const weekDiff = (target.valueOf() - firstThursday.valueOf()) / 86400000;
  const week = 1 + Math.floor(weekDiff / 7);

  // Calculate week start (Monday) and end (Sunday)
  const weekStart = new Date(date.valueOf());
  weekStart.setDate(weekStart.getDate() - dayNum);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    year: target.getFullYear(),
    week,
    weekStart,
    weekEnd,
  };
}

/**
 * Get the date range for a specific ISO week
 * @param year - The ISO year
 * @param week - The ISO week number (1-53)
 * @returns Object containing the week's start and end dates
 */
export function getDateRangeFromISOWeek(
  year: number,
  week: number
): { weekStart: Date; weekEnd: Date } {
  // Find the first Thursday of the year
  const jan4 = new Date(year, 0, 4);
  const dayNum = (jan4.getDay() + 6) % 7;
  const firstThursday = new Date(jan4);
  firstThursday.setDate(firstThursday.getDate() - dayNum + 3);

  // Calculate the Monday of week 1
  const firstMonday = new Date(firstThursday);
  firstMonday.setDate(firstThursday.getDate() - 3);

  // Calculate the Monday of the target week
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
  weekStart.setHours(0, 0, 0, 0);

  // Calculate the Sunday of the target week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// Example usage
const today = new Date();
const isoWeek = getISOWeek(today);
console.log(
  `Today (${today.toDateString()}) is in ISO week ${isoWeek.week} of ${
    isoWeek.year
  }`
);
console.log(`Week starts: ${isoWeek.weekStart.toDateString()}`);
console.log(`Week ends: ${isoWeek.weekEnd.toDateString()}`);

// Get dates for a specific ISO week
const { weekStart, weekEnd } = getDateRangeFromISOWeek(2025, 1);
console.log(`\nISO Week 1 of 2025:`);
console.log(`Starts: ${weekStart.toDateString()}`);
console.log(`Ends: ${weekEnd.toDateString()}`);
