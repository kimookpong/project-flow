import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, Database } from '@/lib/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, fullName: string) => Promise<void>
    signOut: () => Promise<void>
    updateProfile: (data: ProfileUpdate) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const isDemoMode = !supabaseUrl || supabaseUrl === 'your-supabase-project-url'

    // Fetch user profile from database
    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                return null
            }

            return data
        } catch (err) {
            console.error('Error in fetchProfile:', err)
            return null
        }
    }

    useEffect(() => {
        // Init auth from local storage
        const checkAuth = async () => {
            // 1. Check Demo Mode
            if (isDemoMode) {
                console.warn('⚠️ Running in Demo Mode - Supabase not configured')
                const savedUser = localStorage.getItem('demo_user')
                if (savedUser) {
                    const demoUser = JSON.parse(savedUser)
                    setUser(demoUser as unknown as User)
                    setProfile({
                        id: demoUser.id,
                        email: demoUser.email || 'demo@example.com',
                        full_name: demoUser.user_metadata?.full_name || 'Demo User',
                        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
                        job_title: 'Developer',
                        bio: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    setSession({ user: demoUser } as unknown as Session)
                }
                setLoading(false)
                return
            }

            // 2. Check Custom Auth (LocalStorage)
            const storedUserId = localStorage.getItem('custom_auth_user_id')
            if (storedUserId) {
                const userProfile = await fetchProfile(storedUserId)
                if (userProfile) {
                    setProfile(userProfile)
                    // Mock a Supabase User object for compatibility
                    const mockUser = { id: userProfile.id, email: userProfile.email } as User
                    setUser(mockUser)
                    setSession({ user: mockUser } as unknown as Session)

                    // Update last login
                    await (supabase.from('profiles') as any)
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', userProfile.id)
                } else {
                    // Invalid session
                    localStorage.removeItem('custom_auth_user_id')
                }
            }
            setLoading(false)
        }

        checkAuth()
    }, [isDemoMode])

    const signIn = async (email: string, password: string) => {
        if (isDemoMode) {
            // Demo login
            const demoUser = {
                id: '1', // Must match ID in appStore DEMO_MEMBERS
                email,
                user_metadata: { full_name: 'สมชาย ใจดี' },
            }
            localStorage.setItem('demo_user', JSON.stringify(demoUser))
            setUser(demoUser as unknown as User)
            setProfile({
                id: demoUser.id,
                email: email,
                full_name: 'สมชาย ใจดี',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=somchai',
                job_title: 'Product Manager',
                bio: 'ดูแลภาพรวมของโปรเจกต์',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            setSession({ user: demoUser } as unknown as Session)
            return
        }

        // Custom Auth Login: Query Profiles Table directly
        // NOTE: In production, password should be hashed. 
        // For this implementation step, we assume the API handles comparison or we compare locally if possible.
        // Queries profiles where email matches
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !data) {
            throw new Error('Invalid login credentials')
        }

        const profile = data as Profile

        // Verify password (Simple check for now, should use bcrypt/hash comparison)
        // Ensure you have a 'password' column in profiles
        if (profile.password !== password) {
            throw new Error('Invalid login credentials')
        }

        // Login Success
        localStorage.setItem('custom_auth_user_id', profile.id)
        setProfile(profile)

        const mockUser = { id: profile.id, email: profile.email } as User
        setUser(mockUser)
        setSession({ user: mockUser } as unknown as Session)

        // Update last login
        await (supabase.from('profiles') as any)
            .update({ last_login: new Date().toISOString() })
            .eq('id', profile.id)
    }

    const signUp = async (email: string, password: string, fullName: string) => {
        // Disabled for Admin-only creation via TeamPage
        throw new Error('Public sign-up is disabled. Please contact an administrator.')
    }

    const signOut = async () => {
        localStorage.removeItem('demo_user')
        localStorage.removeItem('custom_auth_user_id')
        setUser(null)
        setProfile(null)
        setSession(null)
    }

    const updateProfile = async (data: ProfileUpdate) => {
        if (!user) throw new Error('No user logged in')

        if (isDemoMode) {
            setProfile(prev => prev ? { ...prev, ...(data as any) } : null)
            return
        }

        const { error } = await (supabase
            .from('profiles') as any)
            .update({
                full_name: data.full_name,
                job_title: data.job_title,
                bio: data.bio,
                avatar_url: data.avatar_url,
                email: data.email,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) throw error

        // Refresh profile
        const updatedProfile = await fetchProfile(user.id)
        setProfile(updatedProfile)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
