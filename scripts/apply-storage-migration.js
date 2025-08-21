const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://tepvzhbgobckybyhryuj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyStorageMigration() {
  try {
    console.log('Applying storage migration...');

    // Create avatars bucket
    const { data: avatarBucket, error: avatarError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (avatarError && avatarError.message !== 'Bucket already exists') {
      console.error('Error creating avatars bucket:', avatarError);
    } else {
      console.log('Avatars bucket created/verified');
    }

    // Create posts bucket
    const { data: postsBucket, error: postsError } = await supabase.storage.createBucket('posts', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (postsError && postsError.message !== 'Bucket already exists') {
      console.error('Error creating posts bucket:', postsError);
    } else {
      console.log('Posts bucket created/verified');
    }

    console.log('Storage migration completed successfully!');
  } catch (error) {
    console.error('Error applying storage migration:', error);
    process.exit(1);
  }
}

applyStorageMigration();
