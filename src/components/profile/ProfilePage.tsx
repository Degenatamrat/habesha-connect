import { useState, useRef } from "react"
import { Camera, MapPin, Heart, Gear, SignOut, Plus, X, Pencil, Check, Trash, Crosshair } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useKV } from "@github/spark/hooks"
import { useAuth } from "@/components/auth/AuthContext"
import { toast } from "sonner"

interface UserProfile {
  name: string
  headline?: string
  age?: number
  location?: string
  bio?: string
  interests: string[]
  photos: string[]
  religion?: string
  languages?: string[]
  profession?: string
  lookingFor?: string
}

const emptyProfile: UserProfile = {
  name: "",
  headline: "",
  age: undefined,
  location: "",
  bio: "",
  interests: [],
  photos: [],
  religion: "",
  languages: [],
  profession: "",
  lookingFor: ""
}

export default function ProfilePage() {
  const { signOut, deleteAccount, user } = useAuth()
  const [profile, setProfile] = useKV<UserProfile | null>("user-profile", null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<UserProfile>(emptyProfile)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const actualProfile: UserProfile = profile || { ...emptyProfile, name: user?.name || "" }

  const handleEditMode = () => {
    if (editMode) {
      setProfile(editData)
      setEditMode(false)
      toast.success("Profile updated successfully!")
    } else {
      setEditData(actualProfile)
      setEditMode(true)
    }
  }

  const handlePhotoUpload = () => fileInputRef.current?.click()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file")
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be less than 5MB")

    const imageUrl = URL.createObjectURL(file)
    if (editMode) {
      setEditData(prev => ({ ...prev, photos: [imageUrl, ...prev.photos].slice(0, 5) }))
    } else {
      setProfile(prev => {
        const current = prev || actualProfile
        return { ...current, photos: [imageUrl, ...current.photos].slice(0, 5) }
      })
    }
    toast.success("Photo uploaded!")
    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    if (editMode) setEditData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  const addInterest = () => {
    if (!newInterest.trim()) return
    const current = editMode ? editData.interests : actualProfile.interests
    if (current.includes(newInterest)) return toast.error("Interest already added")

    if (editMode) {
      setEditData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }))
    } else {
      setProfile(prev => {
        const currentProfile = prev || actualProfile
        return { ...currentProfile, interests: [...currentProfile.interests, newInterest.trim()] }
      })
    }
    setNewInterest("")
    toast.success("Interest added!")
  }

  const removeInterest = (interest: string) => {
    if (editMode)
      setEditData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))
  }

  const handleLocationAccess = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.")
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await response.json()
          const city = data.address.city || data.address.town || data.address.village || "Unknown"
          const country = data.address.country || "Unknown"
          const locationString = `${city}, ${country}`

          setEditData(prev => ({ ...prev, location: locationString }))
          setLastUpdated(new Date().toLocaleTimeString())
          toast.success(`Location updated: ${locationString}`)
        } catch {
          toast.error("Failed to fetch location details.")
        } finally {
          setLocationLoading(false)
        }
      },
      () => {
        toast.error("Location permission denied.")
        setLocationLoading(false)
      }
    )
  }

  const handleSignOut = () => {
    signOut()
    toast.success("Signed out successfully!")
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      toast.success("Account deleted successfully")
    } catch {
      toast.error("Failed to delete account. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const displayProfile = editMode ? editData : actualProfile

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 max-w-lg mx-auto pb-6">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

        {/* Profile Header */}
        <Card className="mb-4">
          <CardContent className="p-4 text-center flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={displayProfile.photos[0] || "https://via.placeholder.com/150?text=No+Photo"}
                alt={displayProfile.name || "Profile"}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-lg"
              />
              <Button size="sm" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-lg" onClick={handlePhotoUpload}>
                <Camera className="w-3 h-3" />
              </Button>
            </div>

            {editMode ? (
              <div className="w-full space-y-3 mb-4">
                <Input value={editData.name} onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))} placeholder="Your name" />
                <Input value={editData.headline || ""} onChange={(e) => setEditData(prev => ({ ...prev, headline: e.target.value }))} placeholder="Your headline (e.g. Coffee lover)" />
                <Input type="number" value={editData.age || ""} onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))} placeholder="Age" />
                <div className="flex items-center gap-2">
                  <Input value={editData.location || ""} onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))} placeholder="Your location" />
                  <Button size="sm" variant="outline" onClick={handleLocationAccess} disabled={locationLoading}>
                    <Crosshair className="w-4 h-4 mr-1" /> {locationLoading ? "Detecting..." : "Allow Location"}
                  </Button>
                </div>
                {lastUpdated && <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>}
                <Textarea value={editData.bio || ""} onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell people about yourself..." className="min-h-[80px]" />
                <Input value={editData.profession || ""} onChange={(e) => setEditData(prev => ({ ...prev, profession: e.target.value }))} placeholder="Profession (optional)" />
                <Select value={editData.religion || ""} onValueChange={(val) => setEditData(prev => ({ ...prev, religion: val }))}>
                  <SelectTrigger><SelectValue placeholder="Select Religion" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orthodox">Orthodox</SelectItem>
                    <SelectItem value="Protestant">Protestant</SelectItem>
                    <SelectItem value="Catholic">Catholic</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={(editData.languages || []).join(", ")} onChange={(e) => setEditData(prev => ({ ...prev, languages: e.target.value.split(",").map(l => l.trim()) }))} placeholder="Languages (comma separated)" />
                <Select value={editData.lookingFor || ""} onValueChange={(val) => setEditData(prev => ({ ...prev, lookingFor: val }))}>
                  <SelectTrigger><SelectValue placeholder="Looking for..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serious relationship">Serious relationship</SelectItem>
                    <SelectItem value="Friendship">Friendship</SelectItem>
                    <SelectItem value="Open to chat">Open to chat</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold mb-1">{displayProfile.name || "Unnamed"}</h1>
                {displayProfile.headline && <p className="italic text-muted-foreground mb-2">"{displayProfile.headline}"</p>}
                {displayProfile.age && <p className="text-sm text-muted-foreground">Age: {displayProfile.age}</p>}
                {displayProfile.location && (
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{displayProfile.location}</span>
                  </div>
                )}
                {displayProfile.profession && <p className="text-sm text-muted-foreground">💼 {displayProfile.profession}</p>}
                {displayProfile.religion && <p className="text-sm text-muted-foreground">🕊 {displayProfile.religion}</p>}
                {displayProfile.languages?.length > 0 && (
                  <p className="text-sm text-muted-foreground">🗣 Languages: {displayProfile.languages.join(", ")}</p>
                )}
                {displayProfile.lookingFor && <p className="text-sm text-muted-foreground">🎯 Looking for: {displayProfile.lookingFor}</p>}
                <p className="text-sm text-foreground leading-relaxed mt-3">{displayProfile.bio || "No bio yet."}</p>
              </>
            )}

            <Button onClick={handleEditMode} className="w-full mt-3" size="sm">
              {editMode ? <><Check className="w-4 h-4 mr-2" /> Save Profile</> : <><Pencil className="w-4 h-4 mr-2" /> Edit Profile</>}
            </Button>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base">Interests</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {displayProfile.interests.length > 0 ? displayProfile.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs group">
                  {interest}
                  {editMode && <button onClick={() => removeInterest(interest)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>}
                </Badge>
              )) : <p className="text-xs text-muted-foreground">No interests added yet.</p>}
              {editMode && (
                <div className="flex gap-1">
                  <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="New interest" className="text-xs h-6 w-24" onKeyPress={(e) => e.key === "Enter" && addInterest()} />
                  <Button onClick={addInterest} variant="outline" size="sm" className="text-xs h-6 px-2"><Plus className="w-3 h-3" /></Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Settings</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-1">
            <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-10 text-sm">
                  <Gear className="w-4 h-4 mr-3" /> Account Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Account Settings</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <Label>Email</Label>
                  <Input type="email" defaultValue={user?.email || ""} disabled />
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-destructive mb-3">Danger Zone</h4>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full"><Trash className="w-4 h-4 mr-2" /> Delete Account Permanently</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your account? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" className="w-full justify-start text-destructive h-10 text-sm" onClick={handleSignOut}>
              <SignOut className="w-4 h-4 mr-3" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
