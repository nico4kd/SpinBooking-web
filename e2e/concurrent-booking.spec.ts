import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addHours } from 'date-fns';

/**
 * Concurrent Booking E2E Test
 *
 * Tests the critical business logic that prevents overbooking when multiple users
 * try to book the last available spot simultaneously.
 *
 * This test verifies:
 * 1. Row locking prevents race conditions
 * 2. Only one booking succeeds when multiple requests are made concurrently
 * 3. Database integrity is maintained (currentCapacity matches actual bookings)
 * 4. Other requests receive appropriate error messages
 */

let prisma: PrismaClient;
let testUsersIds: string[] = [];
let testClassId: string;
let testRoomId: string;
let testInstructorId: string;
let testInstructorUserId: string;

test.beforeAll(async () => {
  // Connect to test database
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
      email: `instructor-concurrent-${Date.now()}@example.com`,
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
      bio: 'Test instructor for concurrent booking',
      specialties: ['High Intensity'],
      status: 'ACTIVE',
    },
  });
  testInstructorId = instructor.id;

  // Create test room
  const room = await prisma.room.create({
    data: {
      name: `Concurrent Test Room ${Date.now()}`,
      location: 'Test Location',
      capacity: 20,
      status: 'ACTIVE',
    },
  });
  testRoomId = room.id;

  // Create test class with only 1 spot available (maxCapacity = 1)
  const classEntity = await prisma.class.create({
    data: {
      instructorId: testInstructorId,
      roomId: testRoomId,
      startTime: addHours(new Date(), 24), // Tomorrow
      duration: 45,
      title: 'Concurrent Booking Test Class',
      description: 'Only 1 spot available',
      difficultyLevel: 'ALL_LEVELS',
      maxCapacity: 1, // CRITICAL: Only 1 spot
      currentCapacity: 0,
      status: 'SCHEDULED',
    },
  });
  testClassId = classEntity.id;

  // Create 3 test users who will try to book concurrently
  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `concurrent-user-${i}-${Date.now()}@example.com`,
        password: await bcrypt.hash('Test123!', 10),
        firstName: `Concurrent`,
        lastName: `User${i}`,
        role: 'MEMBER',
        emailVerified: true,
      },
    });

    // Create active package with tickets for each user
    const packageEntity = await prisma.package.create({
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

    // Create tickets
    for (let j = 0; j < 8; j++) {
      await prisma.ticket.create({
        data: {
          packageId: packageEntity.id,
          status: 'AVAILABLE',
        },
      });
    }

    testUsersIds.push(user.id);
  }
});

test.afterAll(async () => {
  // Cleanup test data
  await prisma.booking.deleteMany({
    where: { userId: { in: testUsersIds } },
  });

  await prisma.waitlist.deleteMany({
    where: { userId: { in: testUsersIds } },
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

  for (const userId of testUsersIds) {
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
    where: { id: { in: [...testUsersIds, testInstructorUserId] } },
  });

  await prisma.$disconnect();
});

test.describe('Concurrent Booking Race Condition Test', () => {
  test('should allow only ONE booking when 3 users book simultaneously', async () => {
    // Get auth tokens for all 3 users
    const tokens = await Promise.all(
      testUsersIds.map(async (userId) => {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user!.email,
            password: 'Test123!',
          }),
        });

        const data = await response.json();
        return data.accessToken;
      }),
    );

    // Simulate 3 concurrent booking requests
    console.log('🚀 Launching 3 concurrent booking requests...');

    const bookingPromises = tokens.map((token) =>
      fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: testClassId,
        }),
      }).then((res) => ({ status: res.status, data: res.json() })),
    );

    const results = await Promise.all(bookingPromises);

    // Parse responses
    const parsedResults = await Promise.all(
      results.map(async (result) => ({
        status: result.status,
        data: await result.data,
      })),
    );

    console.log('📊 Booking results:', parsedResults);

    // Verify results
    const successfulBookings = parsedResults.filter((r) => r.status === 201);
    const failedBookings = parsedResults.filter((r) => r.status !== 201);

    console.log(`✅ Successful bookings: ${successfulBookings.length}`);
    console.log(`❌ Failed bookings: ${failedBookings.length}`);

    // CRITICAL ASSERTION: Exactly ONE booking should succeed
    expect(successfulBookings.length).toBe(1);
    expect(failedBookings.length).toBe(2);

    // Verify failed bookings received appropriate error
    failedBookings.forEach((result) => {
      expect(result.status).toBeGreaterThanOrEqual(400);
      expect(result.data.message).toMatch(/full|capacity|available/i);
    });

    // Verify database integrity
    const classEntity = await prisma.class.findUnique({
      where: { id: testClassId },
      include: { bookings: true },
    });

    console.log(`📈 Current capacity: ${classEntity!.currentCapacity}`);
    console.log(`📊 Actual bookings: ${classEntity!.bookings.length}`);

    // CRITICAL ASSERTION: Database integrity
    expect(classEntity!.currentCapacity).toBe(1);
    expect(classEntity!.bookings.length).toBe(1);
    expect(classEntity!.bookings[0].status).toBe('CONFIRMED');

    // Verify the booking is from one of our test users
    expect(testUsersIds).toContain(classEntity!.bookings[0].userId);

    console.log('✅ Concurrent booking test passed - row locking works!');
  });

  test('should handle 10 concurrent requests correctly', async () => {
    // Create a new class with 3 spots
    const newClassEntity = await prisma.class.create({
      data: {
        instructorId: testInstructorId,
        roomId: testRoomId,
        startTime: addHours(new Date(), 48), // 2 days from now
        duration: 45,
        title: 'Concurrent Test - 3 spots',
        description: 'Testing with 3 available spots',
        difficultyLevel: 'ALL_LEVELS',
        maxCapacity: 3,
        currentCapacity: 0,
        status: 'SCHEDULED',
      },
    });

    // Create 10 users who will try to book
    const users = await Promise.all(
      Array.from({ length: 10 }, async (_, i) => {
        const user = await prisma.user.create({
          data: {
            email: `stress-user-${i}-${Date.now()}@example.com`,
            password: await bcrypt.hash('Test123!', 10),
            firstName: `Stress`,
            lastName: `User${i}`,
            role: 'MEMBER',
            emailVerified: true,
          },
        });

        // Create package with tickets
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

        return user;
      }),
    );

    const userIds = users.map((u) => u.id);

    // Get tokens
    const tokens = await Promise.all(
      users.map(async (user) => {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            password: 'Test123!',
          }),
        });

        const data = await response.json();
        return data.accessToken;
      }),
    );

    console.log('🚀 Launching 10 concurrent requests for 3 spots...');

    // Launch 10 concurrent requests
    const bookingPromises = tokens.map((token) =>
      fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: newClassEntity.id,
        }),
      }).then((res) => ({ status: res.status, data: res.json() })),
    );

    const results = await Promise.all(bookingPromises);
    const parsedResults = await Promise.all(
      results.map(async (result) => ({
        status: result.status,
        data: await result.data,
      })),
    );

    const successfulBookings = parsedResults.filter((r) => r.status === 201);
    const failedBookings = parsedResults.filter((r) => r.status !== 201);

    console.log(`✅ Successful bookings: ${successfulBookings.length}`);
    console.log(`❌ Failed bookings: ${failedBookings.length}`);

    // CRITICAL ASSERTION: Exactly 3 bookings should succeed
    expect(successfulBookings.length).toBe(3);
    expect(failedBookings.length).toBe(7);

    // Verify database integrity
    const finalClass = await prisma.class.findUnique({
      where: { id: newClassEntity.id },
      include: { bookings: true },
    });

    expect(finalClass!.currentCapacity).toBe(3);
    expect(finalClass!.bookings.length).toBe(3);

    // Cleanup
    await prisma.booking.deleteMany({
      where: { classId: newClassEntity.id },
    });
    await prisma.class.deleteMany({
      where: { id: newClassEntity.id },
    });

    for (const userId of userIds) {
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
      where: { id: { in: userIds } },
    });

    console.log('✅ Stress test passed - handled 10 concurrent requests correctly!');
  });
});
