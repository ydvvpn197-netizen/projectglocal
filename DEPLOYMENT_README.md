# 🚀 Deployment Guide for TheGlocal

This guide will help you deploy TheGlocal to various platforms and fix the "Cannot access 'w' before initialization" error.

## ✅ Issues Fixed

### 1. Circular Dependency in Supabase Client
- **Problem**: The `resilientSupabase` was being used in `testConnection` function before it was fully initialized
- **Solution**: Restructured the code to create the client first, then export it, then test the connection
- **File**: `src/integrations/supabase/client.ts`

### 2. Build Configuration
- **Problem**: Potential build issues with Vite configuration
- **Solution**: Optimized Vite config for production builds with proper chunk splitting and optimization

## 🏗️ Build Commands

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**: Set these in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 2: GitHub Pages

1. **Enable GitHub Pages** in your repository settings
2. **Set source** to GitHub Actions
3. **Push to main branch** - deployment will happen automatically

### Option 3: Netlify

1. **Connect your GitHub repository** to Netlify
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. **Environment variables**: Set in Netlify dashboard

### Option 4: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder** to your hosting provider

## 🔧 Environment Configuration

### Required Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Optional Variables
```bash
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_STRIPE_PUBLISHABLE_KEY=your_key
VITE_NEWS_API_KEY=your_key
```

## 🚀 Quick Deploy Script

Use the included deployment script:

```bash
# Windows
npm run deploy:windows

# All platforms
npm run deploy:simple
```

## 📋 Pre-deployment Checklist

- [ ] All tests pass (`npm run test:run`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables are set
- [ ] Supabase project is configured
- [ ] Domain is configured (if using custom domain)

## 🔍 Troubleshooting

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Runtime Errors
1. Check browser console for specific error messages
2. Verify environment variables are set correctly
3. Check Supabase connection status
4. Clear browser cache and local storage

### Supabase Connection Issues
1. Verify project URL and API key
2. Check if project is active
3. Verify RLS policies are configured
4. Check network connectivity

## 📱 Performance Optimization

The build is optimized for:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ Lazy loading
- ✅ Service worker (optional)

## 🔒 Security Features

- ✅ Content Security Policy (CSP)
- ✅ XSS Protection
- ✅ HSTS headers
- ✅ Secure cookie settings
- ✅ Input validation and sanitization

## 📊 Monitoring

- ✅ Error tracking (if enabled)
- ✅ Performance monitoring
- ✅ Connection status monitoring
- ✅ User analytics (if enabled)

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Error Handling Documentation](./ERROR_HANDLING_FIXES_README.md)
3. Check [Supabase Configuration](./SUPABASE_FIX_README.md)

## 🎯 Next Steps

After successful deployment:

1. Test all major features
2. Monitor error logs
3. Set up monitoring and analytics
4. Configure backup and recovery procedures
5. Set up staging environment for future updates

---

**Happy Deploying! 🚀**

For more information, check the main [README.md](./README.md) file.
