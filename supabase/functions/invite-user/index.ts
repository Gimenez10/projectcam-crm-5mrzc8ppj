import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/admin-client.ts'
import { verifyAdmin } from '../_shared/auth-middleware.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Invite user function invoked.')
    await verifyAdmin(req)
    console.log('Admin verified.')
    const supabase = getSupabaseAdmin()
    const { email, password, fullName, roleId } = await req.json()
    console.log(`Attempting to create user: ${email}`)

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (error) {
      console.error('Error creating auth user:', error.message)
      throw error
    }
    console.log(`Auth user created: ${data.user.id}`)

    if (data.user) {
      console.log(`Updating profile for user: ${data.user.id}`)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role_id: roleId, full_name: fullName })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError.message)
        console.log(`Attempting to delete auth user: ${data.user.id}`)
        await supabase.auth.admin.deleteUser(data.user.id)
        throw profileError
      }
      console.log(`Profile updated successfully for user: ${data.user.id}`)
    }

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in invite-user function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
