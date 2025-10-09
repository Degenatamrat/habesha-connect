import { Heart, ChatCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useKV } from "@github/spark/hooks"

interface Match {
  id: string
  name: string
  photo: string
  lastMessage?: string
  matchedAt: string
}

const sampleMatches: Match[] = [
  {
    id: "1",
    name: "Rahel",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop",
    lastMessage: "Hey! How are you doing? 😊",
    matchedAt: "2 hours ago"
  },
  {
    id: "3", 
    name: "Meron",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    lastMessage: "Nice to meet you!",
    matchedAt: "1 day ago"
  }
]

interface MatchesPageProps {
  onStartChat: (matchId: string) => void
}

export default function MatchesPage({ onStartChat }: MatchesPageProps) {
  const [userMatches] = useKV<string[]>("user-matches", [])

  const filteredMatches = sampleMatches.filter(match => 
    userMatches?.includes(match.id)
  )

  if (!filteredMatches.length) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Start discovering people to find your perfect match!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 pb-2">
        <h1 className="text-xl font-bold text-foreground mb-1">Your Matches</h1>
        <p className="text-muted-foreground text-sm">
          You have {filteredMatches.length} mutual {filteredMatches.length === 1 ? 'match' : 'matches'}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow active:scale-95 transition-transform">
              <div className="aspect-square relative">
                <img 
                  src={match.photo} 
                  alt={match.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Match indicator */}
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-3 h-3 text-primary-foreground" weight="fill" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm truncate">{match.name}</h3>
                  <span className="text-xs text-muted-foreground">{match.matchedAt}</span>
                </div>
                
                {match.lastMessage && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {match.lastMessage}
                  </p>
                )}
                
                <Button 
                  onClick={() => onStartChat(match.id)}
                  className="w-full"
                  size="sm"
                >
                  <ChatCircle className="w-3 h-3 mr-1" />
                  <span className="text-xs">{match.lastMessage ? 'Chat' : 'Start'}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New matches celebration */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            ✨ Keep swiping to find more amazing connections!
          </p>
        </div>
      </div>
    </div>
  )
}