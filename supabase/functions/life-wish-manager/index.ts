import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LifeWishRequest {
  action: 'create' | 'update' | 'delete' | 'get' | 'share';
  wishId?: string;
  wishData?: {
    title: string;
    content: string;
    visibility: 'private' | 'public' | 'family';
    is_encrypted?: boolean;
  };
  shareData?: {
    shared_with?: string;
    shared_email?: string;
    share_type: 'user' | 'email';
    permissions: Record<string, unknown>;
  };
}

interface LifeWish {
  id: string;
  user_id: string;
  title: string;
  content: string;
  encrypted_content?: string;
  visibility: 'private' | 'public' | 'family';
  is_encrypted: boolean;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

interface LifeWishResponse {
  success: boolean;
  wish?: LifeWish;
  wishes?: LifeWish[];
  error?: string;
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

    const { action, wishId, wishData, shareData }: LifeWishRequest = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let result: LifeWishResponse = { success: false };

    switch (action) {
      case 'create': {
        if (!wishData) {
          return new Response(
            JSON.stringify({ error: 'Wish data is required for create action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: newWish, error: createError } = await supabase
          .from('life_wishes')
          .insert({
            user_id: user.id,
            title: wishData.title,
            content: wishData.is_encrypted ? '' : wishData.content,
            encrypted_content: wishData.is_encrypted ? encryptText(wishData.content) : null,
            visibility: wishData.visibility,
            is_encrypted: wishData.is_encrypted || false,
            metadata: {
              created_at: new Date().toISOString(),
              encryption_method: wishData.is_encrypted ? 'base64' : 'none'
            }
          })
          .select()
          .single();

        if (createError) throw createError;

        result = {
          success: true,
          wish: {
            ...newWish,
            content: wishData.is_encrypted ? wishData.content : newWish.content
          }
        };
        break;
      }

      case 'update': {
        if (!wishId || !wishData) {
          return new Response(
            JSON.stringify({ error: 'Wish ID and data are required for update action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const updateData: {
          title: string;
          visibility: 'private' | 'public' | 'family';
          is_encrypted: boolean;
          updated_at: string;
          content?: string;
          encrypted_content?: string | null;
        } = {
          title: wishData.title,
          visibility: wishData.visibility,
          is_encrypted: wishData.is_encrypted || false,
          updated_at: new Date().toISOString()
        };

        if (wishData.is_encrypted) {
          updateData.content = '';
          updateData.encrypted_content = encryptText(wishData.content);
        } else {
          updateData.content = wishData.content;
          updateData.encrypted_content = null;
        }

        const { data: updatedWish, error: updateError } = await supabase
          .from('life_wishes')
          .update(updateData)
          .eq('id', wishId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        result = {
          success: true,
          wish: {
            ...updatedWish,
            content: wishData.is_encrypted ? wishData.content : updatedWish.content
          }
        };
        break;
      }

      case 'delete': {
        if (!wishId) {
          return new Response(
            JSON.stringify({ error: 'Wish ID is required for delete action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { error: deleteError } = await supabase
          .from('life_wishes')
          .delete()
          .eq('id', wishId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        result = { success: true };
        break;
      }

      case 'get': {
        if (wishId) {
          // Get specific wish
          const { data: wish, error: getError } = await supabase
            .from('life_wishes')
            .select(`
              *,
              profiles!life_wishes_user_id_fkey(display_name, avatar_url)
            `)
            .eq('id', wishId)
            .single();

          if (getError) throw getError;

          // Decrypt content if encrypted
          if (wish.is_encrypted && wish.encrypted_content) {
            wish.content = decryptText(wish.encrypted_content);
          }

          result = {
            success: true,
            wish
          };
        } else {
          // Get all user's wishes
          const { data: wishes, error: getError } = await supabase
            .from('life_wishes')
            .select(`
              *,
              profiles!life_wishes_user_id_fkey(display_name, avatar_url)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (getError) throw getError;

          // Decrypt content for encrypted wishes
          const decryptedWishes = wishes.map(wish => {
            if (wish.is_encrypted && wish.encrypted_content) {
              wish.content = decryptText(wish.encrypted_content);
            }
            return wish;
          });

          result = {
            success: true,
            wishes: decryptedWishes
          };
        }
        break;
      }

      case 'share': {
        if (!wishId || !shareData) {
          return new Response(
            JSON.stringify({ error: 'Wish ID and share data are required for share action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: share, error: shareError } = await supabase
          .from('life_wish_shares')
          .insert({
            wish_id: wishId,
            shared_by: user.id,
            shared_with: shareData.shared_with,
            shared_email: shareData.shared_email,
            share_type: shareData.share_type,
            permissions: shareData.permissions,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          })
          .select()
          .single();

        if (shareError) throw shareError;

        result = {
          success: true,
          wish: { share }
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in life wish manager:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Simple encryption/decryption functions (replace with proper encryption in production)
function encryptText(text: string): string {
  return btoa(text);
}

function decryptText(encryptedText: string): string {
  return atob(encryptedText);
}
