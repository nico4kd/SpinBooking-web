import {
  format,
  formatDistanceToNow,
  addDays,
  addMinutes,
  addHours,
  isAfter,
  isBefore,
  isPast,
  isFuture,
  differenceInMinutes,
  differenceInHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Format date for time display (HH:mm)
 */
export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

/**
 * Format date for datetime display (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Get relative time from now (e.g., "hace 2 horas")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

/**
 * Check if a date is in the past
 */
export const isDatePast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isPast(dateObj);
};

/**
 * Check if a date is in the future
 */
export const isDateFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isFuture(dateObj);
};

/**
 * Check if date1 is after date2
 */
export const isDateAfter = (date1: Date | string, date2: Date | string): boolean => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return isAfter(dateObj1, dateObj2);
};

/**
 * Check if date1 is before date2
 */
export const isDateBefore = (date1: Date | string, date2: Date | string): boolean => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return isBefore(dateObj1, dateObj2);
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addDays(dateObj, days);
};

/**
 * Add minutes to a date
 */
export const addMinutesToDate = (date: Date | string, minutes: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addMinutes(dateObj, minutes);
};

/**
 * Add hours to a date
 */
export const addHoursToDate = (date: Date | string, hours: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addHours(dateObj, hours);
};

/**
 * Get difference in minutes between two dates
 */
export const getMinutesDifference = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return differenceInMinutes(dateObj1, dateObj2);
};

/**
 * Get difference in hours between two dates
 */
export const getHoursDifference = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return differenceInHours(dateObj1, dateObj2);
};

/**
 * Get start of day for a date
 */
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return startOfDay(dateObj);
};

/**
 * Get end of day for a date
 */
export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return endOfDay(dateObj);
};

/**
 * Check if cancellation is allowed (more than X hours before class)
 */
export const canCancelBooking = (classStartTime: Date | string, hoursBeforeClass: number = 2): boolean => {
  const startTime = typeof classStartTime === 'string' ? new Date(classStartTime) : classStartTime;
  const now = new Date();
  const deadline = addHoursToDate(now, hoursBeforeClass);
  return isBefore(deadline, startTime);
};

/**
 * Get countdown minutes remaining
 */
export const getMinutesRemaining = (expiryDate: Date | string): number => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const minutesRemaining = getMinutesDifference(expiry, now);
  return Math.max(0, minutesRemaining);
};
