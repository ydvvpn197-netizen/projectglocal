# Database Restoration Script for TheGlocal Project
# This PowerShell script restores all missing database tables and data

Write-Host "🚀 Starting database restoration for TheGlocal project..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please ensure your environment variables are set." -ForegroundColor Red
    Write-Host "💡 You need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl) {
    Write-Host "❌ VITE_SUPABASE_URL is not set in environment variables" -ForegroundColor Red
    exit 1
}

if (-not $supabaseServiceKey) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables" -ForegroundColor Red
    Write-Host "💡 You can find this in your Supabase project settings > API" -ForegroundColor Yellow
    exit 1
}

Write-Host "📊 Project ID: $($supabaseUrl.Split('//')[1].Split('.')[0])" -ForegroundColor Cyan

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "💡 Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm packages are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing required packages..." -ForegroundColor Yellow
    npm install
}

# Run the restoration script
Write-Host "🔄 Running database restoration script..." -ForegroundColor Yellow
node scripts/restore-database.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Database restoration completed successfully!" -ForegroundColor Green
    Write-Host "📋 Your TheGlocal project database has been fully restored." -ForegroundColor Green
    Write-Host "🔗 You can now use your application normally." -ForegroundColor Green
} else {
    Write-Host "❌ Database restoration failed. Please check the error messages above." -ForegroundColor Red
    Write-Host "💡 You may need to check your Supabase permissions or run the script manually." -ForegroundColor Yellow
}
