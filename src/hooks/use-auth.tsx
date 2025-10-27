import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { getProfile } from '@/services/profiles'
import { Profile, SignInCredentials, SignUpCredentials } from '@/types'
import {
  signInWithPassword,
  signUp as signUpService,
  signOut as signOutService,
} from '@/services/auth'

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (credentials: SignInCredentials) => Promise<{ error: any }>
  signUp: (credentials: SignUpCredentials) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Asynchronous operation is handled with .then() to keep the handler synchronous
        getProfile(currentUser.id).then((userProfile) => {
          setProfile(userProfile)
          setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (credentials: SignInCredentials) => {
    const { error } = await signInWithPassword(credentials)
    return { error }
  }

  const signUp = async (credentials: SignUpCredentials) => {
    const { error } = await signUpService(credentials)
    return { error }
  }

  const signOut = async () => {
    await signOutService()
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
