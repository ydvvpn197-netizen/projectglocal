# GitHub Pages Deployment Script for Project Glocal
# PowerShell version for Windows

Write-Host "🚀 Starting GitHub Pages deployment for Project Glocal..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Git repository not found." -ForegroundColor Red
    exit 1
}

# Check if remote origin is set
try {
    $originUrl = git remote get-url origin 2>$null
    if (-not $originUrl) {
        Write-Host "❌ Error: Git remote 'origin' not found." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: Git remote 'origin' not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pre-deployment checks passed" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run type check
Write-Host "🔍 Running type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}

# Run linting
Write-Host "🧹 Running linter..." -ForegroundColor Yellow
npm run lint

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm run test:fast
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check if build was successful
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Build failed - index.html not found in dist" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Add and commit changes
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy: $timestamp"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️ No changes to commit" -ForegroundColor Blue
}

# Push to main branch (this will trigger GitHub Actions)
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host "🌐 Your site will be available at: https://ydvvpn197-netizen.github.io/projectglocal/" -ForegroundColor Cyan
Write-Host "📊 Check the Actions tab in your GitHub repository for deployment status." -ForegroundColor Cyan
