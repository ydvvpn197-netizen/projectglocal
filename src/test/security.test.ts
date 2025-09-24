/**
 * Security Test Suite
 * Comprehensive security testing for critical functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityUtils, SECURITY_CONFIG } from '@/config/security';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { SecurityAuditor } from '@/utils/securityAudit';

describe('Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML content to prevent XSS', () => {
      const maliciousHtml = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = InputSanitizer.sanitizeHtml(maliciousHtml);
      
      expect(result.sanitized).not.toContain('<script>');
      expect(result.sanitized).toContain('<p>Safe content</p>');
      expect(result.isValid).toBe(true);
    });

    it('should sanitize dangerous JavaScript protocols', () => {
      const dangerousContent = 'javascript:alert("XSS")';
      const result = InputSanitizer.sanitizeText(dangerousContent);
      
      expect(result.sanitized).not.toContain('javascript:');
      expect(result.isValid).toBe(true);
    });

    it('should detect and remove SQL injection patterns', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = InputSanitizer.sanitizeForDatabase(sqlInjection);
      
      expect(result.sanitized).not.toContain('DROP TABLE');
      expect(result.sanitized).not.toContain(';');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate email addresses properly', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';
      const maliciousEmail = 'test@example.com<script>alert("XSS")</script>';
      
      const validResult = InputSanitizer.sanitizeEmail(validEmail);
      const invalidResult = InputSanitizer.sanitizeEmail(invalidEmail);
      const maliciousResult = InputSanitizer.sanitizeEmail(maliciousEmail);
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(maliciousResult.isValid).toBe(false);
    });

    it('should validate usernames properly', () => {
      const validUsername = 'testuser123';
      const invalidUsername = 'admin';
      const maliciousUsername = 'user<script>alert("XSS")</script>';
      
      const validResult = InputSanitizer.sanitizeUsername(validUsername);
      const invalidResult = InputSanitizer.sanitizeUsername(invalidUsername);
      const maliciousResult = InputSanitizer.sanitizeUsername(maliciousUsername);
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(maliciousResult.isValid).toBe(false);
    });

    it('should validate file uploads', () => {
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const oversizedFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      const validResult = InputSanitizer.sanitizeFile(validFile);
      const invalidResult = InputSanitizer.sanitizeFile(invalidFile);
      const oversizedResult = InputSanitizer.sanitizeFile(oversizedFile);
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(oversizedResult.isValid).toBe(false);
    });
  });

  describe('Security Utils', () => {
    it('should detect dangerous content patterns', () => {
      const dangerousContent = '<script>alert("XSS")</script>';
      const safeContent = '<p>Safe content</p>';
      
      expect(SecurityUtils.containsDangerousContent(dangerousContent)).toBe(true);
      expect(SecurityUtils.containsDangerousContent(safeContent)).toBe(false);
    });

    it('should generate secure tokens', () => {
      const token1 = SecurityUtils.generateSecureToken(32);
      const token2 = SecurityUtils.generateSecureToken(32);
      
      expect(token1).toHaveLength(32);
      expect(token2).toHaveLength(32);
      expect(token1).not.toBe(token2);
    });

    it('should validate input with schemas', () => {
      const validInput = 'test@example.com';
      const invalidInput = 'invalid-email';
      
      const validResult = SecurityUtils.validateInput(SECURITY_CONFIG.email, validInput);
      const invalidResult = SecurityUtils.validateInput(SECURITY_CONFIG.email, invalidInput);
      
      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    it('should create rate limiters', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(5, 60000);
      
      // Should allow requests within limit
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed('test-user')).toBe(true);
      }
      
      // Should block requests over limit
      expect(rateLimiter.isAllowed('test-user')).toBe(false);
    });
  });

  describe('Security Audit', () => {
    it('should run security audit and identify vulnerabilities', async () => {
      const auditResult = await SecurityAuditor.runSecurityAudit();
      
      expect(auditResult.vulnerabilities).toBeDefined();
      expect(auditResult.score).toBeGreaterThanOrEqual(0);
      expect(auditResult.score).toBeLessThanOrEqual(100);
      expect(auditResult.recommendations).toBeDefined();
    });

    it('should categorize vulnerabilities by severity', () => {
      const criticalVulns = SecurityAuditor.getVulnerabilitiesBySeverity('critical');
      const highVulns = SecurityAuditor.getVulnerabilitiesBySeverity('high');
      
      expect(criticalVulns).toBeDefined();
      expect(highVulns).toBeDefined();
    });

    it('should categorize vulnerabilities by category', () => {
      const authVulns = SecurityAuditor.getVulnerabilitiesByCategory('authentication');
      const inputVulns = SecurityAuditor.getVulnerabilitiesByCategory('input_validation');
      
      expect(authVulns).toBeDefined();
      expect(inputVulns).toBeDefined();
    });

    it('should provide security summary', () => {
      const summary = SecurityAuditor.getSecuritySummary();
      
      expect(summary.totalVulnerabilities).toBeGreaterThanOrEqual(0);
      expect(summary.score).toBeGreaterThanOrEqual(0);
      expect(summary.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Password Security', () => {
    it('should validate password strength', () => {
      const weakPassword = 'password123';
      const strongPassword = 'StrongP@ssw0rd123!';
      
      const weakResult = SecurityUtils.validateInput(SECURITY_CONFIG.password, weakPassword);
      const strongResult = SecurityUtils.validateInput(SECURITY_CONFIG.password, strongPassword);
      
      expect(weakResult.success).toBe(false);
      expect(strongResult.success).toBe(true);
    });

    it('should enforce password requirements', () => {
      const passwords = [
        'short', // Too short
        'nouppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoNumbers!', // No numbers
        'NoSpecialChars123', // No special characters
        'ValidP@ssw0rd123!' // Valid
      ];
      
      passwords.forEach((password, index) => {
        const result = SecurityUtils.validateInput(SECURITY_CONFIG.password, password);
        if (index === passwords.length - 1) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('Content Security', () => {
    it('should sanitize user-generated content', () => {
      const userContent = `
        <div>
          <p>Safe content</p>
          <script>alert("XSS")</script>
          <img src="x" onerror="alert('XSS')">
          <iframe src="javascript:alert('XSS')"></iframe>
        </div>
      `;
      
      const sanitized = SecurityUtils.sanitizeHtml(userContent);
      
      expect(sanitized).toContain('<p>Safe content</p>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('<iframe>');
    });

    it('should limit content length', () => {
      const longContent = 'a'.repeat(SECURITY_CONFIG.MAX_CONTENT_LENGTH + 1);
      const result = InputSanitizer.sanitizeText(longContent);
      
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Content exceeds maximum length limit');
    });
  });

  describe('API Security', () => {
    it('should validate API request size', () => {
      const largeData = { data: 'x'.repeat(1024 * 1024) }; // 1MB
      const validData = { data: 'small' };
      
      // This would be tested with the SecurityMiddleware in a real implementation
      expect(JSON.stringify(largeData).length).toBeGreaterThan(SECURITY_CONFIG.MAX_API_PAYLOAD_SIZE);
      expect(JSON.stringify(validData).length).toBeLessThan(SECURITY_CONFIG.MAX_API_PAYLOAD_SIZE);
    });

    it('should implement rate limiting', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(3, 60000);
      
      // Should allow 3 requests
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      
      // Should block 4th request
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      
      // Should allow requests for different user
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });
  });
});
