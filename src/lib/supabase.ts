import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const createClientSupabaseClient = () =>
  createClientComponentClient<Database>()

// Server-side Supabase client
export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies })

// Service role client (for admin operations)
export const createServiceSupabaseClient = () =>
  createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

// Public client (no auth required)
export const createPublicSupabaseClient = () =>
  createClient<Database>(supabaseUrl, supabaseAnonKey)

// Default export for client-side usage
export const supabase = createClientSupabaseClient()

// Auth helpers
export const getUser = async () => {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  const supabase = createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Database helpers
export const getUserProfile = async (userId: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const getChurch = async (churchId: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('churches')
    .select('*')
    .eq('id', churchId)
    .single()
  
  if (error) throw error
  return data
}

export const getChurchBySlug = async (slug: string) => {
  const supabase = createPublicSupabaseClient()
  const { data, error } = await supabase
    .from('churches')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

// Real-time subscriptions
export const subscribeToTable = <T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: any) => void,
  filter?: string
) => {
  const supabase = createClientSupabaseClient()
  
  let channel = supabase
    .channel(`realtime:${table}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table },
      callback
    )

  if (filter) {
    channel = channel.filter(filter)
  }

  return channel.subscribe()
}

// Error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST116') {
    return 'Resource not found'
  }
  
  if (error?.code === '23505') {
    return 'This record already exists'
  }
  
  if (error?.code === '42501') {
    return 'Access denied'
  }
  
  return error?.message || 'An unexpected error occurred'
}