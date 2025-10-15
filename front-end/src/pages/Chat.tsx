import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, Send, Search, Phone, Video, MoreHorizontal, Image, Smile, Mic, Info, MessageSquare } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { Segmented } from '@/components/ui/segmented'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConversations, getConversation, getOrCreateDirect, sendChatMessage, createGroupChat, addReaction } from '@/api/chat'
import { getUsers, getMe } from '@/api/users'
import { getSocket } from '@/utils/rt'

export default function ChatPage() {
  const [active, setActive] = useState<number | null>(null)
  const [segment, setSegment] = useState('all')
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => getMe() })
  const { data: convos } = useQuery({ queryKey: ['chat-conversations'], queryFn: () => getConversations(50) })
  const { data: usersPage } = useQuery({ queryKey: ['users-lite'], queryFn: () => getUsers({ perPage: 30 }) })
  const [thread, setThread] = useState<{ id: number; title?: string | null; messages: Array<{ id:number; sender: { id:number; name:string }; content?:string|null; created_at:string; reactions?: Array<{emoji: string, user_id: number}> }> } | null>(null)
  const [input, setInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [reactions, setReactions] = useState<Record<number, Array<{emoji: string, user_id: number}>>>({})
  const [openReactionFor, setOpenReactionFor] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const colorPalette = useMemo(() => [
    'bg-slate-200','bg-blue-200','bg-emerald-200','bg-amber-200','bg-purple-200','bg-pink-200','bg-cyan-200','bg-lime-200'
  ], [])
  const pickColor = (seed: string | number) => {
    const s = String(seed)
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
    return colorPalette[hash % colorPalette.length]
  }

  const getDisplayName = (c: any) => {
    if (c?.type === 'direct') {
      const other = c.participants.find((p: any) => p.id !== me?.id)
      return other?.name || ''
    }
    return c?.title || c?.participants.map((p: any) => p.name).join(', ')
  }

  const getInitials = (name: string) => {
    if (!name) return ''
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase()
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
  }

  // Do not auto-select any conversation when entering chat
  useEffect(() => {}, [convos, active])

  // Join all conversation rooms so we can receive incoming messages even khi chưa mở thread
  useEffect(() => {
    const sio = getSocket()
    ;(convos || []).forEach(c => sio.emit('join_conversation', c.id))
  }, [convos])

  // Ensure join current active room (in case it chưa có trong danh sách convos ngay)
  useEffect(() => {
    if (!active) return
    getSocket().emit('join_conversation', active)
  }, [active])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!active) return
      const data = await getConversation(active)
      if (!cancelled) {
        setThread({ id: data.conversation.id, title: data.conversation.title, messages: data.messages.data.map(m => ({ id: m.id, sender: m.sender, content: m.content, created_at: m.created_at })) })
      }
    }
    load()
    return () => { cancelled = true }
  }, [active])

  // Realtime subscription qua Socket.io: luôn lắng nghe để hiện ngay cả khi chưa mở thread
  useEffect(() => {
    const sio = getSocket()
    const onMessage = (payload: any) => {
      // Handle reaction updates
      if (payload.type === 'reaction') {
        setReactions(prev => ({
          ...prev,
          [payload.message_id]: [
            ...(prev[payload.message_id] || []).filter(r => r.user_id !== payload.user_id),
            { emoji: payload.emoji, user_id: payload.user_id }
          ].filter(r => r.emoji) // Remove empty reactions
        }))
        return
      }

      // Handle new messages
      if (!payload.id) return
      
      setThread(t => {
        // Nếu chưa chọn cuộc trò chuyện nào, auto mở cuộc trò chuyện vừa nhận
        if (!active) {
          setActive(payload.conversation_id)
          return {
            id: payload.conversation_id,
            title: t?.title,
            messages: [{ id: payload.id, sender: payload.sender, content: payload.content || '', created_at: payload.created_at, reactions: [] }]
          }
        }
        // Nếu đang ở cuộc trò chuyện khác, chỉ cập nhật danh sách bên trái
        if (payload.conversation_id !== active) return t
        // Đang ở đúng cuộc trò chuyện, append
        if (!t || t.id !== active) {
          return {
            id: active,
            title: t?.title,
            messages: [{ id: payload.id, sender: payload.sender, content: payload.content || '', created_at: payload.created_at, reactions: [] }]
          }
        }
        return { ...t, messages: [...t.messages, { id: payload.id, sender: payload.sender, content: payload.content || '', created_at: payload.created_at, reactions: [] }] }
      })
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
    }
    sio.on('message', onMessage)
    return () => { sio.off('message', onMessage)}
  }, [active, queryClient])

  // Auto scroll to bottom when messages change or when switching thread
  useEffect(() => {
    if (!thread || !messagesRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    const el = messagesRef.current
    el.scrollTop = el.scrollHeight
  }, [thread?.id, thread?.messages?.length])

  const handleReaction = async (messageId: number, emoji: string) => {
    if (!active) return
    
    try {
      await addReaction(active, { message_id: messageId, emoji })
      
      // Optimistic update
      setReactions(prev => ({
        ...prev,
        [messageId]: [
          ...(prev[messageId] || []).filter(r => r.user_id !== me?.id),
          { emoji, user_id: me?.id || 0 }
        ].filter(r => r.emoji)
      }))
    } catch (error) {
      console.error('Failed to send reaction:', error)
    }
  }
  return (
    <div className="grid gap-6 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left panel */}
        <Card className="col-span-4">
          <CardContent className="p-0">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Tin nhắn</div>
              </div>
              {/* Favorites strip */}
              <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                {(convos||[]).slice(0,7).map((c)=> {
                  const label = (c.title || c.participants.map(p=>p.name).join(', '))
                  return (
                    <div key={c.id} className={`h-8 w-8 shrink-0 rounded-full grid place-items-center text-[10px] ring-2 ring-white ${pickColor(c.id)}`}>
                      {label.slice(0,2)}
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input className="w-full rounded-2xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm text-slate-900 placeholder-slate-500 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue" placeholder="Tìm kiếm" />
                </div>
              </div>
              {/* Suggested users */}
              <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                {(usersPage?.data || []).slice(0,10).map(u => (
                  <button key={u.id} onClick={async ()=> {
                    const id = await getOrCreateDirect(u.id)
                    setActive(id)
                    queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
                  }} className={`flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs ${pickColor(u.id)} hover:brightness-95`} title={u.name}>
                    <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-white/60 text-[10px]">{(u.name||'')[0]?.toUpperCase() || '?'}</span>
                    <span className="max-w-[120px] pr-1 text-slate-700 truncate">{u.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Segmented
                  options={[{label:'Tất cả',value:'all'},{label:'Lớp',value:'classes'},{label:'Giáo viên',value:'teachers'},{label:'Nhóm',value:'groups'}]}
                  value={segment}
                  onChange={setSegment}
                />
                <Button variant="outline" className="h-8 px-3 text-xs" onClick={async ()=>{
                  const ids = (usersPage?.data||[]).slice(0,3).map((u:any)=>u.id)
                  if (ids.length) {
                    const newId = await createGroupChat('Nhóm mới', ids)
                    setActive(newId)
                    queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
                  }
                }}>Tạo nhóm</Button>
              </div>
            </div>
            <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-2">
              {(convos||[]).map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full cursor-pointer rounded-xl px-3 py-2 text-left transition-colors ${active===c.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 shrink-0 rounded-full grid place-items-center text-[10px] ${pickColor(c.id)}`}>
                      {getInitials(getDisplayName(c))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{getDisplayName(c)}</div>
                        {idx % 3 === 0 && <span className="h-2 w-2 rounded-full bg-blue-500"/>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <div className="truncate">{c.last_message?.content || ''}</div>
                        <div className="shrink-0 text-[10px] text-slate-500 ml-2">{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString('vi-VN') : ''}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right panel */}
        <Card className="col-span-8">
          <CardContent className="p-0">
            {!active || !thread ? (
              <div className="flex h-[calc(100dvh-8rem)] items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <MessageSquare className="h-8 w-8"/>
                  </div>
                  <div className="text-lg font-semibold">Chào mừng đến Chat</div>
                  <div className="mt-1 text-sm text-slate-600">Chọn một cuộc trò chuyện ở bên trái, hoặc tạo cuộc trò chuyện mới để bắt đầu.</div>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <Button variant="outline" className="h-8 px-3 text-xs" onClick={async ()=>{
                      const first = (usersPage?.data||[])[0]
                      if (!first) return
                      const id = await getOrCreateDirect(first.id)
                      setActive(id)
                      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
                    }}>Bắt đầu trò chuyện</Button>
                    <Button className="h-8 px-3 text-xs text-black hover:text-white" onClick={async ()=>{
                      const ids = (usersPage?.data||[]).slice(0,3).map((u:any)=>u.id)
                      if (!ids.length) return
                      const id = await createGroupChat('Nhóm mới', ids)
                      setActive(id)
                      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
                    }}>Tạo nhóm</Button>
                  </div>
                </div>
              </div>
            ) : (
            <>
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full grid place-items-center text-[10px] ${pickColor(active || 0)}`}>
                  {getInitials(getDisplayName((convos||[]).find(c=>c.id===active)))}
                </div>
                <div>
                  <div className="text-sm font-medium">{
                    (()=>{
                      const current = (convos||[]).find(c=>c.id===active)
                      if (!current) return thread?.title || ''
                      if (current.type === 'direct') {
                        const meId = me?.id
                        const other = current.participants.find(p=> p.id !== meId)
                        return other?.name || ''
                      }
                      return current.title || current.participants.map(p=>p.name).join(', ')
                    })()
                  }</div>
                  <div className="text-xs text-slate-600">Trực tuyến • Đang nhập…</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-8 px-3"><Phone className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-3"><Video className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-3"><Info className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-3"><MoreHorizontal className="h-4 w-4"/></Button>
              </div>
            </div>

            {/* Thread */}
            <div ref={messagesRef} className="h-[calc(100dvh-16rem)] overflow-y-auto p-4">
              <div className="mb-3 text-center text-[10px] text-slate-500">Hôm nay</div>
              {thread?.messages.map((m) => {
                const mine = m.sender.id === me?.id
                return (
                  <div key={m.id} className={`mb-3 flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                    {!mine && (
                      <div className={`h-7 w-7 shrink-0 rounded-full grid place-items-center text-[10px] ${pickColor(m.sender.id)}`} title={m.sender.name}>
                        {getInitials(m.sender.name)}
                      </div>
                    )}
                    <div className={`relative group max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow ${mine ? 'bg-blue-500/90 text-white' : 'bg-slate-50'}`}>
                      <div className="mb-1 flex items-center gap-2 text-[10px] opacity-70">
                        <span>{new Date(m.created_at).toLocaleTimeString('vi-VN')}</span>
                      </div>
                      {m.content}
                      
                      {/* Reactions */}
                      {(reactions[m.id] || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(
                            (reactions[m.id] || []).reduce((acc, r) => {
                              acc[r.emoji] = (acc[r.emoji] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(m.id, emoji)}
                              className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
                            >
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hover single reaction trigger + anchored palette */}
                      <div className={`absolute -top-3 ${mine ? 'right-0' : 'left-0'} ${openReactionFor === m.id ? 'flex' : 'hidden group-hover:flex'} items-center z-10`}>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenReactionFor(openReactionFor === m.id ? null : m.id) }}
                            className={`rounded-full border px-1.5 py-0.5 text-[11px] shadow-sm ${mine ? 'bg-blue-600/90 border-blue-300/30 hover:bg-blue-600 text-white' : 'bg-white hover:bg-slate-100 border-slate-200'}`}
                            title="Thêm reaction"
                          >
                            😊
                          </button>
                          {openReactionFor === m.id && (
                            <div className={`absolute top-full z-20 mt-2 rounded-xl border bg-white p-1 shadow-lg ${mine ? 'right-0' : 'left-0'}`}
                                 onMouseLeave={() => setOpenReactionFor(null)}>
                              <div className="flex items-center gap-1 max-w-[200px] flex-wrap">
                                {['👍','❤️','😂','😮','😢','😡','👏','🔥','🙏','🎉'].map(emoji => (
                                  <button key={emoji}
                                    onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setOpenReactionFor(null); handleReaction(m.id, emoji) }}
                                    className="rounded-md px-1.5 py-1 text-sm hover:bg-slate-100"
                                  >{emoji}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {mine && (
                      <div className={`h-7 w-7 shrink-0 rounded-full grid place-items-center text-[10px] ${pickColor(me?.id || 0)}`} title={me?.name || ''}>
                        {getInitials(me?.name || '')}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="p-3">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500">
                          <button className="rounded-full p-2 hover:bg-slate-100"><Paperclip className="h-4 w-4"/></button>
                          <button className="rounded-full p-2 hover:bg-slate-100"><Image className="h-4 w-4"/></button>
                          <div className="relative">
                            <button 
                              className="rounded-full p-2 hover:bg-slate-100" 
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowEmojiPicker(!showEmojiPicker)
                              }}
                            >
                              <Smile className="h-4 w-4"/>
                            </button>
                            {showEmojiPicker && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-2">
                                <EmojiPicker
                                  onEmojiClick={(emoji) => {
                                    setInput(prev => prev + emoji.emoji)
                                    setShowEmojiPicker(false)
                                  }}
                                  width={300}
                                  height={400}
                                />
                              </div>
                            )}
                          </div>
                          <button className="rounded-full p-2 hover:bg-slate-100"><Mic className="h-4 w-4"/></button>
                        </div>
                  <input
                    className="w-full rounded-full border border-slate-300 bg-white pl-36 pr-16 py-3 text-sm shadow-sm text-slate-900 placeholder-slate-500 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    placeholder="Nhập tin nhắn…"
                    value={input}
                    onChange={(e)=> setInput(e.target.value)}
                    onKeyDown={async (e)=>{
                      if (e.key === 'Enter' && !e.shiftKey && active && input.trim()) {
                        e.preventDefault()
                        const optimistic = { id: Date.now(), sender: { id: me?.id || 0, name: me?.name || 'Me' }, content: input.trim(), created_at: new Date().toISOString() }
                        setThread((t)=> t && t.id === active ? { ...t, messages: [...t.messages, optimistic] } : { id: active, title: t?.title, messages: [optimistic] })
                        try {
                          const sio = getSocket()
                          sio.emit('send_message', { conversationId: active, content: input.trim(), message_type: 'text' })
                        } catch {
                         await sendChatMessage(active, { content: input.trim(), message_type: 'text' })
                        }
                        setInput('')
                        queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
                      }
                    }}
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hidden sm:block">
                    Nhấn Enter để gửi
                  </div>
                </div>
                <button className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-white shadow-md hover:brightness-105" onClick={async ()=>{
                  if (active && input.trim()) {
                    const optimistic = { id: Date.now(), sender: { id: me?.id || 0, name: me?.name || 'Me' }, content: input.trim(), created_at: new Date().toISOString() }
                    setThread((t)=> t && t.id === active ? { ...t, messages: [...t.messages, optimistic] } : { id: active, title: t?.title, messages: [optimistic] })
                    try {
                      const sio = getSocket()
                      sio.emit('send_message', { conversationId: active, content: input.trim(), message_type: 'text' })
                    } catch {await sendChatMessage(active, { content: input.trim(), message_type: 'text' })}
                    setInput('')
                    queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
                  }
                }}>
                  <Send className="h-4 w-4" />
                </button>
              </div>
              
              {/* Picker is anchored to the emoji button above */}
            </div>
            </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

