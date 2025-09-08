import { NewsSummary, SummarizationOptions } from './newsSummarizationService';

export interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIResponse {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  tags: string[];
  readingTime: number;
}

export class AIIntegrationService {
  private static instance: AIIntegrationService;
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: string = 'openai';

  private constructor() {
    this.initializeProviders();
  }

  public static getInstance(): AIIntegrationService {
    if (!AIIntegrationService.instance) {
      AIIntegrationService.instance = new AIIntegrationService();
    }
    return AIIntegrationService.instance;
  }

  /**
   * Initialize AI providers from environment variables
   */
  private initializeProviders(): void {
    // OpenAI Configuration
    if (process.env.VITE_OPENAI_API_KEY) {
      this.providers.set('openai', {
        name: 'OpenAI',
        apiKey: process.env.VITE_OPENAI_API_KEY,
        baseUrl: 'https://api.openai.com/v1',
        model: process.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.3
      });
    }

    // Anthropic Claude Configuration
    if (process.env.VITE_ANTHROPIC_API_KEY) {
      this.providers.set('claude', {
        name: 'Anthropic Claude',
        apiKey: process.env.VITE_ANTHROPIC_API_KEY,
        baseUrl: 'https://api.anthropic.com/v1',
        model: process.env.VITE_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        maxTokens: 1000,
        temperature: 0.3
      });
    }

    // Google Gemini Configuration
    if (process.env.VITE_GOOGLE_API_KEY) {
      this.providers.set('gemini', {
        name: 'Google Gemini',
        apiKey: process.env.VITE_GOOGLE_API_KEY,
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: process.env.VITE_GOOGLE_MODEL || 'gemini-pro',
        maxTokens: 1000,
        temperature: 0.3
      });
    }

    // Hugging Face Configuration
    if (process.env.VITE_HUGGINGFACE_API_KEY) {
      this.providers.set('huggingface', {
        name: 'Hugging Face',
        apiKey: process.env.VITE_HUGGINGFACE_API_KEY,
        baseUrl: 'https://api-inference.huggingface.co/models',
        model: process.env.VITE_HUGGINGFACE_MODEL || 'facebook/bart-large-cnn',
        maxTokens: 1000,
        temperature: 0.3
      });
    }
  }

  /**
   * Generate summary using AI
   */
  async generateAISummary(
    article: {
      id: string;
      title: string;
      content: string;
      description?: string;
    },
    options: SummarizationOptions = {}
  ): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    
    if (!provider) {
      throw new Error(`No AI provider configured: ${this.currentProvider}`);
    }

    try {
      switch (this.currentProvider) {
        case 'openai':
          return await this.generateOpenAISummary(article, provider, options);
        case 'claude':
          return await this.generateClaudeSummary(article, provider, options);
        case 'gemini':
          return await this.generateGeminiSummary(article, provider, options);
        case 'huggingface':
          return await this.generateHuggingFaceSummary(article, provider, options);
        default:
          throw new Error(`Unsupported AI provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error(`Error generating AI summary with ${provider.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate summary using OpenAI
   */
  private async generateOpenAISummary(
    article: { title: string; content: string; description?: string },
    provider: AIProvider,
    options: SummarizationOptions
  ): Promise<AIResponse> {
    const prompt = this.createSummarizationPrompt(article, options);
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert news summarizer. Provide accurate, concise summaries with key points, sentiment analysis, and relevant tags.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: provider.maxTokens,
        temperature: provider.temperature
      })
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
   * Generate summary using Anthropic Claude
   */
  private async generateClaudeSummary(
    article: { title: string; content: string; description?: string },
    provider: AIProvider,
    options: SummarizationOptions
  ): Promise<AIResponse> {
    const prompt = this.createSummarizationPrompt(article, options);
    
    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: provider.maxTokens,
        temperature: provider.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
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
   * Generate summary using Google Gemini
   */
  private async generateGeminiSummary(
    article: { title: string; content: string; description?: string },
    provider: AIProvider,
    options: SummarizationOptions
  ): Promise<AIResponse> {
    const prompt = this.createSummarizationPrompt(article, options);
    
    const response = await fetch(`${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
          maxOutputTokens: provider.maxTokens,
          temperature: provider.temperature
        }
      })
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
   * Generate summary using Hugging Face
   */
  private async generateHuggingFaceSummary(
    article: { title: string; content: string; description?: string },
    provider: AIProvider,
    options: SummarizationOptions
  ): Promise<AIResponse> {
    const response = await fetch(`${provider.baseUrl}/${provider.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: article.content,
        parameters: {
          max_length: options.maxLength || 150,
          min_length: 50,
          do_sample: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data[0]?.summary_text;
    
    if (!summary) {
      throw new Error('No summary received from Hugging Face');
    }

    // Hugging Face only provides summary, so we'll use fallback methods for other data
    return {
      summary,
      keyPoints: this.extractKeyPointsFallback(article),
      sentiment: this.analyzeSentimentFallback(article),
      confidence: 0.8,
      tags: this.extractTagsFallback(article),
      readingTime: this.calculateReadingTimeFallback(article.content)
    };
  }

  /**
   * Create summarization prompt for AI models
   */
  private createSummarizationPrompt(
    article: { title: string; content: string; description?: string },
    options: SummarizationOptions
  ): string {
    const maxLength = options.maxLength || 150;
    
    return `
Please analyze and summarize the following news article:

Title: ${article.title}
Content: ${article.content}

Please provide your response in the following JSON format:
{
  "summary": "A concise summary of the article (max ${maxLength} characters)",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "sentiment": "positive|negative|neutral",
  "confidence": 0.95,
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 3
}

Requirements:
- Summary should be clear and informative
- Key points should be the most important takeaways
- Sentiment should reflect the overall tone
- Confidence should be between 0 and 1
- Tags should be relevant keywords
- Reading time should be in minutes
`;
  }

  /**
   * Parse AI response from JSON format
   */
  private parseAIResponse(content: string): AIResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          keyPoints: parsed.keyPoints || [],
          sentiment: parsed.sentiment || 'neutral',
          confidence: parsed.confidence || 0.8,
          tags: parsed.tags || [],
          readingTime: parsed.readingTime || 1
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error);
    }

    // Fallback: treat the entire response as summary
    return {
      summary: content.trim(),
      keyPoints: [],
      sentiment: 'neutral',
      confidence: 0.7,
      tags: [],
      readingTime: 1
    };
  }

  /**
   * Fallback methods for when AI doesn't provide complete data
   */
  private extractKeyPointsFallback(article: { title: string; content: string }): string[] {
    const sentences = article.content.split(/[.!?]+/).slice(0, 3);
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  private analyzeSentimentFallback(article: { title: string; content: string }): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['success', 'growth', 'improvement', 'launch', 'achievement'];
    const negativeWords = ['crisis', 'problem', 'issue', 'failure', 'decline'];
    
    const text = (article.title + ' ' + article.content).toLowerCase();
    const positiveCount = positiveWords.reduce((count, word) => count + (text.split(word).length - 1), 0);
    const negativeCount = negativeWords.reduce((count, word) => count + (text.split(word).length - 1), 0);
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractTagsFallback(article: { title: string; content: string }): string[] {
    const commonTags = ['technology', 'business', 'health', 'sports', 'entertainment', 'politics', 'science'];
    const text = (article.title + ' ' + article.content).toLowerCase();
    return commonTags.filter(tag => text.includes(tag)).slice(0, 5);
  }

  private calculateReadingTimeFallback(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Set the current AI provider
   */
  setProvider(providerName: string): void {
    if (this.providers.has(providerName)) {
      this.currentProvider = providerName;
    } else {
      throw new Error(`Provider not found: ${providerName}`);
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): string {
    return this.currentProvider;
  }

  /**
   * Test AI provider connection
   */
  async testProvider(providerName: string): Promise<{ success: boolean; error?: string }> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }

    try {
      const testArticle = {
        id: 'test',
        title: 'Test Article',
        content: 'This is a test article for AI provider testing.',
        description: 'Test description'
      };

      await this.generateAISummary(testArticle, { maxLength: 50 });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
