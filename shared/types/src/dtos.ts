import { Role, PackageType, DifficultyLevel, PaymentMethod } from './enums.js';

// Auth DTOs
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// User DTOs
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Package DTOs
export interface PurchasePackageDto {
  type: PackageType;
  paymentMethod: PaymentMethod;
}

export interface CreatePackageDto {
  userId: string;
  type: PackageType;
  paymentMethod: PaymentMethod;
}

// Class DTOs
export interface CreateClassDto {
  roomId: string;
  instructorId: string;
  startTime: Date;
  duration: number;
  maxCapacity: number;
  title?: string;
  description?: string;
  difficultyLevel: DifficultyLevel;
  musicTheme?: string;
}

export interface UpdateClassDto {
  roomId?: string;
  instructorId?: string;
  startTime?: Date;
  duration?: number;
  maxCapacity?: number;
  title?: string;
  description?: string;
  difficultyLevel?: DifficultyLevel;
  musicTheme?: string;
}

export interface CreateRecurringClassDto {
  roomId: string;
  instructorId: string;
  startDate: Date;
  endDate: Date;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  timeSlots: string[]; // e.g., ["07:00", "09:00", "18:00"]
  duration: number;
  maxCapacity: number;
  title?: string;
  description?: string;
  difficultyLevel: DifficultyLevel;
  musicTheme?: string;
}

export interface ClassFiltersDto {
  startDate?: Date | string;
  endDate?: Date | string;
  roomId?: string;
  instructorId?: string;
  difficultyLevel?: DifficultyLevel;
  status?: string;
  page?: number;
  limit?: number;
}

// Alias for backward compatibility
export type ClassFilterDto = ClassFiltersDto;

// Booking DTOs
export interface CreateBookingDto {
  classId: string;
  bikeNumber?: number;
}

export interface CancelBookingDto {
  reason?: string;
}

export interface BookingFiltersDto {
  status?: string;
  upcoming?: boolean;
  past?: boolean;
  page?: number;
  limit?: number;
}

// Alias for backward compatibility
export type BookingFilterDto = BookingFiltersDto;

// Waitlist DTOs
export interface JoinWaitlistDto {
  classId: string;
}

export interface AcceptWaitlistDto {
  bikeNumber?: number;
}

// Room DTOs
export interface CreateRoomDto {
  name: string;
  location?: string;
  capacity: number;
}

export interface UpdateRoomDto {
  name?: string;
  location?: string;
  capacity?: number;
  status?: string;
}

// Instructor DTOs
export interface CreateInstructorDto {
  userId: string;
  bio?: string;
  photoUrl?: string;
  specialties?: string[];
}

export interface UpdateInstructorDto {
  bio?: string;
  photoUrl?: string;
  specialties?: string[];
  status?: string;
}

// Admin User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: Role;
  status?: string;
}

export interface UserFiltersDto {
  role?: Role;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Payment DTOs
export interface ProcessRefundDto {
  reason: string;
}

export interface PaymentFiltersDto {
  status?: string;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
}
