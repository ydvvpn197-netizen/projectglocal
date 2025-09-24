#!/bin/bash

echo "🚀 Starting GitHub Pages deployment for Project Glocal..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found."
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: Git remote 'origin' not found."
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test:fast

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - index.html not found in dist"
    exit 1
fi

echo "✅ Build completed successfully"

# Add and commit changes
echo "📝 Committing changes..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

# Push to main branch (this will trigger GitHub Actions)
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated!"
echo "🌐 Your site will be available at: https://ydvvpn197-netizen.github.io/projectglocal/"
echo "📊 Check the Actions tab in your GitHub repository for deployment status."
