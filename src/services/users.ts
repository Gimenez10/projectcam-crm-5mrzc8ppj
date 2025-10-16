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
  const { data, error } = await supabase.functions.invoke('list-users')
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data
}

export const inviteUser = async (credentials: AdminCreateUserCredentials) => {
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: credentials,
  })
  return { data, error }
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
  const { data, error } = await supabase.functions.invoke('delete-user', {
    body: { userId },
  })
  return { data, error }
}
