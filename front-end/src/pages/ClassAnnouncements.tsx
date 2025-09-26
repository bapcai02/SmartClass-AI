import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pin, X, Loader2, ArrowLeftCircle } from 'lucide-react'
import { getClassAnnouncements, createClassAnnouncement, type AnnouncementRow } from '@/api/classApi'
import { useUser } from '@/hooks/auth'

type Row = { id: number; title: string; author: string; date: string; content: string; pinned?: boolean }

export default function ClassAnnouncementsPage() {
  const { id } = useParams()
  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])
  const { data: me } = useUser() as any
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const resp = await getClassAnnouncements(id as string, { perPage: 20 })
        const data = Array.isArray((resp as any).data) ? (resp as any).data : (resp as any).items
        const rows: Row[] = (data || []).map((r: AnnouncementRow) => ({
          id: (r as any).id,
          title: (r as any).title,
          author: (r as any).author,
          date: (r as any).created_at?.slice(0,10) || '',
          content: (r as any).content,
        }))
        if (!mounted) return
        setItems(rows)
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load announcements')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (id) load()
    return () => { mounted = false }
  }, [id])

  const sorted = useMemo(()=> [...items].sort((a,b)=> (b.pinned?1:0) - (a.pinned?1:0)), [items])
  return (
    <div className="grid gap-6">
      <div>
        <Link
          to={`/class/${id}`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
          Back to Class Detail
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Class Announcements</h1>
          <p className="text-slate-600">Share updates and pin important messages</p>
        </div>
        <Button className="gap-2 text-black hover:bg-black hover:text-white" onClick={()=>setCreateOpen(true)}><Plus className="h-4 w-4"/> New Announcement</Button>
      </div>

      <div className="grid gap-3">
        {error && <div className="p-2 text-sm text-red-600">{error}</div>}
        {loading ? <div className="p-3 text-sm text-slate-600">Loading…</div> : sorted.map((n)=> (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{n.title}</span>
                <span className="text-sm text-slate-600">{n.author} • {n.date} {n.pinned && <Pin className="ml-1 inline h-4 w-4 text-amber-600"/>}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-700">
                {expanded[String(n.id)] ? (
                  <>
                    {n.content}
                    <button className="ml-2 text-brand-blue" onClick={()=>setExpanded({...expanded,[String(n.id)]:false})}>Collapse</button>
                  </>
                ) : (
                  <>
                    {n.content}
                    <button className="ml-2 text-brand-blue" onClick={()=>setExpanded({...expanded,[String(n.id)]:true})}>Read more</button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="text-base font-semibold">New Announcement</div>
              <button className="rounded p-1 hover:bg-slate-100" onClick={()=>!submitting && setCreateOpen(false)} aria-label="Close"><X className="h-5 w-5"/></button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1 block text-sm text-slate-700">Title</label>
                <input
                  value={title}
                  onChange={(e)=>setTitle(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  placeholder="Enter a clear, concise title"
                />
                <div className="mt-1 text-xs text-slate-500">{title.length}/120</div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">Content</label>
                <textarea
                  value={content}
                  onChange={(e)=>setContent(e.target.value)}
                  rows={7}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 leading-relaxed focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  placeholder="Write the announcement details..."
                />
                {(!title.trim() || !content.trim()) && (
                  <div className="mt-2 text-xs text-amber-600">Title and content are required.</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <Button variant="outline" className="rounded-xl" onClick={()=>!submitting && setCreateOpen(false)}>Cancel</Button>
              <Button
                className="rounded-xl border border-black px-4 text-black bg-white hover:bg-black hover:text-white shadow-sm disabled:opacity-60"
                disabled={submitting || !title.trim() || !content.trim()}
                onClick={async()=>{
                if (!id || !me?.id || !title.trim() || !content.trim()) return
                try {
                  setSubmitting(true)
                  await createClassAnnouncement(id, { title: title.trim(), content: content.trim(), created_by: me.id })
                  // refresh list
                  setTitle(''); setContent(''); setCreateOpen(false)
                  setLoading(true)
                  const resp = await getClassAnnouncements(id as string, { perPage: 20 })
                  const data = Array.isArray((resp as any).data) ? (resp as any).data : (resp as any).items
                  const rows: Row[] = (data || []).map((r: AnnouncementRow) => ({
                    id: (r as any).id,
                    title: (r as any).title,
                    author: (r as any).author,
                    date: (r as any).created_at?.slice(0,10) || '',
                    content: (r as any).content,
                  }))
                  setItems(rows)
                } catch (e) {
                } finally {
                  setSubmitting(false); setLoading(false)
                }
                }}
              >
                {submitting ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Creating…</span>) : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

