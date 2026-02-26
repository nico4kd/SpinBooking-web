/**
 * Centralized API service layer.
 *
 * Usage:
 *   import { usersApi, bookingsApi } from '@/lib/api';
 *   const stats = await usersApi.getStats();
 */

export { usersApi } from './users';
export { bookingsApi } from './bookings';
export type { BookingFilters } from './bookings';
export { classesApi } from './classes';
export type { ClassFilters } from './classes';
export { packagesApi } from './packages';
export { notificationsApi } from './notifications';

// Re-export enums for type-safe status comparisons
export {
  BookingStatus,
  ClassStatus,
  DifficultyLevel,
  InstructorStatus,
  PackageStatus,
  PackageType,
  PaymentMethod,
  PaymentStatus,
  Role,
  UserStatus,
  WaitlistStatus,
} from './types';

// Re-export types for convenience
export type {
  PaginatedResponse,
  UserProfile,
  UserStats,
  UserPackage,
  PackageConfig,
  Booking,
  BookingClass,
  ClassWithAvailability,
  Notification,
  NotificationsResponse,
} from './types';
