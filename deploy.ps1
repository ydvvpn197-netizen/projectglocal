# PowerShell deployment script for theglocal.in
Write-Host "🚀 Starting deployment for theglocal.in..." -ForegroundColor Green

# Set environment variables
$env:NODE_ENV = "production"
$env:VITE_APP_URL = "https://theglocal.in"

# Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build for production
Write-Host "🔨 Building for production..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    
    # Copy .htaccess to dist folder
    Write-Host "📋 Copying .htaccess file..." -ForegroundColor Yellow
    if (Test-Path "public\.htaccess") {
        Copy-Item "public\.htaccess" "dist\.htaccess"
    }
    
    # Create deployment package
    Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
    if (Test-Path "dist") {
        Compress-Archive -Path "dist\*" -DestinationPath "theglocal-deploy.zip" -Force
    }
    
    Write-Host "🎉 Deployment package created: theglocal-deploy.zip" -ForegroundColor Green
    Write-Host "📁 Upload the contents of the 'dist' folder to your web server" -ForegroundColor Cyan
    Write-Host "🌐 Your site should be available at: https://theglocal.in" -ForegroundColor Cyan
    
    # Display build info
    Write-Host ""
    Write-Host "📊 Build Information:" -ForegroundColor White
    Write-Host "   - Build directory: dist/" -ForegroundColor Gray
    Write-Host "   - Main entry: dist/index.html" -ForegroundColor Gray
    Write-Host "   - Assets: dist/js/, dist/css/, dist/assets/" -ForegroundColor Gray
    Write-Host "   - Configuration: dist/.htaccess" -ForegroundColor Gray
    
} else {
    Write-Host "❌ Build failed! Please check the error messages above." -ForegroundColor Red
    exit 1
}
