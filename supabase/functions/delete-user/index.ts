import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/admin-client.ts'
import { verifyAdmin } from '../_shared/auth-middleware.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    await verifyAdmin(req)
    const { userId } = await req.json()
    if (!userId) throw new Error('User ID is required.')

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.admin.deleteUser(userId)

    if (error) throw error

    return new Response(JSON.stringify({ data }), {
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
