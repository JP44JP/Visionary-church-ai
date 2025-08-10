'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient, type Session, type User as SupabaseUser } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserClient>
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session?.user) {
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userProfile) {
          setUser(userProfile)
        }
      }
      
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userProfile) {
          setUser(userProfile)
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setLoading(false)
    router.push('/')
  }

  return (
    <Context.Provider
      value={{
        supabase,
        session,
        user,
        loading,
        signOut,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}