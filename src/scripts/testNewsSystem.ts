import { realTimeNewsService } from '../services/realTimeNewsService';
import { aiSummarizationService } from '../services/aiSummarizationService';

/**
 * Test script to verify the news system is working
 */
async function testNewsSystem() {
  console.log('🧪 Testing News System...');
  
  try {
    // Test 1: Fetch real-time news
    console.log('\n1️⃣ Testing real-time news fetching...');
    const articles = await realTimeNewsService.fetchRealTimeNews('general', 5);
    
    if (articles.length > 0) {
      console.log(`✅ Successfully fetched ${articles.length} articles`);
      console.log(`   Sample: ${articles[0].title}`);
    } else {
      console.log('❌ No articles fetched');
      return false;
    }
    
    // Test 2: Test AI summarization
    console.log('\n2️⃣ Testing AI summarization...');
    const testArticle = articles[0];
    const summary = await aiSummarizationService.generateSummary(testArticle.content, testArticle.title);
    
    if (summary && summary.length > 0) {
      console.log('✅ AI summarization working');
      console.log(`   Summary: ${summary.substring(0, 100)}...`);
    } else {
      console.log('❌ AI summarization failed');
      return false;
    }
    
    // Test 3: Test database operations
    console.log('\n3️⃣ Testing database operations...');
    const trendingArticles = await realTimeNewsService.getTrendingArticles(3);
    console.log(`✅ Database operations working (${trendingArticles.length} trending articles)`);
    
    // Test 4: Test search functionality
    console.log('\n4️⃣ Testing search functionality...');
    const searchResults = await realTimeNewsService.searchArticles('news', 3);
    console.log(`✅ Search functionality working (${searchResults.length} results)`);
    
    console.log('\n🎉 All tests passed! News system is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testNewsSystem()
    .then((success) => {
      if (success) {
        console.log('✅ All tests passed');
        process.exit(0);
      } else {
        console.log('❌ Some tests failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

export { testNewsSystem };
