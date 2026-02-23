"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinutesRemaining = exports.canCancelBooking = exports.getEndOfDay = exports.getStartOfDay = exports.getHoursDifference = exports.getMinutesDifference = exports.addHoursToDate = exports.addMinutesToDate = exports.addDaysToDate = exports.isDateBefore = exports.isDateAfter = exports.isDateFuture = exports.isDatePast = exports.getRelativeTime = exports.formatDateTime = exports.formatTime = exports.formatDate = void 0;
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
/**
 * Format a date to a readable string
 */
const formatDate = (date, formatStr = 'PPP') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.format)(dateObj, formatStr, { locale: locale_1.es });
};
exports.formatDate = formatDate;
/**
 * Format date for time display (HH:mm)
 */
const formatTime = (date) => {
    return (0, exports.formatDate)(date, 'HH:mm');
};
exports.formatTime = formatTime;
/**
 * Format date for datetime display (dd/MM/yyyy HH:mm)
 */
const formatDateTime = (date) => {
    return (0, exports.formatDate)(date, 'dd/MM/yyyy HH:mm');
};
exports.formatDateTime = formatDateTime;
/**
 * Get relative time from now (e.g., "hace 2 horas")
 */
const getRelativeTime = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.formatDistanceToNow)(dateObj, { addSuffix: true, locale: locale_1.es });
};
exports.getRelativeTime = getRelativeTime;
/**
 * Check if a date is in the past
 */
const isDatePast = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.isPast)(dateObj);
};
exports.isDatePast = isDatePast;
/**
 * Check if a date is in the future
 */
const isDateFuture = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.isFuture)(dateObj);
};
exports.isDateFuture = isDateFuture;
/**
 * Check if date1 is after date2
 */
const isDateAfter = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.isAfter)(dateObj1, dateObj2);
};
exports.isDateAfter = isDateAfter;
/**
 * Check if date1 is before date2
 */
const isDateBefore = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.isBefore)(dateObj1, dateObj2);
};
exports.isDateBefore = isDateBefore;
/**
 * Add days to a date
 */
const addDaysToDate = (date, days) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.addDays)(dateObj, days);
};
exports.addDaysToDate = addDaysToDate;
/**
 * Add minutes to a date
 */
const addMinutesToDate = (date, minutes) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.addMinutes)(dateObj, minutes);
};
exports.addMinutesToDate = addMinutesToDate;
/**
 * Add hours to a date
 */
const addHoursToDate = (date, hours) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.addHours)(dateObj, hours);
};
exports.addHoursToDate = addHoursToDate;
/**
 * Get difference in minutes between two dates
 */
const getMinutesDifference = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.differenceInMinutes)(dateObj1, dateObj2);
};
exports.getMinutesDifference = getMinutesDifference;
/**
 * Get difference in hours between two dates
 */
const getHoursDifference = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.differenceInHours)(dateObj1, dateObj2);
};
exports.getHoursDifference = getHoursDifference;
/**
 * Get start of day for a date
 */
const getStartOfDay = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.startOfDay)(dateObj);
};
exports.getStartOfDay = getStartOfDay;
/**
 * Get end of day for a date
 */
const getEndOfDay = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.endOfDay)(dateObj);
};
exports.getEndOfDay = getEndOfDay;
/**
 * Check if cancellation is allowed (more than X hours before class)
 */
const canCancelBooking = (classStartTime, hoursBeforeClass = 2) => {
    const startTime = typeof classStartTime === 'string' ? new Date(classStartTime) : classStartTime;
    const now = new Date();
    const deadline = (0, exports.addHoursToDate)(now, hoursBeforeClass);
    return (0, date_fns_1.isBefore)(deadline, startTime);
};
exports.canCancelBooking = canCancelBooking;
/**
 * Get countdown minutes remaining
 */
const getMinutesRemaining = (expiryDate) => {
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const minutesRemaining = (0, exports.getMinutesDifference)(expiry, now);
    return Math.max(0, minutesRemaining);
};
exports.getMinutesRemaining = getMinutesRemaining;
//# sourceMappingURL=dates.js.map