// Supabase Edge Function for calculating trending news
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrendingScore {
  baseScore: number;
  timeDecay: number;
  localityBoost: number;
  finalScore: number;
}

// Calculate trending score
function calculateTrendingScore(
  likesCount: number,
  commentsCount: number,
  sharesCount: number,
  pollsCount: number,
  publishedAt: string,
  userCity?: string,
  userCountry?: string,
  articleCity?: string,
  articleCountry?: string
): TrendingScore {
  // Base engagement score
  const baseScore = likesCount + (2 * commentsCount) + (1.5 * sharesCount) + pollsCount

  // Time decay factor (λ ≈ 0.08)
  const hoursSincePublished = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60)
  const timeDecay = Math.exp(-0.08 * hoursSincePublished)

  // Locality boost
  let localityBoost = 1.0
  if (userCity && articleCity && userCity.toLowerCase() === articleCity.toLowerCase()) {
    localityBoost = 1.2 // +20% for same city
  } else if (userCountry && articleCountry && userCountry.toLowerCase() === articleCountry.toLowerCase()) {
    localityBoost = 1.1 // +10% for same country
  }

  const finalScore = baseScore * timeDecay * localityBoost

  return {
    baseScore,
    timeDecay,
    localityBoost,
    finalScore
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

    // Get articles with engagement data
    const { data: articles, error: articlesError } = await supabaseClient
      .from('news_cache')
      .select(`
        *,
        news_likes(count),
        news_article_comments(count),
        news_shares(count),
        news_poll_votes(count)
      `)
      .eq('location_name', city)
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })

    if (articlesError) {
      throw articlesError
    }

    // Calculate trending scores
    const articlesWithScores = articles.map(article => {
      const likesCount = article.news_likes?.[0]?.count || 0
      const commentsCount = article.news_article_comments?.[0]?.count || 0
      const sharesCount = article.news_shares?.[0]?.count || 0
      const pollsCount = article.news_poll_votes?.[0]?.count || 0

      const trendingScore = calculateTrendingScore(
        likesCount,
        commentsCount,
        sharesCount,
        pollsCount,
        article.published_at,
        city,
        country,
        article.location_name,
        article.location_name // Using location_name for both city and country comparison
      )

      return {
        ...article,
        trending_score: trendingScore.finalScore,
        likes_count: likesCount,
        comments_count: commentsCount,
        shares_count: sharesCount,
        polls_count: pollsCount
      }
    })

    // Sort by trending score
    articlesWithScores.sort((a, b) => b.trending_score - a.trending_score)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articlesWithScores.slice(startIndex, endIndex)

    return new Response(
      JSON.stringify({
        articles: paginatedArticles,
        total: articlesWithScores.length,
        page,
        has_more: endIndex < articlesWithScores.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in trendingNews function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
