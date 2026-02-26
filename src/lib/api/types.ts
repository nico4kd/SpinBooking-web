/**
 * Shared API response types.
 *
 * These mirror the backend DTOs/shapes so every call site shares a single
 * source of truth. When the backend shape changes, fix it here once.
 *
 * Status fields use the enums from @spinbooking/types for type safety.
 */

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
} from '@spinbooking/types';

// ── Generic ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Users / Profile ──────────────────────────────────────────────────────

import type {
  BookingStatus as BookingStatusType,
  ClassStatus as ClassStatusType,
  DifficultyLevel as DifficultyLevelType,
  PackageStatus as PackageStatusType,
  PaymentStatus as PaymentStatusType,
  Role as RoleType,
  UserStatus as UserStatusType,
} from '@spinbooking/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nroDocumento: string;
  phone: string | null;
  role: RoleType;
  status: UserStatusType;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  availableCredits: number;
  totalCredits: number;
  classesThisMonth: number;
  classesLastMonth: number;
  currentStreak: number;
  longestStreak: number;
  weeklyHistory: number[];
  monthlyGoal: number;
  totalClassesAttended: number;
  daysUntilExpiry: number | null;
  percentileRank: number;
}

// ── Packages ─────────────────────────────────────────────────────────────

export interface UserPackage {
  id: string;
  type: string;
  status: PackageStatusType;
  totalTickets: number;
  remainingTickets: number;
  usedTickets?: number;
  price: number;
  currency: string;
  expiresAt: string | null;
  activatedAt?: string | null;
  createdAt: string;
  payment?: {
    id?: string;
    amount?: number;
    currency?: string;
    method: string;
    status: PaymentStatusType;
    paidAt: string | null;
  };
}

export interface PackageConfig {
  type: string;
  name: string;
  tickets: number;
  price: number;
  currency?: string;
  validityDays: number;
  description: string;
}

// ── Bookings ─────────────────────────────────────────────────────────────

export interface BookingClass {
  id: string;
  title: string | null;
  description?: string | null;
  startTime: string;
  duration: number;
  difficultyLevel: DifficultyLevelType;
  maxCapacity: number;
  currentCapacity: number;
  musicTheme?: string | null;
  room: { id?: string; name: string; location: string | null; capacity?: number };
  instructor: { id?: string; user: { firstName: string; lastName: string } };
}

export interface Booking {
  id: string;
  classId: string;
  status: BookingStatusType;
  bikeNumber: number | null;
  canCancel?: boolean;
  cancellationDeadline?: string;
  cancellationReason?: string | null;
  hoursUntilClass?: number;
  createdAt?: string;
  cancelledAt?: string | null;
  class: BookingClass;
  ticket?: { package: { type: string } };
  user?: { id: string; firstName: string; lastName: string; email: string; phone?: string };
}

// ── Classes ──────────────────────────────────────────────────────────────

export interface ClassWithAvailability {
  id: string;
  title: string | null;
  description: string | null;
  startTime: string;
  duration: number;
  difficultyLevel: DifficultyLevelType;
  maxCapacity: number;
  currentCapacity: number;
  musicTheme: string | null;
  status: ClassStatusType;
  room: { id: string; name: string; location: string | null; capacity: number };
  instructor: { id: string; user: { firstName: string; lastName: string } };
  spotsAvailable: number;
  isFull: boolean;
  fewSpotsLeft: boolean;
  waitlistCount: number;
}

// ── Notifications ────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  channel?: string;
  status?: string;
  subject: string | null;
  message: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}
