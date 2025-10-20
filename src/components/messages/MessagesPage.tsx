import { useState, useRef, useEffect } from "react"
import { PaperPlaneRight, Image, Microphone, ArrowLeft, DotsThreeVertical } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useKV } from "@github/spark/hooks"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  type: "text" | "image" | "audio"
  imageUrl?: string
  audioUrl?: string
  audioDuration?: number
}

interface Chat {
  id: string
  matchId: string
  matchName: string
  matchPhoto?: string
  messages: Message[]
  lastActive: string
}

interface MessagesPageProps {
  activeMatchId?: string
  onBackToMatches?: () => void
  onStartChat?: (matchId: string) => void
}

export default function MessagesPage({ activeMatchId, onBackToMatches, onStartChat }: MessagesPageProps) {
  const [chats, setChats] = useKV<Chat[]>("user-chats", [])
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const activeChat = chats?.find((c) => c.matchId === activeMatchId)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => scrollToBottom(), [activeChat?.messages])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  // ---------- Send Message ----------
  const sendMessage = () => {
    if (!newMessage.trim()) return
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    }

    if (activeChat) {
      setChats((prev) =>
        (prev || []).map((c) =>
          c.id === activeChat.id ? { ...c, messages: [...c.messages, msg] } : c
        )
      )
    } else {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        matchId: "temp",
        matchName: "Someone",
        messages: [msg],
        lastActive: "Online",
      }
      setChats([...(chats || []), newChat])
    }

    setNewMessage("")
    scrollToBottom()
  }

  // ---------- Image Upload ----------
  const handleImageUpload = () => fileInputRef.current?.click()
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file")
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB")

    const imageUrl = URL.createObjectURL(file)
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "image",
      imageUrl,
    }

    if (activeChat) {
      setChats((prev) =>
        (prev || []).map((c) =>
          c.id === activeChat.id ? { ...c, messages: [...c.messages, msg] } : c
        )
      )
    }
    toast.success("Image sent!")
    e.target.value = ""
  }

  // ---------- Audio Recording ----------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      recorder.start()

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setRecordedBlob(audioBlob)
        setRecordedAudioUrl(url)
        setRecordingTime(0)
        stream.getTracks().forEach((t) => t.stop())
      }

      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch {
      toast.error("Microphone access denied")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    clearInterval(recordingIntervalRef.current!)
    setIsRecording(false)
  }

  const sendAudio = () => {
    if (!recordedAudioUrl) return
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "audio",
      audioUrl: recordedAudioUrl,
      audioDuration: recordingTime,
    }
    if (activeChat) {
      setChats((prev) =>
        (prev || []).map((c) =>
          c.id === activeChat.id ? { ...c, messages: [...c.messages, msg] } : c
        )
      )
    }
    setRecordedAudioUrl(null)
    setRecordedBlob(null)
    toast.success("Voice message sent!")
  }

  // ---------- UI ----------
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        {activeChat && (
          <Button variant="ghost" size="sm" onClick={onBackToMatches}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        {activeChat && (
          <>
            <img
              src={activeChat.matchPhoto || "https://via.placeholder.com/100?text=User"}
              alt={activeChat.matchName}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">{activeChat.matchName}</h2>
              <p className="text-xs text-muted-foreground">{activeChat.lastActive}</p>
            </div>
            <DotsThreeVertical className="w-5 h-5 opacity-70" />
          </>
        )}
        {!activeChat && <h2 className="font-semibold text-base">Messages</h2>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
        {activeChat?.messages?.length ? (
          activeChat.messages.map((m) => (
            <div key={m.id} className={cn("flex", m.senderId === "me" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl shadow-sm",
                  m.senderId === "me"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/50 rounded-bl-md"
                )}
              >
                {m.type === "text" && (
                  <div className="px-3 py-2">
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  </div>
                )}
                {m.type === "image" && m.imageUrl && (
                  <img src={m.imageUrl} alt="Sent" className="max-w-full rounded-xl max-h-64 object-cover" />
                )}
                {m.type === "audio" && m.audioUrl && (
                  <div className="px-3 py-2 flex items-center gap-2">
                    <Microphone className="w-4 h-4 opacity-70" />
                    <audio controls className="h-8 w-full" style={{ maxWidth: "200px" }}>
                      <source src={m.audioUrl} type="audio/wav" />
                    </audio>
                    {m.audioDuration && <span className="text-xs opacity-70">{formatTime(m.audioDuration)}</span>}
                  </div>
                )}
                <div className="px-3 pb-2 text-xs text-muted-foreground/70">{m.timestamp}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="mb-2 text-sm">Start a conversation 💬</p>
            <p className="text-xs opacity-70">Type something below to begin</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — always visible */}
      <div className="bg-card/90 backdrop-blur-sm border-t p-3 flex items-end gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <Button variant="ghost" size="sm" onClick={handleImageUpload}>
          <Image className="w-5 h-5" />
        </Button>

        {isRecording ? (
          <Button variant="destructive" size="sm" onClick={stopRecording}>
            ⏺ Stop ({formatTime(recordingTime)})
          </Button>
        ) : recordedAudioUrl ? (
          <Button variant="outline" size="sm" onClick={sendAudio}>
            🎤 Send
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={startRecording}>
            <Microphone className="w-5 h-5" />
          </Button>
        )}

        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="rounded-2xl bg-muted/40 border-0 focus-visible:ring-1 flex-1 py-2"
        />

        <Button onClick={sendMessage} size="sm" className="rounded-full w-10 h-10">
          <PaperPlaneRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
