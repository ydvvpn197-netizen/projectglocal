#!/bin/bash

# Deployment script for theglocal.in
echo "🚀 Starting deployment for theglocal.in..."

# Set environment variables
export NODE_ENV=production
export VITE_APP_URL=https://theglocal.in

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Copy .htaccess to dist folder
    echo "📋 Copying .htaccess file..."
    cp public/.htaccess dist/
    
    # Create deployment package
    echo "📦 Creating deployment package..."
    tar -czf theglocal-deploy.tar.gz -C dist .
    
    echo "🎉 Deployment package created: theglocal-deploy.tar.gz"
    echo "📁 Upload the contents of the 'dist' folder to your web server"
    echo "🌐 Your site should be available at: https://theglocal.in"
    
    # Display build info
    echo ""
    echo "📊 Build Information:"
    echo "   - Build directory: dist/"
    echo "   - Main entry: dist/index.html"
    echo "   - Assets: dist/js/, dist/css/, dist/assets/"
    echo "   - Configuration: dist/.htaccess"
    
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi
