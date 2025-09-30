#!/usr/bin/env node

/**
 * Find Duplicate Pages Script
 * Identifies pages that can be consolidated and marks them for deprecation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '..', 'src', 'pages');

// Pages that should be consolidated
const duplicateCategories = {
  auth: {
    consolidated: 'ConsolidatedAuth.tsx',
    duplicates: ['SignIn.tsx', 'SignUp.tsx']
  },
  profile: {
    consolidated: 'ConsolidatedProfile.tsx',
    duplicates: ['Profile.tsx', 'UserProfile.tsx', 'ArtistProfile.tsx']
  },
  create: {
    consolidated: 'ConsolidatedCreate.tsx',
    duplicates: ['CreatePost.tsx', 'CreateEvent.tsx', 'CreateGroup.tsx', 'CreateDiscussion.tsx']
  },
  chat: {
    consolidated: 'ConsolidatedChat.tsx',
    duplicates: ['Chat.tsx', 'EnhancedChat.tsx', 'EnhancedMessages.tsx']
  },
  booking: {
    consolidated: 'ConsolidatedBooking.tsx',
    duplicates: ['BookArtist.tsx', 'BookArtistSimple.tsx', 'BookArtistTest.tsx']
  },
  artist: {
    consolidated: 'ConsolidatedArtist.tsx',
    duplicates: ['ArtistOnboarding.tsx', 'EnhancedArtistMarketplace.tsx']
  },
  community: {
    consolidated: 'ConsolidatedCommunity.tsx',
    duplicates: ['Community.tsx', 'CommunityPlatform.tsx']
  },
  communityInsights: {
    consolidated: 'ConsolidatedCommunityInsights.tsx',
    duplicates: ['CommunityInsights.tsx', 'CommunityInsightsSimple.tsx']
  },
  notifications: {
    consolidated: 'ConsolidatedNotifications.tsx',
    duplicates: ['Notifications.tsx', 'NotificationsPage.tsx']
  },
  subscription: {
    consolidated: 'ConsolidatedSubscription.tsx',
    duplicates: ['SubscriptionPage.tsx', 'SubscriptionPlansPage.tsx']
  },
  onboarding: {
    consolidated: 'ConsolidatedOnboarding.tsx',
    duplicates: ['Onboarding.tsx', 'PrivacyFirstOnboarding.tsx']
  },
  settings: {
    consolidated: 'ConsolidatedSettings.tsx',
    duplicates: ['NotificationSettings.tsx']
  }
};

// Test/demo pages that should be moved
const testPages = [
  'TestButtons.tsx',
  'ConsolidatedTest.tsx',
  'CivicEngagementTest.tsx',
  'MonetizationTest.tsx',
  'LayoutDemo.tsx',
  'FeatureShowcase.tsx',
  'EnhancedSearchDemo.tsx',
  'VoiceControlDemo.tsx',
  'PerformancePage.tsx'
];

function addDeprecationNotice(filePath, category, consolidatedPage) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has deprecation notice
  if (content.includes('@deprecated')) {
    console.log(`  ✓ Already marked: ${path.basename(filePath)}`);
    return;
  }

  const deprecationNotice = `/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ${consolidatedPage} instead.
 * Category: ${category}
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

`;

  const newContent = deprecationNotice + content;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`  ✓ Marked for deprecation: ${path.basename(filePath)}`);
}

function addTestPageNotice(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('@internal')) {
    console.log(`  ✓ Already marked as test: ${path.basename(filePath)}`);
    return;
  }

  const testNotice = `/**
 * @internal Test/Demo page
 * This page is for testing and demonstration purposes.
 * Should be moved to /dev route behind feature flag.
 * Not for production use.
 */

`;

  const newContent = testNotice + content;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`  ✓ Marked as test page: ${path.basename(filePath)}`);
}

function main() {
  console.log('\n🔍 Finding and Marking Duplicate Pages...\n');

  let totalMarked = 0;
  let totalTest = 0;

  // Process duplicate categories
  console.log('📋 Marking consolidated pages:\n');
  for (const [category, { consolidated, duplicates }] of Object.entries(duplicateCategories)) {
    console.log(`\n${category.toUpperCase()} → ${consolidated}`);
    
    duplicates.forEach(file => {
      const filePath = path.join(pagesDir, file);
      if (fs.existsSync(filePath)) {
        addDeprecationNotice(filePath, category, consolidated);
        totalMarked++;
      } else {
        console.log(`  ⚠️  File not found: ${file}`);
      }
    });
  }

  // Process test pages
  console.log('\n\n🧪 Marking test/demo pages:\n');
  testPages.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (fs.existsSync(filePath)) {
      addTestPageNotice(filePath);
      totalTest++;
    } else {
      console.log(`  ⚠️  File not found: ${file}`);
    }
  });

  console.log(`\n\n✅ Summary:`);
  console.log(`   - Marked ${totalMarked} files for deprecation`);
  console.log(`   - Marked ${totalTest} test/demo pages`);
  console.log(`   - Total: ${totalMarked + totalTest} files marked`);
  console.log(`\n📄 See DEPRECATION_PLAN.md for removal timeline\n`);
}

main();
