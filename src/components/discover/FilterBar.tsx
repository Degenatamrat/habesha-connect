import { useState } from "react"
import { SlidersHorizontal, MapPin, Calendar, Heart } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterOptions {
  ageRange: [number, number]
  location: string
  interests: string[]
  religion: string[]
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void
}

const interestOptions = [
  "Travel", "Coffee", "Photography", "Culture", "Music", "Hiking", 
  "Technology", "Traditional Arts", "Medicine", "Cooking", "Reading", 
  "Family", "Sports", "Art", "Movies", "Dancing"
]

const religionOptions = [
  "Orthodox", "Catholic", "Protestant", "Muslim", "Non-religious"
]

const locationOptions = [
  "All Locations",
  "Dubai, UAE",
  "Riyadh, Saudi Arabia", 
  "Kuwait City, Kuwait",
  "Doha, Qatar",
  "Abu Dhabi, UAE",
  "Jeddah, Saudi Arabia",
  "Manama, Bahrain",
  "Muscat, Oman"
]

export default function FilterBar({ onFiltersChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 50],
    location: "All Locations",
    interests: [],
    religion: []
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
    
    // Count active filters
    let count = 0
    if (updatedFilters.location !== "All Locations") count++
    if (updatedFilters.interests.length > 0) count++
    if (updatedFilters.religion.length > 0) count++
    if (updatedFilters.ageRange[0] !== 18 || updatedFilters.ageRange[1] !== 50) count++
    
    setActiveFiltersCount(count)
  }

  const clearFilters = () => {
    const defaultFilters = {
      ageRange: [18, 50] as [number, number],
      location: "All Locations",
      interests: [],
      religion: []
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    setActiveFiltersCount(0)
  }

  const toggleArrayFilter = (category: keyof Pick<FilterOptions, 'interests' | 'religion'>, value: string) => {
    const currentArray = filters[category]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilters({ [category]: newArray })
  }

  return (
    <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      {/* Left side - Active filters indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filters.location === "All Locations" ? "Nearby" : filters.location.split(",")[0]}
          </span>
        </div>
        
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Right side - Filter controls */}
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Preferences</SheetTitle>
              <SheetDescription>
                Customize your discovery preferences to find better matches.
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              {/* Age Range */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                </h3>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => updateFilters({ ageRange: value as [number, number] })}
                  max={60}
                  min={18}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </h3>
                <Select
                  value={filters.location}
                  onValueChange={(value) => updateFilters({ location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Interests
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={filters.interests.includes(interest)}
                        onCheckedChange={() => toggleArrayFilter('interests', interest)}
                      />
                      <label
                        htmlFor={`interest-${interest}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Religion */}
              <div>
                <h3 className="font-medium mb-3">Religion</h3>
                <div className="space-y-2">
                  {religionOptions.map((religion) => (
                    <div key={religion} className="flex items-center space-x-2">
                      <Checkbox
                        id={`religion-${religion}`}
                        checked={filters.religion.includes(religion)}
                        onCheckedChange={() => toggleArrayFilter('religion', religion)}
                      />
                      <label
                        htmlFor={`religion-${religion}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {religion}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}