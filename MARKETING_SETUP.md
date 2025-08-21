# Marketing Tables Setup

## Issue
The promotional banner is not displaying because the `marketing_campaigns` table and related marketing tables don't exist in the database. This causes the console warning: "Marketing campaigns table not available. Banner will be hidden."

## Solution

### Option 1: Run the Migration (Recommended)

1. **Start Docker Desktop** (if not already running)
2. **Start Supabase locally:**
   ```bash
   npx supabase start
   ```
3. **Apply the migration:**
   ```bash
   npx supabase db push
   ```

This will create all the required marketing tables:
- `marketing_campaigns`
- `referral_program`
- `social_shares`
- `promotional_codes`
- `marketing_analytics`

### Option 2: Manual Database Setup

If you can't run the migration, you can manually create the tables in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL from `supabase/migrations/20250830000000_fix_marketing_campaigns_schema.sql`

### Option 3: Disable Marketing Features Temporarily

If you don't need marketing features right now, you can:

1. **Remove the PromotionalBanner component** from your pages
2. **Comment out marketing-related imports** in your components

## What the Migration Does

The migration file `20250830000000_fix_marketing_campaigns_schema.sql`:

1. **Recreates the `marketing_campaigns` table** with the correct schema that matches the TypeScript types
2. **Creates all related marketing tables** (referral_program, social_shares, promotional_codes, marketing_analytics)
3. **Sets up Row Level Security (RLS) policies** for proper access control
4. **Creates indexes** for better performance
5. **Inserts sample campaigns** for testing

## Expected Result

After running the migration:
- ✅ The promotional banner should display properly
- ✅ No more console warnings about missing marketing tables
- ✅ Marketing features will be fully functional
- ✅ Sample campaigns will be available for testing

## Troubleshooting

### Docker Issues
If you get Docker-related errors:
1. Make sure Docker Desktop is installed and running
2. Try running PowerShell as Administrator
3. Restart Docker Desktop

### Migration Errors
If the migration fails:
1. Check that Supabase is running: `npx supabase status`
2. Try resetting the database: `npx supabase db reset`
3. Then run the migration again: `npx supabase db push`

### Still Not Working
If the banner still doesn't show after the migration:
1. Check the browser console for other errors
2. Verify the migration ran successfully in the Supabase dashboard
3. Check that the `marketing_campaigns` table exists and has data

## Files Modified

- `src/components/marketing/PromotionalBanner.tsx` - Reduced console warnings
- `src/services/marketingService.ts` - Reduced console warnings
- `supabase/migrations/20250830000000_fix_marketing_campaigns_schema.sql` - New migration file
