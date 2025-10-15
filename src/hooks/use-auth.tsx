import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { getProfile } from '@/services/profiles'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  signUp: (credentials: any) => Promise<{ error: any }>
  signIn: (credentials: any) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const userProfile = await getProfile(currentUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const userProfile = await getProfile(currentUser.id)
        setProfile(userProfile)
      }
      setLoading(false)
    }

    initializeSession()

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (credentials: any) => {
    const { email, password, fullName } = credentials
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signIn = async (credentials: any) => {
    const { email, password } = credentials
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
