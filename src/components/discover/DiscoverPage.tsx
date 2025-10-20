import { useState, useEffect } from "react"
import { Heart, X, Star, SlidersHorizontal, Crosshair, ChatCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useKV } from "@github/spark/hooks"

// ---------- Types ----------
interface FilterOptions {
  ageRange: [number, number]
  distanceKm: number
  interests: string[]
  religion: string[]
  location?: { lat: number; lon: number; city?: string; country?: string }
}

interface UserProfile {
  id: string
  name: string
  age: number
  bio: string
  location: { lat: number; lon: number; city: string; country: string }
  interests: string[]
  religion?: string
  photo?: string
}

// ---------- Utility ----------
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const formatDistance = (km: number, country?: string) => {
  if (!country) return `${km.toFixed(1)} km away`
  const isUS = ["US", "USA", "United States"].includes(country)
  return isUS ? `${(km * 0.621371).toFixed(1)} mi away` : `${km.toFixed(1)} km away`
}

// ---------- Component ----------
export default function DiscoverPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [20, 40],
    distanceKm: 50,
    interests: [],
    religion: [],
  })
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [messages, setMessages] = useKV<Record<string, string[]>>("discover-messages", {})
  const currentProfile = profiles[currentProfileIndex]

  // ---------- GPS ----------
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await res.json()
          setFilters((prev) => ({
            ...prev,
            location: {
              lat: latitude,
              lon: longitude,
              city: data.city || "Unknown",
              country: data.countryCode || data.countryName || "",
            },
          }))
          setLocationError(null)
        } catch {
          setLocationError("Unable to detect location.")
        }
      },
      () => setLocationError("Location permission denied.")
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  // ---------- Filter Logic ----------
  const handleApplyFilters = () => {
    if (!filters.location) return
    const mockProfiles: UserProfile[] = [
      {
        id: "1",
        name: "Mina",
        age: 28,
        bio: "Love art, food, and travel ✈️",
        location: { lat: filters.location.lat + 0.02, lon: filters.location.lon + 0.01, city: "Dubai", country: "AE" },
        interests: ["Art", "Coffee"],
        religion: "Orthodox",
        photo: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=500&fit=crop",
      },
      {
        id: "2",
        name: "Daniel",
        age: 31,
        bio: "Adventurer 🌍 hiking and stories.",
        location: { lat: filters.location.lat + 0.1, lon: filters.location.lon + 0.08, city: "Sharjah", country: "AE" },
        interests: ["Travel", "Hiking"],
        religion: "Orthodox",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      },
    ]
    setProfiles(mockProfiles)
    setCurrentProfileIndex(0)
    setIsFilterOpen(false)
  }

  const handleSwipe = (dir: "left" | "right") => {
    if (!currentProfile) return
    setSwipeDirection(dir)
    setTimeout(() => {
      setCurrentProfileIndex((i) => i + 1)
      setSwipeDirection(null)
      setIsChatOpen(false)
    }, 300)
  }

  const sendMessage = () => {
    if (!currentProfile || !newMessage.trim()) return
    setMessages((prev) => ({
      ...prev,
      [currentProfile.id]: [...(prev?.[currentProfile.id] || []), newMessage.trim()],
    }))
    setNewMessage("")
    setIsChatOpen(false)
  }

  // ---------- UI ----------
  return (
    <div className="h-full flex flex-col p-3 relative">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Discover</h2>
        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
          <SlidersHorizontal className="w-4 h-4 mr-1" /> Filter
        </Button>
      </div>

      {/* Profiles */}
      {!currentProfile ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No profiles available. Tap Filter to refresh.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <Card
            className={cn(
              "overflow-hidden transition-transform duration-300 flex flex-col",
              "w-[280px] h-[370px] sm:w-[300px] sm:h-[395px] md:w-[320px] md:h-[420px]",
              swipeDirection === "left" && "transform -translate-x-full rotate-12 opacity-0",
              swipeDirection === "right" && "transform translate-x-full -rotate-12 opacity-0"
            )}
          >
            <div className="relative flex-1">
              <img src={currentProfile.photo} alt={currentProfile.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-lg font-semibold text-white">
                  {currentProfile.name}, {currentProfile.age}
                </h3>
                {filters.location && (
                  <p className="text-xs text-white/90">
                    {formatDistance(
                      haversine(
                        filters.location.lat,
                        filters.location.lon,
                        currentProfile.location.lat,
                        currentProfile.location.lon
                      ),
                      filters.location.country
                    )}
                  </p>
                )}
              </div>
            </div>
            <CardContent className="p-3 text-sm">
              <p className="text-muted-foreground">{currentProfile.bio}</p>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleSwipe("left")}
            >
              <X className="w-7 h-7" weight="bold" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Star className="w-5 h-5" weight="fill" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full border-muted text-muted-foreground hover:bg-muted"
              onClick={() => setIsChatOpen((prev) => !prev)}
            >
              <ChatCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleSwipe("right")}
            >
              <Heart className="w-7 h-7" weight="fill" />
            </Button>
          </div>

          {/* Chat popup */}
          {isChatOpen && (
            <div className="absolute bottom-24 bg-background border border-border rounded-xl shadow-lg p-3 w-72 sm:w-80 z-50">
              <h4 className="font-medium text-sm mb-2">
                Message {currentProfile.name}
              </h4>
              <div className="mb-2 max-h-24 overflow-auto text-xs text-muted-foreground space-y-1">
                {(messages?.[currentProfile.id] || []).map((msg, idx) => (
                  <p key={idx} className="bg-muted px-2 py-1 rounded-lg w-fit">
                    {msg}
                  </p>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="text-sm"
                />
                <Button onClick={sendMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground mt-2">
            {currentProfileIndex + 1} of {profiles.length}
          </div>
        </div>
      )}

      {/* Overlay for bottom sheet */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsFilterOpen(false)}
        ></div>
      )}

      {/* Bottom sheet filter */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background z-50 rounded-t-2xl shadow-lg transition-transform duration-300",
          isFilterOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="p-4 space-y-3 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)}>
              Close
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={getLocation}>
            <Crosshair className="w-3 h-3 mr-1" />
            {filters.location ? "Refresh Location" : "Allow Location"}
          </Button>

          {filters.location && (
            <p className="text-xs text-muted-foreground">
              📍 {filters.location.city || "Unknown"}, {filters.location.country || ""}
            </p>
          )}
          {locationError && <p className="text-xs text-destructive">{locationError}</p>}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block mb-1 text-muted-foreground">Age Range</label>
              <input
                type="range"
                min="18"
                max="60"
                value={filters.ageRange[0]}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, ageRange: [Number(e.target.value), f.ageRange[1]] }))
                }
              />
              <input
                type="range"
                min="18"
                max="60"
                value={filters.ageRange[1]}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, ageRange: [f.ageRange[0], Number(e.target.value)] }))
                }
              />
              <p className="text-xs">
                {filters.ageRange[0]} - {filters.ageRange[1]}
              </p>
            </div>

            <div>
              <label className="block mb-1 text-muted-foreground">Max Distance (km)</label>
              <input
                type="range"
                min="1"
                max="200"
                value={filters.distanceKm}
                onChange={(e) => setFilters((f) => ({ ...f, distanceKm: Number(e.target.value) }))}
              />
              <p className="text-xs">{filters.distanceKm} km</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setFilters({ ageRange: [20, 40], distanceKm: 50, interests: [], religion: [] })}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
