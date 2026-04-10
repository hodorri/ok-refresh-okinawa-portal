import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    "6d3cc7d6-e5b7-439d-9077-0c8c4ec44670",
    { password: "인재개발1!" }
  );

  return new Response(JSON.stringify({ success: !error, error: error?.message }), {
    headers: { "Content-Type": "application/json" },
  });
});
