# 🔐 GitHub Secrets Setup Guide for Supabase Integration

## 🚨 Problem Solved
This guide fixes the "Context access might be invalid" warnings in your GitHub Actions workflows by properly configuring GitHub Secrets for Supabase integration.

## 📋 Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. VITE_SUPABASE_URL
- **Purpose**: Your Supabase project URL
- **Format**: `https://your-project-id.supabase.co`
- **Example**: `https://tepvzhbgobckybyhryuj.supabase.co`

### 2. VITE_SUPABASE_ANON_KEY
- **Purpose**: Your Supabase anonymous key (public key)
- **Format**: JWT token starting with `eyJ...`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🛠️ How to Set Up GitHub Secrets

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (for `VITE_SUPABASE_URL`)
   - **anon public** key (for `VITE_SUPABASE_ANON_KEY`)

### Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:

#### Secret 1: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Your Supabase project URL (e.g., `https://tepvzhbgobckybyhryuj.supabase.co`)

#### Secret 2: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key (the long JWT token)

### Step 3: Verify Secrets Are Set

1. Go back to **Secrets and variables** → **Actions**
2. You should see both secrets listed:
   - ✅ VITE_SUPABASE_URL
   - ✅ VITE_SUPABASE_ANON_KEY

## 🔧 Local Development Setup

### Option 1: Automatic Setup (Recommended)
```bash
npm run setup:env
```

### Option 2: Manual Setup
1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🚀 Testing the Setup

### Local Testing
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for:
   - ✅ "Supabase client initialized successfully"
   - ✅ "Environment variables validated successfully"

### Deployment Testing
1. Push your changes to the main branch
2. Check the GitHub Actions workflow:
   - Go to **Actions** tab in your repository
   - Look for the deployment workflow
   - Verify it shows "✅ Environment variables validated successfully"

## 🔍 Troubleshooting

### Common Issues

#### 1. "Context access might be invalid" Warning
- **Cause**: GitHub Secrets are not properly configured
- **Solution**: Follow the steps above to add secrets to your repository

#### 2. "VITE_SUPABASE_URL secret is not set"
- **Cause**: The secret name is incorrect or not added
- **Solution**: Double-check the secret name is exactly `VITE_SUPABASE_URL`

#### 3. "VITE_SUPABASE_ANON_KEY secret is not set"
- **Cause**: The secret name is incorrect or not added
- **Solution**: Double-check the secret name is exactly `VITE_SUPABASE_ANON_KEY`

#### 4. Build Fails with "Invalid Supabase URL"
- **Cause**: The URL format is incorrect
- **Solution**: Ensure the URL starts with `https://` and ends with `.supabase.co`

#### 5. Build Fails with "Invalid Supabase Key"
- **Cause**: The anon key is incorrect or truncated
- **Solution**: Copy the complete JWT token from Supabase dashboard

### Verification Commands

Check if your secrets are properly set:
```bash
# Check local environment
npm run check:env

# Check Supabase connection
npm run test:supabase
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 🎯 What This Fixes

✅ **GitHub Actions Warnings**: Eliminates "Context access might be invalid" warnings  
✅ **Deployment Issues**: Ensures proper environment variables during build  
✅ **Supabase Connection**: Enables proper connection to your Supabase project  
✅ **Local Development**: Provides clear setup instructions for development  
✅ **Error Handling**: Better error messages and validation  

## 🔄 Next Steps

After setting up the secrets:

1. **Test locally**: Run `npm run dev` and verify Supabase connection
2. **Deploy**: Push to main branch and check GitHub Actions
3. **Monitor**: Check the deployment logs for any remaining issues
4. **Verify**: Test your deployed application to ensure Supabase features work

---

**Need Help?** Check the troubleshooting section above or review the GitHub Actions logs for specific error messages.