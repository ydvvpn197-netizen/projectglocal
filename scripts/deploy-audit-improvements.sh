#!/bin/bash

# Deploy Audit Improvements Script
# This script deploys all the audit improvements and optimizations

set -e

echo "🚀 Starting deployment of audit improvements..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed"
    exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch (currently on $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected. Committing them..."
    git add .
    git commit -m "feat: comprehensive audit improvements and performance optimizations

- Added performance monitoring system with Core Web Vitals tracking
- Implemented bundle optimization with advanced chunk splitting
- Consolidated duplicate components into unified components
- Enhanced database with performance monitoring tables
- Improved error handling and user feedback
- Added comprehensive test suite for performance monitoring
- Created optimized Vite configuration for better build performance
- Enhanced security with additional RLS policies
- Improved accessibility and mobile responsiveness
- Added real-time performance recommendations system"
fi

# Run tests
echo "🧪 Running test suite..."
npm run test:suite

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix issues before deploying."
    exit 1
fi

# Run linting
echo "🔍 Running linter..."
npm run lint:fix

# Build the project
echo "🏗️  Building project..."
npm run build:production

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build issues before deploying."
    exit 1
fi

# Check bundle size
echo "📊 Analyzing bundle size..."
npm run analyze:bundle

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
npm run deploy:github

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

# Push changes to GitHub
echo "📤 Pushing changes to GitHub..."
git push origin main

# Verify deployment
echo "✅ Verifying deployment..."
npm run deploy:verify

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📊 Performance improvements deployed:"
    echo "  - Bundle size optimization"
    echo "  - Performance monitoring"
    echo "  - Component consolidation"
    echo "  - Enhanced security"
    echo "  - Improved accessibility"
    echo ""
    echo "🔗 Live at: https://theglocal.in"
    echo "📈 Monitor performance at: https://theglocal.in/performance"
else
    echo "⚠️  Deployment completed but verification failed"
    echo "Please check the deployment manually"
fi

echo "🏁 Audit improvements deployment complete!"