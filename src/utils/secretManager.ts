// Secret management utility for production
export class SecretManager {
  private static secrets: Record<string, string> = {};
  
  static setSecret(key: string, value: string): void {
    this.secrets[key] = value;
  }
  
  static getSecret(key: string): string | undefined {
    return this.secrets[key] || import.meta.env[key];
  }
  
  static hasSecret(key: string): boolean {
    return !!(this.secrets[key] || import.meta.env[key]);
  }
  
  static validateSecrets(required: string[]): boolean {
    const missing = required.filter(key => !this.hasSecret(key));
    
    if (missing.length > 0) {
      console.error(`Missing required secrets: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
  
  static maskSecret(secret: string): string {
    if (secret.length <= 8) return '*'.repeat(secret.length);
    return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
  }
}

// Initialize secrets in production
if (import.meta.env.PROD) {
  const requiredSecrets = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  SecretManager.validateSecrets(requiredSecrets);
}
