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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-6">
              Start discovering people to find your perfect match!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Matches</h1>
        <p className="text-muted-foreground">
          You have {filteredMatches.length} mutual {filteredMatches.length === 1 ? 'match' : 'matches'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((match) => (
          <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative">
              <img 
                src={match.photo} 
                alt={match.name}
                className="w-full h-full object-cover"
              />
              
              {/* Match indicator */}
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-primary-foreground" weight="fill" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{match.name}</h3>
                <span className="text-xs text-muted-foreground">{match.matchedAt}</span>
              </div>
              
              {match.lastMessage && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {match.lastMessage}
                </p>
              )}
              
              <Button 
                onClick={() => onStartChat(match.id)}
                className="w-full"
              >
                <ChatCircle className="w-4 h-4 mr-2" />
                {match.lastMessage ? 'Continue Chat' : 'Start Conversation'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New matches celebration */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          ✨ Keep swiping to find more amazing connections!
        </p>
      </div>
    </div>
  )
}