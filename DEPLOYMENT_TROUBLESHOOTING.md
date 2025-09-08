# Deployment Troubleshooting Guide

## Common Deployment Issues and Solutions

### 1. Build Failures

#### Issue: TypeScript compilation errors
**Solution:**
```bash
npm run type-check
```
Fix any TypeScript errors before deploying.

#### Issue: Linting errors
**Solution:**
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

#### Issue: Test failures
**Solution:**
```bash
npm run test:run
```
Fix failing tests or temporarily skip them in CI.

### 2. GitHub Actions Failures

#### Issue: Environment variables not set
**Solution:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add required secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Issue: Node.js version mismatch
**Solution:**
Update the workflow file to use the correct Node.js version:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'  # Update to your required version
```

#### Issue: Cache issues
**Solution:**
Clear the npm cache in the workflow:
```yaml
- name: Clear npm cache
  run: npm cache clean --force
```

### 3. Build Output Issues

#### Issue: Missing files in dist/
**Solution:**
```bash
npm run clean
npm run build
ls -la dist/  # Check if all files are present
```

#### Issue: Large bundle size
**Solution:**
```bash
npm run build:analyze  # Analyze bundle size
```
Optimize imports and remove unused dependencies.

### 4. Routing Issues

#### Issue: 404 errors on refresh
**Solution:**
Ensure `_redirects` file exists in `public/` and `dist/`:
```
/*    /index.html   200
```

#### Issue: Assets not loading
**Solution:**
Check `vite.config.ts` base path configuration:
```typescript
export default defineConfig({
  base: '/',  // Adjust based on your deployment path
  // ...
});
```

### 5. Environment-Specific Issues

#### Issue: Different behavior in production
**Solution:**
1. Check environment variables are properly set
2. Verify API endpoints are accessible
3. Check CORS settings

#### Issue: Supabase connection issues
**Solution:**
1. Verify Supabase URL and keys
2. Check RLS policies
3. Ensure database is accessible

## Manual Deployment Process

If automated deployment fails, use manual deployment:

### Option 1: GitHub Pages
```bash
npm run deploy:manual
npm run deploy:github
```

### Option 2: Vercel
```bash
npm run build
npm run deploy:vercel
```

### Option 3: Netlify
```bash
npm run build
npm run deploy:netlify
```

## Debugging Steps

### 1. Local Testing
```bash
npm run build
npm run preview
```
Test the production build locally.

### 2. Check Build Output
```bash
npm run build:analyze
```
Analyze bundle size and dependencies.

### 3. Verify Environment
```bash
npm run deploy:check
```
Check deployment configuration.

### 4. Test Components
```bash
npm run test:run
npm run lint
npm run type-check
```

## Common Error Messages

### "Module not found"
- Check import paths
- Verify dependencies are installed
- Check TypeScript path mapping

### "Build failed with exit code 1"
- Check console output for specific errors
- Verify all required files exist
- Check environment variables

### "Tests failed"
- Fix failing tests
- Update test configuration
- Check test environment setup

### "Linting failed"
- Fix linting errors
- Update ESLint configuration
- Check code formatting

## Prevention Tips

1. **Always test locally** before pushing
2. **Keep dependencies updated**
3. **Use consistent Node.js versions**
4. **Monitor build logs** in CI/CD
5. **Set up proper error tracking**
6. **Use feature flags** for gradual rollouts

## Emergency Rollback

If deployment causes issues:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Use previous build:**
   - Download previous build artifacts
   - Deploy manually

3. **Disable features:**
   - Use environment variables to disable problematic features
   - Update configuration without code changes

## Getting Help

1. Check GitHub Actions logs
2. Review build output
3. Test locally with production settings
4. Check hosting provider documentation
5. Review error logs and monitoring

## Quick Commands Reference

```bash
# Build and test
npm run build
npm run test:run
npm run lint
npm run type-check

# Deployment
npm run deploy:manual
npm run deploy:github
npm run deploy:vercel
npm run deploy:netlify

# Troubleshooting
npm run deploy:check
npm run deploy:fix
npm run build:analyze
```
