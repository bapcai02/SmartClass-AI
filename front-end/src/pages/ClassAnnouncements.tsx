import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pin, X } from 'lucide-react'
import { getClassAnnouncements, createClassAnnouncement, type AnnouncementRow } from '@/api/classApi'
import { useUser } from '@/hooks/auth'

type Row = { id: number; title: string; author: string; date: string; content: string; pinned?: boolean }

export default function ClassAnnouncementsPage() {
  const { id } = useParams()
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
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Announcements</h1>
          <p className="text-slate-600">Share updates and pin important messages</p>
        </div>
        <Button className="gap-2 text-black" onClick={()=>setCreateOpen(true)}><Plus className="h-4 w-4"/> New Announcement</Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-base font-semibold">New Announcement</div>
              <button className="p-1" onClick={()=>!submitting && setCreateOpen(false)}><X className="h-5 w-5"/></button>
            </div>
            <div className="space-y-3 px-4 py-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Enter title" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Content</label>
                <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={6} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Write your announcement" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="outline" onClick={()=>!submitting && setCreateOpen(false)}>Cancel</Button>
              <Button onClick={async()=>{
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
              }}>
                {submitting ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

