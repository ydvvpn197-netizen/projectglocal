/**
 * News Pipeline Edge Function
 * Fetches, deduplicates, and summarizes news articles using AI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  content: string;
  summary: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  city?: string;
  country?: string;
  category?: string;
  tags?: string[];
}

interface NewsAPIResponse {
  articles: Array<{
    title: string;
    description: string;
    content: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: { name: string };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get news API key
    const newsApiKey = Deno.env.get('NEWS_API_KEY');
    if (!newsApiKey) {
      throw new Error('NEWS_API_KEY not found');
    }

    // Get AI API key (OpenAI, Anthropic, or Google)
    const aiApiKey = Deno.env.get('OPENAI_API_KEY') || 
                     Deno.env.get('ANTHROPIC_API_KEY') || 
                     Deno.env.get('GOOGLE_API_KEY');
    
    if (!aiApiKey) {
      throw new Error('No AI API key found');
    }

    // Fetch news from multiple sources
    const newsArticles = await fetchNewsArticles(newsApiKey);
    
    // Deduplicate articles
    const uniqueArticles = deduplicateArticles(newsArticles);
    
    // Process articles with AI summarization
    const processedArticles = await processArticlesWithAI(uniqueArticles, aiApiKey);
    
    // Store in database
    const storedCount = await storeNewsArticles(supabase, processedArticles);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${newsArticles.length} articles, stored ${storedCount} unique articles`,
        articles_processed: newsArticles.length,
        articles_stored: storedCount,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('News pipeline error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function fetchNewsArticles(apiKey: string): Promise<NewsArticle[]> {
  const sources = [
    'bbc-news',
    'cnn',
    'reuters',
    'associated-press',
    'bloomberg',
    'business-insider',
    'techcrunch',
    'the-verge',
    'wired'
  ];

  const articles: NewsArticle[] = [];
  
  for (const source of sources) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?sources=${source}&pageSize=10&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        console.warn(`Failed to fetch from ${source}:`, response.status);
        continue;
      }
      
      const data: NewsAPIResponse = await response.json();
      
      for (const article of data.articles) {
        if (article.title && article.content) {
          articles.push({
            title: article.title,
            content: article.content,
            summary: article.description || '',
            source: article.source.name,
            url: article.url,
            image_url: article.urlToImage,
            published_at: article.publishedAt,
            category: extractCategory(article.title, article.content),
            tags: extractTags(article.title, article.content)
          });
        }
      }
    } catch (error) {
      console.warn(`Error fetching from ${source}:`, error);
    }
  }
  
  return articles;
}

function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const unique: NewsArticle[] = [];
  
  for (const article of articles) {
    // Create a hash of the article content for deduplication
    const hash = createArticleHash(article);
    
    if (!seen.has(hash)) {
      seen.add(hash);
      unique.push(article);
    }
  }
  
  return unique;
}

function createArticleHash(article: NewsArticle): string {
  // Create a hash based on title and first 100 characters of content
  const content = article.title + article.content.substring(0, 100);
  return btoa(content).replace(/[^a-zA-Z0-9]/g, '');
}

async function processArticlesWithAI(articles: NewsArticle[], apiKey: string): Promise<NewsArticle[]> {
  const processed: NewsArticle[] = [];
  
  for (const article of articles) {
    try {
      // Generate AI summary
      const summary = await generateAISummary(article, apiKey);
      
      // Extract location information
      const location = extractLocation(article.title, article.content);
      
      processed.push({
        ...article,
        summary,
        city: location.city,
        country: location.country
      });
    } catch (error) {
      console.warn(`Error processing article "${article.title}":`, error);
      // Keep original article if AI processing fails
      processed.push(article);
    }
  }
  
  return processed;
}

async function generateAISummary(article: NewsArticle, apiKey: string): Promise<string> {
  const prompt = `Summarize this news article in 2-3 sentences, focusing on the key facts and implications:

Title: ${article.title}
Content: ${article.content.substring(0, 1000)}...

Provide a concise, factual summary:`;

  try {
    // Try OpenAI first
    if (Deno.env.get('OPENAI_API_KEY')) {
      return await callOpenAI(prompt, apiKey);
    }
    
    // Try Anthropic
    if (Deno.env.get('ANTHROPIC_API_KEY')) {
      return await callAnthropic(prompt, apiKey);
    }
    
    // Try Google
    if (Deno.env.get('GOOGLE_API_KEY')) {
      return await callGoogle(prompt, apiKey);
    }
    
    // Fallback to basic summary
    return article.content.substring(0, 200) + '...';
  } catch (error) {
    console.warn('AI summarization failed:', error);
    return article.content.substring(0, 200) + '...';
  }
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  const data = await response.json();
  return data.content[0].text;
}

async function callGoogle(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    }),
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

function extractCategory(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('technology') || text.includes('tech') || text.includes('ai') || text.includes('software')) {
    return 'Technology';
  }
  if (text.includes('business') || text.includes('economy') || text.includes('finance') || text.includes('market')) {
    return 'Business';
  }
  if (text.includes('politics') || text.includes('government') || text.includes('election') || text.includes('policy')) {
    return 'Politics';
  }
  if (text.includes('health') || text.includes('medical') || text.includes('covid') || text.includes('disease')) {
    return 'Health';
  }
  if (text.includes('sports') || text.includes('game') || text.includes('team') || text.includes('player')) {
    return 'Sports';
  }
  if (text.includes('entertainment') || text.includes('movie') || text.includes('music') || text.includes('celebrity')) {
    return 'Entertainment';
  }
  
  return 'General';
}

function extractTags(title: string, content: string): string[] {
  const text = (title + ' ' + content).toLowerCase();
  const tags: string[] = [];
  
  // Common tags
  const commonTags = [
    'breaking', 'urgent', 'exclusive', 'analysis', 'opinion', 'investigation',
    'local', 'national', 'international', 'breaking-news', 'trending'
  ];
  
  for (const tag of commonTags) {
    if (text.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags;
}

function extractLocation(title: string, content: string): { city?: string; country?: string } {
  const text = (title + ' ' + content).toLowerCase();
  
  // Common cities and countries
  const cities = ['new york', 'london', 'paris', 'tokyo', 'berlin', 'moscow', 'beijing', 'delhi', 'mumbai', 'sydney'];
  const countries = ['usa', 'united states', 'uk', 'united kingdom', 'france', 'germany', 'japan', 'china', 'india', 'australia'];
  
  for (const city of cities) {
    if (text.includes(city)) {
      return { city: city.charAt(0).toUpperCase() + city.slice(1) };
    }
  }
  
  for (const country of countries) {
    if (text.includes(country)) {
      return { country: country.charAt(0).toUpperCase() + country.slice(1) };
    }
  }
  
  return {};
}

async function storeNewsArticles(supabase: ReturnType<typeof createClient>, articles: NewsArticle[]): Promise<number> {
  let storedCount = 0;
  
  for (const article of articles) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('news_cache')
        .select('id')
        .eq('url', article.url)
        .single();
      
      if (existing) {
        continue; // Skip if already exists
      }
      
      // Insert new article
      const { error } = await supabase
        .from('news_cache')
        .insert({
          article_id: createArticleHash(article),
          title: article.title,
          content: article.content,
          summary: article.summary,
          source: article.source,
          url: article.url,
          image_url: article.image_url,
          published_at: article.published_at,
          city: article.city,
          country: article.country,
          category: article.category,
          tags: article.tags,
          metadata: {
            processed_at: new Date().toISOString(),
            ai_generated: true
          }
        });
      
      if (error) {
        console.warn(`Error storing article "${article.title}":`, error);
      } else {
        storedCount++;
      }
    } catch (error) {
      console.warn(`Error processing article "${article.title}":`, error);
    }
  }
  
  return storedCount;
}
