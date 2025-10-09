import { useState } from "react"
import { Camera, MapPin, Calendar, Heart, Gear, SignOut } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useKV } from "@github/spark/hooks"

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

  if (!profile) return null

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 max-w-lg mx-auto pb-6">
        {/* Profile Header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img 
                  src={profile.photos[0]} 
                  alt={profile.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-lg"
                />
                <Button 
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-lg"
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              
              <h1 className="text-xl font-bold mb-1">{profile.name}, {profile.age}</h1>
              
              <div className="flex items-center gap-1 text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.location}</span>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                <Badge variant="secondary" className="text-xs">
                  🕊️ {profile.religion}
                </Badge>
              </div>

              <p className="text-foreground leading-relaxed mb-4 text-sm">
                {profile.bio}
              </p>

              <Button 
                onClick={() => setEditMode(!editMode)}
                className="w-full"
                size="sm"
              >
                {editMode ? "Save Profile" : "Edit Profile"}
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
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {editMode && (
                <Button variant="outline" size="sm" className="text-xs h-6">+ Add</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        {profile.languages && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Languages</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language) => (
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
              {profile.photos.map((photo, index) => (
                <div key={index} className="aspect-square relative">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {editMode && (
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full p-0 text-xs"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              {editMode && profile.photos.length < 5 && (
                <div className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <Button variant="ghost" size="sm" className="p-1">
                    <Camera className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
            {profile.photos.length < 5 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Add up to {5 - profile.photos.length} more photo{5 - profile.photos.length !== 1 ? 's' : ''}
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
            <Button variant="ghost" className="w-full justify-start h-10 text-sm">
              <Gear className="w-4 h-4 mr-3" />
              Account Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start h-10 text-sm">
              <Heart className="w-4 h-4 mr-3" />
              Discovery Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive h-10 text-sm">
              <SignOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}