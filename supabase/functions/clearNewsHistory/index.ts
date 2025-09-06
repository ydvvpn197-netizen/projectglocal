import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClearHistoryRequest {
  clearType: 'all' | 'interactions' | 'preferences' | 'events';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { clearType = 'all' }: ClearHistoryRequest = await req.json();

    let deletedCounts = {
      likes: 0,
      shares: 0,
      events: 0,
      preferences: 0,
      pollVotes: 0,
      comments: 0
    };

    // Clear based on type
    switch (clearType) {
      case 'all': {
        // Clear all user interactions and preferences
        const { data: deletedLikes } = await supabase
          .from('news_likes')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedShares } = await supabase
          .from('news_shares')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedEvents } = await supabase
          .from('news_events')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedPollVotes } = await supabase
          .from('news_poll_votes')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedComments } = await supabase
          .from('news_article_comments')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedPreferences } = await supabase
          .from('user_news_preferences')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        deletedCounts = {
          likes: deletedLikes?.length || 0,
          shares: deletedShares?.length || 0,
          events: deletedEvents?.length || 0,
          preferences: deletedPreferences?.length || 0,
          pollVotes: deletedPollVotes?.length || 0,
          comments: deletedComments?.length || 0
        };
        break;
      }

      case 'interactions': {
        // Clear only interaction data (likes, shares, poll votes, comments)
        const { data: deletedLikesInt } = await supabase
          .from('news_likes')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedSharesInt } = await supabase
          .from('news_shares')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedPollVotesInt } = await supabase
          .from('news_poll_votes')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        const { data: deletedCommentsInt } = await supabase
          .from('news_article_comments')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        deletedCounts = {
          likes: deletedLikesInt?.length || 0,
          shares: deletedSharesInt?.length || 0,
          events: 0,
          preferences: 0,
          pollVotes: deletedPollVotesInt?.length || 0,
          comments: deletedCommentsInt?.length || 0
        };
        break;
      }

      case 'preferences': {
        // Clear only user preferences
        const { data: deletedPrefs } = await supabase
          .from('user_news_preferences')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        deletedCounts.preferences = deletedPrefs?.length || 0;
        break;
      }

      case 'events': {
        // Clear only event tracking data
        const { data: deletedEventsOnly } = await supabase
          .from('news_events')
          .delete()
          .eq('user_id', user.id)
          .select('id');

        deletedCounts.events = deletedEventsOnly?.length || 0;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid clearType. Must be: all, interactions, preferences, or events' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    // Log the clearing action as an event
    await supabase
      .from('news_events')
      .insert({
        user_id: user.id,
        event_type: 'clear_history',
        event_data: {
          clear_type: clearType,
          deleted_counts: deletedCounts,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully cleared ${clearType} news history`,
        deleted_counts: deletedCounts,
        cleared_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error clearing news history:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to clear news history',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});