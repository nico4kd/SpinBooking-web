export declare enum Role {
    MEMBER = "MEMBER",
    INSTRUCTOR = "INSTRUCTOR",
    ADMIN = "ADMIN"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    DELETED = "DELETED"
}
export declare enum PackageType {
    TRIAL = "TRIAL",// 1 clase
    STARTER = "STARTER",// 4 clases
    REGULAR = "REGULAR",// 8 clases
    PRO = "PRO",// 12 clases
    UNLIMITED = "UNLIMITED"
}
export declare enum PackageStatus {
    PENDING = "PENDING",// Esperando pago
    ACTIVE = "ACTIVE",// Activo con tickets disponibles
    EXPIRED = "EXPIRED",// Venció por fecha
    DEPLETED = "DEPLETED",// Se agotaron los tickets
    REFUNDED = "REFUNDED"
}
export declare enum TicketStatus {
    AVAILABLE = "AVAILABLE",
    USED = "USED",
    EXPIRED = "EXPIRED",
    REFUNDED = "REFUNDED"
}
export declare enum RoomStatus {
    ACTIVE = "ACTIVE",
    MAINTENANCE = "MAINTENANCE",
    INACTIVE = "INACTIVE"
}
export declare enum InstructorStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export declare enum DifficultyLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
    ALL_LEVELS = "ALL_LEVELS"
}
export declare enum ClassStatus {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum BookingStatus {
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW",
    ATTENDED = "ATTENDED"
}
export declare enum WaitlistStatus {
    ACTIVE = "ACTIVE",// En la cola
    NOTIFIED = "NOTIFIED",// Fue notificado de cupo disponible
    ACCEPTED = "ACCEPTED",// Aceptó el cupo
    DECLINED = "DECLINED",// Rechazó el cupo
    EXPIRED = "EXPIRED",// No respondió a tiempo
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    ONLINE_MERCADOPAGO = "ONLINE_MERCADOPAGO",
    IN_PERSON_CASH = "IN_PERSON_CASH",
    IN_PERSON_CARD = "IN_PERSON_CARD"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    REFUNDED = "REFUNDED"
}
export declare enum NotificationType {
    BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION",
    BOOKING_REMINDER = "BOOKING_REMINDER",
    BOOKING_CANCELLATION = "BOOKING_CANCELLATION",
    WAITLIST_JOINED = "WAITLIST_JOINED",
    WAITLIST_SPOT_AVAILABLE = "WAITLIST_SPOT_AVAILABLE",
    PACKAGE_PURCHASED = "PACKAGE_PURCHASED",
    PACKAGE_EXPIRING_SOON = "PACKAGE_EXPIRING_SOON",
    PACKAGE_EXPIRED = "PACKAGE_EXPIRED",
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
    CLASS_CANCELLED = "CLASS_CANCELLED"
}
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    SMS = "SMS"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
    READ = "READ"
}
//# sourceMappingURL=enums.d.ts.map