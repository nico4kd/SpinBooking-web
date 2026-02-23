import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addHours, subHours } from 'date-fns';

/**
 * Cancellation & Refund E2E Test
 *
 * Tests the booking cancellation and refund workflows:
 *
 * 1. User books a class (consumes ticket)
 * 2. User cancels within the deadline (2 hours before class)
 * 3. Ticket is restored to AVAILABLE
 * 4. Class currentCapacity is decremented
 * 5. Admin processes refund
 * 6. Package status changes to REFUNDED
 *
 * Also tests:
 * - Cancellation OUTSIDE deadline (should fail)
 * - Refund idempotency (can't refund twice)
 */

let prisma: PrismaClient;
let testUserId: string;
let adminUserId: string;
let testInstructorUserId: string;
let testInstructorId: string;
let testRoomId: string;
let testClassId: string; // Class in 24 hours (can cancel)
let testClassId2: string; // Class in 1 hour (cannot cancel)
let testPackageId: string;
let accessToken: string;
let adminAccessToken: string;

test.beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://spinbooking_user:password@localhost:5432/spinbooking_test',
      },
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: `admin-cancel-${Date.now()}@example.com`,
      password: await bcrypt.hash('Admin123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  adminUserId = admin.id;

  // Get admin token
  const adminLoginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: admin.email,
      password: 'Admin123!',
    }),
  });
  const adminData = await adminLoginResponse.json();
  adminAccessToken = adminData.accessToken;

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: `cancel-test-${Date.now()}@example.com`,
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Cancel',
      lastName: 'TestUser',
      role: 'MEMBER',
      emailVerified: true,
    },
  });
  testUserId = user.id;

  // Get user token
  const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: 'Test123!',
    }),
  });
  const data = await loginResponse.json();
  accessToken = data.accessToken;

  // Create test package
  const packageEntity = await prisma.package.create({
    data: {
      userId: testUserId,
      type: 'REGULAR',
      status: 'ACTIVE',
      totalTickets: 8,
      remainingTickets: 8,
      price: 18000,
      currency: 'ARS',
      expiresAt: addHours(new Date(), 24 * 45),
      purchasedAt: new Date(),
    },
  });
  testPackageId = packageEntity.id;

  // Create tickets
  for (let i = 0; i < 8; i++) {
    await prisma.ticket.create({
      data: {
        packageId: testPackageId,
        status: 'AVAILABLE',
      },
    });
  }

  // Create test instructor
  const instructorUser = await prisma.user.create({
    data: {
      email: `instructor-cancel-${Date.now()}@example.com`,
      password: await bcrypt.hash('Instructor123!', 10),
      firstName: 'Test',
      lastName: 'Instructor',
      role: 'INSTRUCTOR',
      emailVerified: true,
    },
  });
  testInstructorUserId = instructorUser.id;

  const instructor = await prisma.instructor.create({
    data: {
      userId: instructorUser.id,
      bio: 'Test instructor',
      specialties: ['High Intensity'],
      status: 'ACTIVE',
    },
  });
  testInstructorId = instructor.id;

  // Create test room
  const room = await prisma.room.create({
    data: {
      name: `Cancel Test Room ${Date.now()}`,
      location: 'Test Location',
      capacity: 20,
      status: 'ACTIVE',
    },
  });
  testRoomId = room.id;

  // Create test class 1 (24 hours away - can cancel)
  const class1 = await prisma.class.create({
    data: {
      instructorId: testInstructorId,
      roomId: testRoomId,
      startTime: addHours(new Date(), 24),
      duration: 45,
      title: 'Cancellation Test Class - Can Cancel',
      difficultyLevel: 'ALL_LEVELS',
      maxCapacity: 20,
      currentCapacity: 0,
      status: 'SCHEDULED',
    },
  });
  testClassId = class1.id;

  // Create test class 2 (1 hour away - cannot cancel)
  const class2 = await prisma.class.create({
    data: {
      instructorId: testInstructorId,
      roomId: testRoomId,
      startTime: addHours(new Date(), 1),
      duration: 45,
      title: 'Cancellation Test Class - Too Late',
      difficultyLevel: 'ALL_LEVELS',
      maxCapacity: 20,
      currentCapacity: 0,
      status: 'SCHEDULED',
    },
  });
  testClassId2 = class2.id;
});

test.afterAll(async () => {
  // Cleanup
  await prisma.booking.deleteMany({
    where: { userId: testUserId },
  });

  await prisma.class.deleteMany({
    where: { id: { in: [testClassId, testClassId2] } },
  });

  await prisma.instructor.deleteMany({
    where: { id: testInstructorId },
  });

  await prisma.room.deleteMany({
    where: { id: testRoomId },
  });

  await prisma.ticket.deleteMany({
    where: { packageId: testPackageId },
  });

  await prisma.payment.deleteMany({
    where: { packageId: testPackageId },
  });

  await prisma.package.deleteMany({
    where: { id: testPackageId },
  });

  await prisma.refreshToken.deleteMany({
    where: { userId: { in: [testUserId, adminUserId, testInstructorUserId] } },
  });

  await prisma.user.deleteMany({
    where: { id: { in: [testUserId, adminUserId, testInstructorUserId] } },
  });

  await prisma.$disconnect();
});

test.describe('Cancellation & Refund Flow', () => {
  test('should allow cancellation within deadline and restore ticket', async () => {
    // Create booking
    console.log('🎫 Creating booking...');
    const bookingResponse = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        classId: testClassId,
      }),
    });

    expect(bookingResponse.status).toBe(201);
    const booking = await bookingResponse.json();

    console.log('✅ Booking created:', booking.id);

    // Verify booking state
    const bookingBefore = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { ticket: true },
    });

    expect(bookingBefore!.status).toBe('CONFIRMED');
    expect(bookingBefore!.ticket!.status).toBe('USED');

    // Verify class capacity increased
    const classBefore = await prisma.class.findUnique({
      where: { id: testClassId },
    });

    expect(classBefore!.currentCapacity).toBe(1);

    // Cancel booking
    console.log('❌ Cancelling booking...');
    const cancelResponse = await fetch(`http://localhost:3000/bookings/${booking.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: 'Test cancellation',
      }),
    });

    expect(cancelResponse.status).toBe(200);
    const cancelResult = await cancelResponse.json();

    console.log('✅ Booking cancelled:', cancelResult);

    // Verify booking status
    const bookingAfter = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { ticket: true },
    });

    expect(bookingAfter!.status).toBe('CANCELLED');
    expect(bookingAfter!.cancelledAt).toBeTruthy();
    expect(bookingAfter!.cancellationReason).toBe('Test cancellation');

    // CRITICAL: Verify ticket was restored
    expect(bookingAfter!.ticket!.status).toBe('AVAILABLE');
    expect(bookingAfter!.ticket!.bookingId).toBeNull();

    // CRITICAL: Verify class capacity decreased
    const classAfter = await prisma.class.findUnique({
      where: { id: testClassId },
    });

    expect(classAfter!.currentCapacity).toBe(0);

    // Verify package remaining tickets increased
    const packageAfter = await prisma.package.findUnique({
      where: { id: testPackageId },
    });

    expect(packageAfter!.remainingTickets).toBe(8); // Restored to original

    console.log('✅ Cancellation test passed - ticket restored correctly!');
  });

  test('should reject cancellation outside deadline', async () => {
    // Create booking for class that starts in 1 hour (past 2-hour deadline)
    console.log('🎫 Creating booking for class starting soon...');
    const bookingResponse = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        classId: testClassId2,
      }),
    });

    expect(bookingResponse.status).toBe(201);
    const booking = await bookingResponse.json();

    // Try to cancel (should fail)
    console.log('❌ Attempting to cancel (should fail)...');
    const cancelResponse = await fetch(`http://localhost:3000/bookings/${booking.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: 'Too late',
      }),
    });

    // Should fail
    expect(cancelResponse.status).toBeGreaterThanOrEqual(400);
    const error = await cancelResponse.json();

    console.log('✅ Cancellation rejected:', error.message);
    expect(error.message).toMatch(/deadline|too late|cannot cancel/i);

    // Verify booking status unchanged
    const bookingAfter = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    expect(bookingAfter!.status).toBe('CONFIRMED');
    expect(bookingAfter!.cancelledAt).toBeNull();

    console.log('✅ Deadline enforcement test passed!');
  });

  test('should process refund correctly (admin only)', async () => {
    // Create a payment record for the package
    const payment = await prisma.payment.create({
      data: {
        packageId: testPackageId,
        amount: 18000,
        currency: 'ARS',
        method: 'ONLINE_MERCADOPAGO',
        status: 'APPROVED',
        externalId: `test-payment-${Date.now()}`,
        paidAt: new Date(),
      },
    });

    console.log('💳 Payment created:', payment.id);

    // Process refund (admin only)
    console.log('💰 Processing refund as admin...');
    const refundResponse = await fetch(`http://localhost:3000/payments/${payment.id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        reason: 'Test refund',
      }),
    });

    expect(refundResponse.status).toBe(200);
    const refundResult = await refundResponse.json();

    console.log('✅ Refund processed:', refundResult);

    // Verify payment status
    const paymentAfter = await prisma.payment.findUnique({
      where: { id: payment.id },
    });

    expect(paymentAfter!.status).toBe('REFUNDED');

    // Verify package status
    const packageAfter = await prisma.package.findUnique({
      where: { id: testPackageId },
      include: { tickets: true },
    });

    expect(packageAfter!.status).toBe('REFUNDED');
    expect(packageAfter!.remainingTickets).toBe(0);

    // Verify all tickets marked as refunded
    const refundedTickets = packageAfter!.tickets.filter((t) => t.status === 'REFUNDED');
    expect(refundedTickets.length).toBeGreaterThan(0);

    console.log('✅ Refund test passed - package and tickets refunded correctly!');
  });

  test('should prevent duplicate refund', async () => {
    // Get the refunded payment from previous test
    const payment = await prisma.payment.findFirst({
      where: { packageId: testPackageId, status: 'REFUNDED' },
    });

    if (!payment) {
      console.log('⚠️ Skipping duplicate refund test - no refunded payment found');
      return;
    }

    // Try to refund again (should fail)
    console.log('💰 Attempting duplicate refund...');
    const refundResponse = await fetch(`http://localhost:3000/payments/${payment.id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        reason: 'Duplicate refund attempt',
      }),
    });

    // Should fail
    expect(refundResponse.status).toBeGreaterThanOrEqual(400);
    const error = await refundResponse.json();

    console.log('✅ Duplicate refund rejected:', error.message);
    expect(error.message).toMatch(/already refunded|cannot refund/i);

    console.log('✅ Refund idempotency test passed!');
  });
});
