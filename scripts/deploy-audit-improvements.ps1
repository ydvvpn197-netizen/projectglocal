# Deploy Audit Improvements Script (PowerShell)
# This script deploys all the audit improvements and optimizations

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Force
)

Write-Host "Starting deployment of audit improvements..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're on the main branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Warning: Not on main branch (currently on $currentBranch)" -ForegroundColor Yellow
    if (-not $Force) {
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -notmatch "^[Yy]$") {
            Write-Host "Deployment cancelled" -ForegroundColor Red
            exit 1
        }
    }
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Uncommitted changes detected. Committing them..." -ForegroundColor Yellow
    git add .
    git commit -m "feat: comprehensive audit improvements and performance optimizations"
}

# Run tests
if (-not $SkipTests) {
    Write-Host "Running test suite..." -ForegroundColor Blue
    npm run test:suite
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tests failed. Please fix issues before deploying." -ForegroundColor Red
        exit 1
    }
}

# Run linting
Write-Host "Running linter..." -ForegroundColor Blue
npm run lint:fix

# Build the project
if (-not $SkipBuild) {
    Write-Host "Building project..." -ForegroundColor Blue
    npm run build:production
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed. Please fix build issues before deploying." -ForegroundColor Red
        exit 1
    }
}

# Check bundle size
Write-Host "Analyzing bundle size..." -ForegroundColor Blue
npm run analyze:bundle

# Deploy to GitHub Pages
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Blue
npm run deploy:github

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed." -ForegroundColor Red
    exit 1
}

# Push changes to GitHub
Write-Host "Pushing changes to GitHub..." -ForegroundColor Blue
git push origin main

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Blue
npm run deploy:verify

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Performance improvements deployed:" -ForegroundColor Cyan
    Write-Host "  - Bundle size optimization" -ForegroundColor White
    Write-Host "  - Performance monitoring" -ForegroundColor White
    Write-Host "  - Component consolidation" -ForegroundColor White
    Write-Host "  - Enhanced security" -ForegroundColor White
    Write-Host "  - Improved accessibility" -ForegroundColor White
    Write-Host ""
    Write-Host "Live at: https://theglocal.in" -ForegroundColor Green
} else {
    Write-Host "Deployment completed but verification failed" -ForegroundColor Yellow
    Write-Host "Please check the deployment manually" -ForegroundColor Yellow
}

Write-Host "Audit improvements deployment complete!" -ForegroundColor Green