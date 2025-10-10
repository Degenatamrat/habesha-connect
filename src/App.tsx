import { useState, useEffect } from "react"
import Layout from "@/components/layout/Layout"
import DiscoverPage from "@/components/discover/DiscoverPage"
import MatchesPage from "@/components/matches/MatchesPage"
import MessagesPage from "@/components/messages/MessagesPage"
import ProfilePage from "@/components/profile/ProfilePage"
import AdminAuth from "@/components/auth/AdminAuth"
import AuthScreen from "@/components/auth/AuthScreen"
import WelcomeScreen from "@/components/onboarding/WelcomeScreen"
import { AuthProvider, useAuth } from "@/components/auth/AuthContext"
import { useKV } from "@github/spark/hooks"
import { Toaster } from "@/components/ui/sonner"

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("discover")
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | undefined>()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useKV<boolean>("has-seen-welcome", false)

  useEffect(() => {
    // Check if the current path is /admin
    const path = window.location.pathname
    if (path === '/admin') {
      setIsAdminMode(true)
    }
  }, [])

  const handleGetStarted = () => {
    setHasSeenWelcome(true)
  }

  const handleStartChat = (matchId: string) => {
    setActiveChatMatchId(matchId)
    setActiveTab("messages")
  }

  const handleBackToMatches = () => {
    setActiveChatMatchId(undefined)
    setActiveTab("matches")
  }

  // Admin mode - no layout wrapper
  if (isAdminMode) {
    return <AdminAuth />
  }

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    return <AuthScreen />
  }

  // Show welcome screen for new users
  if (!hasSeenWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

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

