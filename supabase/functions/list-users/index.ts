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

    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers()
    if (authError) throw authError

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*, role:roles(name)')
    if (profilesError) throw profilesError

    const combinedUsers = profiles.map((profile) => ({
      ...profile,
      email: authUsers.users.find((u) => u.id === profile.id)?.email,
      role_name: (profile.role as any)?.name,
    }))

    return new Response(JSON.stringify(combinedUsers), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    })
  }
})
