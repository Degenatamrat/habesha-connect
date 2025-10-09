import { ReactNode, useState } from "react"
import { Heart, ChatCircle, Users, Gear, User, List, X } from "@phosphor-icons/react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId)
    setMobileMenuOpen(false)
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" weight="fill" />
            </div>
            <span className="text-xl font-bold text-foreground">Habesha</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
          </Button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="bg-card border-b border-border p-4">
            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentTab === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => handleTabClick(item.id)}
                  >
                    <Icon className="w-5 h-5 mr-3" weight={isActive ? "fill" : "regular"} />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-card border-t border-border p-2">
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 h-auto py-2",
                    isActive && "text-primary"
                  )}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className="w-6 h-6" weight={isActive ? "fill" : "regular"} />
                  <span className="text-xs">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </nav>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" weight="fill" />
            </div>
            <span className="text-2xl font-bold text-foreground">Habesha</span>
          </div>

          <nav className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className="w-5 h-5 mr-2" weight={isActive ? "fill" : "regular"} />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          <Button variant="ghost" size="sm">
            <Gear className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Desktop Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}