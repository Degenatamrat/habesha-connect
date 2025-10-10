import { useState, useRef } from "react"
import { Camera, Heart, Plus, X, ArrowLeft, ArrowRight, Check, MapPin, Calendar, User } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useKV } from "@github/spark/hooks"
import { useAuth } from "@/components/auth/AuthContext"
import { toast } from "sonner"

interface ProfileData {
  photo: string
  bio: string
  interests: string[]
  languages: string[]
  phoneNumber: string
  age: number
  location: string
  religion: string
  ageRangePreference: [number, number]
}

interface ProfileCompletionProps {
  userEmail: string
  userName: string
  onComplete: () => void
}

const COMMON_INTERESTS = [
  "Travel", "Photography", "Coffee", "Fitness", "Reading", "Movies", 
  "Music", "Cooking", "Dancing", "Art", "Sports", "Technology",
  "Fashion", "Hiking", "Yoga", "Gaming", "Writing", "Languages"
]

const COMMON_LANGUAGES = [
  "Amharic", "Tigrinya", "English", "Arabic", "French", "Italian", 
  "German", "Spanish", "Oromo", "Somali", "Afar", "Sidamo"
]

const RELIGION_OPTIONS = [
  "Orthodox", "Catholic", "Protestant", "Muslim", "Non-religious"
]

const LOCATION_OPTIONS = [
  "Dubai, UAE",
  "Riyadh, Saudi Arabia", 
  "Kuwait City, Kuwait",
  "Doha, Qatar",
  "Abu Dhabi, UAE",
  "Jeddah, Saudi Arabia",
  "Manama, Bahrain",
  "Muscat, Oman"
]

export default function ProfileCompletion({ userEmail, userName, onComplete }: ProfileCompletionProps) {
  const { finalizeAccount } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    photo: "",
    bio: "",
    interests: [],
    languages: [],
    phoneNumber: "",
    age: 25,
    location: "Dubai, UAE",
    religion: "Orthodox",
    ageRangePreference: [22, 35]
  })

  const steps = [
    { title: "Add Your Photo", description: "Let people see the real you" },
    { title: "About You", description: "Your age and location" },
    { title: "Tell Your Story", description: "Share what makes you unique" },
    { title: "Your Interests", description: "What do you love doing?" },
    { title: "Languages", description: "What languages do you speak?" },
    { title: "Faith & Values", description: "Your religious background" },
    { title: "Dating Preferences", description: "Age range you're looking for" },
    { title: "Contact Info", description: "Add your phone number" }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

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
    setProfileData(prev => ({ ...prev, photo: imageUrl }))
    toast.success("Photo uploaded!")
    e.target.value = ""
  }

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleLanguage = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return profileData.photo !== ""
      case 1: return profileData.age >= 18 && profileData.location !== ""
      case 2: return true // Bio is now optional
      case 3: return profileData.interests.length >= 3
      case 4: return profileData.languages.length >= 1
      case 5: return profileData.religion !== ""
      case 6: return true // Age preference has default values
      case 7: return profileData.phoneNumber.trim().length >= 10
      default: return false
    }
  }

  const handleNext = () => {
    if (!canProceed()) {
      const requirements = [
        "Please add a photo",
        "Please enter your age and select location",
        "", // Bio is optional, no error message needed
        "Please select at least 3 interests",
        "Please select at least 1 language",
        "Please select your religion",
        "", // Age preference has defaults
        "Please enter a valid phone number"
      ]
      if (requirements[currentStep]) {
        toast.error(requirements[currentStep])
      }
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = async () => {
    if (!canProceed()) {
      toast.error("Please enter a valid phone number")
      return
    }

    setIsSubmitting(true)
    try {
      // Finalize the account with complete profile data
      await finalizeAccount(userEmail, userName, profileData)
      toast.success("Welcome to Habesha! Your profile is complete!")
      onComplete()
    } catch (error) {
      toast.error("Failed to complete profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <div className="relative mx-auto w-32 h-32">
              {profileData.photo ? (
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center bg-muted">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Button
                onClick={handlePhotoUpload}
                size="sm"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full shadow-lg"
              >
                {profileData.photo ? (
                  <Camera className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div>
              <p className="text-muted-foreground mb-4">
                Add a great photo that shows your personality! This will be the first thing people see.
              </p>
              <Button onClick={handlePhotoUpload} variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                {profileData.photo ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="age" className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Age
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  This helps us find age-appropriate matches
                </p>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                  min="18"
                  max="80"
                  className="text-base"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Your Location
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  We'll show you people nearby
                </p>
                <Select
                  value={profileData.location}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio" className="text-base">Tell us about yourself (optional)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Share your passions, what makes you unique, and what you're looking for.
              </p>
            </div>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="I love exploring new cultures, trying different cuisines, and connecting with people who share similar values. I'm passionate about..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground">
              {profileData.bio.length}/500 characters
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base">What are you interested in?</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select at least 3 interests that represent you
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {COMMON_INTERESTS.map((interest) => (
                <Button
                  key={interest}
                  variant={profileData.interests.includes(interest) ? "default" : "outline"}
                  onClick={() => toggleInterest(interest)}
                  className="justify-start h-auto py-3 text-sm"
                >
                  {interest}
                  {profileData.interests.includes(interest) && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>

            {profileData.interests.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Selected interests:</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                      <button
                        onClick={() => toggleInterest(interest)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base">What languages do you speak?</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select all languages you're comfortable with
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {COMMON_LANGUAGES.map((language) => (
                <Button
                  key={language}
                  variant={profileData.languages.includes(language) ? "default" : "outline"}
                  onClick={() => toggleLanguage(language)}
                  className="justify-start h-auto py-3 text-sm"
                >
                  {language}
                  {profileData.languages.includes(language) && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>

            {profileData.languages.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Selected languages:</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map((language) => (
                    <Badge key={language} variant="secondary">
                      {language}
                      <button
                        onClick={() => toggleLanguage(language)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base">Religious Background</Label>
              <p className="text-sm text-muted-foreground mb-4">
                This helps us find people who share similar values
              </p>
            </div>
            
            <div className="space-y-2">
              {RELIGION_OPTIONS.map((religion) => (
                <Button
                  key={religion}
                  variant={profileData.religion === religion ? "default" : "outline"}
                  onClick={() => setProfileData(prev => ({ ...prev, religion }))}
                  className="w-full justify-start h-auto py-4 text-left"
                >
                  {religion}
                  {profileData.religion === religion && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Age Range You're Looking For
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                {profileData.ageRangePreference[0]} - {profileData.ageRangePreference[1]} years old
              </p>
            </div>
            
            <Slider
              value={profileData.ageRangePreference}
              onValueChange={(value) => setProfileData(prev => ({ ...prev, ageRangePreference: value as [number, number] }))}
              max={60}
              min={18}
              step={1}
              className="w-full"
            />
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> You can always adjust these preferences later in your discovery filters.
              </p>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-base">Phone Number</Label>
              <p className="text-sm text-muted-foreground mb-3">
                This helps verify your account and enables better connections
              </p>
            </div>
            <Input
              id="phone"
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="+971 50 123 4567"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Your phone number will be kept private and only used for account verification.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-primary-foreground" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Hi {userName}! Let's set up your profile to find great matches.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Completing..." : "Complete Profile"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Touch */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground italic">
            "ሰላም ይሁንልህ - ተዋህዶ ያለበት ቦታ"
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            "Peace be with you - Where unity resides"
          </p>
        </div>
      </div>
    </div>
  )
}