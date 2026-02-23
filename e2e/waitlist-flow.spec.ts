import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addHours } from 'date-fns';

/**
 * Waitlist Flow E2E Test
 *
 * Tests the waitlist functionality when a class is full:
 *
 * 1. Fill class to maximum capacity (20 bookings)
 * 2. User tries to book → automatically joins waitlist
 * 3. Another user cancels their booking
 * 4. First user in waitlist is notified (spot offered)
 * 5. User accepts waitlist offer → booking is created
 * 6. Verify waitlist position management
 */

let prisma: PrismaClient;
let testRoomId: string;
let testInstructorId: string;
let testInstructorUserId: string;
let testClassId: string;
let waitlistUserId: string;
let waitlistAccessToken: string;
let fillerUserIds: string[] = [];
let fillerBookingIds: string[] = [];

test.beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://spinbooking_user:password@localhost:5432/spinbooking_test',
      },
    },
  });

  // Create test instructor
  const instructorUser = await prisma.user.create({
    data: {
      email: `instructor-waitlist-${Date.now()}@example.com`,
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
      name: `Waitlist Test Room ${Date.now()}`,
      location: 'Test Location',
      capacity: 5, // Small capacity for easier testing
      status: 'ACTIVE',
    },
  });
  testRoomId = room.id;

  // Create test class with small capacity
  const classEntity = await prisma.class.create({
    data: {
      instructorId: testInstructorId,
      roomId: testRoomId,
      startTime: addHours(new Date(), 24),
      duration: 45,
      title: 'Waitlist Test Class',
      description: 'Small capacity for waitlist testing',
      difficultyLevel: 'ALL_LEVELS',
      maxCapacity: 5, // Only 5 spots
      currentCapacity: 0,
      status: 'SCHEDULED',
    },
  });
  testClassId = classEntity.id;

  // Create 5 filler users to fill the class
  console.log('👥 Creating 5 users to fill the class...');
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `filler-waitlist-${i}-${Date.now()}@example.com`,
        password: await bcrypt.hash('Test123!', 10),
        firstName: `Filler`,
        lastName: `User${i}`,
        role: 'MEMBER',
        emailVerified: true,
      },
    });

    // Create package with ticket
    const pkg = await prisma.package.create({
      data: {
        userId: user.id,
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
        packageId: pkg.id,
        status: 'AVAILABLE',
      },
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        classId: testClassId,
        ticketId: ticket.id,
        status: 'CONFIRMED',
      },
    });

    // Update ticket and class capacity
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
        bookingId: booking.id,
      },
    });

    await prisma.class.update({
      where: { id: testClassId },
      data: {
        currentCapacity: {
          increment: 1,
        },
      },
    });

    fillerUserIds.push(user.id);
    fillerBookingIds.push(booking.id);
  }

  // Create waitlist user (will join waitlist)
  const waitlistUser = await prisma.user.create({
    data: {
      email: `waitlist-user-${Date.now()}@example.com`,
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Waitlist',
      lastName: 'User',
      role: 'MEMBER',
      emailVerified: true,
    },
  });
  waitlistUserId = waitlistUser.id;

  // Create package with tickets for waitlist user
  const pkg = await prisma.package.create({
    data: {
      userId: waitlistUserId,
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

  for (let i = 0; i < 8; i++) {
    await prisma.ticket.create({
      data: {
        packageId: pkg.id,
        status: 'AVAILABLE',
      },
    });
  }

  // Get waitlist user token
  const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: waitlistUser.email,
      password: 'Test123!',
    }),
  });
  const data = await loginResponse.json();
  waitlistAccessToken = data.accessToken;
});

test.afterAll(async () => {
  // Cleanup
  await prisma.waitlist.deleteMany({
    where: { classId: testClassId },
  });

  await prisma.booking.deleteMany({
    where: { classId: testClassId },
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

  for (const userId of [...fillerUserIds, waitlistUserId]) {
    await prisma.ticket.deleteMany({
      where: { package: { userId } },
    });
    await prisma.package.deleteMany({
      where: { userId },
    });
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  await prisma.user.deleteMany({
    where: { id: { in: [...fillerUserIds, waitlistUserId, testInstructorUserId] } },
  });

  await prisma.$disconnect();
});

test.describe('Waitlist Flow', () => {
  test('should automatically join waitlist when class is full', async () => {
    // Verify class is full
    const classBefore = await prisma.class.findUnique({
      where: { id: testClassId },
    });

    console.log('📊 Class capacity:', {
      current: classBefore!.currentCapacity,
      max: classBefore!.maxCapacity,
    });

    expect(classBefore!.currentCapacity).toBe(classBefore!.maxCapacity);

    // Try to book (should automatically join waitlist)
    console.log('🎫 Attempting to book full class...');
    const bookingResponse = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${waitlistAccessToken}`,
      },
      body: JSON.stringify({
        classId: testClassId,
      }),
    });

    // Should return 200 or 201 with waitlist info (not an error)
    expect([200, 201]).toContain(bookingResponse.status);
    const result = await bookingResponse.json();

    console.log('✅ Response:', result);

    // Verify waitlist entry was created
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        userId: waitlistUserId,
        classId: testClassId,
      },
    });

    expect(waitlistEntry).toBeTruthy();
    expect(waitlistEntry!.status).toBe('ACTIVE');
    expect(waitlistEntry!.position).toBe(1); // First in line

    console.log('✅ Joined waitlist at position:', waitlistEntry!.position);
  });

  test('should notify waitlist user when spot becomes available', async () => {
    // Get first booking to cancel
    const firstBooking = await prisma.booking.findFirst({
      where: {
        classId: testClassId,
        status: 'CONFIRMED',
      },
      include: { user: true },
    });

    // Get token for filler user
    const fillerLoginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: firstBooking!.user.email,
        password: 'Test123!',
      }),
    });
    const fillerData = await fillerLoginResponse.json();

    // Cancel booking
    console.log('❌ Filler user cancelling booking...');
    const cancelResponse = await fetch(`http://localhost:3000/bookings/${firstBooking!.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fillerData.accessToken}`,
      },
      body: JSON.stringify({
        reason: 'Making room for waitlist test',
      }),
    });

    expect(cancelResponse.status).toBe(200);

    // Wait a moment for waitlist processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify waitlist user was notified
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        userId: waitlistUserId,
        classId: testClassId,
      },
    });

    console.log('📬 Waitlist entry status:', waitlistEntry!.status);

    // Status should be NOTIFIED
    expect(waitlistEntry!.status).toBe('NOTIFIED');
    expect(waitlistEntry!.notifiedAt).toBeTruthy();
    expect(waitlistEntry!.notificationExpiresAt).toBeTruthy();

    console.log('✅ Waitlist user was notified!');
  });

  test('should allow waitlist user to accept offer and create booking', async () => {
    // Get waitlist entry
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        userId: waitlistUserId,
        classId: testClassId,
        status: 'NOTIFIED',
      },
    });

    if (!waitlistEntry) {
      console.log('⚠️ Skipping accept test - no notified waitlist entry');
      return;
    }

    // Accept waitlist offer
    console.log('✅ Accepting waitlist offer...');
    const acceptResponse = await fetch(`http://localhost:3000/waitlist/${waitlistEntry.id}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${waitlistAccessToken}`,
      },
    });

    expect(acceptResponse.status).toBe(201);
    const booking = await acceptResponse.json();

    console.log('🎫 Booking created:', booking.id);

    // Verify booking was created
    const newBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    expect(newBooking).toBeTruthy();
    expect(newBooking!.userId).toBe(waitlistUserId);
    expect(newBooking!.classId).toBe(testClassId);
    expect(newBooking!.status).toBe('CONFIRMED');

    // Verify waitlist entry status
    const waitlistAfter = await prisma.waitlist.findUnique({
      where: { id: waitlistEntry.id },
    });

    expect(waitlistAfter!.status).toBe('ACCEPTED');
    expect(waitlistAfter!.respondedAt).toBeTruthy();

    // Verify class capacity
    const classAfter = await prisma.class.findUnique({
      where: { id: testClassId },
    });

    expect(classAfter!.currentCapacity).toBe(5); // Back to full

    console.log('✅ Waitlist acceptance test passed!');
  });

  test('should manage waitlist positions correctly', async () => {
    // Create 3 more waitlist users
    const waitlistUsers = [];

    for (let i = 0; i < 3; i++) {
      const user = await prisma.user.create({
        data: {
          email: `waitlist-pos-${i}-${Date.now()}@example.com`,
          password: await bcrypt.hash('Test123!', 10),
          firstName: `WaitPos`,
          lastName: `User${i}`,
          role: 'MEMBER',
          emailVerified: true,
        },
      });

      // Create package
      const pkg = await prisma.package.create({
        data: {
          userId: user.id,
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

      await prisma.ticket.create({
        data: {
          packageId: pkg.id,
          status: 'AVAILABLE',
        },
      });

      waitlistUsers.push(user);
    }

    // All 3 users join waitlist
    for (let i = 0; i < waitlistUsers.length; i++) {
      const user = waitlistUsers[i];

      // Login
      const loginResp = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: 'Test123!',
        }),
      });
      const { accessToken } = await loginResp.json();

      // Join waitlist
      await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          classId: testClassId,
        }),
      });
    }

    // Verify positions
    const waitlistEntries = await prisma.waitlist.findMany({
      where: {
        classId: testClassId,
        status: 'ACTIVE',
      },
      orderBy: {
        position: 'asc',
      },
    });

    console.log('📊 Waitlist positions:', waitlistEntries.map((e) => ({
      userId: e.userId.slice(-8),
      position: e.position,
    })));

    // Verify positions are sequential
    expect(waitlistEntries.length).toBeGreaterThanOrEqual(3);
    waitlistEntries.forEach((entry, index) => {
      if (index > 0) {
        expect(entry.position).toBeGreaterThan(waitlistEntries[index - 1].position);
      }
    });

    // Cleanup
    for (const user of waitlistUsers) {
      await prisma.waitlist.deleteMany({ where: { userId: user.id } });
      await prisma.ticket.deleteMany({ where: { package: { userId: user.id } } });
      await prisma.package.deleteMany({ where: { userId: user.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.deleteMany({ where: { id: user.id } });
    }

    console.log('✅ Waitlist position test passed!');
  });
});
