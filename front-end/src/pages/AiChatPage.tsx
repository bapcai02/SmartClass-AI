import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react'
import { 
  sendMessage, 
  getContext,
  getSessions,
  getSession,
  createSession,
  deleteSession,
  getChatStats,
  type ChatMessage, 
  type ChatRequest,
  type ChatSession,
} from '@/api/aiChat'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function AiChatPage() {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showContext, setShowContext] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const { data: context } = useQuery({
    queryKey: ['ai-context'],
    queryFn: getContext,
  })

  const { data: sessions } = useQuery({
    queryKey: ['ai-sessions'],
    queryFn: getSessions,
  })

  const { data: chatStats } = useQuery({
    queryKey: ['ai-stats'],
    queryFn: getChatStats,
  })

  const chatMutation = useMutation({
    mutationFn: sendMessage,
    onMutate: () => {
      setIsTyping(true)
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString(),
        imageUrl: imagePreviewUrl || undefined,
      }
      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
    },
    onSuccess: (data) => {
      setIsTyping(false)
      if (data.success && data.response) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp,
        }
        setMessages(prev => [...prev, aiMessage])
        
        // Update current session ID if provided
        if (data.session_id) {
          setCurrentSessionId(data.session_id)
          // refresh sessions list so the active thread appears/updates
          queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    },
    onError: () => {
      setIsTyping(false)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    },
  })

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return

    const conversationHistory = messages
      .filter(msg => msg.role !== 'assistant' || !msg.isTyping)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

    const payload: ChatRequest = {
      message: inputMessage.trim(),
      conversation_history: conversationHistory,
      context: context ? `Current classes: ${context.current_classes.join(', ')}. Recent topics: ${context.recent_topics.join(', ')}. Upcoming assignments: ${context.upcoming_assignments.join(', ')}.` : undefined,
      session_id: currentSessionId || undefined,
    }

    if (attachedImage) {
      payload.imageFile = attachedImage
    }

    chatMutation.mutate(payload)
    if (attachedImage) {
      setAttachedImage(null)
      setImagePreviewUrl(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setCurrentSessionId(null)
    setAttachedImage(null)
    setImagePreviewUrl(null)
  }

  const loadSession = async (sessionId: number) => {
    try {
      const data = await getSession(sessionId)
      const sessionMessages: ChatMessage[] = []
      
      data.conversations.forEach((conv) => {
        if (conv.message_type === 'user') {
          sessionMessages.push({
            id: `user-${conv.id}`,
            role: 'user',
            content: conv.message,
            timestamp: conv.created_at,
            imageUrl: conv.image_url || undefined,
          })
        } else if (conv.message_type === 'assistant' && conv.response) {
          sessionMessages.push({
            id: `assistant-${conv.id}`,
            role: 'assistant',
            content: conv.response,
            timestamp: conv.created_at,
          })
        }
      })
      
      setMessages(sessionMessages)
      setCurrentSessionId(sessionId)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const data = await createSession({ title: 'New Chat' })
      setCurrentSessionId(data.session.id)
      setMessages([])
      // focus the input after creating a new chat
      setTimeout(() => inputRef.current?.focus(), 0)
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const deleteSessionById = async (sessionId: number) => {
    try {
      await deleteSession(sessionId)
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setMessages([])
      }
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const groupSessionsByDate = (items: ChatSession[]) => {
    const groups: Record<string, ChatSession[]> = { 'Hôm nay': [], 'Hôm qua': [], 'Tuần này': [], 'Cũ hơn': [] }
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)
    const startOfWeek = new Date(startOfToday)
    const day = startOfWeek.getDay() || 7
    startOfWeek.setDate(startOfWeek.getDate() - (day - 1))

    items.forEach((s) => {
      const d = new Date(s.last_message_at || s.id)
      if (d >= startOfToday) groups['Hôm nay'].push(s)
      else if (d >= startOfYesterday) groups['Hôm qua'].push(s)
      else if (d >= startOfWeek) groups['Tuần này'].push(s)
      else groups['Cũ hơn'].push(s)
    })
    return groups
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SmartClass AI
              </h1>
            </div>
            <Button
              onClick={createNewSession}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
            >
              New Chat
            </Button>
          </div>
          <p className="text-slate-600 text-center">Your intelligent learning companion powered by Gemini</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Context Panel */}
            {context && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Your Context</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowContext(!showContext)}
                    className="text-black hover:bg-black hover:text-white"
                  >
                    {showContext ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {showContext && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-slate-700 mb-1">Current Classes</div>
                      <div className="text-slate-600">{context.current_classes.join(', ')}</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-700 mb-1">Recent Topics</div>
                      <div className="text-slate-600">{context.recent_topics.join(', ')}</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-700 mb-1">Upcoming</div>
                      <div className="text-slate-600">{context.upcoming_assignments.join(', ')}</div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Suggestions removed */}

            {/* Chat Stats */}
            {chatStats && (
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Your Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Sessions</span>
                    <span className="font-medium">{chatStats.total_sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Messages</span>
                    <span className="font-medium">{chatStats.total_messages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Active Sessions</span>
                    <span className="font-medium">{chatStats.active_sessions}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Chat Sessions - always visible like ChatGPT threads */}
            {sessions && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Luồng chat</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewSession}
                    className="text-black hover:bg-black hover:text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> New Chat
                  </Button>
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {Object.entries(groupSessionsByDate(sessions.sessions)).map(([label, list]) => (
                    list.length > 0 && (
                      <div key={label}>
                        <div className="px-1 pb-1 text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
                        <div className="space-y-2">
                          {list.map((session) => (
                            <div
                              key={session.id}
                              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                currentSessionId === session.id
                                  ? 'bg-indigo-100 border border-indigo-300'
                                  : 'hover:bg-slate-100'
                              }`}
                              onClick={() => loadSession(session.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{session.title}</div>
                                  <div className="text-xs text-slate-500">
                                    {session.total_messages} messages
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSessionById(session.id)
                                  }}
                                  className="p-1 rounded hover:bg-red-100 text-red-500"
                                  title="Delete chat"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </Card>
            )}

            {/* Chat Actions */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={clearChat}
                  className="w-full justify-start text-black hover:bg-black hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Current Chat
                </Button>
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-160px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Welcome to SmartClass AI!</h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                      I'm here to help you with your studies. Ask me anything about your subjects, 
                      get explanations, solve problems, or just chat about learning!
                    </p>
                <div />
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        {message.imageUrl && (
                          <div className="mb-2">
                            <img src={message.imageUrl} alt="attached" className="max-h-48 rounded-lg border" />
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${
                            message.role === 'user' ? 'text-indigo-100' : 'text-slate-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => copyMessage(message.content)}
                                className="p-1 rounded hover:bg-slate-200 transition-colors"
                                title="Copy message"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                className="p-1 rounded hover:bg-slate-200 transition-colors"
                                title="Good response"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                className="p-1 rounded hover:bg-slate-200 transition-colors"
                                title="Poor response"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-slate-500 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 p-4">
                {imagePreviewUrl && (
                  <div className="mb-3 flex items-center gap-3">
                    <img src={imagePreviewUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg border" />
                    <button
                      onClick={() => { setAttachedImage(null); setImagePreviewUrl(null) }}
                      className="text-sm text-red-600 hover:underline"
                    >Remove image</button>
                  </div>
                )}
                <div className="flex gap-3 items-start">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your studies..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3 text-xs text-slate-400">
                      <label className="cursor-pointer grid place-items-center p-2 rounded hover:bg-slate-100 text-slate-600" title="Attach image" aria-label="Attach image">
                        <ImageIcon className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            if (file) {
                              setAttachedImage(file)
                              const url = URL.createObjectURL(file)
                              setImagePreviewUrl(url)
                            }
                          }}
                        />
                      </label>
                      <span>Enter to send, Shift+Enter for new line</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                  >
                    {chatMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
