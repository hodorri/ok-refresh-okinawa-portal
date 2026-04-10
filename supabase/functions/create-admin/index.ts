import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create admin user
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: 'okhrd@okfinancialgroup.com',
    password: '인재개발1!',
    email_confirm: true,
    user_metadata: { display_name: '관리자 (인재개발팀)' }
  })

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 })
  }

  // Assign admin role
  const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
    user_id: user.user.id,
    role: 'admin'
  })

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true, userId: user.user.id }), { status: 200 })
})
