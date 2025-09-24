/**
 * SecurityUtils Tests
 * Comprehensive testing for security utilities and validation functions
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SecurityUtils, SecuritySchemas, SECURITY_CONFIG } from '../security';
import { mockSanitize } from '../../test/setup';

describe('SecurityUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitize.mockImplementation((content: string) => content);
  });

  describe('sanitizeHtml', () => {
    it('sanitizes HTML content using DOMPurify', () => {
      const content = '<p>Hello <script>alert("xss")</script> World</p>';
      const result = SecurityUtils.sanitizeHtml(content);
      
      expect(mockSanitize).toHaveBeenCalledWith(content, {
        ALLOWED_TAGS: SECURITY_CONFIG.ALLOWED_HTML_TAGS,
        ALLOWED_ATTR: SECURITY_CONFIG.ALLOWED_HTML_ATTRS,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      });
      expect(result).toBe(content);
    });

    it('returns sanitized content', () => {
      const content = '<b>Bold text</b>';
      const sanitized = '<b>Bold text</b>';
      mockSanitize.mockReturnValue(sanitized);
      
      const result = SecurityUtils.sanitizeHtml(content);
      expect(result).toBe(sanitized);
    });
  });

  describe('validateInput', () => {
    it('validates input successfully with valid data', () => {
      const schema = SecuritySchemas.username;
      const input = 'validUsername';
      
      const result = SecurityUtils.validateInput(schema, input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(input);
      }
    });

    it('returns validation errors for invalid input', () => {
      const schema = SecuritySchemas.username;
      const input = 'a'; // Too short
      
      const result = SecurityUtils.validateInput(schema, input);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('Username must be at least 3 characters');
      }
    });

    it('handles validation exceptions gracefully', () => {
      const schema = SecuritySchemas.username;
      const input = null;
      
      const result = SecurityUtils.validateInput(schema, input);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('Validation failed');
      }
    });
  });

  describe('containsDangerousContent', () => {
    it('detects script tags', () => {
      const content = '<script>alert("xss")</script>';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('detects javascript: protocol', () => {
      const content = 'javascript:alert("xss")';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('detects vbscript: protocol', () => {
      const content = 'vbscript:msgbox("xss")';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('detects event handlers', () => {
      const content = 'onclick="alert(\'xss\')"';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('detects iframe tags', () => {
      const content = '<iframe src="malicious.com"></iframe>';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('detects object tags', () => {
      const content = '<object data="malicious.swf"></object>';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('detects embed tags', () => {
      const content = '<embed src="malicious.swf"></embed>';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(true);
    });

    it('returns false for safe content', () => {
      const content = '<p>This is safe content</p>';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(false);
    });

    it('returns false for plain text', () => {
      const content = 'This is plain text content';
      const result = SecurityUtils.containsDangerousContent(content);
      expect(result).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('generates token of specified length', () => {
      const length = 16;
      const token = SecurityUtils.generateSecureToken(length);
      expect(token).toHaveLength(length);
    });

    it('generates token of default length when not specified', () => {
      const token = SecurityUtils.generateSecureToken();
      expect(token).toHaveLength(32);
    });

    it('generates different tokens on each call', () => {
      const token1 = SecurityUtils.generateSecureToken(16);
      const token2 = SecurityUtils.generateSecureToken(16);
      expect(token1).not.toBe(token2);
    });

    it('generates token with valid characters only', () => {
      const token = SecurityUtils.generateSecureToken(100);
      const validChars = /^[A-Za-z0-9]+$/;
      expect(token).toMatch(validChars);
    });
  });

  describe('hashData', () => {
    it('generates hash for string data', async () => {
      const data = 'test data';
      const hash = await SecurityUtils.hashData(data);
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('generates different hashes for different data', async () => {
      const data1 = 'test data 1';
      const data2 = 'test data 2';
      
      const hash1 = await SecurityUtils.hashData(data1);
      const hash2 = await SecurityUtils.hashData(data2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('generates consistent hash for same data', async () => {
      const data = 'test data';
      
      const hash1 = await SecurityUtils.hashData(data);
      const hash2 = await SecurityUtils.hashData(data);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('validateFile', () => {
    it('validates file size correctly', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: SECURITY_CONFIG.MAX_FILE_SIZE + 1 });
      
      const result = SecurityUtils.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size too large');
    });

    it('validates file type correctly', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const result = SecurityUtils.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File type not allowed');
    });

    it('returns valid for acceptable file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = SecurityUtils.validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('handles edge case file sizes', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: SECURITY_CONFIG.MAX_FILE_SIZE });
      
      const result = SecurityUtils.validateFile(file);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('createRateLimiter', () => {
    it('creates rate limiter with specified limits', () => {
      const maxRequests = 5;
      const windowMs = 1000;
      
      const rateLimiter = SecurityUtils.createRateLimiter(maxRequests, windowMs);
      
      expect(rateLimiter).toHaveProperty('isAllowed');
      expect(rateLimiter).toHaveProperty('reset');
    });

    it('allows requests within limit', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(3, 1000);
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('blocks requests over limit', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(2, 1000);
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('resets rate limiter for specific identifier', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(1, 1000);
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      
      rateLimiter.reset('user1');
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('handles multiple identifiers independently', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(1, 1000);
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      expect(rateLimiter.isAllowed('user2')).toBe(false);
    });
  });
});

describe('SecuritySchemas', () => {
  describe('username', () => {
    it('validates valid usernames', () => {
      const validUsernames = ['john_doe', 'user123', 'test-user', 'valid'];
      
      validUsernames.forEach(username => {
        const result = username.match(SecuritySchemas.username._def.regex);
        expect(result).toBeTruthy();
      });
    });

    it('rejects invalid usernames', () => {
      const invalidUsernames = ['ab', 'user@name', 'user.name', 'user name', '123user'];
      
      invalidUsernames.forEach(username => {
        const result = SecuritySchemas.username.safeParse(username);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('email', () => {
    it('validates valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com'
      ];
      
      validEmails.forEach(email => {
        const result = SecuritySchemas.email.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user name@example.com'
      ];
      
      invalidEmails.forEach(email => {
        const result = SecuritySchemas.email.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('password', () => {
    it('validates valid passwords', () => {
      const validPasswords = [
        'StrongPass123!',
        'Complex@Password456',
        'Secure#Pass789$'
      ];
      
      validPasswords.forEach(password => {
        const result = SecuritySchemas.password.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'weak',
        'password123',
        'PASSWORD123',
        'Password',
        '12345678'
      ];
      
      weakPasswords.forEach(password => {
        const result = SecuritySchemas.password.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('postContent', () => {
    it('validates valid post content', () => {
      const validContent = [
        'This is a valid post',
        'A'.repeat(SECURITY_CONFIG.MAX_CONTENT_LENGTH),
        'Content with <b>HTML</b> tags'
      ];
      
      validContent.forEach(content => {
        const result = SecuritySchemas.postContent.safeParse(content);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid post content', () => {
      const invalidContent = [
        '',
        'A'.repeat(SECURITY_CONFIG.MAX_CONTENT_LENGTH + 1)
      ];
      
      invalidContent.forEach(content => {
        const result = SecuritySchemas.postContent.safeParse(content);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('commentContent', () => {
    it('validates valid comment content', () => {
      const validContent = [
        'This is a valid comment',
        'A'.repeat(1000),
        'Comment with <em>emphasis</em>'
      ];
      
      validContent.forEach(content => {
        const result = SecuritySchemas.commentContent.safeParse(content);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid comment content', () => {
      const invalidContent = [
        '',
        'A'.repeat(1001)
      ];
      
      invalidContent.forEach(content => {
        const result = SecuritySchemas.commentContent.safeParse(content);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('fileUpload', () => {
    it('validates valid file uploads', () => {
      const validUploads = [
        { size: 1024 * 1024, type: 'image/jpeg' },
        { size: SECURITY_CONFIG.MAX_FILE_SIZE, type: 'image/png' },
        { size: 100, type: 'image/webp' }
      ];
      
      validUploads.forEach(upload => {
        const result = SecuritySchemas.fileUpload.safeParse(upload);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid file uploads', () => {
      const invalidUploads = [
        { size: SECURITY_CONFIG.MAX_FILE_SIZE + 1, type: 'image/jpeg' },
        { size: 1024, type: 'text/plain' },
        { size: -1, type: 'image/jpeg' }
      ];
      
      invalidUploads.forEach(upload => {
        const result = SecuritySchemas.fileUpload.safeParse(upload);
        expect(result.success).toBe(false);
      });
    });
  });
});

describe('SECURITY_CONFIG', () => {
  it('has all required configuration properties', () => {
    expect(SECURITY_CONFIG).toHaveProperty('SESSION_TIMEOUT');
    expect(SECURITY_CONFIG).toHaveProperty('MAX_LOGIN_ATTEMPTS');
    expect(SECURITY_CONFIG).toHaveProperty('LOCKOUT_DURATION');
    expect(SECURITY_CONFIG).toHaveProperty('MIN_PASSWORD_LENGTH');
    expect(SECURITY_CONFIG).toHaveProperty('REQUIRE_SPECIAL_CHARS');
    expect(SECURITY_CONFIG).toHaveProperty('REQUIRE_NUMBERS');
    expect(SECURITY_CONFIG).toHaveProperty('REQUIRE_UPPERCASE');
    expect(SECURITY_CONFIG).toHaveProperty('REQUIRE_LOWERCASE');
    expect(SECURITY_CONFIG).toHaveProperty('MAX_REQUESTS_PER_MINUTE');
    expect(SECURITY_CONFIG).toHaveProperty('MAX_REQUESTS_PER_HOUR');
    expect(SECURITY_CONFIG).toHaveProperty('ALLOWED_HTML_TAGS');
    expect(SECURITY_CONFIG).toHaveProperty('ALLOWED_HTML_ATTRS');
    expect(SECURITY_CONFIG).toHaveProperty('MAX_CONTENT_LENGTH');
    expect(SECURITY_CONFIG).toHaveProperty('MAX_FILE_SIZE');
    expect(SECURITY_CONFIG).toHaveProperty('ALLOWED_FILE_TYPES');
    expect(SECURITY_CONFIG).toHaveProperty('API_RATE_LIMIT_WINDOW');
    expect(SECURITY_CONFIG).toHaveProperty('MAX_API_PAYLOAD_SIZE');
  });

  it('has reasonable security values', () => {
    expect(SECURITY_CONFIG.SESSION_TIMEOUT).toBeGreaterThan(0);
    expect(SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS).toBeGreaterThan(0);
    expect(SECURITY_CONFIG.LOCKOUT_DURATION).toBeGreaterThan(0);
    expect(SECURITY_CONFIG.MIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(8);
    expect(SECURITY_CONFIG.MAX_FILE_SIZE).toBeGreaterThan(0);
    expect(SECURITY_CONFIG.MAX_CONTENT_LENGTH).toBeGreaterThan(0);
  });

  it('has consistent password requirements', () => {
    expect(SECURITY_CONFIG.MIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(12);
    expect(SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS).toBe(true);
    expect(SECURITY_CONFIG.REQUIRE_NUMBERS).toBe(true);
    expect(SECURITY_CONFIG.REQUIRE_UPPERCASE).toBe(true);
    expect(SECURITY_CONFIG.REQUIRE_LOWERCASE).toBe(true);
  });
});
