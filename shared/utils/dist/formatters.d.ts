/**
 * Format a name to proper case (capitalize first letter of each word)
 */
export declare const formatName: (name: string) => string;
/**
 * Get initials from a name
 */
export declare const getInitials: (firstName: string, lastName: string) => string;
/**
 * Format a phone number
 */
export declare const formatPhone: (phone: string) => string;
/**
 * Truncate text with ellipsis
 */
export declare const truncate: (text: string, maxLength: number) => string;
/**
 * Generate a random alphanumeric string
 */
export declare const generateRandomString: (length: number) => string;
/**
 * Pluralize a word based on count
 */
export declare const pluralize: (count: number, singular: string, plural: string) => string;
/**
 * Format capacity display (e.g., "15/20")
 */
export declare const formatCapacity: (current: number, max: number) => string;
/**
 * Get capacity percentage
 */
export declare const getCapacityPercentage: (current: number, max: number) => number;
/**
 * Format difficulty level for display
 */
export declare const formatDifficulty: (level: string) => string;
/**
 * Format status for display
 */
export declare const formatStatus: (status: string) => string;
//# sourceMappingURL=formatters.d.ts.map