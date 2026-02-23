// User enums
export enum Role {
  MEMBER = 'MEMBER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// Package enums
export enum PackageType {
  TRIAL = 'TRIAL', // 1 clase
  STARTER = 'STARTER', // 4 clases
  REGULAR = 'REGULAR', // 8 clases
  PRO = 'PRO', // 12 clases
  UNLIMITED = 'UNLIMITED', // Ilimitado por 30 días
}

export enum PackageStatus {
  PENDING = 'PENDING', // Esperando pago
  ACTIVE = 'ACTIVE', // Activo con tickets disponibles
  EXPIRED = 'EXPIRED', // Venció por fecha
  DEPLETED = 'DEPLETED', // Se agotaron los tickets
  REFUNDED = 'REFUNDED', // Reembolsado
}

// Ticket enums
export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

// Room enums
export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

// Instructor enums
export enum InstructorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Class enums
export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL_LEVELS = 'ALL_LEVELS',
}

export enum ClassStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Booking enums
export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  ATTENDED = 'ATTENDED',
}

// Waitlist enums
export enum WaitlistStatus {
  ACTIVE = 'ACTIVE', // En la cola
  NOTIFIED = 'NOTIFIED', // Fue notificado de cupo disponible
  ACCEPTED = 'ACCEPTED', // Aceptó el cupo
  DECLINED = 'DECLINED', // Rechazó el cupo
  EXPIRED = 'EXPIRED', // No respondió a tiempo
  CANCELLED = 'CANCELLED', // Usuario canceló su posición
}

// Payment enums
export enum PaymentMethod {
  ONLINE_MERCADOPAGO = 'ONLINE_MERCADOPAGO',
  IN_PERSON_CASH = 'IN_PERSON_CASH',
  IN_PERSON_CARD = 'IN_PERSON_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

// Notification enums
export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  WAITLIST_JOINED = 'WAITLIST_JOINED',
  WAITLIST_SPOT_AVAILABLE = 'WAITLIST_SPOT_AVAILABLE',
  PACKAGE_PURCHASED = 'PACKAGE_PURCHASED',
  PACKAGE_EXPIRING_SOON = 'PACKAGE_EXPIRING_SOON',
  PACKAGE_EXPIRED = 'PACKAGE_EXPIRED',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  CLASS_CANCELLED = 'CLASS_CANCELLED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}
