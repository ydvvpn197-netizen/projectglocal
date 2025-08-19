# 🚀 Deployment Guide for theglocal.in

## Overview
This guide will help you deploy your Local Social Hub application to [https://theglocal.in/](https://theglocal.in/).

## ✅ Pre-Deployment Checklist

### 1. **Build Status**
- ✅ Production build completed successfully
- ✅ All assets optimized and minified
- ✅ Bundle analysis generated
- ✅ .htaccess file configured for SPA routing

### 2. **Files Ready for Deployment**
- ✅ `dist/` folder with all build files
- ✅ `dist/.htaccess` for Apache server configuration
- ✅ `theglocal-deploy.zip` deployment package created

## 📁 Files to Upload

Upload the following files from the `dist/` folder to your web server:

```
dist/
├── index.html              # Main entry point
├── .htaccess              # Apache configuration for SPA routing
├── favicon.ico            # Site favicon
├── robots.txt             # SEO configuration
├── placeholder.svg        # Placeholder image
├── css/
│   └── index-BE4MUJK0.css # Main stylesheet
├── js/                    # JavaScript chunks
│   ├── react-vendor-*.js  # React libraries
│   ├── supabase-vendor-*.js # Supabase client
│   ├── page-*.js          # Page components
│   ├── component-*.js     # UI components
│   └── vendor-*.js        # Other libraries
└── assets/                # Static assets (if any)
```

## 🌐 Server Configuration

### Apache Server (.htaccess)
The `.htaccess` file is already configured with:
- ✅ SPA routing support (React Router)
- ✅ Security headers
- ✅ Gzip compression
- ✅ Cache control
- ✅ SEO optimization

### Nginx Server
If using Nginx, add this configuration:

```nginx
server {
    listen 80;
    server_name theglocal.in www.theglocal.in;
    root /path/to/your/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

## 🔧 Deployment Methods

### Method 1: Using Deployment Scripts

#### Windows (PowerShell)
```powershell
# Run the deployment script
.\deploy.ps1

# Or use npm script
npm run deploy:windows
```

#### Linux/Mac (Bash)
```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh

# Or use npm script
npm run deploy
```

### Method 2: Manual Deployment

1. **Build the project:**
   ```bash
   npm run build:prod
   ```

2. **Copy .htaccess:**
   ```bash
   cp public/.htaccess dist/
   ```

3. **Upload files:**
   - Upload all contents of `dist/` folder to your web server
   - Ensure `index.html` is in the root directory
   - Place `.htaccess` in the root directory

## 🌍 Domain Configuration

### DNS Settings
Ensure your domain `theglocal.in` points to your web server:
- **A Record**: Point to your server IP
- **CNAME**: `www.theglocal.in` → `theglocal.in`

### SSL Certificate
For HTTPS support:
1. Install SSL certificate (Let's Encrypt recommended)
2. Configure redirect from HTTP to HTTPS
3. Update `.htaccess` to force HTTPS

## 🔍 Post-Deployment Verification

### 1. **Check Basic Functionality**
- ✅ Homepage loads: [https://theglocal.in/](https://theglocal.in/)
- ✅ Navigation works
- ✅ Assets load properly
- ✅ No console errors

### 2. **Test Key Features**
- ✅ User authentication
- ✅ Supabase connection
- ✅ Real-time features
- ✅ File uploads (if any)

### 3. **Performance Check**
- ✅ Page load speed
- ✅ Bundle size optimization
- ✅ Caching working
- ✅ Gzip compression

## 🛠️ Troubleshooting

### Common Issues

#### 1. **404 Errors on Routes**
**Problem**: Direct URL access returns 404
**Solution**: Ensure `.htaccess` is properly configured for SPA routing

#### 2. **Assets Not Loading**
**Problem**: CSS/JS files return 404
**Solution**: Check file paths and server configuration

#### 3. **CORS Errors**
**Problem**: Supabase API calls fail
**Solution**: Verify Supabase URL and API keys in production

#### 4. **Slow Loading**
**Problem**: Pages load slowly
**Solution**: 
- Enable Gzip compression
- Check CDN configuration
- Optimize images

### Debug Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check Server Logs**
   - Apache: `/var/log/apache2/error.log`
   - Nginx: `/var/log/nginx/error.log`

3. **Test API Endpoints**
   - Verify Supabase connection
   - Check authentication flow

## 📊 Monitoring

### Performance Monitoring
- Use Google PageSpeed Insights
- Monitor Core Web Vitals
- Track user engagement

### Error Tracking
- Set up error logging
- Monitor 404 errors
- Track API failures

## 🔄 Update Process

To update the deployed application:

1. **Build new version:**
   ```bash
   npm run build:prod
   ```

2. **Upload new files:**
   - Replace old files with new ones
   - Keep `.htaccess` configuration

3. **Clear cache:**
   - Clear browser cache
   - Clear CDN cache if using

## 📞 Support

If you encounter issues:
1. Check this deployment guide
2. Review server logs
3. Test locally first
4. Contact hosting provider

## 🎉 Success!

Once deployed successfully, your Local Social Hub will be available at:
**🌐 [https://theglocal.in/](https://theglocal.in/)**

---

*Last updated: January 2025*
*Version: 1.0.0*
