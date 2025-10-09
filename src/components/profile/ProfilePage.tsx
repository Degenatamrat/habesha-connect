import { useState, useRef } from "react"
import { Camera, MapPin, Calendar, Heart, Gear, SignOut, Plus, X, Pencil, Check } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface UserProfile {
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  religion?: string
  languages?: string[]
  profession?: string
}

const defaultProfile: UserProfile = {
  name: "Your Name",
  age: 25,
  location: "Dubai, UAE",
  bio: "Tell people about yourself! Share your passions, what makes you unique, and what you're looking for.",
  interests: ["Travel", "Coffee", "Photography"],
  photos: ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=600&fit=crop"],
  religion: "Orthodox",
  languages: ["Amharic", "English", "Arabic"],
  profession: "Software Engineer"
}

export default function ProfilePage() {
  const [profile, setProfile] = useKV<UserProfile>("user-profile", defaultProfile)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<UserProfile>(defaultProfile)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!profile) return null

  const handleEditMode = () => {
    if (editMode) {
      // Save changes
      setProfile(editData)
      setEditMode(false)
      toast.success("Profile updated successfully!")
    } else {
      // Enter edit mode
      setEditData(profile)
      setEditMode(true)
    }
  }

  const handlePhotoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    const imageUrl = URL.createObjectURL(file)
    
    if (editMode) {
      setEditData(prev => ({
        ...prev,
        photos: [imageUrl, ...(prev?.photos || [])].slice(0, 5)
      }))
    } else {
      setProfile((prev: UserProfile | undefined) => {
        if (!prev) return defaultProfile
        return {
          ...prev,
          photos: [imageUrl, ...prev.photos].slice(0, 5)
        }
      })
    }
    
    toast.success("Photo uploaded!")
    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    if (editMode) {
      setEditData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }))
    }
  }

  const addInterest = () => {
    if (!newInterest.trim()) return
    
    const currentInterests = editMode ? editData.interests : profile.interests
    if (currentInterests.includes(newInterest)) {
      toast.error("Interest already added")
      return
    }

    if (editMode) {
      setEditData(prev => ({
        ...prev,
        interests: [...(prev?.interests || []), newInterest.trim()]
      }))
    } else {
      setProfile((prev: UserProfile | undefined) => {
        if (!prev) return defaultProfile
        return {
          ...prev,
          interests: [...prev.interests, newInterest.trim()]
        }
      })
    }
    
    setNewInterest("")
    toast.success("Interest added!")
  }

  const removeInterest = (interestToRemove: string) => {
    if (editMode) {
      setEditData(prev => ({
        ...prev,
        interests: prev.interests.filter(interest => interest !== interestToRemove)
      }))
    }
  }

  const displayProfile = editMode ? editData : profile

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 max-w-lg mx-auto pb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Profile Header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img 
                  src={displayProfile.photos[0]} 
                  alt={displayProfile.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-lg"
                />
                <Button 
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-lg"
                  onClick={handlePhotoUpload}
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              
              {editMode ? (
                <div className="w-full space-y-3 mb-4">
                  <div className="flex gap-2">
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                      placeholder="Age"
                      className="w-20"
                    />
                  </div>
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Your location"
                  />
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell people about yourself..."
                    className="min-h-[80px]"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold mb-1">{displayProfile.name}, {displayProfile.age}</h1>
                  
                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{displayProfile.location}</span>
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap justify-center">
                    <Badge variant="secondary" className="text-xs">
                      🕊️ {displayProfile.religion}
                    </Badge>
                  </div>

                  <p className="text-foreground leading-relaxed mb-4 text-sm">
                    {displayProfile.bio}
                  </p>
                </>
              )}

              <Button 
                onClick={handleEditMode}
                className="w-full"
                size="sm"
              >
                {editMode ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Interests</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {displayProfile.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs group">
                  {interest}
                  {editMode && (
                    <button 
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {editMode && (
                <div className="flex gap-1">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="New interest"
                    className="text-xs h-6 w-24"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button 
                    onClick={addInterest}
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        {displayProfile.languages && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Languages</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {displayProfile.languages.map((language) => (
                  <Badge key={language} variant="secondary" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              {displayProfile.photos.map((photo, index) => (
                <div key={index} className="aspect-square relative">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {editMode && index > 0 && (
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full p-0 text-xs"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              {editMode && displayProfile.photos.length < 5 && (
                <div className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1"
                    onClick={handlePhotoUpload}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
            {displayProfile.photos.length < 5 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Add up to {5 - displayProfile.photos.length} more photo{5 - displayProfile.photos.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
              <div>
                <div className="text-xl font-bold text-accent">45</div>
                <div className="text-xs text-muted-foreground">Likes Given</div>
              </div>
              <div>
                <div className="text-xl font-bold text-secondary-foreground">8</div>
                <div className="text-xs text-muted-foreground">Conversations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-10 text-sm">
                  <Gear className="w-4 h-4 mr-3" />
                  Account Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Account Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com"
                      defaultValue="user@habesha.app"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notifications">Notification Preferences</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All notifications</SelectItem>
                        <SelectItem value="matches">Matches only</SelectItem>
                        <SelectItem value="messages">Messages only</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacy">Profile Visibility</Label>
                    <Select defaultValue="public">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="matches">Matches only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      toast.success("Settings saved!")
                      setShowAccountSettings(false)
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" className="w-full justify-start h-10 text-sm">
              <Heart className="w-4 h-4 mr-3" />
              Discovery Preferences
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive h-10 text-sm"
              onClick={() => {
                toast.success("Signed out successfully!")
                // In a real app, this would handle authentication
              }}
            >
              <SignOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}