"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  name: string
  avatar?: string
  admin?: boolean
}

interface UserProfileContextType {
  userProfile: UserProfile | null
  refreshUserProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const refreshUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const response = await fetch(`/api/user/${session.user.id}`)
        if (response.ok) {
          const userData = await response.json()
          setUserProfile({
            name: userData.userProfile?.name || 'Usuario',
            avatar: userData.userProfile?.avatar,
            admin: userData.userProfile?.admin || false,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    refreshUserProfile()
  }, [])

  return (
    <UserProfileContext.Provider value={{ userProfile, refreshUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}
