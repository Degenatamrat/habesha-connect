import { useState, useRef, useEffect } from "react"
import { PaperPlaneRight, Image, Microphone, ArrowLeft, DotsThreeVertical, Check, X, Trash, User } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useKV } from "@github/spark/hooks"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  type: 'text' | 'image' | 'audio'
  imageUrl?: string
  audioUrl?: string
  audioDuration?: number
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
  onStartChat?: (matchId: string) => void
}

export default function MessagesPage({ activeMatchId, onBackToMatches, onStartChat }: MessagesPageProps) {
  const [chats, setChats] = useKV<Chat[]>("user-chats", sampleChats)
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showRecordingControls, setShowRecordingControls] = useState(false)
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const isMobile = useIsMobile()

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

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeChat) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image must be less than 5MB")
      return
    }

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file)
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'image',
      imageUrl: imageUrl
    }

    setChats(currentChats => 
      (currentChats || []).map(chat => 
        chat.id === activeChat.id 
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    )

    toast.success("Image sent!")
    // Reset file input
    e.target.value = ""
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setRecordedAudioBlob(audioBlob)
        setRecordedAudioUrl(audioUrl)
        setShowRecordingControls(true)
      }
      
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  const handleRecordingStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isMobile) {
      // Desktop: Click to start/stop recording
      if (isRecording) {
        stopRecording()
      } else {
        startRecording()
      }
    } else {
      // Mobile: Hold to record
      startRecording()
    }
  }

  const handleRecordingEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (isMobile && isRecording) {
      // Mobile: Release to send
      stopRecording()
    }
    // Desktop: Do nothing on mouse up since we handle click to start/stop
  }

  const sendRecordedMessage = () => {
    if (!recordedAudioUrl || !activeChat || recordingTime === 0) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'audio',
      audioUrl: recordedAudioUrl,
      audioDuration: recordingTime
    }

    setChats(currentChats => 
      (currentChats || []).map(chat => 
        chat.id === activeChat.id 
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    )
    
    toast.success("Voice message sent!")
    cancelRecording()
  }

  const cancelRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl)
    }
    setRecordedAudioBlob(null)
    setRecordedAudioUrl(null)
    setShowRecordingControls(false)
    setRecordingTime(0)
  }

  const handleProfileClick = (matchId: string) => {
    // Navigate to the profile or start a new chat with this person
    if (onStartChat) {
      onStartChat(matchId)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
                    <CardContent className="p-3" onClick={() => onStartChat?.(chat.matchId)}>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div 
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProfileClick(chat.matchId)
                            }}
                          >
                            <img 
                              src={chat.matchPhoto} 
                              alt={chat.matchName}
                              className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary/50 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors flex items-center justify-center">
                              <User className="w-3 h-3 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                            </div>
                          </div>
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
          
          <div 
            className="relative cursor-pointer group"
            onClick={() => handleProfileClick(activeChat.matchId)}
          >
            <img 
              src={activeChat.matchPhoto} 
              alt={activeChat.matchName}
              className="w-9 h-9 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary/50 transition-all"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors flex items-center justify-center">
              <User className="w-4 h-4 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
          </div>
          
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
              "max-w-[85%] rounded-2xl shadow-sm",
              message.senderId === "me" 
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card text-foreground rounded-bl-md border border-border/50"
            )}>
              {message.type === 'text' && (
                <div className="px-3 py-2">
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              )}
              
              {message.type === 'image' && message.imageUrl && (
                <div className="p-1">
                  <img 
                    src={message.imageUrl} 
                    alt="Shared image" 
                    className="max-w-full rounded-xl max-h-64 object-cover"
                  />
                </div>
              )}
              
              {message.type === 'audio' && message.audioUrl && (
                <div className="px-3 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center">
                    <Microphone className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <audio controls className="w-full h-8" style={{ maxWidth: '200px' }}>
                      <source src={message.audioUrl} type="audio/wav" />
                    </audio>
                  </div>
                  {message.audioDuration && (
                    <span className="text-xs opacity-70">{formatTime(message.audioDuration)}</span>
                  )}
                </div>
              )}
              
              <div className={cn(
                "px-3 pb-2 pt-0",
                message.type === 'image' && "pt-1"
              )}>
                <p className={cn(
                  "text-xs",
                  message.senderId === "me" 
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50 p-3 flex-shrink-0 safe-area-inset-bottom">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        
        {/* Recording Controls - Show when audio is recorded */}
        {showRecordingControls && recordedAudioUrl && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-2xl mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Microphone className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Voice message ({formatTime(recordingTime)})</span>
              <audio controls className="flex-1 max-w-xs h-8">
                <source src={recordedAudioUrl} type="audio/wav" />
              </audio>
            </div>
            <Button 
              onClick={sendRecordedMessage}
              size="sm" 
              className="rounded-full w-10 h-10 p-0"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              onClick={cancelRecording}
              size="sm" 
              variant="outline"
              className="rounded-full w-10 h-10 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Recording Indicator - Show while recording */}
        {isRecording && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-2xl mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-destructive font-medium">
                Recording: {formatTime(recordingTime)}
              </span>
              <div className="flex-1 bg-red-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {isMobile ? "Release to send" : "Click mic to stop"}
            </span>
          </div>
        )}
        
        {/* Text Input - Always show unless actively recording */}
        {!isRecording && (
          <div className="flex items-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 flex-shrink-0"
              onClick={handleImageUpload}
            >
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
            
            {/* Send button for text messages - always show when there's text */}
            {newMessage.trim() && (
              <Button 
                onClick={sendMessage}
                variant="default"
                size="sm"
                className="p-2 flex-shrink-0 rounded-full w-10 h-10"
              >
                <PaperPlaneRight className="w-4 h-4" />
              </Button>
            )}
            
            {/* Voice recording button - show when no text and no recording controls */}
            {!newMessage.trim() && !showRecordingControls && (
              <Button 
                onMouseDown={isMobile ? handleRecordingStart : undefined}
                onMouseUp={isMobile ? handleRecordingEnd : undefined}
                onMouseLeave={isMobile ? handleRecordingEnd : undefined}
                onTouchStart={isMobile ? handleRecordingStart : undefined}
                onTouchEnd={isMobile ? handleRecordingEnd : undefined}
                onClick={!isMobile ? handleRecordingStart : undefined}
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2 flex-shrink-0 rounded-full w-10 h-10 select-none",
                  isRecording && "bg-destructive/20 text-destructive"
                )}
                title={isMobile ? "Hold to record voice message" : isRecording ? "Click to stop recording" : "Click to start recording"}
              >
                <Microphone className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}