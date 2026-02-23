import { Role, UserStatus, PackageType, PackageStatus, TicketStatus, RoomStatus, InstructorStatus, DifficultyLevel, ClassStatus, BookingStatus, WaitlistStatus, PaymentMethod, PaymentStatus, NotificationType, NotificationChannel, NotificationStatus } from './enums';
export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: Role;
    status: UserStatus;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Package {
    id: string;
    userId: string;
    type: PackageType;
    status: PackageStatus;
    totalTickets: number;
    remainingTickets: number;
    price: number;
    currency: string;
    purchasedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface Ticket {
    id: string;
    packageId: string;
    status: TicketStatus;
    usedAt: Date | null;
    bookingId: string | null;
    createdAt: Date;
}
export interface Room {
    id: string;
    name: string;
    location: string | null;
    capacity: number;
    status: RoomStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface Instructor {
    id: string;
    userId: string;
    bio: string | null;
    photoUrl: string | null;
    specialties: string[];
    status: InstructorStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface Class {
    id: string;
    roomId: string;
    instructorId: string;
    startTime: Date;
    duration: number;
    title: string | null;
    description: string | null;
    difficultyLevel: DifficultyLevel;
    musicTheme: string | null;
    maxCapacity: number;
    currentCapacity: number;
    status: ClassStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface Booking {
    id: string;
    userId: string;
    classId: string;
    ticketId: string;
    bikeNumber: number | null;
    status: BookingStatus;
    bookedAt: Date;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Waitlist {
    id: string;
    userId: string;
    classId: string;
    position: number;
    status: WaitlistStatus;
    joinedAt: Date;
    notifiedAt: Date | null;
    notificationExpiresAt: Date | null;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Payment {
    id: string;
    packageId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    externalId: string | null;
    receiptNumber: string | null;
    paidAt: Date | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    subject: string | null;
    message: string;
    data: Record<string, any> | null;
    status: NotificationStatus;
    sentAt: Date | null;
    readAt: Date | null;
    createdAt: Date;
}
export interface RefreshToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
//# sourceMappingURL=entities.d.ts.map