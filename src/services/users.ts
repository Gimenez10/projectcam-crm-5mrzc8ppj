import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/types'

type UserWithEmailAndRole = Profile & { email?: string; role_name?: string }
type AdminCreateUserCredentials = {
  fullName: string
  email: string
  password: string
  roleId: string
}

export const getUsersWithEmail = async (): Promise<UserWithEmailAndRole[]> => {
  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Error listing auth users:', authError)
    return []
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*, role:roles(name)')
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return []
  }

  return profiles.map((profile) => ({
    ...profile,
    email: authUsers.users.find((u) => u.id === profile.id)?.email,
    role_name: (profile.role as any)?.name,
  }))
}

export const inviteUser = async (credentials: AdminCreateUserCredentials) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: credentials.email,
    password: credentials.password,
    email_confirm: true,
    user_metadata: {
      full_name: credentials.fullName,
    },
  })

  if (error) return { data: null, error }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role_id: credentials.roleId,
        full_name: credentials.fullName,
      })
      .eq('id', data.user.id)

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id)
      return { data: null, error: profileError }
    }
  }

  return { data, error: null }
}

export const updateUserProfile = async (
  userId: string,
  updates: { full_name?: string; avatar_url?: string; role_id?: string },
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.auth.admin.deleteUser(userId)
  return { data, error }
}
