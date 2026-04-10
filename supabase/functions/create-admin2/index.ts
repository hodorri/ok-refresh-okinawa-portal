import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create admin user with employee ID based email
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: 'okhrd@okfg.internal',
    password: '인재개발1!',
    email_confirm: true,
    user_metadata: { display_name: '관리자 (인재개발팀)', employee_id: 'okhrd' }
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
