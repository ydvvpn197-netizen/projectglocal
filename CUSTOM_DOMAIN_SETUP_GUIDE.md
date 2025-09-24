# 🌐 Custom Domain Setup Guide - theglocal.in

## 🚀 Deployment Status
✅ **Code Changes**: All deployment fixes have been applied and pushed
✅ **Build Configuration**: Updated for custom domain deployment
✅ **GitHub Actions**: Will automatically deploy when triggered

## 🔧 Required Manual Setup Steps

### Step 1: Configure GitHub Pages Settings

1. **Go to your GitHub repository**: https://github.com/ydvvpn197-netizen/projectglocal
2. **Click on Settings tab**
3. **Scroll down to "Pages" section**
4. **Configure the following**:
   - **Source**: Select "Deploy from a branch" or "GitHub Actions" (recommended)
   - **Branch**: Select "main" if using branch deployment
   - **Custom domain**: Enter `theglocal.in`
   - **Enforce HTTPS**: ✅ Check this box

### Step 2: Verify DNS Configuration

Your domain `theglocal.in` needs to point to GitHub Pages. Configure these DNS records:

#### Option A: CNAME Record (Recommended)
```
Type: CNAME
Name: @ (or root domain)
Value: ydvvpn197-netizen.github.io
```

#### Option B: A Records (Alternative)
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

#### WWW Subdomain (Optional)
```
Type: CNAME
Name: www
Value: ydvvpn197-netizen.github.io
```

### Step 3: Add Required GitHub Secrets

The deployment needs these environment variables as GitHub secrets:

#### Essential Secrets (Required):
1. **VITE_SUPABASE_URL**
   - Value: `https://tepvzhbgobckybyhryuj.supabase.co`
   
2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczNTI1MDEsImV4cCI6MjA0MjkyODUwMX0.YaVJJqD2WxkW5q9YG8Hf1LKGt3K8I9Ub2Dc5A7VxE4M`

#### Optional Secrets (For Enhanced Features):
3. **VITE_GOOGLE_MAPS_API_KEY**
   - Value: `AIzaSyBwdf6eMzFbsPcD12apX_PdCihrgun55YA`

4. **VITE_NEWS_API_KEY**
   - Value: `edcc8605b836ce982b924ab1bbe45056`

5. **VITE_OPENAI_API_KEY**
   - Value: `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`

#### How to Add Secrets:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

### Step 4: Trigger Deployment

1. **Check GitHub Actions**: Go to the Actions tab to see if deployment started automatically
2. **Manual Trigger** (if needed): Go to Actions → "Complete Deployment to GitHub Pages" → "Run workflow"

### Step 5: Verify Custom Domain

After deployment completes (5-10 minutes):

1. **Check DNS Propagation**: Use tools like https://dnschecker.org/
2. **Test the Site**: Visit https://theglocal.in/
3. **Verify HTTPS**: Ensure the site loads with SSL certificate
4. **Test Functionality**: Check that all features work properly

## 🔍 Troubleshooting

### Issue: "Domain not verified" in GitHub Pages
**Solution**: Wait for DNS propagation (up to 24 hours) or check DNS configuration

### Issue: Site shows 404 error
**Solution**: 
1. Ensure GitHub Pages is enabled with correct source
2. Check that CNAME file exists in the repository
3. Verify DNS records are correct

### Issue: SSL certificate not working
**Solution**: 
1. Ensure "Enforce HTTPS" is enabled in GitHub Pages settings
2. Wait for certificate provisioning (can take up to 24 hours)
3. Check that DNS records are properly configured

### Issue: Site loads but features don't work
**Solution**:
1. Check browser console for errors
2. Verify all GitHub secrets are set correctly
3. Check that Supabase project is active and accessible

## 📊 Deployment Monitoring

### GitHub Actions Status
Monitor deployment at: https://github.com/ydvvpn197-netizen/projectglocal/actions

### Site Health Check
- **Primary URL**: https://theglocal.in/
- **GitHub Pages URL**: https://ydvvpn197-netizen.github.io/projectglocal/ (fallback)

### Expected Deployment Time
- **Code Deployment**: 3-5 minutes
- **DNS Propagation**: Up to 24 hours
- **SSL Certificate**: Up to 24 hours

## ✅ Success Checklist

- [ ] GitHub Pages configured with custom domain
- [ ] DNS records properly configured
- [ ] All required secrets added to repository
- [ ] GitHub Actions deployment successful
- [ ] Site accessible at https://theglocal.in/
- [ ] HTTPS working with valid certificate
- [ ] All features functional (auth, posts, etc.)

## 🎯 Next Steps After Successful Deployment

1. **Test all features** on the live site
2. **Set up monitoring** for uptime and performance
3. **Configure analytics** (Google Analytics, etc.)
4. **Set up automated backups** for Supabase data
5. **Plan content migration** if moving from another platform

---

## 🚨 Important Notes

- **DNS Changes**: Can take up to 24 hours to propagate globally
- **SSL Certificate**: GitHub automatically provisions SSL, but it may take time
- **First Deployment**: May take longer than subsequent deployments
- **Cache**: Clear browser cache if you see old content

---

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify DNS configuration using online tools
3. Test locally first: `npm run dev`
4. Check Supabase dashboard for database connectivity

**Your site should be live at https://theglocal.in/ once all steps are completed! 🎉**
