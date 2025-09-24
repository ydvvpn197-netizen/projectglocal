// Supabase Edge Function for fetching news from GNews API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  articles: GNewsArticle[];
  totalArticles: number;
}

// Generate SHA-256 hash for article ID
async function generateArticleId(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate AI summary using OpenAI
async function generateAISummary(content: string, openaiApiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, engaging summaries of news articles in 2-3 sentences.'
          },
          {
            role: 'user',
            content: `Please summarize this news article in 2-3 sentences: ${content}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || content.substring(0, 200) + '...';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return content.substring(0, 200) + '...';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get request parameters
    const { city, country, page = 1, limit = 20 } = await req.json()

    if (!city || !country) {
      return new Response(
        JSON.stringify({ error: 'City and country are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check cache first
    const { data: cachedArticles, error: cacheError } = await supabaseClient
      .from('news_cache')
      .select('*')
      .eq('location_name', city)
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (cachedArticles && cachedArticles.length > 0) {
      return new Response(
        JSON.stringify({
          articles: cachedArticles,
          total: cachedArticles.length,
          page,
          has_more: cachedArticles.length === limit,
          cached: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch from GNews API
    const gnewsApiKey = Deno.env.get('GNEWS_API_KEY')
    if (!gnewsApiKey) {
      return new Response(
        JSON.stringify({ error: 'GNews API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const query = `${city} ${country}`
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=${country.toLowerCase()}&max=${limit}&page=${page}&apikey=${gnewsApiKey}`

    const gnewsResponse = await fetch(gnewsUrl)
    if (!gnewsResponse.ok) {
      throw new Error(`GNews API error: ${gnewsResponse.status}`)
    }

    const gnewsData: GNewsResponse = await gnewsResponse.json()

    // Process and cache articles
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const processedArticles = []

    for (const article of gnewsData.articles) {
      try {
        const articleId = await generateArticleId(article.url)
        
        // Generate AI summary
        const aiSummary = openaiApiKey 
          ? await generateAISummary(article.content, openaiApiKey)
          : article.content.substring(0, 200) + '...'

        // Prepare article data
        const articleData = {
          article_id: articleId,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.image,
          source_name: article.source.name,
          published_at: article.publishedAt,
          location_name: city,
          ai_summary: aiSummary,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        }

        // Insert or update in cache
        const { data: cachedArticle, error: upsertError } = await supabaseClient
          .from('news_cache')
          .upsert(articleData, { onConflict: 'article_id' })
          .select()
          .single()

        if (upsertError) {
          console.error('Error caching article:', upsertError)
          continue
        }

        processedArticles.push(cachedArticle)
      } catch (error) {
        console.error('Error processing article:', error)
        continue
      }
    }

    return new Response(
      JSON.stringify({
        articles: processedArticles,
        total: processedArticles.length,
        page,
        has_more: processedArticles.length === limit,
        cached: false
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in fetchNews function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
