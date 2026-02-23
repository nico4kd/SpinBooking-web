import { Role, PackageType, DifficultyLevel, PaymentMethod } from './enums';
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
export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export interface PurchasePackageDto {
    type: PackageType;
    paymentMethod: PaymentMethod;
}
export interface CreatePackageDto {
    userId: string;
    type: PackageType;
    paymentMethod: PaymentMethod;
}
export interface CreateClassDto {
    roomId: string;
    instructorId: string;
    startTime: Date;
    duration: number;
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
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
}
export interface CreateRecurringClassDto extends CreateClassDto {
    recurrence: {
        frequency: 'DAILY' | 'WEEKLY';
        daysOfWeek?: number[];
        endDate: Date;
    };
}
export interface ClassFiltersDto {
    startDate?: Date;
    endDate?: Date;
    roomId?: string;
    instructorId?: string;
    difficultyLevel?: DifficultyLevel;
    status?: string;
}
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
}
export interface JoinWaitlistDto {
    classId: string;
}
export interface AcceptWaitlistDto {
    bikeNumber?: number;
}
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
}
export interface ProcessRefundDto {
    reason: string;
}
export interface PaymentFiltersDto {
    status?: string;
    method?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
}
//# sourceMappingURL=dtos.d.ts.map