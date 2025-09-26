# 🚀 Project Glocal - Build, Test & Deploy Guide

This guide provides comprehensive instructions for building, testing, and deploying Project Glocal to GitHub Pages.

## 📋 Prerequisites

- Node.js 20+ 
- npm 8+
- Git configured with proper credentials
- GitHub repository with Pages enabled

## 🔧 Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with required variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 🧪 Testing

### Run All Tests
```bash
npm run test:suite
```

### Individual Test Commands
```bash
# Unit tests (fast)
npm run test:fast

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔨 Building

### Production Build
```bash
npm run build:production
```

### Standard Build
```bash
npm run build:prod
```

### Build with Analysis
```bash
npm run build:optimized
```

## 🚀 Deployment

### Quick Deploy (Build + Deploy)
```bash
npm run deploy:production
```

### Full Pipeline (Test + Build + Deploy)
```bash
npm run deploy:full
```

### Manual Deployment Steps
```bash
# 1. Run tests
npm run test:suite

# 2. Build for production
npm run build:production

# 3. Deploy to GitHub Pages
npm run deploy:git
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. **Quality Checks**: Type checking, linting, formatting
2. **Testing**: Unit tests, coverage, E2E tests
3. **Building**: Optimized production build
4. **Deployment**: Automatic deployment to GitHub Pages
5. **Verification**: Post-deployment health checks

### Workflow Triggers
- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Validation only
- Manual workflow dispatch → Custom deployment

## 📊 Scripts Overview

### Build Scripts
- `build:production` - Comprehensive production build with validation
- `build:prod` - Standard production build
- `build:optimized` - Build with bundle analysis

### Test Scripts
- `test:suite` - Complete test suite (unit, coverage, E2E, security)
- `test:fast` - Quick unit tests
- `test:coverage` - Tests with coverage report
- `test:e2e` - End-to-end tests

### Deployment Scripts
- `deploy:production` - Build and deploy to production
- `deploy:full` - Complete pipeline (test + build + deploy)
- `deploy:git` - Deploy to GitHub Pages only

### CI/CD Scripts
- `ci:build` - CI build script
- `ci:test` - CI test script
- `ci:deploy` - CI deployment script
- `ci:full` - Complete CI pipeline

## 🐛 Troubleshooting

### Build Failures
```bash
# Clean and rebuild
npm run clean:all
npm install
npm run build:production
```

### Test Failures
```bash
# Run tests with debug info
npm run test:debug

# Check specific test files
npm run test:fast -- src/test/specific.test.ts
```

### Deployment Issues
```bash
# Verify build output
ls -la dist/

# Check GitHub Pages settings
# Repository → Settings → Pages → Source: Deploy from branch (gh-pages)

# Manual deployment verification
npm run deploy:verify
```

## 📈 Performance Optimization

### Bundle Analysis
```bash
npm run analyze:bundle
```

### Performance Testing
```bash
npm run performance
```

### Security Audit
```bash
npm run security
```

## 🔐 GitHub Secrets Setup

Configure these secrets in your GitHub repository:

1. Go to Repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_NEWS_API_KEY`
   - `VITE_OPENAI_API_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

## 📝 Deployment Checklist

- [ ] Environment variables configured
- [ ] Tests passing
- [ ] Build successful
- [ ] GitHub Pages enabled
- [ ] Secrets configured
- [ ] Domain configured (if custom)
- [ ] SSL certificate active

## 🌐 Live URLs

- **Production**: https://theglocal.in/
- **GitHub Repository**: https://github.com/ydvvpn197-netizen/projectglocal
- **GitHub Pages**: https://ydvvpn197-netizen.github.io/projectglocal/

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify environment variables
3. Test locally first
4. Check build output validation

---

**Happy Deploying! 🎉**