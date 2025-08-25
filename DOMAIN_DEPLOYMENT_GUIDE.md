# Domain Deployment Guide for theglocal.in

## 🚀 Quick Deployment

Your project is now configured for domain deployment. Here's what you need to do:

### 1. Build and Deploy
```bash
npm run deploy:domain
```

This will create a deployment package: `theglocal-domain-deploy.zip`

### 2. Upload to Web Server
Upload the contents of the `dist/` folder to your web server's root directory.

### 3. DNS Configuration (GoDaddy)

Since you bought the domain from GoDaddy, you need to configure DNS:

#### A. Log into GoDaddy
1. Go to [GoDaddy.com](https://godaddy.com)
2. Sign in to your account
3. Go to "My Products" → "Domains"

#### B. Configure DNS Records
1. Click on `theglocal.in`
2. Go to "DNS" tab
3. Add/Update these records:

**A Record:**
- Name: `@` (or leave blank)
- Value: Your web server's IP address
- TTL: 600 (or default)

**CNAME Record:**
- Name: `www`
- Value: `theglocal.in`
- TTL: 600 (or default)

### 4. SSL Certificate
Install an SSL certificate for `https://theglocal.in`:
- Use Let's Encrypt (free)
- Or purchase from GoDaddy
- Ensure HTTPS redirect is enabled

## 🔧 Technical Configuration

### Current Setup
- ✅ Domain: `theglocal.in`
- ✅ Build configured for production
- ✅ Assets use absolute domain paths
- ✅ SPA routing configured
- ✅ Security headers enabled
- ✅ CORS configured for domain

### Files Generated
- `dist/index.html` - Main application
- `dist/js/` - JavaScript bundles
- `dist/css/` - Stylesheets
- `dist/.htaccess` - Apache configuration
- `dist/web.config` - IIS configuration

### Environment Variables
```env
VITE_APP_URL=https://theglocal.in
NODE_ENV=production
```

## 🌐 Web Server Configuration

### Apache (.htaccess)
The `.htaccess` file handles:
- SPA routing (React Router)
- Security headers
- Gzip compression
- Cache control
- HTTPS redirect

### IIS (web.config)
The `web.config` file handles:
- SPA routing
- MIME types
- Security headers

## 🔍 Troubleshooting

### Common Issues

1. **Domain not loading**
   - Check DNS propagation (can take 24-48 hours)
   - Verify A record points to correct IP
   - Check web server is running

2. **Assets not loading**
   - Ensure all files uploaded to server
   - Check file permissions (644 for files, 755 for directories)
   - Verify `.htaccess` is in root directory

3. **SSL/HTTPS issues**
   - Install SSL certificate
   - Configure HTTPS redirect
   - Check certificate validity

4. **Routing issues**
   - Ensure SPA routing is configured
   - Check `.htaccess` or `web.config` is present
   - Verify server supports URL rewriting

### Testing
```bash
# Test locally
npm run preview

# Test domain
curl -I https://theglocal.in
```

## 📞 Support

If you encounter issues:
1. Check web server logs
2. Verify DNS propagation
3. Test with different browsers
4. Check browser developer tools for errors

## 🎯 Success Checklist

- [ ] Domain resolves to your server
- [ ] HTTPS works (SSL certificate installed)
- [ ] Website loads correctly
- [ ] All assets (JS, CSS) load
- [ ] Navigation/routing works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance is good

## 🔄 Updates

To update your deployed site:
1. Make code changes
2. Run `npm run deploy:domain`
3. Upload new `dist/` contents
4. Clear browser cache if needed

---

**Your site should be live at: https://theglocal.in**
