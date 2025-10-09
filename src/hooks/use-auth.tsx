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
import {
  signInWithPassword,
  signUp,
  signOut as authSignOut,
} from '@/services/auth'
import { SignInCredentials, SignUpCredentials } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  signIn: (credentials: SignInCredentials) => Promise<{ error: any }>
  signUp: (credentials: SignUpCredentials) => Promise<{ error: any }>
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

    // Initial session check
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session)
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const userProfile = await getProfile(currentUser.id)
          setProfile(userProfile)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    profile,
    signIn: signInWithPassword,
    signUp,
    signOut: authSignOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
