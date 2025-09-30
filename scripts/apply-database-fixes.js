#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Applying database fixes...');

// Read environment variables
const envPath = path.join(__dirname, '..', '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://tepvzhbgobckybyhryuj.supabase.co';
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

if (supabaseKey === 'your_supabase_anon_key_here') {
  console.log('❌ Please update VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyDatabaseFixes() {
  try {
    console.log('📊 Testing database connection...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Apply schema fixes
    console.log('🔧 Applying schema fixes...');
    
    // Create community_groups table if not exists
    const createCommunityGroups = `
      CREATE TABLE IF NOT EXISTS public.community_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        location_city TEXT,
        created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        member_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    // Create community_members table if not exists
    const createCommunityMembers = `
      CREATE TABLE IF NOT EXISTS public.community_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        community_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(community_id, user_id)
      );
    `;
    
    // Create privacy_settings table if not exists
    const createPrivacySettings = `
      CREATE TABLE IF NOT EXISTS public.privacy_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'anonymous')),
        show_email BOOLEAN DEFAULT false,
        show_phone BOOLEAN DEFAULT false,
        show_location BOOLEAN DEFAULT false,
        anonymous_mode BOOLEAN DEFAULT false,
        anonymous_posts BOOLEAN DEFAULT false,
        anonymous_comments BOOLEAN DEFAULT false,
        anonymous_votes BOOLEAN DEFAULT false,
        location_sharing BOOLEAN DEFAULT false,
        precise_location BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(user_id)
      );
    `;
    
    // Add columns to profiles table
    const alterProfiles = `
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'anonymous')),
      ADD COLUMN IF NOT EXISTS anonymous_handle TEXT,
      ADD COLUMN IF NOT EXISTS anonymous_display_name TEXT,
      ADD COLUMN IF NOT EXISTS real_name_visibility BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS location_sharing BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS precise_location BOOLEAN DEFAULT false;
    `;
    
    // Execute SQL via RPC (if available) or direct SQL
    console.log('📝 Note: Some schema changes may need to be applied manually via Supabase Dashboard');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/tepvzhbgobckybyhryuj/sql');
    console.log('');
    console.log('📋 SQL to execute:');
    console.log(createCommunityGroups);
    console.log(createCommunityMembers);
    console.log(createPrivacySettings);
    console.log(alterProfiles);
    
    console.log('✅ Database setup instructions provided');
    console.log('📝 Please run the SQL commands above in your Supabase SQL editor');
    
  } catch (error) {
    console.error('❌ Error applying database fixes:', error.message);
  }
}

applyDatabaseFixes();
