/**
 * Format a name to proper case (capitalize first letter of each word)
 */
export const formatName = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get initials from a name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Format a phone number
 */
export const formatPhone = (phone: string): string => {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for 10 digits, or +XX XXX XXX XXXX for 11+ digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length > 10) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Generate a random alphanumeric string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Pluralize a word based on count
 */
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

/**
 * Format capacity display (e.g., "15/20")
 */
export const formatCapacity = (current: number, max: number): string => {
  return `${current}/${max}`;
};

/**
 * Get capacity percentage
 */
export const getCapacityPercentage = (current: number, max: number): number => {
  if (max === 0) return 0;
  return Math.round((current / max) * 100);
};

/**
 * Format difficulty level for display
 */
export const formatDifficulty = (level: string): string => {
  const map: Record<string, string> = {
    BEGINNER: 'Principiante',
    INTERMEDIATE: 'Intermedio',
    ADVANCED: 'Avanzado',
    ALL_LEVELS: 'Todos los niveles',
  };
  return map[level] || level;
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  const map: Record<string, string> = {
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
