import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'

interface User {
  id: string
  email: string
  name: string
  isAuthenticated: boolean
  profileCompleted: boolean
}

interface ProfileData {
  photo: string
  bio: string
  interests: string[]
  languages: string[]
  phoneNumber: string
  age: number
  location: string
  religion: string
  ageRangePreference: [number, number]
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; needsProfileCompletion?: boolean }>
  signOut: () => void
  deleteAccount: () => Promise<void>
  finalizeAccount: (email: string, name: string, profileData: ProfileData) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useKV<User | null>("current-user", null)
  const [registeredUsers, setRegisteredUsers] = useKV<Record<string, { email: string, password: string, name: string, profileCompleted?: boolean }>>("registered-users", {})

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Check if user exists in our mock database
    const userRecord = Object.values(registeredUsers || {}).find(u => u.email === email && u.password === password)
    
    if (userRecord) {
      const authenticatedUser: User = {
        id: email, // Using email as ID for simplicity
        email: userRecord.email,
        name: userRecord.name,
        isAuthenticated: true,
        profileCompleted: userRecord.profileCompleted || false
      }
      setUser(authenticatedUser)
      return true
    }
    return false
  }

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; needsProfileCompletion?: boolean }> => {
    // Check if user already exists
    if (Object.values(registeredUsers || {}).some(u => u.email === email)) {
      return { success: false }
    }

    // Add user to our mock database (profile not completed yet)
    setRegisteredUsers((prev) => ({
      ...(prev || {}),
      [email]: { email, password, name, profileCompleted: false }
    }))

    // Don't auto sign-in yet - user needs to complete profile
    return { success: true, needsProfileCompletion: true }
  }

  const signOut = () => {
    setUser(null)
  }

  const finalizeAccount = async (email: string, name: string, profileData: ProfileData): Promise<void> => {
    // Mark profile as completed in the database
    setRegisteredUsers((prev) => ({
      ...(prev || {}),
      [email]: { 
        ...(prev?.[email] || { email, password: "", name }), 
        profileCompleted: true 
      }
    }))

    // Save the complete profile data
    await window.spark.kv.set("user-profile", {
      name,
      age: profileData.age,
      location: profileData.location,
      bio: profileData.bio,
      interests: profileData.interests,
      photos: profileData.photo ? [profileData.photo] : [],
      religion: profileData.religion,
      languages: profileData.languages,
      profession: "Professional", // Default
      phoneNumber: profileData.phoneNumber
    })

    // Save user's discovery preferences based on their sign-up choices
    await window.spark.kv.set("user-discovery-preferences", {
      ageRange: profileData.ageRangePreference,
      location: profileData.location,
      interests: profileData.interests,
      religion: [profileData.religion]
    })

    // Now authenticate the user
    const authenticatedUser: User = {
      id: email,
      email,
      name,
      isAuthenticated: true,
      profileCompleted: true
    }
    setUser(authenticatedUser)
  }

  const deleteAccount = async () => {
    if (user) {
      // Remove user from registered users
      setRegisteredUsers((prev) => {
        if (!prev) return {}
        const updated = { ...prev }
        delete updated[user.email]
        return updated
      })
      
      // Clear user session
      setUser(null)
      
      // Clear all user data (profile, matches, etc.)
      // Note: In a real app, this would be handled by the backend
      await window.spark.kv.delete("user-profile")
      await window.spark.kv.delete("user-matches")
      await window.spark.kv.delete("user-messages")
    }
  }

  return (
    <AuthContext.Provider value={{
      user: user || null,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      finalizeAccount,
      isAuthenticated: !!(user?.isAuthenticated && user?.profileCompleted)
    }}>
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