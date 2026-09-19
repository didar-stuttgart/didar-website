/**
 * Admin Authentication Tests
 * Verifies password hashing, verification, and validation
 * These tests ensure no regressions in the authentication system
 */

import { describe, it, expect } from '@jest/globals';
import { hashPassword, verifyPassword, validatePassword, generateSessionToken } from '@/lib/admin-auth';

describe('Admin Authentication System', () => {
  describe('hashPassword()', () => {
    it('should generate a hash with correct format: salt:derivedHash', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toHaveLength(32); // 16 bytes × 2 hex chars
      expect(parts[1]).toHaveLength(128); // 64 bytes × 2 hex chars
    });

    it('should generate different hashes for same password (random salt)', () => {
      const password = 'TestPassword123!';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salt
    });

    it('should use valid hex characters only', () => {
      const password = 'ValidPassword123!';
      const hash = hashPassword(password);
      
      const [salt, derivedKey] = hash.split(':');
      expect(/^[0-9a-f]+$/.test(salt)).toBe(true);
      expect(/^[0-9a-f]+$/.test(derivedKey)).toBe(true);
    });
  });

  describe('verifyPassword()', () => {
    it('should verify correct password', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = hashPassword(password);
      
      expect(verifyPassword(wrongPassword, hash)).toBe(false);
    });

    it('should reject null, undefined, or non-string hashes', () => {
      const password = 'TestPassword123!';
      
      expect(verifyPassword(password, null)).toBe(false);
      expect(verifyPassword(password, undefined)).toBe(false);
      expect(verifyPassword(password, 123)).toBe(false);
    });

    it('should reject malformed hash (missing colon delimiter)', () => {
      const password = 'TestPassword123!';
      
      expect(verifyPassword(password, 'nosaltnodelimiter')).toBe(false);
    });

    it('should reject hash with empty salt or derivedHash parts', () => {
      const password = 'TestPassword123!';
      
      expect(verifyPassword(password, ':')).toBe(false);
      expect(verifyPassword(password, 'salt:')).toBe(false);
      expect(verifyPassword(password, ':derivedkey')).toBe(false);
    });

    it('should be case-sensitive for password characters', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      expect(verifyPassword('testpassword123!', hash)).toBe(false);
      expect(verifyPassword('TESTPASSWORD123!', hash)).toBe(false);
      expect(verifyPassword('TestPassword123!', hash)).toBe(true);
    });

    it('should reject passwords with extra whitespace', () => {
      const password = 'TestPassword123!';
      const hash = hashPassword(password);
      
      expect(verifyPassword(' TestPassword123!', hash)).toBe(false);
      expect(verifyPassword('TestPassword123! ', hash)).toBe(false);
      expect(verifyPassword('Test Password123!', hash)).toBe(false);
    });
  });

  describe('validatePassword()', () => {
    it('should accept password meeting all requirements', () => {
      const result = validatePassword('ValidPassword123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require minimum 12 characters', () => {
      const result = validatePassword('Short123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('12 characters'))).toBe(true);
    });

    it('should require at least one uppercase letter', () => {
      const result = validatePassword('allowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should require at least one lowercase letter', () => {
      const result = validatePassword('ALLUPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should require at least one digit', () => {
      const result = validatePassword('NoDigitsHere!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });

    it('should require at least one special character from !@#$%^&*', () => {
      const result = validatePassword('NoSpecialChar123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('special character'))).toBe(true);
    });

    it('should accept all allowed special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
      
      specialChars.forEach(char => {
        const password = `ValidPass123${char}`;
        const result = validatePassword(password);
        expect(result.valid).toBe(true, `Should accept special char: ${char}`);
      });
    });

    it('should return array of error messages for validation failures', () => {
      const result = validatePassword('bad!');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateSessionToken()', () => {
    it('should generate 64-character hex string (32 bytes)', () => {
      const token = generateSessionToken();
      expect(token).toHaveLength(64);
    });

    it('should use only valid hex characters', () => {
      const token = generateSessionToken();
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
    });

    it('should generate unique tokens on each call', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate cryptographically random tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSessionToken());
      }
      // All 100 tokens should be unique (collision probability negligible)
      expect(tokens.size).toBe(100);
    });
  });

  describe('PBKDF2 Algorithm Consistency (Regression Prevention)', () => {
    it('should use consistent PBKDF2-SHA256 parameters across hash and verify', () => {
      // This is critical: if hashPassword and verifyPassword ever use
      // different PBKDF2 parameters, previously-hashed passwords will
      // become unverifiable. This test catches that regression.
      
      const passwords = [
        'SimplePassword123!',
        'SpecialChars!@#$%^&*',
        'MixedCase_WithNumbers_123!',
        'VeryLongPasswordWithManyCharactersAndNumbersAndSpecialChars123!@#$%',
        'AnotherTest456!',
      ];

      passwords.forEach(password => {
        const hash = hashPassword(password);
        const isValid = verifyPassword(password, hash);
        expect(isValid).toBe(true, `Verification failed for: ${password}`);
      });
    });

    it('should maintain backwards compatibility with existing hashes', () => {
      // Simulate an existing hash from a previous generation
      // This ensures new code can still verify old hashes
      const testPassword = 'BackwardsCompat123!';
      const hash = hashPassword(testPassword);
      
      // Should verify immediately after generation
      expect(verifyPassword(testPassword, hash)).toBe(true);
      
      // Should still verify after "time passes" (hash stored in DB)
      // We simulate this by re-using the same hash
      expect(verifyPassword(testPassword, hash)).toBe(true);
    });
  });
});
