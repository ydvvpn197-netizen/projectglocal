import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface AISummaryRequest {
  article: NewsArticle;
  articleId: string;
}

interface AISummaryResponse {
  summary: string;
  keywords: string[];
  category: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { article, articleId }: AISummaryRequest = await req.json();
    
    if (!article || !articleId) {
      return new Response(
        JSON.stringify({ error: 'Article and articleId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if summary already exists in cache
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: cachedArticle } = await supabase
      .from('news_cache')
      .select('ai_summary')
      .eq('article_id', articleId)
      .single();

    if (cachedArticle?.ai_summary) {
      return new Response(
        JSON.stringify({ 
          summary: cachedArticle.ai_summary,
          cached: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate AI summary using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Please provide a concise 2-3 sentence summary of the following news article. Focus on the key facts and main points. Also extract 3-5 relevant keywords and suggest a category (politics, sports, technology, business, entertainment, health, science, world, local, etc.).

Title: ${article.title}
Description: ${article.description}
Content: ${article.content.substring(0, 2000)}...

Please respond in JSON format:
{
  "summary": "2-3 sentence summary here",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "category_name"
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise news summaries and extracts relevant information. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    let aiSummary: AISummaryResponse;
    try {
      aiSummary = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiSummary = {
        summary: aiResponse.substring(0, 200) + '...',
        keywords: extractKeywords(article.title + ' ' + article.description),
        category: 'general'
      };
    }

    // Update cache with AI summary
    await supabase
      .from('news_cache')
      .upsert({
        article_id: articleId,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        source_name: article.source,
        published_at: article.publishedAt,
        ai_summary: aiSummary.summary,
        category: aiSummary.category,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      });

    // Track this as an AI processing event
    await supabase
      .from('news_events')
      .insert({
        article_id: articleId,
        event_type: 'ai_processed',
        event_data: {
          summary_length: aiSummary.summary.length,
          keywords_count: aiSummary.keywords.length,
          category: aiSummary.category
        }
      });

    return new Response(
      JSON.stringify({
        summary: aiSummary.summary,
        keywords: aiSummary.keywords,
        category: aiSummary.category,
        cached: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        summary: 'Unable to generate AI summary at this time.',
        keywords: [],
        category: 'general'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to extract keywords when AI parsing fails
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'say', 'use', 'her', 'many', 'some', 'very', 'when', 'much', 'then', 'them', 'can', 'only', 'think', 'get', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'say', 'use', 'her', 'many', 'some', 'very', 'when', 'much', 'then', 'them', 'can', 'only', 'think', 'get', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even'].includes(word));
  
  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Return top 5 most frequent words
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}
