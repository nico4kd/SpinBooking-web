"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationChannel = exports.NotificationType = exports.PaymentStatus = exports.PaymentMethod = exports.WaitlistStatus = exports.BookingStatus = exports.ClassStatus = exports.DifficultyLevel = exports.InstructorStatus = exports.RoomStatus = exports.TicketStatus = exports.PackageStatus = exports.PackageType = exports.UserStatus = exports.Role = void 0;
// User enums
var Role;
(function (Role) {
    Role["MEMBER"] = "MEMBER";
    Role["INSTRUCTOR"] = "INSTRUCTOR";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Package enums
var PackageType;
(function (PackageType) {
    PackageType["TRIAL"] = "TRIAL";
    PackageType["STARTER"] = "STARTER";
    PackageType["REGULAR"] = "REGULAR";
    PackageType["PRO"] = "PRO";
    PackageType["UNLIMITED"] = "UNLIMITED";
})(PackageType || (exports.PackageType = PackageType = {}));
var PackageStatus;
(function (PackageStatus) {
    PackageStatus["PENDING"] = "PENDING";
    PackageStatus["ACTIVE"] = "ACTIVE";
    PackageStatus["EXPIRED"] = "EXPIRED";
    PackageStatus["DEPLETED"] = "DEPLETED";
    PackageStatus["REFUNDED"] = "REFUNDED";
})(PackageStatus || (exports.PackageStatus = PackageStatus = {}));
// Ticket enums
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["AVAILABLE"] = "AVAILABLE";
    TicketStatus["USED"] = "USED";
    TicketStatus["EXPIRED"] = "EXPIRED";
    TicketStatus["REFUNDED"] = "REFUNDED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
// Room enums
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["ACTIVE"] = "ACTIVE";
    RoomStatus["MAINTENANCE"] = "MAINTENANCE";
    RoomStatus["INACTIVE"] = "INACTIVE";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
// Instructor enums
var InstructorStatus;
(function (InstructorStatus) {
    InstructorStatus["ACTIVE"] = "ACTIVE";
    InstructorStatus["INACTIVE"] = "INACTIVE";
})(InstructorStatus || (exports.InstructorStatus = InstructorStatus = {}));
// Class enums
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["BEGINNER"] = "BEGINNER";
    DifficultyLevel["INTERMEDIATE"] = "INTERMEDIATE";
    DifficultyLevel["ADVANCED"] = "ADVANCED";
    DifficultyLevel["ALL_LEVELS"] = "ALL_LEVELS";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
var ClassStatus;
(function (ClassStatus) {
    ClassStatus["SCHEDULED"] = "SCHEDULED";
    ClassStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ClassStatus["COMPLETED"] = "COMPLETED";
    ClassStatus["CANCELLED"] = "CANCELLED";
})(ClassStatus || (exports.ClassStatus = ClassStatus = {}));
// Booking enums
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["NO_SHOW"] = "NO_SHOW";
    BookingStatus["ATTENDED"] = "ATTENDED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
// Waitlist enums
var WaitlistStatus;
(function (WaitlistStatus) {
    WaitlistStatus["ACTIVE"] = "ACTIVE";
    WaitlistStatus["NOTIFIED"] = "NOTIFIED";
    WaitlistStatus["ACCEPTED"] = "ACCEPTED";
    WaitlistStatus["DECLINED"] = "DECLINED";
    WaitlistStatus["EXPIRED"] = "EXPIRED";
    WaitlistStatus["CANCELLED"] = "CANCELLED";
})(WaitlistStatus || (exports.WaitlistStatus = WaitlistStatus = {}));
// Payment enums
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["ONLINE_MERCADOPAGO"] = "ONLINE_MERCADOPAGO";
    PaymentMethod["IN_PERSON_CASH"] = "IN_PERSON_CASH";
    PaymentMethod["IN_PERSON_CARD"] = "IN_PERSON_CARD";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["APPROVED"] = "APPROVED";
    PaymentStatus["REJECTED"] = "REJECTED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// Notification enums
var NotificationType;
(function (NotificationType) {
    NotificationType["BOOKING_CONFIRMATION"] = "BOOKING_CONFIRMATION";
    NotificationType["BOOKING_REMINDER"] = "BOOKING_REMINDER";
    NotificationType["BOOKING_CANCELLATION"] = "BOOKING_CANCELLATION";
    NotificationType["WAITLIST_JOINED"] = "WAITLIST_JOINED";
    NotificationType["WAITLIST_SPOT_AVAILABLE"] = "WAITLIST_SPOT_AVAILABLE";
    NotificationType["PACKAGE_PURCHASED"] = "PACKAGE_PURCHASED";
    NotificationType["PACKAGE_EXPIRING_SOON"] = "PACKAGE_EXPIRING_SOON";
    NotificationType["PACKAGE_EXPIRED"] = "PACKAGE_EXPIRED";
    NotificationType["PAYMENT_CONFIRMED"] = "PAYMENT_CONFIRMED";
    NotificationType["CLASS_CANCELLED"] = "CLASS_CANCELLED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["PUSH"] = "PUSH";
    NotificationChannel["SMS"] = "SMS";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["FAILED"] = "FAILED";
    NotificationStatus["READ"] = "READ";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
//# sourceMappingURL=enums.js.map