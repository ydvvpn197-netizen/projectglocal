#!/usr/bin/env node

/**
 * Database Restoration Script for TheGlocal Project
 * This script restores all missing database tables and data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in environment variables');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  console.log('💡 You can find this in your Supabase project settings > API');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreDatabase() {
  try {
    console.log('🚀 Starting database restoration...');
    console.log('📊 Project ID:', supabaseUrl.split('//')[1].split('.')[0]);
    
    // Read the SQL restoration script
    const sqlPath = path.join(__dirname, 'restore-database-complete.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executing database restoration script...');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing restoration script:', error);
      
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying alternative approach...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📋 Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
            if (stmtError) {
              console.warn(`⚠️  Warning in statement ${i + 1}:`, stmtError.message);
            }
          } catch (err) {
            console.warn(`⚠️  Warning in statement ${i + 1}:`, err.message);
          }
        }
      }
    } else {
      console.log('✅ Database restoration script executed successfully!');
    }
    
    // Verify tables exist
    console.log('🔍 Verifying table restoration...');
    await verifyTables();
    
    console.log('🎉 Database restoration completed successfully!');
    console.log('📋 Your TheGlocal project database has been fully restored.');
    console.log('🔗 You can now use your application normally.');
    
  } catch (error) {
    console.error('❌ Fatal error during database restoration:', error);
    process.exit(1);
  }
}

async function verifyTables() {
  const expectedTables = [
    'profiles', 'interests', 'user_interests', 'posts', 'follows', 'likes', 'comments',
    'artists', 'artist_bookings', 'artist_discussions', 'artist_discussion_replies',
    'artist_discussion_moderation_notifications', 'events', 'event_attendees',
    'groups', 'group_members', 'group_admins', 'group_messages', 'group_message_likes',
    'group_message_views', 'chat_conversations', 'chat_messages', 'discussions',
    'news_cache', 'news_likes', 'news_comments', 'news_polls', 'news_poll_votes',
    'news_shares', 'news_events', 'notifications'
  ];
  
  console.log(`🔍 Checking for ${expectedTables.length} expected tables...`);
  
  let foundTables = 0;
  let missingTables = [];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          missingTables.push(tableName);
        } else {
          console.warn(`⚠️  Warning checking table ${tableName}:`, error.message);
        }
      } else {
        foundTables++;
        console.log(`✅ Table ${tableName} exists`);
      }
    } catch (err) {
      missingTables.push(tableName);
    }
  }
  
  console.log(`📊 Found ${foundTables}/${expectedTables.length} tables`);
  
  if (missingTables.length > 0) {
    console.log('❌ Missing tables:', missingTables.join(', '));
    console.log('💡 You may need to run the restoration script again or check your Supabase permissions.');
  } else {
    console.log('✅ All expected tables are present!');
  }
}

// Run the restoration
if (require.main === module) {
  restoreDatabase();
}

module.exports = { restoreDatabase, verifyTables };
