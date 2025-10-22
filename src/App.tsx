import { useState, useEffect } from "react"
import Layout from "@/components/layout/Layout"
import DiscoverPage from "@/components/discover/DiscoverPage"
import MatchesPage from "@/components/matches/MatchesPage"
import MessagesPage from "@/components/messages/MessagesPage"
import ProfilePage from "@/components/profile/ProfilePage"
import AdminAuth from "@/components/auth/AdminAuth"
import AuthScreen from "@/components/auth/AuthScreen"
import WelcomeScreen from "@/components/onboarding/WelcomeScreen"
import TinderFlow from "@/components/onboarding/TinderFlow" // ✅ replaced old ProfileCompletion
import { AuthProvider, useAuth } from "@/components/auth/AuthContext"
import { useKV } from "@github/spark/hooks"
import { Toaster } from "@/components/ui/sonner"

function AppContent() {
  const { isAuthenticated, user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("discover")
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | undefined>()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useKV<boolean>(`has-seen-welcome-${user?.id || 'guest'}`, false)

  useEffect(() => {
    // Check if current path is /admin
    const path = window.location.pathname
    if (path === '/admin') {
      setIsAdminMode(true)
    }
  }, [])

  const handleGetStarted = () => {
    setHasSeenWelcome(true)
    updateUser({ isNewUser: false })
  }

  const handleStartChat = (matchId: string) => {
    setActiveChatMatchId(matchId)
    setActiveTab("messages")
  }

  const handleBackToMatches = () => {
    setActiveChatMatchId(undefined)
    setActiveTab("matches")
  }

  // ✅ Admin mode — no layout
  if (isAdminMode) return <AdminAuth />

  // ✅ If not authenticated → show Auth screen
  if (!isAuthenticated) return <AuthScreen />

  // ✅ If new user → show TinderFlow (OTP + profile steps)
  if (user && user.isAuthenticated && !user.profileCompleted) {
    return (
      <TinderFlow
        onComplete={() => {
          updateUser({ profileCompleted: true })
        }}
      />
    )
  }

  // ✅ Show welcome screen for new users after onboarding
  if (user?.isNewUser && !hasSeenWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

  // ✅ Main content tabs
  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return <DiscoverPage />
      case "matches":
        return <MatchesPage onStartChat={handleStartChat} />
      case "messages":
        return (
          <MessagesPage
            activeMatchId={activeChatMatchId}
            onBackToMatches={handleBackToMatches}
            onStartChat={handleStartChat}
          />
        )
      case "profile":
        return <ProfilePage />
      default:
        return <DiscoverPage />
    }
  }

  return (
    <Layout currentTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-center" />
    </AuthProvider>
  )
}

export default App
