import { SecurityManager } from '@/utils/securityUtils.tsx';

// React hooks for security
export function useSecurity() {
  const securityManager = new SecurityManager();
  
  const sanitizeHTML = (html: string) => securityManager.sanitizeHTML(html);
  const sanitizeText = (text: string) => securityManager.sanitizeText(text);
  const validateInput = (input: string, type: 'text' | 'email' | 'url' | 'number') => 
    securityManager.validateInput(input, type);
  const validateFile = (file: File) => securityManager.validateFile(file);
  const checkRateLimit = (identifier: string, limit?: number, windowMs?: number) => 
    securityManager.checkRateLimit(identifier, limit, windowMs);
  const generateSecureToken = () => securityManager.generateSecureToken();

  return {
    sanitizeHTML,
    sanitizeText,
    validateInput,
    validateFile,
    checkRateLimit,
    generateSecureToken,
  };
}
