# GitHub Secrets Setup for Deployment

## Required Secrets for GitHub Actions

Add these secrets to your GitHub repository:

### 1. Supabase Configuration
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://tepvzhbgobckybyhryuj.supabase.co`

- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4`

### 2. Optional API Keys (add if you have them)
- **Name**: `VITE_GOOGLE_MAPS_API_KEY`
- **Value**: `your_google_maps_api_key`

- **Name**: `VITE_NEWS_API_KEY`
- **Value**: `your_news_api_key`

- **Name**: `VITE_OPENAI_API_KEY`
- **Value**: `your_openai_api_key`

- **Name**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value**: `your_stripe_publishable_key`

## How to Add Secrets:

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the name and value for each secret above
6. Click **Add secret**

## After Adding Secrets:

1. Go to **Actions** tab in your repository
2. Click on **Complete Deployment to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select your main branch and click **Run workflow**

The deployment will automatically:
- ✅ Validate your code
- ✅ Run tests
- ✅ Build the project
- ✅ Deploy to GitHub Pages
- ✅ Verify the deployment

Your site will be available at: `https://yourusername.github.io/projectglocal/`
