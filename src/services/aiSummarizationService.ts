import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source: string;
  url: string;
  published_at: string;
  category: string;
  tags: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  reading_time_minutes?: number;
  key_points?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  image_url?: string;
  author?: string;
}

export interface AISummary {
  summary: string;
  key_points: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  reading_time_minutes: number;
  tags: string[];
  confidence_score: number;
  generated_at: string;
}

export interface SummarizationConfig {
  max_summary_length: number;
  include_key_points: boolean;
  include_sentiment: boolean;
  include_reading_time: boolean;
  include_tags: boolean;
  language: string;
  style: 'concise' | 'detailed' | 'bullet_points';
}

export class AISummarizationService {
  private static instance: AISummarizationService;
  private readonly DEFAULT_CONFIG: SummarizationConfig = {
    max_summary_length: 150,
    include_key_points: true,
    include_sentiment: true,
    include_reading_time: true,
    include_tags: true,
    language: 'en',
    style: 'concise'
  };

  public static getInstance(): AISummarizationService {
    if (!AISummarizationService.instance) {
      AISummarizationService.instance = new AISummarizationService();
    }
    return AISummarizationService.instance;
  }

  /**
   * Generate AI summary for a news article
   */
  async generateSummary(
    article: NewsArticle,
    config: Partial<SummarizationConfig> = {}
  ): Promise<AISummary> {
    try {
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      
      // Check if summary already exists and is recent
      const existingSummary = await this.getExistingSummary(article.id);
      if (existingSummary && this.isSummaryRecent(existingSummary.generated_at)) {
        return existingSummary;
      }

      // Generate new summary using AI
      const summary = await this.callAIService(article, finalConfig);
      
      // Store the summary in database
      await this.storeSummary(article.id, summary);
      
      return summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Fallback to basic summarization
      return this.generateBasicSummary(article, config);
    }
  }

  /**
   * Generate summaries for multiple articles
   */
  async generateBatchSummaries(
    articles: NewsArticle[],
    config: Partial<SummarizationConfig> = {}
  ): Promise<Map<string, AISummary>> {
    const summaries = new Map<string, AISummary>();
    
    try {
      // Process articles in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < articles.length; i += batchSize) {
        const batch = articles.slice(i, i + batchSize);
        const batchPromises = batch.map(async (article) => {
          try {
            const summary = await this.generateSummary(article, config);
            summaries.set(article.id, summary);
          } catch (error) {
            console.error(`Error generating summary for article ${article.id}:`, error);
            // Use basic summary as fallback
            const basicSummary = this.generateBasicSummary(article, config);
            summaries.set(article.id, basicSummary);
          }
        });
        
        await Promise.all(batchPromises);
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < articles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error generating batch summaries:', error);
    }
    
    return summaries;
  }

  /**
   * Get existing summary from database
   */
  private async getExistingSummary(articleId: string): Promise<AISummary | null> {
    try {
      const { data, error } = await supabase
        .from('news_summaries')
        .select('*')
        .eq('article_id', articleId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching existing summary:', error);
      return null;
    }
  }

  /**
   * Check if summary is recent (less than 24 hours old)
   */
  private isSummaryRecent(generatedAt: string): boolean {
    const generated = new Date(generatedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - generated.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }

  /**
   * Call AI service to generate summary
   */
  private async callAIService(
    article: NewsArticle,
    config: SummarizationConfig
  ): Promise<AISummary> {
    try {
      // Try multiple AI providers in order of preference
      const providers = ['openai', 'claude', 'gemini', 'local'];
      
      for (const provider of providers) {
        try {
          const summary = await this.callProvider(provider, article, config);
          if (summary) {
            return summary;
          }
        } catch (error) {
          console.warn(`Provider ${provider} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All AI providers failed');
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error;
    }
  }

  /**
   * Call specific AI provider
   */
  private async callProvider(
    provider: string,
    article: NewsArticle,
    config: SummarizationConfig
  ): Promise<AISummary | null> {
    const prompt = this.buildPrompt(article, config);
    
    switch (provider) {
      case 'openai':
        return await this.callOpenAI(prompt, config);
      case 'claude':
        return await this.callClaude(prompt, config);
      case 'gemini':
        return await this.callGemini(prompt, config);
      case 'local':
        return await this.callLocalModel(prompt, config);
      default:
        return null;
    }
  }

  /**
   * Build prompt for AI service
   */
  private buildPrompt(article: NewsArticle, config: SummarizationConfig): string {
    const styleInstructions = {
      concise: 'Provide a concise summary in 2-3 sentences.',
      detailed: 'Provide a detailed summary with context and background.',
      bullet_points: 'Provide key points in bullet format.'
    };

    return `
Please analyze and summarize the following news article:

Title: ${article.title}
Content: ${article.content.substring(0, 2000)}...

Requirements:
- ${styleInstructions[config.style]}
- Maximum ${config.max_summary_length} words
- Language: ${config.language}
- ${config.include_sentiment ? 'Include sentiment analysis (positive/negative/neutral)' : ''}
- ${config.include_key_points ? 'Extract 3-5 key points' : ''}
- ${config.include_tags ? 'Suggest relevant tags' : ''}
- ${config.include_reading_time ? 'Estimate reading time' : ''}

Please respond in JSON format with the following structure:
{
  "summary": "string",
  "key_points": ["string"],
  "sentiment": "positive|negative|neutral",
  "reading_time_minutes": number,
  "tags": ["string"],
  "confidence_score": number
}
    `.trim();
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, config: SummarizationConfig): Promise<AISummary> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional news summarizer. Provide accurate, unbiased summaries in the requested format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return this.parseAIResponse(content);
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string, config: SummarizationConfig): Promise<AISummary> {
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Claude');
    }

    return this.parseAIResponse(content);
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string, config: SummarizationConfig): Promise<AISummary> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Gemini');
    }

    return this.parseAIResponse(content);
  }

  /**
   * Call local model (fallback)
   */
  private async callLocalModel(prompt: string, config: SummarizationConfig): Promise<AISummary> {
    // This would be implemented to call a local AI model
    // For now, we'll use a basic fallback
    throw new Error('Local model not implemented');
  }

  /**
   * Parse AI response and extract structured data
   */
  private parseAIResponse(content: string): AISummary {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          key_points: parsed.key_points || [],
          sentiment: parsed.sentiment || 'neutral',
          reading_time_minutes: parsed.reading_time_minutes || 1,
          tags: parsed.tags || [],
          confidence_score: parsed.confidence_score || 0.8,
          generated_at: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error);
    }

    // Fallback: extract information from text
    return this.extractFromText(content);
  }

  /**
   * Extract summary information from unstructured text
   */
  private extractFromText(content: string): AISummary {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      summary: lines[0] || content.substring(0, 200),
      key_points: lines.slice(1, 6).filter(line => line.trim()),
      sentiment: this.detectSentiment(content),
      reading_time_minutes: Math.max(1, Math.ceil(content.length / 200)),
      tags: this.extractTags(content),
      confidence_score: 0.6,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Detect sentiment from text
   */
  private detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'win', 'improve', 'better'];
    const negativeWords = ['bad', 'terrible', 'negative', 'fail', 'lose', 'worse', 'problem', 'issue', 'crisis'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract tags from text
   */
  private extractTags(text: string): string[] {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Return top 5 most frequent words
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Store summary in database
   */
  private async storeSummary(articleId: string, summary: AISummary): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_summaries')
        .insert({
          article_id: articleId,
          summary: summary.summary,
          key_points: summary.key_points,
          sentiment: summary.sentiment,
          reading_time_minutes: summary.reading_time_minutes,
          tags: summary.tags,
          confidence_score: summary.confidence_score,
          generated_at: summary.generated_at,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing summary:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Generate basic summary as fallback
   */
  private generateBasicSummary(
    article: NewsArticle,
    config: Partial<SummarizationConfig>
  ): AISummary {
    const content = article.content;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 2).join('. ').trim() + '.';
    
    return {
      summary: summary.substring(0, config.max_summary_length || 150),
      key_points: sentences.slice(0, 3).map(s => s.trim()),
      sentiment: this.detectSentiment(content),
      reading_time_minutes: Math.max(1, Math.ceil(content.length / 200)),
      tags: this.extractTags(content),
      confidence_score: 0.5,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Get summarization statistics
   */
  async getSummarizationStats(): Promise<{
    total_summaries: number;
    average_confidence: number;
    sentiment_distribution: Record<string, number>;
    most_common_tags: Array<{ tag: string; count: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('news_summaries')
        .select('*');

      if (error) throw error;

      const summaries = data || [];
      const total = summaries.length;
      const averageConfidence = summaries.reduce((sum, s) => sum + s.confidence_score, 0) / total;
      
      const sentimentCount = summaries.reduce((acc, s) => {
        acc[s.sentiment] = (acc[s.sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tagCount = summaries.reduce((acc, s) => {
        s.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const mostCommonTags = Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      return {
        total_summaries: total,
        average_confidence: averageConfidence,
        sentiment_distribution: sentimentCount,
        most_common_tags: mostCommonTags,
      };
    } catch (error) {
      console.error('Error getting summarization stats:', error);
      return {
        total_summaries: 0,
        average_confidence: 0,
        sentiment_distribution: {},
        most_common_tags: [],
      };
    }
  }
}

// Export singleton instance
export const aiSummarizationService = AISummarizationService.getInstance();