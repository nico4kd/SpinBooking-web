"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinutesRemaining = exports.canCancelBooking = exports.getEndOfDay = exports.getStartOfDay = exports.getHoursDifference = exports.getMinutesDifference = exports.addHoursToDate = exports.addMinutesToDate = exports.addDaysToDate = exports.isDateBefore = exports.isDateAfter = exports.isDateFuture = exports.isDatePast = exports.getRelativeTime = exports.formatDateTime = exports.formatTime = exports.formatDate = void 0;
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const formatDate = (date, formatStr = 'PPP') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.format)(dateObj, formatStr, { locale: locale_1.es });
};
exports.formatDate = formatDate;
const formatTime = (date) => {
    return (0, exports.formatDate)(date, 'HH:mm');
};
exports.formatTime = formatTime;
const formatDateTime = (date) => {
    return (0, exports.formatDate)(date, 'dd/MM/yyyy HH:mm');
};
exports.formatDateTime = formatDateTime;
const getRelativeTime = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.formatDistanceToNow)(dateObj, { addSuffix: true, locale: locale_1.es });
};
exports.getRelativeTime = getRelativeTime;
const isDatePast = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.isPast)(dateObj);
};
exports.isDatePast = isDatePast;
const isDateFuture = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.isFuture)(dateObj);
};
exports.isDateFuture = isDateFuture;
const isDateAfter = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.isAfter)(dateObj1, dateObj2);
};
exports.isDateAfter = isDateAfter;
const isDateBefore = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.isBefore)(dateObj1, dateObj2);
};
exports.isDateBefore = isDateBefore;
const addDaysToDate = (date, days) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.addDays)(dateObj, days);
};
exports.addDaysToDate = addDaysToDate;
const addMinutesToDate = (date, minutes) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.addMinutes)(dateObj, minutes);
};
exports.addMinutesToDate = addMinutesToDate;
const addHoursToDate = (date, hours) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.addHours)(dateObj, hours);
};
exports.addHoursToDate = addHoursToDate;
const getMinutesDifference = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.differenceInMinutes)(dateObj1, dateObj2);
};
exports.getMinutesDifference = getMinutesDifference;
const getHoursDifference = (date1, date2) => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return (0, date_fns_1.differenceInHours)(dateObj1, dateObj2);
};
exports.getHoursDifference = getHoursDifference;
const getStartOfDay = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.startOfDay)(dateObj);
};
exports.getStartOfDay = getStartOfDay;
const getEndOfDay = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.endOfDay)(dateObj);
};
exports.getEndOfDay = getEndOfDay;
const canCancelBooking = (classStartTime, hoursBeforeClass = 2) => {
    const startTime = typeof classStartTime === 'string' ? new Date(classStartTime) : classStartTime;
    const now = new Date();
    const deadline = (0, exports.addHoursToDate)(now, hoursBeforeClass);
    return (0, date_fns_1.isBefore)(deadline, startTime);
};
exports.canCancelBooking = canCancelBooking;
const getMinutesRemaining = (expiryDate) => {
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const minutesRemaining = (0, exports.getMinutesDifference)(expiry, now);
    return Math.max(0, minutesRemaining);
};
exports.getMinutesRemaining = getMinutesRemaining;
//# sourceMappingURL=dates.js.map