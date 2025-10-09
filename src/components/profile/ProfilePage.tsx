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
  ethnicity?: string
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
  ethnicity: "Ethiopian",
  languages: ["Amharic", "English", "Arabic"],
  profession: "Software Engineer"
}

export default function ProfilePage() {
  const [profile, setProfile] = useKV<UserProfile>("user-profile", defaultProfile)
  const [editMode, setEditMode] = useState(false)

  if (!profile) return null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img 
                src={profile.photos[0]} 
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
              />
              <Button 
                size="sm"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <h1 className="text-2xl font-bold mb-1">{profile.name}, {profile.age}</h1>
            
            <div className="flex items-center gap-1 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>

            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">
                🕊️ {profile.religion}
              </Badge>
              <Badge variant="secondary">
                🌍 {profile.ethnicity}
              </Badge>
            </div>

            <p className="text-foreground leading-relaxed mb-6 max-w-md">
              {profile.bio}
            </p>

            <Button 
              onClick={() => setEditMode(!editMode)}
              className="w-full max-w-xs"
            >
              {editMode ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge key={interest} variant="outline" className="text-sm">
                {interest}
              </Badge>
            ))}
            {editMode && (
              <Button variant="outline" size="sm">+ Add Interest</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      {profile.languages && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((language) => (
                <Badge key={language} variant="secondary" className="text-sm">
                  {language}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
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
                    className="absolute top-1 right-1 w-6 h-6 rounded-full p-0"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {editMode && profile.photos.length < 5 && (
              <div className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <Button variant="ghost" size="sm">
                  <Camera className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
          {profile.photos.length < 5 && (
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Add up to {5 - profile.photos.length} more photo{5 - profile.photos.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">45</div>
              <div className="text-sm text-muted-foreground">Likes Given</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-foreground">8</div>
              <div className="text-sm text-muted-foreground">Conversations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start">
            <Gear className="w-5 h-5 mr-3" />
            Account Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Heart className="w-5 h-5 mr-3" />
            Discovery Preferences
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive">
            <SignOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}