import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Delete user account function called')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Add a simple test endpoint
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ message: 'Delete user account function is working' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    console.log('Supabase client created')

    // Get the user from the request
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    console.log('Auth check result:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      console.log('Unauthorized access attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = user.id
    console.log('User ID:', userId)

    // Start a transaction to delete all user data
    console.log('Calling delete_user_account RPC function')
    const { error: deleteError } = await supabaseClient.rpc('delete_user_account', {
      user_uuid: userId
    })

    console.log('RPC call result:', { error: deleteError })

    if (deleteError) {
      console.error('Error deleting user account:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete account data', details: deleteError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Database cleanup completed, now deleting auth user')

    // Create admin client to delete the auth user
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Admin client created')

    // Delete the user from Supabase Auth using admin privileges
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    
    console.log('Auth deletion result:', { error: authDeleteError })
    
    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user from authentication', details: authDeleteError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Account deletion completed successfully')

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
