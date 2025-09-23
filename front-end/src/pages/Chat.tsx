import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Paperclip, Send, Search, Phone, Video, MoreHorizontal, CheckCheck, Image, Smile, Mic, Info } from 'lucide-react'
import { Segmented } from '@/components/ui/segmented'

type Conversation = { id: string; name: string; last: string; avatar: string }
const baseConversations: Conversation[] = [
  { id: 'c1', name: 'Algebra I', last: 'See you tomorrow!', avatar: 'https://i.pravatar.cc/64?img=12' },
  { id: 'c2', name: 'Biology Group', last: 'Share the slides please', avatar: 'https://i.pravatar.cc/64?img=32' },
  { id: 'c3', name: 'Ms. Johnson', last: 'Grades posted', avatar: 'https://i.pravatar.cc/64?img=48' },
  { id: 'c4', name: 'History Club', last: 'Meeting at 5 PM', avatar: 'https://i.pravatar.cc/64?img=7' },
]
const conversations: Conversation[] = [
  ...baseConversations,
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `cg${i + 1}`,
    name: `Study Group ${i + 1}`,
    last: 'New updates available. Check the files.',
    avatar: `https://i.pravatar.cc/64?img=${(i % 70) + 1}`,
  })),
]

export default function ChatPage() {
  const [active, setActive] = useState('c1')
  const [segment, setSegment] = useState('all')
  return (
    <div className="grid gap-6 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left panel */}
        <Card className="col-span-4">
          <CardContent className="p-0">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Messages</div>
              </div>
              {/* Favorites strip */}
              <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                {conversations.slice(0,7).map((c)=> (
                  <img key={c.id} src={c.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white" />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input className="w-full rounded-2xl border bg-white pl-9 pr-3 py-2 text-sm shadow-sm" placeholder="Search" />
                </div>
              </div>
              <div className="mt-3">
                <Segmented
                  options={[{label:'All',value:'all'},{label:'Classes',value:'classes'},{label:'Teachers',value:'teachers'},{label:'Groups',value:'groups'}]}
                  value={segment}
                  onChange={setSegment}
                />
              </div>
            </div>
            <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-2">
              {conversations.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${active===c.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-500">10:{20+idx}</div>
                      </div>
                      <div className="text-xs text-slate-600 truncate">{c.last}</div>
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
                  <div className="text-sm font-medium">{conversations.find(c=>c.id===active)?.name}</div>
                  <div className="text-xs text-slate-600">Online • Typing…</div>
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
              <div className="mb-3 text-center text-[10px] text-slate-500">Today</div>
              {Array.from({length: 100}).map((_,i) => (
                <div key={i} className={`mb-3 flex items-end gap-2 ${i % 2 ? 'justify-start' : 'justify-end'}`}>
                  {i % 2 ? (
                    <img src={conversations.find(c=>c.id===active)!.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : null}
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow ${i % 2 ? 'bg-slate-50' : 'bg-blue-500/90 text-white'}`}>
                    <div className="mb-1 flex items-center gap-2 text-[10px] opacity-70">
                      <span>10:{10+i} AM</span>
                      {! (i%2) && <span className="flex items-center gap-1"><CheckCheck className="h-3 w-3"/> Seen</span>}
                    </div>
                    Message {i} content...
                    {i===2 && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/20 px-2 py-1 text-xs backdrop-blur-sm">
                        <Paperclip className="h-3 w-3"/> assignment.pdf
                      </div>
                    )}
                  </div>
                  {i % 2 === 0 ? (
                    <img src="https://i.pravatar.cc/64?img=3" alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : null}
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
                    className="w-full rounded-full border bg-white pl-36 pr-16 py-3 text-sm shadow-sm outline-none focus:border-blue-500"
                    placeholder="Write a message…"
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hidden sm:block">
                    Enter to send
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

