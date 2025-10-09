import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/types'

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, role:roles(*)')
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
