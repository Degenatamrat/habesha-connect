import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'

interface User {
  id: string
  email: string
  name: string
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<boolean>
  signOut: () => void
  deleteAccount: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useKV<User | null>("current-user", null)
  const [registeredUsers, setRegisteredUsers] = useKV<Record<string, { email: string, password: string, name: string }>>("registered-users", {})

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Check if user exists in our mock database
    const userRecord = Object.values(registeredUsers || {}).find(u => u.email === email && u.password === password)
    
    if (userRecord) {
      const authenticatedUser: User = {
        id: email, // Using email as ID for simplicity
        email: userRecord.email,
        name: userRecord.name,
        isAuthenticated: true
      }
      setUser(authenticatedUser)
      return true
    }
    return false
  }

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    // Check if user already exists
    if (Object.values(registeredUsers || {}).some(u => u.email === email)) {
      return false
    }

    // Add user to our mock database
    setRegisteredUsers((prev) => ({
      ...(prev || {}),
      [email]: { email, password, name }
    }))

    // Auto sign-in after signup
    const newUser: User = {
      id: email,
      email,
      name,
      isAuthenticated: true
    }
    setUser(newUser)
    return true
  }

  const signOut = () => {
    setUser(null)
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
      isAuthenticated: !!(user?.isAuthenticated)
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