import { supabase } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/types'

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from('profiles').select('*')

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data as Profile[]
}

export const updateProfileRole = async (
  userId: string,
  role: UserRole,
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile role:', error)
  }

  return { error }
}
