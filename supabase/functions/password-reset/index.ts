import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, token, newPassword } = await req.json();

    if (action === "request") {
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userError || !user.user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const { error: insertError } = await supabase
        .from("password_reset_tokens")
        .insert({
          user_id: user.user.id,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Failed to create reset token" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Password reset token created",
          token: token
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );

    } else if (action === "reset") {
      if (!token || !newPassword) {
        return new Response(
          JSON.stringify({ error: "Token and new password are required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const { data: resetToken, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        resetToken.user_id,
        { password: newPassword }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update password" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      await supabase
        .from("password_reset_tokens")
        .update({ used: true })
        .eq("id", resetToken.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Password updated successfully" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error("Password reset error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
