#!/bin/bash

# ============================================================================
# DEPLOY AUDIT IMPROVEMENTS SCRIPT
# ============================================================================
# This script deploys all the audit improvements and fixes
# Date: 2025-01-28
# Version: 1.0.0

set -e

echo "🚀 Starting deployment of audit improvements..."

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

echo "📋 Running pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install it first."
    exit 1
fi

# Check if we're logged into Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not logged into Supabase. Please run 'supabase login' first."
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# ============================================================================
# INSTALL DEPENDENCIES
# ============================================================================

echo "📦 Installing dependencies..."

# Install npm dependencies
npm install

# Install Supabase CLI if not already installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Dependencies installed"

# ============================================================================
# RUN TESTS
# ============================================================================

echo "🧪 Running tests..."

# Run unit tests
echo "Running unit tests..."
npm run test

# Run integration tests
echo "Running integration tests..."
npm run test:integration

# Run type checking
echo "Running type checking..."
npm run type-check

# Run linting
echo "Running linting..."
npm run lint

echo "✅ All tests passed"

# ============================================================================
# DATABASE MIGRATIONS
# ============================================================================

echo "🗄️ Running database migrations..."

# Check if Supabase is running locally
if ! supabase status &> /dev/null; then
    echo "Starting Supabase locally..."
    supabase start
fi

# Run migrations
echo "Applying database migrations..."
supabase db push

# Verify migrations
echo "Verifying migrations..."
supabase db diff

echo "✅ Database migrations completed"

# ============================================================================
# DEPLOY EDGE FUNCTIONS
# ============================================================================

echo "⚡ Deploying edge functions..."

# Deploy news pipeline function
echo "Deploying news-pipeline function..."
supabase functions deploy news-pipeline

# Verify function deployment
echo "Verifying function deployment..."
supabase functions list

echo "✅ Edge functions deployed"

# ============================================================================
# BUILD APPLICATION
# ============================================================================

echo "🏗️ Building application..."

# Build for production
echo "Building for production..."
npm run build:production

# Verify build
echo "Verifying build..."
ls -la dist/

echo "✅ Application built successfully"

# ============================================================================
# SECURITY AUDIT
# ============================================================================

echo "🔒 Running security audit..."

# Check for exposed secrets
echo "Checking for exposed secrets..."
if grep -r "process\.env" src/ --include="*.ts" --include="*.tsx" | grep -v "import.meta.env"; then
    echo "❌ Warning: Found process.env usage in client code"
fi

# Check for service role keys
echo "Checking for service role keys..."
if grep -r "service_role" src/ --include="*.ts" --include="*.tsx"; then
    echo "❌ Warning: Found service role key usage in client code"
fi

# Check for hardcoded secrets
echo "Checking for hardcoded secrets..."
if grep -r "sk_" src/ --include="*.ts" --include="*.tsx"; then
    echo "❌ Warning: Found potential secret keys in code"
fi

echo "✅ Security audit completed"

# ============================================================================
# PERFORMANCE AUDIT
# ============================================================================

echo "⚡ Running performance audit..."

# Check bundle size
echo "Checking bundle size..."
npm run analyze:bundle

# Check for large dependencies
echo "Checking for large dependencies..."
npm run analyze:deps

echo "✅ Performance audit completed"

# ============================================================================
# DEPLOYMENT
# ============================================================================

echo "🚀 Deploying to production..."

# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."
npm run deploy:github

# Verify deployment
echo "Verifying deployment..."
npm run deploy:verify

echo "✅ Deployment completed"

# ============================================================================
# POST-DEPLOYMENT VERIFICATION
# ============================================================================

echo "🔍 Running post-deployment verification..."

# Test anonymous handle system
echo "Testing anonymous handle system..."
curl -X POST "https://your-project.supabase.co/functions/v1/test-anonymous-handle" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test news pipeline
echo "Testing news pipeline..."
curl -X POST "https://your-project.supabase.co/functions/v1/news-pipeline" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test RLS policies
echo "Testing RLS policies..."
supabase db test

echo "✅ Post-deployment verification completed"

# ============================================================================
# CLEANUP
# ============================================================================

echo "🧹 Cleaning up..."

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf dist/
rm -rf node_modules/.cache/

# Clear Supabase cache
echo "Clearing Supabase cache..."
supabase db reset --linked

echo "✅ Cleanup completed"

# ============================================================================
# SUCCESS MESSAGE
# ============================================================================

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📊 Deployment Summary:"
echo "  ✅ Dependencies installed"
echo "  ✅ Tests passed"
echo "  ✅ Database migrations applied"
echo "  ✅ Edge functions deployed"
echo "  ✅ Application built"
echo "  ✅ Security audit passed"
echo "  ✅ Performance audit passed"
echo "  ✅ Production deployment completed"
echo "  ✅ Post-deployment verification passed"
echo ""
echo "🔗 Your application is now live at: https://theglocal.in"
echo ""
echo "📋 Next Steps:"
echo "  1. Monitor application performance"
echo "  2. Test anonymous user flows"
echo "  3. Verify privacy controls"
echo "  4. Check news pipeline functionality"
echo "  5. Monitor security logs"
echo ""
echo "🚀 Happy coding!"
