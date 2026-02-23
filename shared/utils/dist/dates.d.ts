/**
 * Format a date to a readable string
 */
export declare const formatDate: (date: Date | string, formatStr?: string) => string;
/**
 * Format date for time display (HH:mm)
 */
export declare const formatTime: (date: Date | string) => string;
/**
 * Format date for datetime display (dd/MM/yyyy HH:mm)
 */
export declare const formatDateTime: (date: Date | string) => string;
/**
 * Get relative time from now (e.g., "hace 2 horas")
 */
export declare const getRelativeTime: (date: Date | string) => string;
/**
 * Check if a date is in the past
 */
export declare const isDatePast: (date: Date | string) => boolean;
/**
 * Check if a date is in the future
 */
export declare const isDateFuture: (date: Date | string) => boolean;
/**
 * Check if date1 is after date2
 */
export declare const isDateAfter: (date1: Date | string, date2: Date | string) => boolean;
/**
 * Check if date1 is before date2
 */
export declare const isDateBefore: (date1: Date | string, date2: Date | string) => boolean;
/**
 * Add days to a date
 */
export declare const addDaysToDate: (date: Date | string, days: number) => Date;
/**
 * Add minutes to a date
 */
export declare const addMinutesToDate: (date: Date | string, minutes: number) => Date;
/**
 * Add hours to a date
 */
export declare const addHoursToDate: (date: Date | string, hours: number) => Date;
/**
 * Get difference in minutes between two dates
 */
export declare const getMinutesDifference: (date1: Date | string, date2: Date | string) => number;
/**
 * Get difference in hours between two dates
 */
export declare const getHoursDifference: (date1: Date | string, date2: Date | string) => number;
/**
 * Get start of day for a date
 */
export declare const getStartOfDay: (date: Date | string) => Date;
/**
 * Get end of day for a date
 */
export declare const getEndOfDay: (date: Date | string) => Date;
/**
 * Check if cancellation is allowed (more than X hours before class)
 */
export declare const canCancelBooking: (classStartTime: Date | string, hoursBeforeClass?: number) => boolean;
/**
 * Get countdown minutes remaining
 */
export declare const getMinutesRemaining: (expiryDate: Date | string) => number;
//# sourceMappingURL=dates.d.ts.map