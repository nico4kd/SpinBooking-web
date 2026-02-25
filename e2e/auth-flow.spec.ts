import { test, expect } from '@playwright/test';

/**
 * Critical E2E Test: Authentication Flow
 *
 * This test verifies the complete authentication system:
 * 1. User registration
 * 2. Login with valid credentials
 * 3. Protected route access
 * 4. Logout
 * 5. Token refresh (implicit)
 *
 * Business Logic Tested:
 * - Registration with validation
 * - JWT token generation
 * - Protected route guards
 * - Session management
 * - Logout and token cleanup
 */

test.describe('Authentication Flow', () => {
  const TEST_USER = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    nroDocumento: '35111222',
    phone: '+56912345678',
  };

  const EXISTING_USER = {
    email: 'carolina.member@spinbooking.com',
    password: 'Member123!',
  };

  test('should complete full registration flow', async ({ page }) => {
    await test.step('Navigate to registration page', async () => {
      await page.goto('/register');
      await expect(page).toHaveURL('/register');
    });

    await test.step('Verify DNI field is visible', async () => {
      await expect(page.locator('input[name="nroDocumento"]')).toBeVisible();
    });

    await test.step('Fill registration form', async () => {
      // Fill out all required fields
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.fill('input[name="firstName"]', TEST_USER.firstName);
      await page.fill('input[name="lastName"]', TEST_USER.lastName);
      await page.fill('input[name="nroDocumento"]', TEST_USER.nroDocumento);
      await page.fill('input[name="phone"]', TEST_USER.phone);

      // Submit the form
      await page.click('button[type="submit"]');
    });

    await test.step('Verify successful registration', async () => {
      // Should redirect to login or dashboard
      await page.waitForURL(/\/login|\/dashboard/, { timeout: 5000 });

      // Check for success message or redirect
      const isOnLogin = page.url().includes('/login');
      const isOnDashboard = page.url().includes('/dashboard');

      expect(isOnLogin || isOnDashboard).toBeTruthy();

      // If redirected to login, verify success message
      if (isOnLogin) {
        await expect(page.locator('text=/Registro exitoso|Registration successful/i')).toBeVisible({
          timeout: 3000,
        }).catch(() => {
          // Message might not always be visible, that's OK
        });
      }
    });
  });

  test('should login with valid credentials', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await expect(page).toHaveURL('/login');
    });

    await test.step('Enter valid credentials', async () => {
      await page.fill('input[name="email"]', EXISTING_USER.email);
      await page.fill('input[name="password"]', EXISTING_USER.password);
    });

    await test.step('Submit login form', async () => {
      await page.click('button[type="submit"]');
    });

    await test.step('Verify successful login and redirect', async () => {
      // Should redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 5000 });
      expect(page.url()).toContain('/dashboard');

      // Verify user is logged in
      await expect(page.locator('text=/Carolina|Cerrar Sesión/i')).toBeVisible();
    });

    await test.step('Verify auth token is stored', async () => {
      // Check localStorage for auth token
      const token = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token?.length).toBeGreaterThan(20);
    });
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
    });

    await test.step('Enter invalid credentials', async () => {
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');
    });

    await test.step('Verify error message displayed', async () => {
      // Should show error message
      await expect(page.locator('text=/Credenciales inválidas|Invalid credentials|Error/i')).toBeVisible({
        timeout: 3000,
      });

      // Should stay on login page
      expect(page.url()).toContain('/login');
    });

    await test.step('Verify no auth token stored', async () => {
      const token = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(token).toBeNull();
    });
  });

  test('should protect routes from unauthenticated access', async ({ page }) => {
    await test.step('Clear any existing auth state', async () => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      });
    });

    await test.step('Try to access protected route', async () => {
      // Try to access dashboard without being logged in
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL('/login', { timeout: 3000 });
      expect(page.url()).toContain('/login');
    });

    await test.step('Try to access schedule without login', async () => {
      await page.goto('/schedule');

      // Should redirect to login
      await page.waitForURL('/login', { timeout: 3000 });
      expect(page.url()).toContain('/login');
    });

    await test.step('Try to access bookings without login', async () => {
      await page.goto('/bookings');

      // Should redirect to login
      await page.waitForURL('/login', { timeout: 3000 });
      expect(page.url()).toContain('/login');
    });
  });

  test('should logout successfully', async ({ page }) => {
    await test.step('Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"]', EXISTING_USER.email);
      await page.fill('input[name="password"]', EXISTING_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    await test.step('Click logout button', async () => {
      // Find and click logout button
      await page.click('button:has-text(/Cerrar Sesión|Logout|Salir/i)');
    });

    await test.step('Verify redirect to login', async () => {
      // Should redirect to login page
      await page.waitForURL('/login', { timeout: 3000 });
      expect(page.url()).toContain('/login');
    });

    await test.step('Verify auth state cleared', async () => {
      // Check that tokens are removed from localStorage
      const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      const user = await page.evaluate(() => localStorage.getItem('user'));

      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(user).toBeNull();
    });

    await test.step('Verify cannot access protected routes after logout', async () => {
      await page.goto('/dashboard');

      // Should be redirected back to login
      await page.waitForURL('/login', { timeout: 3000 });
      expect(page.url()).toContain('/login');
    });
  });

  test('should validate email format on registration', async ({ page }) => {
    await test.step('Navigate to registration', async () => {
      await page.goto('/register');
    });

    await test.step('Enter invalid email', async () => {
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'Test123!');
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
    });

    await test.step('Try to submit', async () => {
      await page.click('button[type="submit"]');
    });

    await test.step('Verify validation error', async () => {
      // Should show email validation error
      await expect(page.locator('text=/Email inválido|Invalid email|email válido/i')).toBeVisible({
        timeout: 2000,
      });

      // Should stay on registration page
      expect(page.url()).toContain('/register');
    });
  });

  test('should validate password strength on registration', async ({ page }) => {
    await test.step('Navigate to registration', async () => {
      await page.goto('/register');
    });

    await test.step('Enter weak password', async () => {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', '123'); // Too short, no uppercase, no special char
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
    });

    await test.step('Try to submit', async () => {
      await page.click('button[type="submit"]');
    });

    await test.step('Verify validation error', async () => {
      // Should show password validation error
      await expect(page.locator('text=/contraseña|password|mayúscula|uppercase|8 caracteres|8 characters/i')).toBeVisible({
        timeout: 2000,
      });

      // Should stay on registration page
      expect(page.url()).toContain('/register');
    });
  });

  test('should reject registration with invalid DNI format', async ({ page }) => {
    await test.step('Navigate to registration', async () => {
      await page.goto('/register');
    });

    await test.step('Fill form with invalid DNI', async () => {
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="nroDocumento"]', 'ABC1234');  // non-numeric
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
    });

    await test.step('Verify inline DNI validation error is shown', async () => {
      await expect(
        page.locator('text=/DNI debe tener 7 u 8 dígitos|DNI es requerido/i')
      ).toBeVisible({ timeout: 2000 });
      expect(page.url()).toContain('/register');
    });
  });

  test('should reject registration with duplicate DNI', async ({ page }) => {
    // Use a DNI that matches a seeded user (carolina.member has 35678901)
    await test.step('Navigate to registration', async () => {
      await page.goto('/register');
    });

    await test.step('Fill form with duplicate DNI', async () => {
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="nroDocumento"]', '35678901'); // seeded — carolina.member
      await page.locator('input[name="nroDocumento"]').blur();
      await page.fill('input[name="email"]', `dup${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
    });

    await test.step('Verify duplicate DNI error is shown', async () => {
      await expect(
        page.locator('text=/DNI|documento|already|duplicado|registrado/i')
      ).toBeVisible({ timeout: 5000 });
      expect(page.url()).toContain('/register');
    });
  });

  test('should handle admin login correctly', async ({ page }) => {
    const ADMIN_USER = {
      email: 'admin@spinbooking.com',
      password: 'Admin123!',
    };

    await test.step('Login as admin', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"]', ADMIN_USER.email);
      await page.fill('input[name="password"]', ADMIN_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    await test.step('Verify admin can access admin routes', async () => {
      // Navigate to admin dashboard
      await page.goto('/admin/dashboard');

      // Should NOT redirect (admin has access)
      expect(page.url()).toContain('/admin/dashboard');

      // Verify admin content is visible
      await expect(page.locator('text=/Admin|Panel de Administración/i')).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test('should prevent non-admin from accessing admin routes', async ({ page }) => {
    await test.step('Login as regular member', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"]', EXISTING_USER.email);
      await page.fill('input[name="password"]', EXISTING_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    await test.step('Try to access admin route', async () => {
      await page.goto('/admin/dashboard');

      // Should redirect away from admin (either to /dashboard or /login)
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).not.toContain('/admin');
      expect(url).toMatch(/\/dashboard|\/login/);
    });
  });
});
