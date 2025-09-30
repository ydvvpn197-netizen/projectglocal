#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
const envConfig = `# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://tepvzhbgobckybyhryuj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_API_BASE_URL=https://theglocal.in
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000

# Security Configuration
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_ENABLE_XSS_PROTECTION=true
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_SESSION_TIMEOUT=3600000

# Performance Configuration
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_CODE_SPLITTING=true
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_PRELOADING=true

# Monitoring Configuration
VITE_ENABLE_LOGGING=true
VITE_ENABLE_METRICS=true
VITE_ENABLE_TRACING=false
VITE_LOG_LEVEL=info

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_ERROR_TRACKING=true

# Cache Configuration
VITE_CACHE_DEFAULT_TTL=300000
VITE_CACHE_MAX_SIZE=100
VITE_ENABLE_PERSISTENT_CACHE=true
`;

// Create .env.local file
const envPath = path.join(process.cwd(), '.env.local');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envConfig);
    console.log('✅ Created .env.local file with default configuration');
    console.log('⚠️  Please update VITE_SUPABASE_ANON_KEY with your actual Supabase anon key');
  } else {
    console.log('⚠️  .env.local already exists, skipping creation');
  }
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}

console.log('\n📋 Next steps:');
console.log('1. Update VITE_SUPABASE_ANON_KEY in .env.local');
console.log('2. Run database migrations');
console.log('3. Start the development server');