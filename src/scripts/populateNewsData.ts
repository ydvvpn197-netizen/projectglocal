import { realTimeNewsService } from '../services/realTimeNewsService';
import { aiSummarizationService } from '../services/aiSummarizationService';

/**
 * Script to populate the database with real news data
 */
async function populateNewsData() {
  console.log('🚀 Starting news data population...');
  
  try {
    // Fetch real-time news from APIs
    console.log('📰 Fetching real-time news...');
    const articles = await realTimeNewsService.fetchRealTimeNews('general', 20);
    
    console.log(`✅ Fetched ${articles.length} articles`);
    
    // Generate AI summaries for articles
    console.log('🤖 Generating AI summaries...');
    const articlesForSummarization = articles.map(article => ({
      id: article.id,
      content: article.content,
      title: article.title
    }));
    
    const summaries = await aiSummarizationService.generateSummariesForArticles(articlesForSummarization);
    
    console.log(`✅ Generated ${summaries.size} summaries`);
    
    // Display results
    console.log('\n📊 News Data Population Summary:');
    console.log(`- Articles fetched: ${articles.length}`);
    console.log(`- Summaries generated: ${summaries.size}`);
    console.log(`- Sources: GNews API, NewsAPI`);
    console.log(`- AI Provider: OpenAI GPT-3.5-turbo`);
    
    // Show sample articles
    console.log('\n📰 Sample Articles:');
    articles.slice(0, 3).forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.author}`);
      console.log(`   Published: ${new Date(article.published_at).toLocaleDateString()}`);
      console.log(`   URL: ${article.url}`);
    });
    
    console.log('\n🎉 News data population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating news data:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  populateNewsData()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { populateNewsData };
