# GitHub Secrets Setup for TheGlocal Deployment

## 🚨 CRITICAL: Set up GitHub Secrets for Production Deployment

The sign-in functionality is failing because the GitHub Actions workflow doesn't have access to the Supabase credentials. You need to set up GitHub repository secrets.

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. VITE_SUPABASE_URL
- **Value**: `https://tepvzhbgobckybyhryuj.supabase.co`
- **Description**: Your Supabase project URL

### 2. VITE_SUPABASE_ANON_KEY
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4`
- **Description**: Your Supabase anonymous key

## How to Add GitHub Secrets

1. **Go to your GitHub repository**: https://github.com/ydvvpn197-netizen/projectglocal

2. **Navigate to Settings**:
   - Click on the "Settings" tab in your repository

3. **Go to Secrets and Variables**:
   - In the left sidebar, click on "Secrets and variables"
   - Then click on "Actions"

4. **Add Repository Secrets**:
   - Click "New repository secret"
   - Add each secret with the exact names and values above

## Alternative: Manual Deployment

If you prefer to deploy manually without GitHub Actions:

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider:
   - The `dist/` folder contains all the built files
   - Upload the entire `dist/` folder to your web server

## Verification

After setting up the secrets:

1. **Trigger a new deployment** by pushing any change to the main branch
2. **Check the GitHub Actions tab** to see the deployment progress
3. **Visit https://theglocal.in** to test the sign-in functionality

## Current Issue

The console shows these errors because the build is using placeholder values:
- `ERR_NAME_NOT_RESOLVED` for `placeholder.supabase...`
- `Failed to fetch` errors
- `Sign in failed: AuthRetryableFetchError`

This happens because the GitHub Actions workflow falls back to placeholder values when secrets are not configured.

## Next Steps

1. ✅ Set up the GitHub secrets (above)
2. ✅ Push a change to trigger deployment
3. ✅ Test the sign-in functionality
4. ✅ Verify all features work correctly

---

**Note**: The Supabase credentials are already correctly configured in your local `.env` file, but they need to be available to the GitHub Actions build process through repository secrets.
