import { useState } from "react"
import { Shield, Eye, EyeSlash, Warning } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminDashboard from "@/components/admin/AdminDashboard"

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "habesha2024"
}

export default function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Invalid credentials. Access denied.")
    }
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin()
    }
  }

  if (isAuthenticated) {
    return <AdminDashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <p className="text-muted-foreground">
            Habesha Dating Platform Administration
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Warning className="h-4 w-4" />
            <AlertDescription>
              This is a secure admin area. Unauthorized access is prohibited and monitored.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="username">Administrator Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter admin username"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter admin password"
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlash className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleLogin}
            className="w-full"
            disabled={!username || !password || isLoading}
          >
            {isLoading ? "Authenticating..." : "Access Dashboard"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Demo credentials for development:</p>
            <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
              admin / habesha2024
            </p>
          </div>

          <div className="border-t pt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/"}>
              ← Back to Main App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}