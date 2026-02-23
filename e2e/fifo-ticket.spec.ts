import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, addHours } from 'date-fns';

/**
 * FIFO Ticket Consumption E2E Test
 *
 * Tests that tickets are consumed from the package expiring soonest (FIFO logic).
 *
 * Business Rule: When a user has multiple active packages, tickets should be
 * consumed from the package that expires first to minimize waste.
 *
 * This test verifies:
 * 1. User with 2 packages (expires in 5 days vs 30 days)
 * 2. Books a class
 * 3. Ticket is consumed from the package expiring soonest (5 days)
 * 4. Package expiring later (30 days) remains untouched
 */

let prisma: PrismaClient;
let testUserId: string;
let testInstructorUserId: string;
let testInstructorId: string;
let testRoomId: string;
let testClassId: string;
let package1Id: string; // Expires soon (5 days)
let package2Id: string; // Expires later (30 days)

test.beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://spinbooking_user:password@localhost:5432/spinbooking_test',
      },
    },
  });

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: `fifo-test-${Date.now()}@example.com`,
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'FIFO',
      lastName: 'TestUser',
      role: 'MEMBER',
      emailVerified: true,
    },
  });
  testUserId = user.id;

  // Create Package 1: Expires in 5 days (should be consumed FIRST)
  const package1 = await prisma.package.create({
    data: {
      userId: testUserId,
      type: 'STARTER',
      status: 'ACTIVE',
      totalTickets: 4,
      remainingTickets: 4,
      price: 10000,
      currency: 'ARS',
      expiresAt: addDays(new Date(), 5), // Expires SOON
      purchasedAt: new Date(),
    },
  });
  package1Id = package1.id;

  // Create tickets for package 1
  for (let i = 0; i < 4; i++) {
    await prisma.ticket.create({
      data: {
        packageId: package1Id,
        status: 'AVAILABLE',
      },
    });
  }

  // Create Package 2: Expires in 30 days (should NOT be consumed yet)
  const package2 = await prisma.package.create({
    data: {
      userId: testUserId,
      type: 'REGULAR',
      status: 'ACTIVE',
      totalTickets: 8,
      remainingTickets: 8,
      price: 18000,
      currency: 'ARS',
      expiresAt: addDays(new Date(), 30), // Expires LATER
      purchasedAt: new Date(),
    },
  });
  package2Id = package2.id;

  // Create tickets for package 2
  for (let i = 0; i < 8; i++) {
    await prisma.ticket.create({
      data: {
        packageId: package2Id,
        status: 'AVAILABLE',
      },
    });
  }

  // Create test instructor
  const instructorUser = await prisma.user.create({
    data: {
      email: `instructor-fifo-${Date.now()}@example.com`,
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
      name: `FIFO Test Room ${Date.now()}`,
      location: 'Test Location',
      capacity: 20,
      status: 'ACTIVE',
    },
  });
  testRoomId = room.id;

  // Create test class
  const classEntity = await prisma.class.create({
    data: {
      instructorId: testInstructorId,
      roomId: testRoomId,
      startTime: addHours(new Date(), 24),
      duration: 45,
      title: 'FIFO Test Class',
      description: 'Test class for FIFO ticket consumption',
      difficultyLevel: 'ALL_LEVELS',
      maxCapacity: 20,
      currentCapacity: 0,
      status: 'SCHEDULED',
    },
  });
  testClassId = classEntity.id;
});

test.afterAll(async () => {
  // Cleanup
  await prisma.booking.deleteMany({
    where: { userId: testUserId },
  });

  await prisma.class.deleteMany({
    where: { id: testClassId },
  });

  await prisma.instructor.deleteMany({
    where: { id: testInstructorId },
  });

  await prisma.room.deleteMany({
    where: { id: testRoomId },
  });

  await prisma.ticket.deleteMany({
    where: { packageId: { in: [package1Id, package2Id] } },
  });

  await prisma.package.deleteMany({
    where: { id: { in: [package1Id, package2Id] } },
  });

  await prisma.refreshToken.deleteMany({
    where: { userId: testUserId },
  });

  await prisma.user.deleteMany({
    where: { id: { in: [testUserId, testInstructorUserId] } },
  });

  await prisma.$disconnect();
});

test.describe('FIFO Ticket Consumption', () => {
  test('should consume ticket from package expiring soonest', async () => {
    // Login as test user
    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `fifo-test-${testUserId.slice(-8)}@example.com`, // This won't match, need actual email
      }),
    });

    // Get actual email from database
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
    });

    const loginResponse2 = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user!.email,
        password: 'Test123!',
      }),
    });

    const { accessToken } = await loginResponse2.json();

    // Verify initial state
    const package1Before = await prisma.package.findUnique({
      where: { id: package1Id },
      include: { tickets: true },
    });

    const package2Before = await prisma.package.findUnique({
      where: { id: package2Id },
      include: { tickets: true },
    });

    console.log('📦 Package 1 (expires soon):', {
      expiresAt: package1Before!.expiresAt,
      remainingTickets: package1Before!.remainingTickets,
      availableTickets: package1Before!.tickets.filter((t) => t.status === 'AVAILABLE').length,
    });

    console.log('📦 Package 2 (expires later):', {
      expiresAt: package2Before!.expiresAt,
      remainingTickets: package2Before!.remainingTickets,
      availableTickets: package2Before!.tickets.filter((t) => t.status === 'AVAILABLE').length,
    });

    // CRITICAL: Verify package 1 expires before package 2
    expect(package1Before!.expiresAt.getTime()).toBeLessThan(
      package2Before!.expiresAt.getTime(),
    );

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

    console.log('✅ Booking created:', booking);

    // Get the ticket that was used
    const usedTicket = await prisma.ticket.findUnique({
      where: { id: booking.ticketId },
      include: { package: true },
    });

    console.log('🎟️ Used ticket from package:', {
      packageId: usedTicket!.packageId,
      packageType: usedTicket!.package.type,
      packageExpiresAt: usedTicket!.package.expiresAt,
    });

    // CRITICAL ASSERTION: Ticket should be from package 1 (expires soonest)
    expect(usedTicket!.packageId).toBe(package1Id);
    expect(usedTicket!.status).toBe('USED');

    // Verify package states after booking
    const package1After = await prisma.package.findUnique({
      where: { id: package1Id },
      include: { tickets: true },
    });

    const package2After = await prisma.package.findUnique({
      where: { id: package2Id },
      include: { tickets: true },
    });

    console.log('📦 Package 1 after booking:', {
      remainingTickets: package1After!.remainingTickets,
      availableTickets: package1After!.tickets.filter((t) => t.status === 'AVAILABLE').length,
      usedTickets: package1After!.tickets.filter((t) => t.status === 'USED').length,
    });

    console.log('📦 Package 2 after booking:', {
      remainingTickets: package2After!.remainingTickets,
      availableTickets: package2After!.tickets.filter((t) => t.status === 'AVAILABLE').length,
      usedTickets: package2After!.tickets.filter((t) => t.status === 'USED').length,
    });

    // Verify package 1 was decremented
    expect(package1After!.remainingTickets).toBe(3);
    expect(package1After!.tickets.filter((t) => t.status === 'AVAILABLE').length).toBe(3);
    expect(package1After!.tickets.filter((t) => t.status === 'USED').length).toBe(1);

    // Verify package 2 was NOT touched
    expect(package2After!.remainingTickets).toBe(8);
    expect(package2After!.tickets.filter((t) => t.status === 'AVAILABLE').length).toBe(8);
    expect(package2After!.tickets.filter((t) => t.status === 'USED').length).toBe(0);

    console.log('✅ FIFO test passed - ticket consumed from package expiring soonest!');
  });

  test('should switch to next package when first package is depleted', async () => {
    // Get user and login
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
    });

    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user!.email,
        password: 'Test123!',
      }),
    });

    const { accessToken } = await loginResponse.json();

    // Create 3 more classes to deplete package 1 (it has 3 remaining tickets)
    const classes = [];
    for (let i = 0; i < 3; i++) {
      const cls = await prisma.class.create({
        data: {
          instructorId: testInstructorId,
          roomId: testRoomId,
          startTime: addHours(new Date(), 24 * (i + 2)),
          duration: 45,
          title: `FIFO Test Class ${i + 2}`,
          description: 'Additional test class',
          difficultyLevel: 'ALL_LEVELS',
          maxCapacity: 20,
          currentCapacity: 0,
          status: 'SCHEDULED',
        },
      });
      classes.push(cls);
    }

    // Book all 3 classes to deplete package 1
    console.log('🎫 Booking 3 more classes to deplete package 1...');

    for (const cls of classes) {
      const bookingResponse = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          classId: cls.id,
        }),
      });

      expect(bookingResponse.status).toBe(201);
    }

    // Verify package 1 is now depleted
    const package1Final = await prisma.package.findUnique({
      where: { id: package1Id },
      include: { tickets: true },
    });

    console.log('📦 Package 1 final state:', {
      status: package1Final!.status,
      remainingTickets: package1Final!.remainingTickets,
      availableTickets: package1Final!.tickets.filter((t) => t.status === 'AVAILABLE').length,
    });

    expect(package1Final!.remainingTickets).toBe(0);
    expect(package1Final!.status).toBe('DEPLETED');

    // Now book one more class - should use package 2
    const lastClass = await prisma.class.create({
      data: {
        instructorId: testInstructorId,
        roomId: testRoomId,
        startTime: addHours(new Date(), 24 * 10),
        duration: 45,
        title: 'FIFO Test Class - Final',
        description: 'Should use package 2',
        difficultyLevel: 'ALL_LEVELS',
        maxCapacity: 20,
        currentCapacity: 0,
        status: 'SCHEDULED',
      },
    });

    console.log('🎫 Booking final class (should use package 2)...');

    const finalBookingResponse = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        classId: lastClass.id,
      }),
    });

    expect(finalBookingResponse.status).toBe(201);
    const finalBooking = await finalBookingResponse.json();

    // Verify this booking used package 2
    const finalTicket = await prisma.ticket.findUnique({
      where: { id: finalBooking.ticketId },
    });

    console.log('🎟️ Final ticket from package:', finalTicket!.packageId);

    // CRITICAL ASSERTION: Should be from package 2
    expect(finalTicket!.packageId).toBe(package2Id);

    // Verify package 2 state
    const package2Final = await prisma.package.findUnique({
      where: { id: package2Id },
      include: { tickets: true },
    });

    expect(package2Final!.remainingTickets).toBe(7);
    expect(package2Final!.tickets.filter((t) => t.status === 'USED').length).toBe(1);

    // Cleanup extra classes
    await prisma.booking.deleteMany({
      where: { classId: { in: [...classes.map((c) => c.id), lastClass.id] } },
    });

    await prisma.class.deleteMany({
      where: { id: { in: [...classes.map((c) => c.id), lastClass.id] } },
    });

    console.log('✅ Package switching test passed - correctly switched to package 2!');
  });
});
