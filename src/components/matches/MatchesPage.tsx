import { Heart, UserPlus, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useKV } from "@github/spark/hooks"
import { useState } from "react"

/**
 * Represents a single user who liked you.
 */
interface Like {
  id: string
  name: string
  photo: string
  likedAt: string
}

/**
 * Sample placeholder data — replace with backend API later.
 */
const sampleLikes: Like[] = [
  {
    id: "1",
    name: "Rahel",
    photo:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop",
    likedAt: "2 hours ago",
  },
  {
    id: "3",
    name: "Meron",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    likedAt: "1 day ago",
  },
]

interface LikedYouPageProps {
  onLikeBack: (userId: string) => void
  onDismiss?: (userId: string) => void
}

/**
 * LikedYouPage — shows users who liked you (one-way likes),
 * allows you to "Like back" or "Pass".
 */
export default function LikedYouPage({
  onLikeBack,
  onDismiss,
}: LikedYouPageProps) {
  const [likedYouList, setLikedYouList] = useKV<string[]>("liked-you", [])
  const [dismissedList, setDismissedList] = useKV<string[]>("dismissed", [])
  const [animatingIds, setAnimatingIds] = useState<string[]>([])

  // Show all likes not yet liked back or dismissed
  const filteredLikes = sampleLikes.filter(
    (like) =>
      !likedYouList.includes(like.id) && !dismissedList.includes(like.id)
  )

  const handleLikeBack = (id: string) => {
    setAnimatingIds((prev) => [...prev, id])
    setTimeout(() => {
      setLikedYouList([...likedYouList, id])
      onLikeBack(id)
      setAnimatingIds((prev) => prev.filter((x) => x !== id))
    }, 400)
  }

  const handleDismiss = (id: string) => {
    setAnimatingIds((prev) => [...prev, id])
    setTimeout(() => {
      setDismissedList([...dismissedList, id])
      onDismiss?.(id)
      setAnimatingIds((prev) => prev.filter((x) => x !== id))
    }, 400)
  }

  if (!filteredLikes.length) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-[280px] sm:w-[300px] md:w-[320px] text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No likes yet</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              People who like you will appear here. Keep discovering new
              profiles!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-2">
        <h1 className="text-xl font-bold text-foreground mb-1">Liked You</h1>
        <p className="text-muted-foreground text-sm">
          {filteredLikes.length}{" "}
          {filteredLikes.length === 1
            ? "person likes you"
            : "people like you"}
        </p>
      </div>

      {/* Main grid */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredLikes.map((like) => (
            <Card
              key={like.id}
              className={`overflow-hidden hover:shadow-lg transition-all transform ${
                animatingIds.includes(like.id)
                  ? "opacity-0 scale-90 duration-500"
                  : "opacity-100 scale-100 duration-300"
              }`}
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={like.photo}
                  alt={like.name}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/200x200?text=Profile"
                  }}
                  className="w-full h-full object-cover"
                />

                {/* pink heart icon */}
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-3 h-3 text-white" weight="fill" />
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm truncate">
                    {like.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {like.likedAt}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleLikeBack(like.id)}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                    size="sm"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    <span className="text-xs">Like back</span>
                  </Button>

                  <Button
                    onClick={() => handleDismiss(like.id)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                    size="sm"
                  >
                    <X className="w-3 h-3 mr-1" />
                    <span className="text-xs">Pass</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            💖 Keep exploring — liking back creates a match so you can start
            chatting!
          </p>
        </div>
      </div>
    </div>
  )
}
