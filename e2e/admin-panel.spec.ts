import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addHours } from 'date-fns';

/**
 * Admin Panel E2E Test
 *
 * Tests admin-only functionality:
 * 1. Admin can create classes
 * 2. Admin can view all bookings
 * 3. Admin can mark attendance (ATTENDED status)
 * 4. Admin can process manual payments
 * 5. Regular users cannot access admin endpoints
 */

let prisma: PrismaClient;
let adminUserId: string;
let memberUserId: string;
let adminToken: string;
let memberToken: string;
let testRoomId: string;
let testInstructorId: string;
let testInstructorUserId: string;

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
      email: `admin-panel-${Date.now()}@example.com`,
      password: await bcrypt.hash('Admin123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  adminUserId = admin.id;

  // Get admin token
  const adminLoginResp = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: admin.email,
      password: 'Admin123!',
    }),
  });
  const adminData = await adminLoginResp.json();
  adminToken = adminData.accessToken;

  // Create regular member user
  const member = await prisma.user.create({
    data: {
      email: `member-panel-${Date.now()}@example.com`,
      password: await bcrypt.hash('Member123!', 10),
      firstName: 'Regular',
      lastName: 'Member',
      role: 'MEMBER',
      emailVerified: true,
    },
  });
  memberUserId = member.id;

  // Get member token
  const memberLoginResp = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: member.email,
      password: 'Member123!',
    }),
  });
  const memberData = await memberLoginResp.json();
  memberToken = memberData.accessToken;

  // Create test room
  const room = await prisma.room.create({
    data: {
      name: `Admin Test Room ${Date.now()}`,
      location: 'Test Location',
      capacity: 20,
      status: 'ACTIVE',
    },
  });
  testRoomId = room.id;

  // Create instructor
  const instructorUser = await prisma.user.create({
    data: {
      email: `instructor-admin-${Date.now()}@example.com`,
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
});

test.afterAll(async () => {
  // Cleanup
  await prisma.booking.deleteMany({
    where: { userId: { in: [adminUserId, memberUserId] } },
  });

  await prisma.class.deleteMany({
    where: { roomId: testRoomId },
  });

  await prisma.instructor.deleteMany({
    where: { id: testInstructorId },
  });

  await prisma.room.deleteMany({
    where: { id: testRoomId },
  });

  await prisma.ticket.deleteMany({
    where: { package: { userId: { in: [adminUserId, memberUserId] } } },
  });

  await prisma.package.deleteMany({
    where: { userId: { in: [adminUserId, memberUserId] } },
  });

  await prisma.refreshToken.deleteMany({
    where: { userId: { in: [adminUserId, memberUserId, testInstructorUserId] } },
  });

  await prisma.user.deleteMany({
    where: { id: { in: [adminUserId, memberUserId, testInstructorUserId] } },
  });

  await prisma.$disconnect();
});

test.describe('Admin Panel Functionality', () => {
  test('admin can create a new class', async () => {
    console.log('📅 Creating class as admin...');

    const classResponse = await fetch('http://localhost:3000/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        instructorId: testInstructorId,
        roomId: testRoomId,
        startTime: addHours(new Date(), 48).toISOString(),
        duration: 45,
        title: 'Admin Created Class',
        description: 'Test class created by admin',
        difficultyLevel: 'INTERMEDIATE',
        musicTheme: 'Rock',
      }),
    });

    expect(classResponse.status).toBe(201);
    const classData = await classResponse.json();

    console.log('✅ Class created:', classData.id);

    // Verify class was created
    expect(classData.title).toBe('Admin Created Class');
    expect(classData.instructorId).toBe(testInstructorId);
    expect(classData.maxCapacity).toBeGreaterThan(0);

    console.log('✅ Admin class creation test passed!');
  });

  test('regular member CANNOT create classes', async () => {
    console.log('🚫 Attempting to create class as member (should fail)...');

    const classResponse = await fetch('http://localhost:3000/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        instructorId: testInstructorId,
        roomId: testRoomId,
        startTime: addHours(new Date(), 48).toISOString(),
        duration: 45,
        title: 'Member Unauthorized Class',
      }),
    });

    // Should be forbidden
    expect(classResponse.status).toBe(403);

    console.log('✅ Authorization test passed - member blocked from admin action!');
  });

  test('admin can mark booking attendance', async () => {
    // Create a booking first
    const packageEntity = await prisma.package.create({
      data: {
        userId: memberUserId,
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

    const ticket = await prisma.ticket.create({
      data: {
        packageId: packageEntity.id,
        status: 'AVAILABLE',
      },
    });

    const classEntity = await prisma.class.create({
      data: {
        instructorId: testInstructorId,
        roomId: testRoomId,
        startTime: addHours(new Date(), 24),
        duration: 45,
        title: 'Attendance Test Class',
        difficultyLevel: 'ALL_LEVELS',
        maxCapacity: 20,
        currentCapacity: 0,
        status: 'SCHEDULED',
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userId: memberUserId,
        classId: classEntity.id,
        ticketId: ticket.id,
        status: 'CONFIRMED',
      },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
        bookingId: booking.id,
      },
    });

    console.log('📋 Marking attendance as admin...');

    // Mark attendance (admin only)
    const attendanceResponse = await fetch(
      `http://localhost:3000/admin/bookings/${booking.id}/attendance`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'ATTENDED',
        }),
      },
    );

    expect(attendanceResponse.status).toBe(200);

    // Verify booking status
    const bookingAfter = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    expect(bookingAfter!.status).toBe('ATTENDED');

    console.log('✅ Attendance marked successfully!');
  });

  test('admin can view all bookings', async () => {
    console.log('📊 Fetching all bookings as admin...');

    const bookingsResponse = await fetch('http://localhost:3000/admin/bookings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(bookingsResponse.status).toBe(200);
    const bookings = await bookingsResponse.json();

    console.log(`📋 Found ${bookings.length} bookings`);

    expect(Array.isArray(bookings)).toBe(true);

    console.log('✅ Admin booking list test passed!');
  });

  test('admin can process manual payment', async () => {
    // Create pending package
    const packageEntity = await prisma.package.create({
      data: {
        userId: memberUserId,
        type: 'STARTER',
        status: 'PENDING',
        totalTickets: 4,
        remainingTickets: 4,
        price: 10000,
        currency: 'ARS',
        expiresAt: addHours(new Date(), 24 * 30),
      },
    });

    console.log('💵 Processing manual cash payment as admin...');

    // Process in-person cash payment (admin only)
    const paymentResponse = await fetch(
      `http://localhost:3000/payments/in-person/${packageEntity.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          method: 'IN_PERSON_CASH',
        }),
      },
    );

    expect(paymentResponse.status).toBe(201);
    const payment = await paymentResponse.json();

    console.log('✅ Manual payment processed:', payment.id);

    // Verify payment created
    expect(payment.method).toBe('IN_PERSON_CASH');
    expect(payment.status).toBe('APPROVED');
    expect(payment.receiptNumber).toBeTruthy();

    // Verify package activated
    const packageAfter = await prisma.package.findUnique({
      where: { id: packageEntity.id },
      include: { tickets: true },
    });

    expect(packageAfter!.status).toBe('ACTIVE');
    expect(packageAfter!.tickets.length).toBe(4);

    console.log('✅ Manual payment test passed!');
  });

  test('member CANNOT process manual payments', async () => {
    const packageEntity = await prisma.package.create({
      data: {
        userId: memberUserId,
        type: 'TRIAL',
        status: 'PENDING',
        totalTickets: 1,
        remainingTickets: 1,
        price: 3000,
        currency: 'ARS',
        expiresAt: addHours(new Date(), 24 * 7),
      },
    });

    console.log('🚫 Attempting manual payment as member (should fail)...');

    const paymentResponse = await fetch(
      `http://localhost:3000/payments/in-person/${packageEntity.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          method: 'IN_PERSON_CASH',
        }),
      },
    );

    // Should be forbidden
    expect(paymentResponse.status).toBe(403);

    console.log('✅ Authorization test passed - member blocked from manual payment!');
  });
});
