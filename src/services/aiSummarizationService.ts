import { supabase } from '../integrations/supabase/client';

interface OpenAISummaryResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AISummarizationService {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!this.openaiApiKey) {
      console.warn('OpenAI API key not configured');
    }
  }

  /**
   * Generate AI summary for a news article
   */
  async generateSummary(articleContent: string, title: string): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        // Fallback to basic text summarization
        return this.generateBasicSummary(articleContent);
      }

      const prompt = this.createSummaryPrompt(articleContent, title);
      const summary = await this.callOpenAI(prompt);
      
      return summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Fallback to basic summarization
      return this.generateBasicSummary(articleContent);
    }
  }

  /**
   * Create prompt for OpenAI
   */
  private createSummaryPrompt(content: string, title: string): string {
    return `Please provide a concise, one-paragraph summary of the following news article. Focus on the key facts, main points, and important details. Make it informative but easy to read:

Title: ${title}

Content: ${content.substring(0, 2000)}...

Summary:`;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAISummaryResponse = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Generate basic summary as fallback
   */
  private generateBasicSummary(content: string): string {
    // Simple extractive summarization
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      return content.substring(0, 200) + '...';
    }

    // Take first 2-3 sentences as summary
    const summarySentences = sentences.slice(0, 3);
    return summarySentences.join('. ').trim() + '.';
  }

  /**
   * Generate summary for multiple articles
   */
  async generateSummariesForArticles(articles: Array<{ id: string; content: string; title: string }>): Promise<Map<string, string>> {
    const summaries = new Map<string, string>();
    
    for (const article of articles) {
      try {
        const summary = await this.generateSummary(article.content, article.title);
        summaries.set(article.id, summary);
        
        // Save summary to database
        await this.saveSummaryToDatabase(article.id, summary);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating summary for article ${article.id}:`, error);
        // Use basic summary as fallback
        const basicSummary = this.generateBasicSummary(article.content);
        summaries.set(article.id, basicSummary);
      }
    }
    
    return summaries;
  }

  /**
   * Save summary to database
   */
  private async saveSummaryToDatabase(articleId: string, summary: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_article_summaries')
        .upsert({
          article_id: articleId,
          summary,
          summary_type: 'ai_generated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving summary to database:', error);
      }
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  }

  /**
   * Get existing summary from database
   */
  async getExistingSummary(articleId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('news_article_summaries')
        .select('summary')
        .eq('article_id', articleId)
        .single();

      if (error) {
        return null;
      }

      return data?.summary || null;
    } catch (error) {
      console.error('Error getting existing summary:', error);
      return null;
    }
  }

  /**
   * Generate category-based summary
   */
  async generateCategorySummary(articles: Array<{ id: string; content: string; title: string; category: string }>): Promise<Map<string, string>> {
    const summaries = new Map<string, string>();
    
    // Group articles by category
    const articlesByCategory = new Map<string, Array<{ id: string; content: string; title: string }>>();
    
    for (const article of articles) {
      if (!articlesByCategory.has(article.category)) {
        articlesByCategory.set(article.category, []);
      }
      articlesByCategory.get(article.category)!.push({
        id: article.id,
        content: article.content,
        title: article.title
      });
    }
    
    // Generate summaries for each category
    for (const [category, categoryArticles] of articlesByCategory) {
      for (const article of categoryArticles) {
        try {
          const summary = await this.generateSummary(article.content, article.title);
          summaries.set(article.id, summary);
          
          // Save summary to database
          await this.saveSummaryToDatabase(article.id, summary);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error generating summary for article ${article.id}:`, error);
          // Use basic summary as fallback
          const basicSummary = this.generateBasicSummary(article.content);
          summaries.set(article.id, basicSummary);
        }
      }
    }
    
    return summaries;
  }

  /**
   * Generate trending topics summary
   */
  async generateTrendingTopicsSummary(articles: Array<{ id: string; content: string; title: string }>): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        return this.generateBasicTrendingSummary(articles);
      }

      const titles = articles.map(article => article.title).join('\n');
      const prompt = `Based on these news headlines, provide a brief summary of the trending topics and main themes:

${titles}

Trending Topics Summary:`;

      const summary = await this.callOpenAI(prompt);
      return summary;
    } catch (error) {
      console.error('Error generating trending topics summary:', error);
      return this.generateBasicTrendingSummary(articles);
    }
  }

  /**
   * Generate basic trending summary as fallback
   */
  private generateBasicTrendingSummary(articles: Array<{ id: string; content: string; title: string }>): string {
    const titles = articles.map(article => article.title);
    const commonWords = this.extractCommonWords(titles);
    
    return `Current trending topics include: ${commonWords.slice(0, 5).join(', ')}. These stories cover the latest developments in these areas.`;
  }

  /**
   * Extract common words from titles
   */
  private extractCommonWords(titles: string[]): string[] {
    const wordCount = new Map<string, number>();
    
    titles.forEach(title => {
      const words = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      });
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }
}

export const aiSummarizationService = new AISummarizationService();
export default aiSummarizationService;
