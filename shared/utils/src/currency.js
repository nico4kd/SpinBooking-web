"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCurrency = exports.formatAmount = exports.formatCurrency = void 0;
const formatCurrency = (amount, currency = 'ARS', locale = 'es-AR') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatAmount = (amount, locale = 'es-AR') => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
exports.formatAmount = formatAmount;
const parseCurrency = (currencyString) => {
    const cleaned = currencyString.replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(cleaned);
};
exports.parseCurrency = parseCurrency;
//# sourceMappingURL=currency.js.map