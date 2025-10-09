import { useState, useEffect } from "react"
import { Heart, X, MapPin, Calendar, Star } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useKV } from "@github/spark/hooks"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  religion?: string
  ethnicity?: string
}

const sampleProfiles: UserProfile[] = [
  {
    id: "1",
    name: "Rahel",
    age: 27,
    location: "Dubai, UAE", 
    bio: "Coffee enthusiast from Addis. Love exploring new places and trying different cuisines. Looking for someone who shares my passion for travel and culture.",
    interests: ["Travel", "Coffee", "Photography", "Culture"],
    photos: ["https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop"],
    religion: "Orthodox",
    ethnicity: "Ethiopian"
  },
  {
    id: "2", 
    name: "Dawit",
    age: 30,
    location: "Riyadh, Saudi Arabia",
    bio: "Engineer by day, musician by night. Originally from Bahir Dar. Love hiking and playing traditional music. Seeking meaningful connections.",
    interests: ["Music", "Hiking", "Technology", "Traditional Arts"],
    photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"],
    religion: "Orthodox",
    ethnicity: "Ethiopian"
  },
  {
    id: "3",
    name: "Meron", 
    age: 25,
    location: "Kuwait City, Kuwait",
    bio: "Medical student who loves books and cooking traditional food. From Asmara. Looking for someone who appreciates deep conversations and family values.",
    interests: ["Medicine", "Cooking", "Reading", "Family"],
    photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop"],
    religion: "Catholic",
    ethnicity: "Eritrean"
  }
]

export default function DiscoverPage() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [matches, setMatches] = useKV<string[]>("user-matches", [])
  const [passes, setPasses] = useKV<string[]>("user-passes", [])
  
  const currentProfile = sampleProfiles[currentProfileIndex]
  
  const handleSwipe = (direction: "left" | "right") => {
    if (!currentProfile) return
    
    setSwipeDirection(direction)
    
    if (direction === "right") {
      setMatches(current => [...(current || []), currentProfile.id])
    } else {
      setPasses(current => [...(current || []), currentProfile.id])
    }
    
    setTimeout(() => {
      setCurrentProfileIndex(prev => prev + 1)
      setSwipeDirection(null)
    }, 300)
  }

  const resetProfiles = () => {
    setCurrentProfileIndex(0)
    setMatches([])
    setPasses([])
  }

  if (currentProfileIndex >= sampleProfiles.length) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-[280px] sm:w-[300px] md:w-[320px] text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">That's everyone for now!</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Check back later for more profiles in your area.
            </p>
            <Button onClick={resetProfiles} className="w-full">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentProfile) return null

  return (
    <div className="h-full flex flex-col p-3 md:p-6">
      <div className="flex-1 flex flex-col mx-auto w-full">
        {/* Profile Card - Fixed dimensions with mobile scaling */}
        <div className="flex-1 flex flex-col items-center justify-center mb-4">
          <Card className={cn(
            "overflow-hidden transition-transform duration-300 flex flex-col",
            // Fixed dimensions: 320px × 420px on desktop, scaled proportionally on mobile
            "w-[280px] h-[370px] sm:w-[300px] sm:h-[395px] md:w-[320px] md:h-[420px]",
            swipeDirection === "left" && "transform -translate-x-full rotate-12 opacity-0",
            swipeDirection === "right" && "transform translate-x-full -rotate-12 opacity-0"
          )}>
            <div className="flex-1 relative">
              <img 
                src={currentProfile.photos[0]} 
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Profile info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-white">{currentProfile.name}</h2>
                  <span className="text-lg md:text-xl text-white/90">{currentProfile.age}</span>
                </div>
                
                <div className="flex items-center gap-1 mb-3">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/80">{currentProfile.location}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {currentProfile.interests.slice(0, 3).map((interest) => (
                    <Badge 
                      key={interest} 
                      variant="secondary" 
                      className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 flex-shrink-0">
              <p className="text-foreground leading-relaxed text-sm mb-3">
                {currentProfile.bio}
              </p>
              
              <div className="flex gap-4 text-xs text-muted-foreground">
                {currentProfile.religion && (
                  <span>🕊️ {currentProfile.religion}</span>
                )}
                {currentProfile.ethnicity && (
                  <span>🌍 {currentProfile.ethnicity}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Mobile optimized */}
        <div className="flex items-center justify-center gap-4 px-2 pb-2">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground active:scale-95 transition-transform shadow-lg"
            onClick={() => handleSwipe("left")}
          >
            <X className="w-7 h-7" weight="bold" />
          </Button>
          
          <Button
            variant="outline"
            size="lg" 
            className="w-12 h-12 rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform shadow-lg"
          >
            <Star className="w-5 h-5" weight="fill" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-95 transition-transform shadow-lg"
            onClick={() => handleSwipe("right")}
          >
            <Heart className="w-7 h-7" weight="fill" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="text-center text-xs text-muted-foreground pb-1">
          {currentProfileIndex + 1} of {sampleProfiles.length}
        </div>
      </div>
    </div>
  )
}