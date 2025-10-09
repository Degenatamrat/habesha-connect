import { useState, useRef, useEffect } from "react"
import { PaperPlaneRight, Image, Microphone, ArrowLeft, DotsThreeVertical } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useKV } from "@github/spark/hooks"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  type: 'text' | 'image' | 'audio'
}

interface Chat {
  id: string
  matchId: string
  matchName: string
  matchPhoto: string
  messages: Message[]
  lastActive: string
}

const sampleChats: Chat[] = [
  {
    id: "chat-1",
    matchId: "1", 
    matchName: "Rahel",
    matchPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop",
    lastActive: "Online",
    messages: [
      {
        id: "msg-1",
        senderId: "1",
        text: "Hey! How are you doing? 😊",
        timestamp: "2:30 PM",
        type: 'text'
      },
      {
        id: "msg-2", 
        senderId: "me",
        text: "Hi Rahel! I'm doing great, thanks for asking. How about you?",
        timestamp: "2:32 PM",
        type: 'text'
      },
      {
        id: "msg-3",
        senderId: "1", 
        text: "I'm wonderful! I saw you love coffee too. Have you tried the Ethiopian coffee place in DIFC?",
        timestamp: "2:35 PM",
        type: 'text'
      }
    ]
  },
  {
    id: "chat-3",
    matchId: "3",
    matchName: "Meron", 
    matchPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    lastActive: "2 hours ago",
    messages: [
      {
        id: "msg-4",
        senderId: "3",
        text: "Nice to meet you! I love your photos from the hiking trip.",
        timestamp: "Yesterday",
        type: 'text'
      }
    ]
  }
]

interface MessagesPageProps {
  activeMatchId?: string
  onBackToMatches?: () => void
}

export default function MessagesPage({ activeMatchId, onBackToMatches }: MessagesPageProps) {
  const [chats, setChats] = useKV<Chat[]>("user-chats", sampleChats)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = chats?.find(chat => chat.matchId === activeMatchId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeChat?.messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }

    setChats(currentChats => 
      (currentChats || []).map(chat => 
        chat.id === activeChat.id 
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    )

    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Chat List View
  if (!activeMatchId) {
    const userChats = chats || []
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-4 pb-2">
          <h1 className="text-xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-muted-foreground text-sm">
            {userChats.length} active {userChats.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-4">
          {userChats.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Card className="text-center w-full max-w-sm">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <PaperPlaneRight className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Start a conversation with your matches!
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-2">
              {userChats.map((chat) => {
                const lastMessage = chat.messages[chat.messages.length - 1]
                return (
                  <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer active:scale-98 transition-transform">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={chat.matchPhoto} 
                            alt={chat.matchName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {chat.lastActive === "Online" && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate text-sm">{chat.matchName}</h3>
                            <span className="text-xs text-muted-foreground">{chat.lastActive}</span>
                          </div>
                          {lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {lastMessage.senderId === "me" ? "You: " : ""}{lastMessage.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Individual Chat View
  if (!activeChat) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBackToMatches} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <img 
            src={activeChat.matchPhoto} 
            alt={activeChat.matchName}
            className="w-9 h-9 rounded-full object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{activeChat.matchName}</h2>
            <p className="text-xs text-muted-foreground truncate">{activeChat.lastActive}</p>
          </div>
          
          <Button variant="ghost" size="sm" className="p-1">
            <DotsThreeVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
        {activeChat.messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "flex",
              message.senderId === "me" ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 shadow-sm",
              message.senderId === "me" 
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card text-foreground rounded-bl-md border border-border/50"
            )}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={cn(
                "text-xs mt-1",
                message.senderId === "me" 
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50 p-3 flex-shrink-0 safe-area-inset-bottom">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
            <Image className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="border-0 focus-visible:ring-1 rounded-2xl bg-muted/50 resize-none min-h-[40px] py-2"
            />
          </div>
          
          <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
            <Microphone className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="p-2 flex-shrink-0 rounded-full w-10 h-10"
          >
            <PaperPlaneRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}