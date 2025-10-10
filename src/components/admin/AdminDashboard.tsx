import { useState, useEffect } from "react"
import { 
  Users, Shield, ChartBar, Gear, Eye, Trash, Check, X, 
  MagnifyingGlass, Warning, Globe, Calendar, Heart,
  CaretDown, Clipboard, Bell, Translate, SignOut
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useKV } from "@github/spark/hooks"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import MobileAdminNav from "./MobileAdminNav"

interface AdminUser {
  id: string
  name: string
  email: string
  age: number
  location: string
  status: "active" | "suspended" | "pending" | "reported"
  joinDate: string
  lastActive: string
  matchCount: number
  reportCount: number
  photo: string
  bio?: string
  profession?: string
  isVerified: boolean
}

interface ContentReport {
  id: string
  reportType: "inappropriate_content" | "fake_profile" | "harassment" | "spam"
  reportedUserId: string
  reportedUserName: string
  reporterName: string
  content: string
  reason: string
  timestamp: string
  status: "pending" | "resolved" | "dismissed"
}

interface PendingApproval {
  id: string
  userId: string
  userName: string
  type: "profile" | "photo" | "bio_update"
  content: string
  submittedDate: string
  status: "pending" | "approved" | "rejected"
}

interface AdminLog {
  id: string
  adminName: string
  action: string
  targetUser?: string
  details: string
  timestamp: string
  type: "user_action" | "content_moderation" | "system_setting"
}

const sampleUsers: AdminUser[] = [
  {
    id: "1",
    name: "Rahel Tesfaye",
    email: "rahel.t@email.com",
    age: 27,
    location: "Dubai, UAE",
    status: "active",
    joinDate: "2024-01-15",
    lastActive: "2024-02-10",
    matchCount: 8,
    reportCount: 0,
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop",
    bio: "Ethiopian living in Dubai, love traditional coffee ceremonies",
    profession: "Software Engineer",
    isVerified: true
  },
  {
    id: "2",
    name: "Dawit Haile",
    email: "dawit.h@email.com", 
    age: 30,
    location: "Riyadh, Saudi Arabia",
    status: "active",
    joinDate: "2024-01-20",
    lastActive: "2024-02-11",
    matchCount: 12,
    reportCount: 1,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    bio: "Looking for someone who shares my love for Ethiopian culture",
    profession: "Marketing Manager",
    isVerified: false
  },
  {
    id: "3",
    name: "Meron Kidane",
    email: "meron.k@email.com",
    age: 25,
    location: "Kuwait City, Kuwait",
    status: "pending",
    joinDate: "2024-02-01",
    lastActive: "2024-02-11",
    matchCount: 0,
    reportCount: 0,
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    bio: "New to Kuwait, hoping to connect with fellow Ethiopians",
    profession: "Teacher", 
    isVerified: false
  }
]

const sampleReports: ContentReport[] = [
  {
    id: "r1",
    reportType: "inappropriate_content",
    reportedUserId: "2",
    reportedUserName: "Dawit Haile",
    reporterName: "Anonymous User",
    content: "Inappropriate message content",
    reason: "Used offensive language in chat",
    timestamp: "2024-02-10T14:30:00Z",
    status: "pending"
  },
  {
    id: "r2", 
    reportType: "fake_profile",
    reportedUserId: "4",
    reportedUserName: "Fake User",
    reporterName: "Rahel Tesfaye",
    content: "Suspicious profile photos",
    reason: "Photos appear to be stock images",
    timestamp: "2024-02-09T09:15:00Z",
    status: "pending"
  }
]

const sampleApprovals: PendingApproval[] = [
  {
    id: "a1",
    userId: "3",
    userName: "Meron Kidane",
    type: "profile",
    content: "New user profile pending approval",
    submittedDate: "2024-02-01",
    status: "pending"
  },
  {
    id: "a2",
    userId: "5",
    userName: "Samuel Bekele",
    type: "photo",
    content: "New profile photo uploaded",
    submittedDate: "2024-02-11",
    status: "pending"
  }
]

const adminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  pendingApprovals: 23,
  totalMatches: 5681,
  reportsToReview: 7,
  dailySignups: 12,
  weeklySignups: 89,
  monthlySignups: 356,
  engagementRate: 68,
  averageSessionTime: "12m",
  locationBreakdown: {
    "Dubai, UAE": 387,
    "Riyadh, Saudi Arabia": 298,
    "Kuwait City, Kuwait": 201,
    "Doha, Qatar": 189,
    "Abu Dhabi, UAE": 172
  }
}

export default function AdminDashboard() {
  const isMobile = useIsMobile()
  const [users, setUsers] = useState(sampleUsers)
  const [reports, setReports] = useState(sampleReports)
  const [approvals, setApprovals] = useState(sampleApprovals)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [language, setLanguage] = useKV<string>("admin-language", "en")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [systemSettings, setSystemSettings] = useKV<{
    maxAge: number;
    minAge: number; 
    maxDistance: number;
    requireVerification: boolean;
    autoApproveProfiles: boolean;
  }>("admin-system-settings", {
    maxAge: 50,
    minAge: 18,
    maxDistance: 100,
    requireVerification: true,
    autoApproveProfiles: false
  })
  const [adminLogs, setAdminLogs] = useKV<AdminLog[]>("admin-logs", [])

  const addAdminLog = (action: string, targetUser?: string, details?: string) => {
    const newLog: AdminLog = {
      id: `log-${Date.now()}`,
      adminName: "Admin",
      action,
      targetUser,
      details: details || "",
      timestamp: new Date().toISOString(),
      type: targetUser ? "user_action" : "system_setting"
    }
    setAdminLogs(prev => [newLog, ...(prev || []).slice(0, 49)]) // Keep last 50 logs
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = userFilter === "all" || user.status === userFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "suspended":
        return "destructive"
      case "pending":
        return "secondary"
      case "reported":
        return "destructive"
      default:
        return "outline"
    }
  }

  const approveUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: "active" as const } : user
    ))
    const user = users.find(u => u.id === userId)
    addAdminLog("User Approved", user?.name, `Profile approved for ${user?.email}`)
    toast.success("User approved successfully")
  }

  const suspendUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: "suspended" as const } : user
    ))
    const user = users.find(u => u.id === userId)
    addAdminLog("User Suspended", user?.name, `Account suspended for ${user?.email}`)
    toast.success("User suspended")
  }

  const deleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    setUsers(prev => prev.filter(user => user.id !== userId))
    addAdminLog("User Deleted", user?.name, `Account permanently deleted for ${user?.email}`)
    toast.success("User deleted permanently")
  }

  const resolveReport = (reportId: string, action: "resolved" | "dismissed") => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: action } : report
    ))
    addAdminLog(`Report ${action}`, undefined, `Report ${reportId} marked as ${action}`)
    toast.success(`Report ${action}`)
  }

  const approveContent = (approvalId: string, action: "approved" | "rejected") => {
    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId ? { ...approval, status: action } : approval
    ))
    const approval = approvals.find(a => a.id === approvalId)
    addAdminLog(`Content ${action}`, approval?.userName, `${approval?.type} ${action}`)
    toast.success(`Content ${action}`)
  }

  const handleSignOut = () => {
    // Navigate back to main app or login
    window.location.href = "/"
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Habesha Admin</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Community Management Dashboard
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Translate className="w-4 h-4 text-muted-foreground" />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">አማርኛ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Sign Out */}
            <Button variant="outline" onClick={handleSignOut} className="gap-2" size={isMobile ? "sm" : "default"}>
              <SignOut className="w-4 h-4" />
              {!isMobile && "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-full">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          {/* Desktop Navigation */}
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users" className="relative">
                Users
              </TabsTrigger>
              <TabsTrigger value="reports" className="relative">
                Reports
                {reports.filter(r => r.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {reports.filter(r => r.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approvals" className="relative">
                Approvals
                {approvals.filter(a => a.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {approvals.filter(a => a.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          )}

          {/* Mobile Navigation */}
          <MobileAdminNav 
            activeTab={selectedTab}
            onTabChange={setSelectedTab}
            stats={{
              pendingReports: reports.filter(r => r.status === "pending").length,
              pendingApprovals: approvals.filter(a => a.status === "pending").length
            }}
          />

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.activeUsers} active • {adminStats.weeklySignups} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Shield className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-accent">{adminStats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.reportsToReview} reports • {approvals.filter(a => a.status === "pending").length} approvals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches Created</CardTitle>
                  <Heart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-primary">{adminStats.totalMatches.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.engagementRate}% engagement rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
                  <ChartBar className="h-4 w-4 text-secondary-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.averageSessionTime} avg session
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={user.photo} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.location}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(user.status)} className="text-xs">
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(adminStats.locationBreakdown).map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{count}</div>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(count / adminStats.totalUsers) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="relative flex-1">
                    <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={isMobile ? "Search users..." : "Search users by name, email, or location..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors`}>
                      <div className={`flex items-center gap-4 ${isMobile ? 'mb-3' : 'flex-1'}`}>
                        <div className="relative">
                          <img 
                            src={user.photo} 
                            alt={user.name}
                            className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full object-cover`}
                          />
                          {user.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>{user.name}</h3>
                            <Badge variant={getStatusColor(user.status)} className="text-xs">
                              {user.status}
                            </Badge>
                            {user.reportCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {user.reportCount} reports
                              </Badge>
                            )}
                          </div>
                          
                          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground space-y-1`}>
                            <div>{user.email} • {user.age} years</div>
                            <div>{user.location} • {user.profession}</div>
                            {!isMobile && (
                              <>
                                <div className="truncate">Bio: {user.bio}</div>
                                <div className="text-xs">
                                  Joined: {user.joinDate} • Matches: {user.matchCount}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : 'ml-4'}`}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className={`${isMobile ? 'max-w-[95vw] mx-2' : 'max-w-2xl'}`}>
                            <DialogHeader>
                              <DialogTitle>User Profile Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                <div className={`flex ${isMobile ? 'flex-col' : 'items-start'} gap-4`}>
                                  <img 
                                    src={selectedUser.photo} 
                                    alt={selectedUser.name}
                                    className={`${isMobile ? 'w-20 h-20 mx-auto' : 'w-24 h-24'} rounded-lg object-cover`}
                                  />
                                  <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{selectedUser.name}</h3>
                                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-sm`}>
                                      <div><strong>Email:</strong> {selectedUser.email}</div>
                                      <div><strong>Age:</strong> {selectedUser.age}</div>
                                      <div><strong>Location:</strong> {selectedUser.location}</div>
                                      <div><strong>Profession:</strong> {selectedUser.profession}</div>
                                      <div><strong>Joined:</strong> {selectedUser.joinDate}</div>
                                      <div><strong>Status:</strong> {selectedUser.status}</div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <strong>Bio:</strong>
                                  <p className="mt-2 text-sm text-muted-foreground">{selectedUser.bio}</p>
                                </div>
                                <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                                  <Button variant="outline" size="sm" className={isMobile ? 'w-full' : ''}>
                                    Send Message
                                  </Button>
                                  <Button variant="outline" size="sm" className={isMobile ? 'w-full' : ''}>
                                    View Match History
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {user.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => approveUser(user.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {!isMobile && "Approve"}
                          </Button>
                        )}
                        
                        {user.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => suspendUser(user.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="w-4 h-4 mr-1" />
                            {!isMobile && "Suspend"}
                          </Button>
                        )}
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <p className="text-muted-foreground">Review and resolve user reports</p>
              </CardHeader>
              <CardContent>
                {reports.filter(r => r.status === "pending").length > 0 ? (
                  <div className="space-y-4">
                    {reports.filter(r => r.status === "pending").map((report) => (
                      <Alert key={report.id} className="border-destructive/50">
                        <Warning className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-base mb-2">
                                  {report.reportType.replace("_", " ").toUpperCase()} Report
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Reported User:</strong> {report.reportedUserName}</p>
                                  <p><strong>Reporter:</strong> {report.reporterName}</p>
                                  <p><strong>Reason:</strong> {report.reason}</p>
                                  <p><strong>Content:</strong> {report.content}</p>
                                  <p className="text-muted-foreground">
                                    <strong>Reported:</strong> {new Date(report.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="destructive" className="ml-4">
                                {report.status}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => resolveReport(report.id, "resolved")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => resolveReport(report.id, "dismissed")}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Dismiss
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View User
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Reports</h3>
                    <p className="text-muted-foreground">
                      All reports have been reviewed. Great job maintaining community standards!
                    </p>
                  </div>
                )}
                
                {/* Resolved Reports */}
                {reports.filter(r => r.status !== "pending").length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">Recently Resolved Reports</h4>
                    <div className="space-y-2">
                      {reports.filter(r => r.status !== "pending").slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium">{report.reportedUserName}</span> - {report.reportType}
                          </div>
                          <Badge variant={report.status === "resolved" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Approvals</CardTitle>
                <p className="text-muted-foreground">Review pending profile submissions and updates</p>
              </CardHeader>
              <CardContent>
                {approvals.filter(a => a.status === "pending").length > 0 ? (
                  <div className="space-y-4">
                    {approvals.filter(a => a.status === "pending").map((approval) => (
                      <div key={approval.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-base mb-1">
                              {approval.type.replace("_", " ").toUpperCase()} - {approval.userName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {approval.submittedDate}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {approval.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm">{approval.content}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => approveContent(approval.id, "approved")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => approveContent(approval.id, "rejected")}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      No pending profile approvals at this time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Daily Signups</span>
                      <span className="font-bold">{adminStats.dailySignups}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Weekly Signups</span>
                      <span className="font-bold">{adminStats.weeklySignups}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Monthly Signups</span>
                      <span className="font-bold">{adminStats.monthlySignups}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Engagement Rate</span>
                      <span className="font-bold">{adminStats.engagementRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Matches</span>
                      <span className="font-bold">{adminStats.totalMatches.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Session</span>
                      <span className="font-bold">{adminStats.averageSessionTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Users</span>
                      <span className="font-bold">{adminStats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Reports Resolved</span>
                      <span className="font-bold">98.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discovery Settings</CardTitle>
                  <p className="text-muted-foreground">Configure global discovery parameters</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="min-age">Minimum Age</Label>
                    <Input
                      id="min-age"
                      type="number"
                      value={systemSettings?.minAge || 18}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev!, minAge: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-age">Maximum Age</Label>
                    <Input
                      id="max-age"
                      type="number"
                      value={systemSettings?.maxAge || 50}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev!, maxAge: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-distance">Maximum Distance (km)</Label>
                    <Input
                      id="max-distance"
                      type="number"
                      value={systemSettings?.maxDistance || 100}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev!, maxDistance: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-verification">Require Photo Verification</Label>
                    <Switch
                      id="require-verification"
                      checked={systemSettings?.requireVerification || false}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev!, requireVerification: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-approve">Auto-approve Profiles</Label>
                    <Switch
                      id="auto-approve"
                      checked={systemSettings?.autoApproveProfiles || false}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev!, autoApproveProfiles: checked }))
                      }
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      addAdminLog("System Settings Updated", undefined, "Updated discovery settings")
                      toast.success("Settings saved successfully")
                    }}
                    className="w-full"
                  >
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <p className="text-muted-foreground">Send announcements to users</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title">Title</Label>
                    <Input
                      id="announcement-title"
                      placeholder="Enter announcement title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="announcement-message">Message</Label>
                    <Textarea
                      id="announcement-message"
                      placeholder="Enter your announcement message..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active Users Only</SelectItem>
                        <SelectItem value="new">New Users (Last 7 days)</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => {
                      addAdminLog("Announcement Sent", undefined, "Sent announcement to users")
                      toast.success("Announcement sent successfully")
                    }}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Logs</CardTitle>
                <p className="text-muted-foreground">Track all admin actions and system changes</p>
              </CardHeader>
              <CardContent>
                {adminLogs && adminLogs.length > 0 ? (
                  <div className="space-y-3">
                    {adminLogs.slice(0, 20).map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 border border-border rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            {log.targetUser && (
                              <Badge variant="outline" className="text-xs">
                                {log.targetUser}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {log.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>by {log.adminName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clipboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                    <p className="text-muted-foreground">
                      Admin actions will appear here as they happen.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}