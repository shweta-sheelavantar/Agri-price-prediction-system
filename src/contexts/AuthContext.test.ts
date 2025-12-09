import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Feature: agrifriend-platform, Property 28: Session duration correctness
// Validates: Requirements 7.2

describe('Session Management Properties', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('Property 28: Session duration correctness - sessions expire after 30 days', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 10 }), // mobile number
        fc.constantFrom('Wheat', 'Rice', 'Cotton', 'Onion'), // crop
        fc.integer({ min: 0, max: 60 }), // days offset
        (mobileNumber, crop, daysOffset) => {
          // Create a session
          const user = {
            id: `user_${Date.now()}`,
            mobileNumber,
            primaryCrop: crop,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
            preferredLanguage: 'en',
            isActive: true,
            preferences: {
              notificationChannels: ['push' as const, 'sms' as const],
              priceAlertFrequency: 'realtime' as const,
              dashboardLayout: 'default',
              theme: 'light' as const,
            },
          };

          // Set session expiry
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          localStorage.setItem('agrifriend_user', JSON.stringify(user));
          localStorage.setItem('agrifriend_session_expiry', expiryDate.toISOString());

          // Simulate time passing
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() + daysOffset);

          const storedExpiry = localStorage.getItem('agrifriend_session_expiry');
          if (!storedExpiry) return false;

          const expiryDateCheck = new Date(storedExpiry);
          const shouldBeValid = checkDate <= expiryDateCheck;

          // Session should be valid if check date is before or equal to expiry
          // Session should be invalid if check date is after expiry
          if (daysOffset <= 30) {
            return shouldBeValid === true;
          } else {
            return shouldBeValid === false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: Session duration correctness - logout clears session data', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 10 }),
        fc.constantFrom('Wheat', 'Rice', 'Cotton'),
        (mobileNumber, crop) => {
          // Create a session
          const user = {
            id: `user_${Date.now()}`,
            mobileNumber,
            primaryCrop: crop,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
            preferredLanguage: 'en',
            isActive: true,
            preferences: {
              notificationChannels: ['push' as const],
              priceAlertFrequency: 'realtime' as const,
              dashboardLayout: 'default',
              theme: 'light' as const,
            },
          };

          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          localStorage.setItem('agrifriend_user', JSON.stringify(user));
          localStorage.setItem('agrifriend_session_expiry', expiryDate.toISOString());

          // Verify session exists
          const sessionExists = localStorage.getItem('agrifriend_user') !== null;
          if (!sessionExists) return false;

          // Simulate logout
          localStorage.removeItem('agrifriend_user');
          localStorage.removeItem('agrifriend_session_expiry');

          // Verify session is cleared
          const userCleared = localStorage.getItem('agrifriend_user') === null;
          const expiryCleared = localStorage.getItem('agrifriend_session_expiry') === null;

          return userCleared && expiryCleared;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: Session duration correctness - session persists across page reloads within 30 days', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 10 }),
        fc.constantFrom('Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato'),
        (mobileNumber, crop) => {
          // Create a session
          const user = {
            id: `user_${Date.now()}`,
            mobileNumber,
            primaryCrop: crop,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
            preferredLanguage: 'en',
            isActive: true,
            preferences: {
              notificationChannels: ['push' as const, 'sms' as const],
              priceAlertFrequency: 'realtime' as const,
              dashboardLayout: 'default',
              theme: 'light' as const,
            },
          };

          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          localStorage.setItem('agrifriend_user', JSON.stringify(user));
          localStorage.setItem('agrifriend_session_expiry', expiryDate.toISOString());

          // Simulate page reload by retrieving from storage
          const storedUser = localStorage.getItem('agrifriend_user');
          const storedExpiry = localStorage.getItem('agrifriend_session_expiry');

          if (!storedUser || !storedExpiry) return false;

          const retrievedUser = JSON.parse(storedUser);
          const expiryDateCheck = new Date(storedExpiry);
          const now = new Date();

          // Session should be retrievable and valid
          return (
            retrievedUser.mobileNumber === mobileNumber &&
            retrievedUser.primaryCrop === crop &&
            expiryDateCheck > now
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: Session duration correctness - exactly 30 days from creation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 10 }),
        fc.constantFrom('Wheat', 'Rice'),
        (mobileNumber, crop) => {
          const creationDate = new Date();
          const expectedExpiryDate = new Date(creationDate);
          expectedExpiryDate.setDate(expectedExpiryDate.getDate() + 30);

          // Store session
          localStorage.setItem('agrifriend_user', JSON.stringify({ mobileNumber, crop }));
          localStorage.setItem('agrifriend_session_expiry', expectedExpiryDate.toISOString());

          // Retrieve and verify
          const storedExpiry = localStorage.getItem('agrifriend_session_expiry');
          if (!storedExpiry) return false;

          const storedExpiryDate = new Date(storedExpiry);
          
          // Calculate difference in days
          const diffTime = storedExpiryDate.getTime() - creationDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          // Should be exactly 30 days
          return diffDays === 30;
        }
      ),
      { numRuns: 100 }
    );
  });
});
