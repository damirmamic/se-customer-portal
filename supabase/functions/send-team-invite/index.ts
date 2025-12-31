import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  name?: string;
  role: "customer" | "operations_engineer" | "admin";
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the inviter
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, name, role }: InviteRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating invitation for ${email} with role ${role} by user ${user.id}`);

    // Create invitation record
    const { data: invitation, error: insertError } = await supabase
      .from("team_invitations")
      .insert({
        email,
        name: name || null,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create invitation:", insertError);
      
      // Check if it's a duplicate
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "An invitation for this email is already pending" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Invitation created with ID: ${invitation.id}`);

    // Get inviter's name for the email
    const inviterName = user.user_metadata?.full_name || user.email?.split("@")[0] || "A team member";

    // Send invitation email
    const roleLabels: Record<string, string> = {
      customer: "Customer",
      operations_engineer: "Operations Engineer",
      admin: "Administrator",
    };

    const appUrl = req.headers.get("origin") || "https://cloudops.app";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #18181b; font-size: 24px; margin: 0 0 24px 0;">You're Invited to CloudOps Portal</h1>
          
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi${name ? ` ${name}` : ""},
          </p>
          
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            <strong>${inviterName}</strong> has invited you to join the CloudOps Portal team as a <strong>${roleLabels[role]}</strong>.
          </p>
          
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            To accept this invitation, please sign in to the portal using your Microsoft account:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/auth" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
              Sign In to Accept
            </a>
          </div>
          
          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
            This invitation will expire in 7 days. If you have any questions, please contact your team administrator.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">
          
          <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
            CloudOps Portal - Enterprise Cloud Operations Management
          </p>
        </div>
      </body>
      </html>
    `;

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "CloudOps Portal <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} invited you to join CloudOps Portal`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      // Still return success since invitation was created
      return new Response(
        JSON.stringify({ 
          invitation,
          warning: "Invitation created but email delivery failed" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ invitation, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-team-invite function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
