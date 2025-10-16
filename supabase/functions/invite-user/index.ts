import { corsHeaders } from './cors.ts'
import { getSupabaseAdmin } from './admin-client.ts'
import { verifyAdmin } from './auth-middleware.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    await verifyAdmin(req)
    const supabase = getSupabaseAdmin()
    const { email, password, fullName, roleId } = await req.json()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role_id: roleId, full_name: fullName })
        .eq('id', data.user.id)

      if (profileError) {
        await supabase.auth.admin.deleteUser(data.user.id)
        throw profileError
      }
    }

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
