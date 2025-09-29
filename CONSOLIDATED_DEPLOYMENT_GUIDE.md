# Consolidated Deployment Guide

This guide covers the improved build, test, and deployment process for the consolidated components.

## 🎯 Overview

The app has been optimized with consolidated components to reduce duplication and improve performance:

- **ConsolidatedDashboard**: Merges UserDashboard and ArtistDashboard
- **ConsolidatedFeed**: Unified feed component
- **ConsolidatedIndex**: Main home page
- **MainLayout**: Unified layout component

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run consolidated tests
npm run test:consolidated

# Build consolidated version
npm run build:consolidated
```

### Production Deployment

```bash
# Full production build
npm run build:consolidated

# Verify deployment
npm run verify:consolidated

# Deploy to GitHub Pages
npm run deploy:github
```

## 📦 Build Process

### Consolidated Build Script

The new `scripts/build-consolidated.js` provides:

- ✅ Type checking
- ✅ Linting
- ✅ Testing (optional)
- ✅ Production build
- ✅ Bundle analysis
- ✅ Build verification
- ✅ Consolidated component detection

### Build Optimization

The Vite configuration has been optimized for consolidated components:

```typescript
// Optimized chunk splitting
manualChunks: (id) => {
  // Consolidated pages get their own chunk
  if (id.includes('src/pages/ConsolidatedDashboard') || 
      id.includes('src/pages/ConsolidatedFeed') || 
      id.includes('src/pages/ConsolidatedIndex')) {
    return 'consolidated-pages';
  }
  
  // Layout components grouped together
  if (id.includes('src/components/MainLayout') || 
      id.includes('src/components/ResponsiveLayout') ||
      id.includes('src/components/layout/')) {
    return 'layout-components';
  }
}
```

## 🧪 Testing

### Consolidated Component Tests

New test suite at `src/tests/consolidated-components.test.tsx` covers:

- ✅ ConsolidatedDashboard rendering
- ✅ ConsolidatedFeed functionality
- ✅ ConsolidatedIndex display
- ✅ MainLayout integration
- ✅ Responsive behavior
- ✅ Error handling
- ✅ Component integration

### Test Commands

```bash
# Run consolidated tests
npm run test:consolidated

# Watch mode
npm run test:consolidated:watch

# All tests
npm run test:all
```

### Test Setup

The `src/test/consolidated-setup.ts` provides:

- Mock consolidated components
- Supabase client mocking
- React Router mocking
- Authentication mocking
- Responsive testing utilities

## 🚀 GitHub Deployment

### New Workflow: `consolidated-deploy.yml`

The improved GitHub workflow includes:

1. **Validation Phase**:
   - Consolidated component verification
   - Type checking
   - Linting
   - Testing

2. **Build Phase**:
   - Memory-optimized build
   - Consolidated chunk detection
   - Build verification
   - Bundle analysis (optional)

3. **Deploy Phase**:
   - GitHub Pages deployment
   - Deployment verification
   - Status reporting

### Workflow Triggers

- **Push to main**: Automatic deployment
- **Pull requests**: Validation only
- **Manual dispatch**: With options for skipping tests and build analysis

### Environment Variables

Required secrets in GitHub:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GOOGLE_MAPS_API_KEY (optional)
VITE_NEWS_API_KEY (optional)
VITE_OPENAI_API_KEY (optional)
VITE_STRIPE_PUBLISHABLE_KEY (optional)
```

## 🔍 Verification

### Deployment Verification

The `scripts/verify-consolidated-deployment.js` script checks:

- ✅ Build artifacts exist
- ✅ Consolidated chunks present
- ✅ Component files present
- ✅ Routing configured
- ✅ Performance metrics
- ✅ Functionality tests

### Manual Verification

1. **Check consolidated components**:
   ```bash
   npm run test:consolidated
   ```

2. **Verify build output**:
   ```bash
   npm run verify:consolidated
   ```

3. **Test locally**:
   ```bash
   npm run build:consolidated
   npm run preview
   ```

## 📊 Performance Optimizations

### Bundle Splitting

- **consolidated-pages**: Dashboard, Feed, Index
- **layout-components**: MainLayout, ResponsiveLayout
- **react**: Core React libraries
- **supabase**: Database client
- **radix-ui**: UI components
- **vendor**: Other dependencies

### Memory Optimization

- Node.js memory limit: 6GB
- Parallel file operations: Limited to 2
- Cache enabled for better performance
- Terser optimization for production

### Build Size Monitoring

The build process generates a `build-report.json` with:

- Build timestamp
- Node.js version
- Build target
- Consolidated components list
- Build size
- Status

## 🛠️ Troubleshooting

### Common Issues

1. **Memory errors during build**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=6144"
   npm run build:consolidated
   ```

2. **Missing consolidated components**:
   - Check if files exist in `src/pages/`
   - Verify imports in routing
   - Run verification script

3. **Test failures**:
   ```bash
   npm run test:consolidated -- --reporter=verbose
   ```

4. **Deployment issues**:
   - Check GitHub secrets
   - Verify workflow permissions
   - Review deployment logs

### Debug Commands

```bash
# Check consolidated components
ls -la src/pages/Consolidated*

# Verify routing
grep -r "Consolidated" src/routes/

# Check build output
ls -la dist/js/ | grep consolidated

# Run verification
npm run verify:consolidated
```

## 📈 Monitoring

### Build Metrics

- Build time
- Bundle size
- Chunk count
- Memory usage
- Test coverage

### Deployment Status

- Validation results
- Build success/failure
- Deployment status
- Site accessibility

## 🔄 Maintenance

### Regular Tasks

1. **Update dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Run tests**:
   ```bash
   npm run test:all
   ```

3. **Verify deployment**:
   ```bash
   npm run verify:consolidated
   ```

4. **Monitor performance**:
   ```bash
   npm run analyze:bundle
   ```

### Updates

When updating consolidated components:

1. Update tests in `src/tests/consolidated-components.test.tsx`
2. Update mocks in `src/test/consolidated-setup.ts`
3. Run verification: `npm run verify:consolidated`
4. Deploy: `npm run deploy:github`

## 🎉 Success Metrics

After successful consolidation:

- ✅ Reduced duplicate files
- ✅ Improved build performance
- ✅ Better code organization
- ✅ Comprehensive testing
- ✅ Optimized deployment
- ✅ Maintained functionality

The consolidated deployment ensures all functionality is preserved while improving performance and maintainability.
