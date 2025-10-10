import { Users, Shield, ChartBar, Gear, Eye, Clipboard, Bell } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileAdminNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  stats: {
    pendingReports: number
    pendingApprovals: number
  }
}

export default function MobileAdminNav({ activeTab, onTabChange, stats }: MobileAdminNavProps) {
  const isMobile = useIsMobile()
  
  if (!isMobile) return null

  const navItems = [
    { id: "overview", icon: ChartBar, label: "Overview" },
    { 
      id: "users", 
      icon: Users, 
      label: "Users" 
    },
    { 
      id: "reports", 
      icon: Shield, 
      label: "Reports",
      badge: stats.pendingReports > 0 ? stats.pendingReports : undefined
    },
    { 
      id: "approvals", 
      icon: Eye, 
      label: "Approvals",
      badge: stats.pendingApprovals > 0 ? stats.pendingApprovals : undefined
    },
    { id: "analytics", icon: ChartBar, label: "Analytics" },
    { id: "settings", icon: Gear, label: "Settings" },
    { id: "logs", icon: Clipboard, label: "Logs" }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.slice(0, 4).map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(item.id)}
            className="flex flex-col gap-1 h-auto p-2 relative"
          >
            <item.icon className="w-4 h-4" />
            <span className="text-xs">{item.label}</span>
            {item.badge && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
        
        {/* More menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col gap-1 h-auto p-2"
        >
          <Bell className="w-4 h-4" />
          <span className="text-xs">More</span>
        </Button>
      </div>
    </div>
  )
}