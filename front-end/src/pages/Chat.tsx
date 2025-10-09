import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import { Paperclip, Send, Search, Phone, Video, MoreHorizontal, CheckCheck, Image, Smile, Mic, Info } from 'lucide-react'
import { Segmented } from '@/components/ui/segmented'

import { useQuery } from '@tanstack/react-query'
import { getConversations, getConversation, type ConversationListItem } from '@/api/chat'

export default function ChatPage() {
  const [active, setActive] = useState<number | null>(null)
  const [segment, setSegment] = useState('all')
  const { data: convos } = useQuery({ queryKey: ['chat-conversations'], queryFn: () => getConversations(50) })
  const [thread, setThread] = useState<{ id: number; title?: string | null; messages: Array<{ id:number; sender: { id:number; name:string }; content?:string|null; created_at:string }> } | null>(null)

  const colorPalette = useMemo(() => [
    'bg-slate-200','bg-blue-200','bg-emerald-200','bg-amber-200','bg-purple-200','bg-pink-200','bg-cyan-200','bg-lime-200'
  ], [])
  const pickColor = (seed: string | number) => {
    const s = String(seed)
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
    return colorPalette[hash % colorPalette.length]
  }

  useEffect(() => {
    if (!active && convos && convos.length) setActive(convos[0].id)
  }, [convos, active])

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
              <div className="mt-3">
                <Segmented
                  options={[{label:'Tất cả',value:'all'},{label:'Lớp',value:'classes'},{label:'Giáo viên',value:'teachers'},{label:'Nhóm',value:'groups'}]}
                  value={segment}
                  onChange={setSegment}
                />
              </div>
            </div>
            <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-2">
              {(convos||[]).map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${active===c.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 shrink-0 rounded-full grid place-items-center text-[10px] ${pickColor(c.id)}`}>
                      {(c.title || c.participants.map(p=>p.name).join(', ')).slice(0,2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{c.title || c.participants.map(p=>p.name).join(', ')}</div>
                        <div className="text-[10px] text-slate-500">{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString('vi-VN') : ''}</div>
                      </div>
                      <div className="text-xs text-slate-600 truncate">{c.last_message?.content || ''}</div>
                    </div>
                    {idx % 3 === 0 && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"/>}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right panel */}
        <Card className="col-span-8">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green" />
                <div>
                  <div className="text-sm font-medium">{thread?.title || (convos||[]).find(c=>c.id===active)?.participants.map(p=>p.name).join(', ')}</div>
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
            <div className="h-[calc(100dvh-16rem)] overflow-y-auto p-4">
              <div className="mb-3 text-center text-[10px] text-slate-500">Hôm nay</div>
              {thread?.messages.map((m) => (
                <div key={m.id} className={`mb-3 flex items-end gap-2 ${m.sender.id !== 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow ${m.sender.id !== 0 ? 'bg-slate-50' : 'bg-blue-500/90 text-white'}`}>
                    <div className="mb-1 flex items-center gap-2 text-[10px] opacity-70">
                      <span>{new Date(m.created_at).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="p-3">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500">
                    <button className="rounded-full p-2 hover:bg-slate-100"><Paperclip className="h-4 w-4"/></button>
                    <button className="rounded-full p-2 hover:bg-slate-100"><Image className="h-4 w-4"/></button>
                    <button className="rounded-full p-2 hover:bg-slate-100"><Smile className="h-4 w-4"/></button>
                    <button className="rounded-full p-2 hover:bg-slate-100"><Mic className="h-4 w-4"/></button>
                  </div>
                  <input
                    className="w-full rounded-full border border-slate-300 bg-white pl-36 pr-16 py-3 text-sm shadow-sm text-slate-900 placeholder-slate-500 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    placeholder="Nhập tin nhắn…"
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hidden sm:block">
                    Nhấn Enter để gửi
                  </div>
                </div>
                <button className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-white shadow-md hover:brightness-105">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

