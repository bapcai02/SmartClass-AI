import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pin } from 'lucide-react'
import { getClassAnnouncements, type AnnouncementRow } from '@/api/classApi'

type Row = { id: number; title: string; author: string; date: string; content: string; pinned?: boolean }

export default function ClassAnnouncementsPage() {
  const { id } = useParams()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <Button className="gap-2"><Plus className="h-4 w-4"/> New Announcement</Button>
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
    </div>
  )
}

