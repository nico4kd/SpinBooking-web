"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStatus = exports.formatDifficulty = exports.getCapacityPercentage = exports.formatCapacity = exports.pluralize = exports.generateRandomString = exports.truncate = exports.formatPhone = exports.getInitials = exports.formatName = void 0;
/**
 * Format a name to proper case (capitalize first letter of each word)
 */
const formatName = (name) => {
    return name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
exports.formatName = formatName;
/**
 * Get initials from a name
 */
const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
exports.getInitials = getInitials;
/**
 * Format a phone number
 */
const formatPhone = (phone) => {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX for 10 digits, or +XX XXX XXX XXXX for 11+ digits
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    else if (cleaned.length > 10) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
};
exports.formatPhone = formatPhone;
/**
 * Truncate text with ellipsis
 */
const truncate = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
};
exports.truncate = truncate;
/**
 * Generate a random alphanumeric string
 */
const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
/**
 * Pluralize a word based on count
 */
const pluralize = (count, singular, plural) => {
    return count === 1 ? singular : plural;
};
exports.pluralize = pluralize;
/**
 * Format capacity display (e.g., "15/20")
 */
const formatCapacity = (current, max) => {
    return `${current}/${max}`;
};
exports.formatCapacity = formatCapacity;
/**
 * Get capacity percentage
 */
const getCapacityPercentage = (current, max) => {
    if (max === 0)
        return 0;
    return Math.round((current / max) * 100);
};
exports.getCapacityPercentage = getCapacityPercentage;
/**
 * Format difficulty level for display
 */
const formatDifficulty = (level) => {
    const map = {
        BEGINNER: 'Principiante',
        INTERMEDIATE: 'Intermedio',
        ADVANCED: 'Avanzado',
        ALL_LEVELS: 'Todos los niveles',
    };
    return map[level] || level;
};
exports.formatDifficulty = formatDifficulty;
/**
 * Format status for display
 */
const formatStatus = (status) => {
    const map = {
        // User
        ACTIVE: 'Activo',
        SUSPENDED: 'Suspendido',
        DELETED: 'Eliminado',
        // Package
        PENDING: 'Pendiente',
        EXPIRED: 'Vencido',
        DEPLETED: 'Agotado',
        REFUNDED: 'Reembolsado',
        // Booking
        CONFIRMED: 'Confirmado',
        CANCELLED: 'Cancelado',
        NO_SHOW: 'No asistió',
        ATTENDED: 'Asistió',
        // Waitlist
        NOTIFIED: 'Notificado',
        ACCEPTED: 'Aceptado',
        DECLINED: 'Rechazado',
        // Payment
        PROCESSING: 'Procesando',
        APPROVED: 'Aprobado',
        REJECTED: 'Rechazado',
        // Class
        SCHEDULED: 'Programada',
        IN_PROGRESS: 'En progreso',
        COMPLETED: 'Completada',
        // Note: CANCELLED already defined for Booking (line 106), shared with Class
    };
    return map[status] || status;
};
exports.formatStatus = formatStatus;
//# sourceMappingURL=formatters.js.map