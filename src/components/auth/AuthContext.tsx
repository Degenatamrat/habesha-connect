import React, { createContext, useContext, ReactNode, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
  profileCompleted: boolean;
  isNewUser?: boolean;
}

interface ProfileData {
  photo: string;
  bio: string;
  interests: string[];
  languages: string[];
  phoneNumber: string;
  age: number;
  location: string;
  religion: string;
  ageRangePreference: [number, number];
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; needsProfileCompletion?: boolean }>;
  signOut: () => void;
  finalizeAccount: (
    email: string,
    name: string,
    profileData: ProfileData
  ) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Permanent Render backend URL (PostgreSQL live)
  const BASE_URL = "https://habesha-90nw.onrender.com";

  // ==== SIGN IN ====
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const authenticatedUser: User = {
          id: data.user.id?.toString() || email,
          email: data.user.email,
          name: data.user.name,
          isAuthenticated: true,
          profileCompleted: data.user.profileCompleted,
          isNewUser: false,
        };
        setUser(authenticatedUser);
        return true;
      } else {
        console.error("Login failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return false;
    }
  };

  // ==== SIGN UP ====
  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; needsProfileCompletion?: boolean }> => {
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, needsProfileCompletion: true };
      } else {
        console.error("Signup failed:", data.message);
        return { success: false };
      }
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false };
    }
  };

  const signOut = () => setUser(null);

  const finalizeAccount = async () => {
    console.log("Finalize profile — not yet connected to backend");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        finalizeAccount,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
