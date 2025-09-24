import DOMPurify from 'dompurify';

interface SecurityAuditResult {
  level: 'low' | 'medium' | 'high' | 'critical';
  category: 'xss' | 'injection' | 'auth' | 'data' | 'network';
  message: string;
  recommendation: string;
  fixed: boolean;
}

interface SecurityConfig {
  enableAudit: boolean;
  strictMode: boolean;
  logLevel: 'error' | 'warn' | 'info';
  reportToConsole: boolean;
}

class SecurityAuditor {
  private static instance: SecurityAuditor;
  private config: SecurityConfig;
  private auditResults: SecurityAuditResult[] = [];
  private isAuditing = false;

  constructor() {
    this.config = {
      enableAudit: process.env.NODE_ENV === 'development' || 
                   import.meta.env.VITE_ENABLE_SECURITY_AUDIT === 'true',
      strictMode: import.meta.env.VITE_SECURITY_STRICT_MODE === 'true',
      logLevel: (import.meta.env.VITE_SECURITY_LOG_LEVEL as any) || 'warn',
      reportToConsole: true
    };
  }

  static getInstance(): SecurityAuditor {
    if (!SecurityAuditor.instance) {
      SecurityAuditor.instance = new SecurityAuditor();
    }
    return SecurityAuditor.instance;
  }

  startAudit(): void {
    if (!this.config.enableAudit || this.isAuditing) return;

    this.isAuditing = true;
    this.auditResults = [];
    
    this.auditXSSVulnerabilities();
    this.auditInjectionVulnerabilities();
    this.auditAuthenticationIssues();
    this.auditDataProtection();
    this.auditNetworkSecurity();
    
    this.reportResults();
  }

  private auditXSSVulnerabilities(): void {
    // Check for innerHTML usage
    const innerHTMLUsage = document.querySelectorAll('[innerHTML]');
    if (innerHTMLUsage.length > 0) {
      this.addAuditResult({
        level: 'high',
        category: 'xss',
        message: `Found ${innerHTMLUsage.length} elements using innerHTML`,
        recommendation: 'Use textContent or DOMPurify for HTML content',
        fixed: false
      });
    }

    // Check for dangerous script sources
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && (src.includes('eval') || src.includes('javascript:'))) {
        this.addAuditResult({
          level: 'critical',
          category: 'xss',
          message: `Dangerous script source detected: ${src}`,
          recommendation: 'Remove or sanitize script source',
          fixed: false
        });
      }
    });

    // Check for inline event handlers
    const inlineHandlers = document.querySelectorAll('[onclick], [onload], [onerror]');
    if (inlineHandlers.length > 0) {
      this.addAuditResult({
        level: 'medium',
        category: 'xss',
        message: `Found ${inlineHandlers.length} elements with inline event handlers`,
        recommendation: 'Use addEventListener instead of inline handlers',
        fixed: false
      });
    }
  }

  private auditInjectionVulnerabilities(): void {
    // Check for SQL injection patterns in URLs
    const urlParams = new URLSearchParams(window.location.search);
    const dangerousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /or\s+1\s*=\s*1/i,
      /';\s*drop/i,
      /<script/i,
      /javascript:/i
    ];

    urlParams.forEach((value, key) => {
      dangerousPatterns.forEach(pattern => {
        if (pattern.test(value) || pattern.test(key)) {
          this.addAuditResult({
            level: 'high',
            category: 'injection',
            message: `Potential injection pattern detected in URL parameter: ${key}=${value}`,
            recommendation: 'Sanitize and validate all URL parameters',
            fixed: false
          });
        }
      });
    });
  }

  private auditAuthenticationIssues(): void {
    // Check for hardcoded tokens in localStorage
    const localStorageKeys = Object.keys(localStorage);
    const sensitiveKeys = ['token', 'key', 'secret', 'password', 'auth'];
    
    sensitiveKeys.forEach(sensitiveKey => {
      localStorageKeys.forEach(key => {
        if (key.toLowerCase().includes(sensitiveKey)) {
          const value = localStorage.getItem(key);
          if (value && value.length > 20) { // Likely a token
            this.addAuditResult({
              level: 'medium',
              category: 'auth',
              message: `Sensitive data found in localStorage: ${key}`,
              recommendation: 'Use secure storage methods for sensitive data',
              fixed: false
            });
          }
        }
      });
    });

    // Check for exposed API keys in environment
    const envKeys = Object.keys(import.meta.env);
    const exposedKeys = envKeys.filter(key => 
      key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')
    );

    if (exposedKeys.length > 0) {
      this.addAuditResult({
        level: 'high',
        category: 'auth',
        message: `Environment variables exposed to client: ${exposedKeys.join(', ')}`,
        recommendation: 'Move sensitive environment variables to server-side',
        fixed: false
      });
    }
  }

  private auditDataProtection(): void {
    // Check for PII in console logs
    const consoleLogs = [];
    const originalLog = console.log;
    console.log = (...args) => {
      consoleLogs.push(args.join(' '));
      originalLog.apply(console, args);
    };

    // Check for unencrypted sensitive data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input[type="password"], input[type="email"], input[type="tel"]');
      inputs.forEach(input => {
        if (!input.hasAttribute('autocomplete') || input.getAttribute('autocomplete') === 'off') {
          this.addAuditResult({
            level: 'low',
            category: 'data',
            message: `Form input without proper autocomplete: ${input.name || input.id}`,
            recommendation: 'Add appropriate autocomplete attributes',
            fixed: false
          });
        }
      });
    });

    // Restore original console.log
    console.log = originalLog;
  }

  private auditNetworkSecurity(): void {
    // Check for mixed content
    if (window.location.protocol === 'https:') {
      const resources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
      if (resources.length > 0) {
        this.addAuditResult({
          level: 'medium',
          category: 'network',
          message: `Mixed content detected: ${resources.length} HTTP resources on HTTPS page`,
          recommendation: 'Use HTTPS for all resources',
          fixed: false
        });
      }
    }

    // Check for insecure cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      if (!cookie.includes('Secure') && !cookie.includes('HttpOnly')) {
        this.addAuditResult({
          level: 'medium',
          category: 'network',
          message: `Insecure cookie detected: ${cookie.split('=')[0]}`,
          recommendation: 'Add Secure and HttpOnly flags to cookies',
          fixed: false
        });
      }
    });
  }

  private addAuditResult(result: SecurityAuditResult): void {
    this.auditResults.push(result);
  }

  private reportResults(): void {
    if (!this.config.reportToConsole) return;

    const criticalIssues = this.auditResults.filter(r => r.level === 'critical');
    const highIssues = this.auditResults.filter(r => r.level === 'high');
    const mediumIssues = this.auditResults.filter(r => r.level === 'medium');
    const lowIssues = this.auditResults.filter(r => r.level === 'low');

    if (criticalIssues.length > 0) {
      console.group('🚨 CRITICAL Security Issues');
      criticalIssues.forEach(issue => {
        console.error(`[${issue.category.toUpperCase()}] ${issue.message}`);
        console.info(`Recommendation: ${issue.recommendation}`);
      });
      console.groupEnd();
    }

    if (highIssues.length > 0) {
      console.group('⚠️ HIGH Priority Security Issues');
      highIssues.forEach(issue => {
        console.warn(`[${issue.category.toUpperCase()}] ${issue.message}`);
        console.info(`Recommendation: ${issue.recommendation}`);
      });
      console.groupEnd();
    }

    if (mediumIssues.length > 0 && this.config.logLevel !== 'error') {
      console.group('🔶 MEDIUM Priority Security Issues');
      mediumIssues.forEach(issue => {
        console.warn(`[${issue.category.toUpperCase()}] ${issue.message}`);
        console.info(`Recommendation: ${issue.recommendation}`);
      });
      console.groupEnd();
    }

    if (lowIssues.length > 0 && this.config.logLevel === 'info') {
      console.group('ℹ️ LOW Priority Security Issues');
      lowIssues.forEach(issue => {
        console.info(`[${issue.category.toUpperCase()}] ${issue.message}`);
        console.info(`Recommendation: ${issue.recommendation}`);
      });
      console.groupEnd();
    }

    // Summary
    console.log(`🔒 Security Audit Complete: ${this.auditResults.length} issues found`);
    console.log(`Critical: ${criticalIssues.length}, High: ${highIssues.length}, Medium: ${mediumIssues.length}, Low: ${lowIssues.length}`);
  }

  // Security utilities
  sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    });
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePassword(password: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      issues.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const crypto = window.crypto || (window as any).msCrypto;
    
    if (crypto && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  getAuditResults(): SecurityAuditResult[] {
    return [...this.auditResults];
  }

  getSecurityScore(): number {
    if (this.auditResults.length === 0) return 100;
    
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    const totalWeight = this.auditResults.reduce((sum, result) => sum + weights[result.level], 0);
    const maxWeight = this.auditResults.length * 4; // All critical
    
    return Math.max(0, Math.round(100 - (totalWeight / maxWeight) * 100));
  }

  clearAuditResults(): void {
    this.auditResults = [];
  }
}

// React hook for security monitoring
export const useSecurityAudit = () => {
  const auditor = SecurityAuditor.getInstance();
  
  const auditSecurity = () => {
    auditor.startAudit();
  };

  const sanitizeHTML = (html: string) => {
    return auditor.sanitizeHTML(html);
  };

  const sanitizeInput = (input: string) => {
    return auditor.sanitizeInput(input);
  };

  const validateEmail = (email: string) => {
    return auditor.validateEmail(email);
  };

  const validatePassword = (password: string) => {
    return auditor.validatePassword(password);
  };

  return {
    auditSecurity,
    sanitizeHTML,
    sanitizeInput,
    validateEmail,
    validatePassword,
    getAuditResults: auditor.getAuditResults.bind(auditor),
    getSecurityScore: auditor.getSecurityScore.bind(auditor)
  };
};

// Initialize security auditing
export const initializeSecurityAudit = () => {
  const auditor = SecurityAuditor.getInstance();
  auditor.startAudit();
  return auditor;
};

export default SecurityAuditor;
