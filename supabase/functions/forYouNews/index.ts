// Supabase Edge Function for personalized news feed
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserPreferences {
  preferredCities: string[];
  preferredSources: string[];
  preferredKeywords: string[];
  preferredCategories: string[];
}

// Extract user preferences from news events
function extractUserPreferences(events: any[]): UserPreferences {
  const preferences: UserPreferences = {
    preferredCities: [],
    preferredSources: [],
    preferredKeywords: [],
    preferredCategories: []
  }

  // Count occurrences of different preferences
  const cityCounts = new Map<string, number>()
  const sourceCounts = new Map<string, number>()
  const keywordCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()

  events.forEach(event => {
    if (event.event_type === 'like' || event.event_type === 'comment' || event.event_type === 'share') {
      // This would need to be joined with news_cache to get article details
      // For now, we'll use a simplified approach
    }
  })

  // Get top preferences (simplified logic)
  return preferences
}

// Calculate personalization score
function calculatePersonalizationScore(
  article: any,
  preferences: UserPreferences,
  trendingScore: number
): number {
  let score = trendingScore
  const reasons: string[] = []

  // City preference boost
  if (preferences.preferredCities.includes(article.city)) {
    score *= 1.3
    reasons.push('From your preferred city')
  }

  // Source preference boost
  if (preferences.preferredSources.includes(article.source_name)) {
    score *= 1.2
    reasons.push('From your preferred source')
  }

  // Category preference boost
  if (preferences.preferredCategories.includes(article.category)) {
    score *= 1.15
    reasons.push('In your preferred category')
  }

  // Keyword preference boost (simplified)
  const articleText = `${article.title} ${article.description} ${article.ai_summary}`.toLowerCase()
  const matchingKeywords = preferences.preferredKeywords.filter(keyword => 
    articleText.includes(keyword.toLowerCase())
  )
  
  if (matchingKeywords.length > 0) {
    score *= (1 + matchingKeywords.length * 0.1)
    reasons.push(`Contains your interests: ${matchingKeywords.join(', ')}`)
  }

  return score
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

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

    // Get user's news events from last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: events, error: eventsError } = await supabaseClient
      .from('news_events')
      .select(`
        *,
        news_cache!inner(city, source_name, category, title, description, ai_summary)
      `)
      .eq('user_id', user.id)
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: false })

    if (eventsError) {
      throw eventsError
    }

    // Extract user preferences
    const preferences = extractUserPreferences(events)

    // Get trending articles first
    const { data: articles, error: articlesError } = await supabaseClient
      .from('news_cache')
      .select(`
        *,
        news_likes(count),
        news_comments(count),
        news_shares(count),
        news_polls(count)
      `)
      .eq('city', city)
      .eq('country', country)
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })

    if (articlesError) {
      throw articlesError
    }

    // Calculate personalization scores
    const articlesWithScores = articles.map(article => {
      const likesCount = article.news_likes?.[0]?.count || 0
      const commentsCount = article.news_comments?.[0]?.count || 0
      const sharesCount = article.news_shares?.[0]?.count || 0
      const pollsCount = article.news_polls?.[0]?.count || 0

      // Calculate base trending score
      const hoursSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60)
      const timeDecay = Math.exp(-0.08 * hoursSincePublished)
      const baseTrendingScore = (likesCount + (2 * commentsCount) + (1.5 * sharesCount) + pollsCount) * timeDecay

      // Calculate personalization score
      const personalizationScore = calculatePersonalizationScore(article, preferences, baseTrendingScore)

      return {
        ...article,
        personalization_score: personalizationScore,
        trending_score: baseTrendingScore,
        likes_count: likesCount,
        comments_count: commentsCount,
        shares_count: sharesCount,
        polls_count: pollsCount
      }
    })

    // Sort by personalization score
    articlesWithScores.sort((a, b) => b.personalization_score - a.personalization_score)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articlesWithScores.slice(startIndex, endIndex)

    return new Response(
      JSON.stringify({
        articles: paginatedArticles,
        total: articlesWithScores.length,
        page,
        has_more: endIndex < articlesWithScores.length,
        preferences: preferences
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in forYouNews function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
