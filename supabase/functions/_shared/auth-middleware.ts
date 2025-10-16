import { getSupabaseAdmin } from './admin-client.ts'

export const verifyAdmin = async (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseAdmin()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new Error('Authentication failed')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role:roles(name)')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found')
  }

  if ((profile.role as any)?.name !== 'admin') {
    throw new Error('User is not an admin')
  }

  return user
}
