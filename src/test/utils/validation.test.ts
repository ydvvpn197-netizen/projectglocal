/**
 * Validation Utils Tests
 * Tests for validation utility functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test schemas
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const phoneSchema = z.string().regex(/^\+?[\d\s\-()]{10,}$/, 'Invalid phone number format');

describe('Validation Utils', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@.com',
        '',
        'test@example',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate passwords with minimum length', () => {
      const validPasswords = [
        'password123',
        'MySecurePass!',
        '12345678',
        'a'.repeat(8),
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject passwords that are too short', () => {
      const invalidPasswords = [
        '1234567',
        'short',
        '',
        'a'.repeat(7),
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate correct phone number formats', () => {
      const validPhones = [
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '123 456 7890',
        '+1 (123) 456-7890',
        '1234567890',
      ];

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone number formats', () => {
      const invalidPhones = [
        'abc-def-ghij',
        '123-abc-7890',
        '123.456.7890',
        '123/456/7890',
        '',
        '123',
      ];

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow();
      });
    });
  });

  describe('Complex Validation Schemas', () => {
    const userSchema = z.object({
      email: emailSchema,
      password: passwordSchema,
      phone: phoneSchema.optional(),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
    });

    it('should validate complete user objects', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
        name: 'John Doe',
        age: 25,
      };

      expect(() => userSchema.parse(validUser)).not.toThrow();
    });

    it('should validate user objects without optional fields', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        age: 25,
      };

      expect(() => userSchema.parse(validUser)).not.toThrow();
    });

    it('should reject invalid user objects', () => {
      const invalidUsers = [
        {
          email: 'invalid-email',
          password: 'password123',
          name: 'John Doe',
          age: 25,
        },
        {
          email: 'test@example.com',
          password: 'short',
          name: 'John Doe',
          age: 25,
        },
        {
          email: 'test@example.com',
          password: 'password123',
          name: 'J',
          age: 25,
        },
        {
          email: 'test@example.com',
          password: 'password123',
          name: 'John Doe',
          age: 17,
        },
      ];

      invalidUsers.forEach(user => {
        expect(() => userSchema.parse(user)).toThrow();
      });
    });
  });

  describe('Custom Validation Functions', () => {
    const customValidation = (value: string) => {
      if (!value) return 'Value is required';
      if (value.length < 3) return 'Value must be at least 3 characters';
      if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Value must contain only alphanumeric characters';
      return null;
    };

    it('should validate custom rules correctly', () => {
      expect(customValidation('')).toBe('Value is required');
      expect(customValidation('ab')).toBe('Value must be at least 3 characters');
      expect(customValidation('abc!')).toBe('Value must contain only alphanumeric characters');
      expect(customValidation('abc123')).toBeNull();
    });
  });

  describe('Async Validation', () => {
    const asyncEmailValidation = async (email: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (email === 'taken@example.com') {
        throw new Error('Email is already taken');
      }
      
      return true;
    };

    it('should handle async validation', async () => {
      await expect(asyncEmailValidation('available@example.com')).resolves.toBe(true);
      await expect(asyncEmailValidation('taken@example.com')).rejects.toThrow('Email is already taken');
    });
  });
});
