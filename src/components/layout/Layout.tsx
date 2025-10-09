import { ReactNode } from "react"
import { Heart, ChatCircle, Users, User } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface LayoutProps {
  children: ReactNode
  currentTab?: string
  onTabChange?: (tab: string) => void
}

const navigationItems = [
  { id: "discover", label: "Discover", icon: Heart },
  { id: "matches", label: "Matches", icon: Users },
  { id: "messages", label: "Messages", icon: ChatCircle },
  { id: "profile", label: "Profile", icon: User },
]

export default function Layout({ children, currentTab = "discover", onTabChange }: LayoutProps) {
  const isMobile = useIsMobile()

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId)
  }

  if (isMobile) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" weight="fill" />
              </div>
              <span className="text-lg font-bold text-foreground">Habesha</span>
            </div>
          </div>
        </header>

        {/* Main Content - Full height with proper scroll */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>

        {/* Bottom Navigation - Native app style */}
        <nav className="bg-card/95 backdrop-blur-sm border-t border-border/50 px-2 py-1 flex-shrink-0 safe-area-inset-bottom">
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 h-auto py-2 px-2 rounded-lg transition-colors",
                    "hover:bg-transparent active:scale-95 transition-transform duration-100",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-200",
                      isActive && "scale-110"
                    )} 
                    weight={isActive ? "fill" : "regular"} 
                  />
                  <span className={cn(
                    "text-xs font-medium transition-all duration-200",
                    isActive && "scale-105"
                  )}>
                    {item.label}
                  </span>
                </Button>
              )
            })}
          </div>
        </nav>
      </div>
    )
  }

  // Desktop Layout - Improved responsive design
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" weight="fill" />
            </div>
            <span className="text-xl font-bold text-foreground">Habesha</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className="gap-2"
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className="w-4 h-4" weight={isActive ? "fill" : "regular"} />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Mobile nav for tablets */}
          <nav className="md:hidden flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className="w-5 h-5" weight={isActive ? "fill" : "regular"} />
                </Button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Desktop Main Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {children}
      </main>
    </div>
  )
}